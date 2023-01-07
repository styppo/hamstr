import {encode as bech32encode, decode as bech32decode} from 'bech32-buffer'

export function bech32ToHex(bech32) {
  if (!bech32) return null
  let {data} = bech32decode(bech32.toLowerCase())
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
  if (!hex || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) {
    return null
  }
  let buffer = new Uint8Array(hex.length / 2)
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = parseInt(hex.substr(2 * i, 2), 16)
  }
  return bech32encode(prefix, buffer)
}
