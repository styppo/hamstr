import {bech32ToHex} from 'src/utils/utils'

const Bots = new Set()
export default Bots
Bots.isBot = Bots.has.bind(Bots)
Bots.add = pubkey => Set.prototype.add.call(Bots, bech32ToHex(pubkey))

Bots.add('npub1tsgw6pncspg4d5u778hk63s3pls70evs4czfsmx0fzap9xwt203qtkhtk4') // gpt3
Bots.add('npub17stpezz4suqdywh33k9x8pht04l76a5sfrsjj7q3mnp5ap5937eqdt58d7') // bitcoin_bot
Bots.add('npub1xe59lfgsdvduqwh8h65zahkc2hv02mzpmdxghhhcpx0puret9taqheapxc') // moe_bot
