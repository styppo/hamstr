import hdkey from 'hdkey'

function deriveFromHexesAndNonce(pubKeyHex, token, derivationIndex) {
  const concatenatedHex = pubKeyHex + token
  const masterKey = hdkey.fromMasterSeed(concatenatedHex)
  const childKey = masterKey.derive(`m/44'/0'/0'/0/${derivationIndex}`)

  return childKey
}

export function getKeyPair(pubKeyHex, token, derivationIndex) {
  const childKey = deriveFromHexesAndNonce(pubKeyHex, token, derivationIndex)
  const pubKey = childKey.publicKey.toString('hex')
  const secKey = childKey.privateKey.toString('hex')
  return {
    pubKey,
    secKey
  }
}
