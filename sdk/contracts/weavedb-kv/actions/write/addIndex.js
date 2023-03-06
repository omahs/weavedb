const { o, flatten, isNil, mergeLeft, includes, init } = require("ramda")
const { parse } = require("../../lib/utils")
const { err } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { addIndex: _addIndex, getIndex } = require("../../lib/index")

const addIndex = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "addIndex",
      SmartWeave
    ))
  }
  let { col, _data, data, query, new_data, path } = await parse(
    state,
    action,
    "addIndex",
    signer,
    null,
    contractErr,
    SmartWeave
  )
  let ind = getIndex(state, path)
  if (o(includes("__id__"), flatten)(new_data)) {
    err("index cannot contain __id__")
  }
  const db = async id => {
    const doc_key = `data.${path.join("/")}/${id}`
    return (await SmartWeave.kv.get(doc_key)) || { __data: null, subs: {} }
  }
  const docs = ind?.__id__?.asc?._ || []
  await _addIndex(new_data, ind, docs, db)
  return {
    state,
    result: {
      original_signer,
      transaction: SmartWeave.transaction,
      block: SmartWeave.block,
    },
  }
}

module.exports = { addIndex }
