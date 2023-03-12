const { isNil, is, intersection } = require("ramda")
const { parse, err, wrapResult } = require("../../lib/utils")
const { validate } = require("../../lib/validate")

const setAlgorithms = async (
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
      "setAlgorithms",
      SmartWeave
    ))
  }

  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "setAlgorithms",
    signer,
    null,
    contractErr,
    SmartWeave
  )
  if (
    !is(Array)(new_data) ||
    intersection(new_data)(["secp256k1", "ed25519", "rsa256", "secp256k1-2"])
      .length !== new_data.length
  ) {
    err(`The wrong algorithms`)
  }
  state.auth.algorithms = new_data
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { setAlgorithms }
