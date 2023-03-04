const { isNil, clone, mergeLeft } = require("ramda")
const { handle } = require("weavedb-contracts/weavedb/contract")
const Base = require("weavedb-base")
const arweave = require("arweave")
const { createId } = require("@paralleldrive/cuid2")

class OffChain extends Base {
  constructor({ state = {}, cache = "memory", redis }) {
    super()
    this.cache = cache
    if (cache === "redis") {
      try {
        const { createClient } = require("redis")
        const opt = { url: redis?.url || null }
        this.redis_client = createClient(opt)
        this.redis_prefix = isNil(redis?.prefix)
          ? "weavedb-offchain."
          : `${redis.prefix}.`
        this.redis_client.connect()
      } catch (e) {
        console.log(e)
        this.cache = "memory"
      }
    }

    this.validity = {}
    this.txs = []
    this.arweave = arweave.init()
    this.contractTxId = "offchain"
    this.domain = {
      name: "weavedb",
      version: "1",
      verifyingContract: this.contractTxId,
    }
    this.state = mergeLeft(state, {
      version: "0.23.0",
      canEvolve: true,
      evolve: null,
      secure: true,
      data: {},
      nonces: {},
      ids: {},
      indexes: {},
      auth: {
        algorithms: ["secp256k1", "secp256k1-2", "ed25519", "rsa256"],
        name: "weavedb",
        version: "1",
        links: {},
      },
      crons: {
        lastExecuted: 0,
        crons: {},
      },
      contracts: { ethereum: "ethereum", dfinity: "dfinity" },
    })
    this.initialState = clone(this.state)
    this.height = 0
  }
  async initialize() {
    if (this.cache === "redis") {
      const cache = await this.redis_client.get(
        `${this.redis_prefix}state`,
        JSON.stringify(this.state)
      )
      if (!isNil(cache)) {
        try {
          const json = JSON.parse(cache)
          this.state = json.state
          this.height = json.height
        } catch (e) {}
      }
    }
  }
  getSW() {
    return {
      contract: { id: this.contractTxId },
      arweave,
      block: {
        timestamp: Math.round(Date.now() / 1000),
        height: ++this.height,
      },
      transaction: { id: createId() },
      contracts: {
        viewContractState: async (contract, param, SmartWeave) => {
          const { handle } = require(`weavedb-contracts/${contract}/contract`)
          try {
            return await handle({}, { input: param }, SmartWeave)
          } catch (e) {
            console.log(e)
          }
        },
      },
    }
  }
  async read(input) {
    return (await handle(clone(this.state), { input }, this.getSW())).result
  }

  async write(func, param, dryWrite, bundle, relay = false) {
    if (relay) {
      return param
    } else {
      let error = null
      let tx = null
      let sw = this.getSW()
      try {
        tx = await handle(clone(this.state), { input: param }, sw)
        this.state = tx.state
        if (this.cache === "redis") {
          await this.redis_client.set(
            `${this.redis_prefix}state`,
            JSON.stringify({
              height: tx?.result?.block?.height || 0,
              state: this.state,
            })
          )
        }
      } catch (e) {
        error = e
      }
      const start = Date.now()
      this.validity[sw.transaction.id] = error === null
      this.txs.push({
        transaction: sw.transaction,
        block: sw.block,
        param,
        func,
      })
      return {
        originalTxId: tx?.result?.transaction?.id || null,
        transaction: tx?.result?.transaction || null,
        block: tx?.result?.block || null,
        success: error === null,
        nonce: param.nonce,
        signer: param.caller,
        duration: Date.now() - start,
        error,
        function: param.function,
      }
    }
  }
}

module.exports = OffChain
