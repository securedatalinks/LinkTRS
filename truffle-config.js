const HDWalletProvider = require('truffle-hdwallet-provider')
var mnemonic = "lyrics various math speak almost tonight license crash whisper flush gossip knee";

module.exports = {
  networks: {
    cldev: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
    },
    ropsten: {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/9964b47e23b14a3396e69c1da884ab81"),
      network_id: 3,
      gas: 8000000
    },
    live: {
      provider: () => {
        return new HDWalletProvider(process.env.MNEMONIC, process.env.RPC_URL)
      },
      network_id: '*',
      // Necessary due to https://github.com/trufflesuite/truffle/issues/1971
      // Should be fixed in Truffle 5.0.17
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: '0.4.24',
    },
  },
}
