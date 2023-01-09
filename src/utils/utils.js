import {encode as bech32encode, decode as bech32decode} from 'bech32-buffer'

export function bech32prefix(bech32) {
  if (!bech32 || bech32.length < 4) return
  return bech32.substr(0, 4).toLowerCase()
}

export function bech32ToHex(bech32) {
  if (!bech32) return
  let data
  try {
    data = bech32decode(bech32.toLowerCase())?.data
  } catch (e) {
    console.warn(`Failed to bech32decode ${bech32}`)
    return
  }
  return data.reduce(
    (s, byte) => {
      let hex = byte.toString(16)
      if (hex.length === 1) hex = '0' + hex
      return s + hex
    },
    ''
  )
}

export function hexToBech32(hex, prefix = '') {
  if (!hex || hex.length % 2 !== 0) return
  let buffer = new Uint8Array(hex.length / 2)
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = parseInt(hex.substr(2 * i, 2), 16)
  }
  return bech32encode(prefix, buffer)
}
