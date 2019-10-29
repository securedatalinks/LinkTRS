let LinkToken = artifacts.require('LinkToken')
let DemoAggregator = artifacts.require('DemoAggregator')
let LinkTRS = artifacts.require('LinkTRS')

module.exports = (deployer, network) => {
  // Local (development) networks need their own deployment of the LINK
  // token and the Oracle contract
  if (network.startsWith("cldev")) {
    deployer.deploy(DemoAggregator).then(() => {
      return deployer.deploy(LinkToken).then(() => {
        return deployer.deploy(LinkTRS, LinkToken.address, DemoAggregator.address, LinkToken.address)
      })
    })
  } else if (network.startsWith("test")) {
    deployer.deploy(DemoAggregator).then(() => {
      return deployer.deploy(LinkToken).then(() => {
        return deployer.deploy(LinkTRS, LinkToken.address, DemoAggregator.address, LinkToken.address)
      })
    })
  } 
  else if (network.startsWith('ropsten')) {
    return deployer.deploy(LinkTRS, "0x20fe562d797a42dcb3399062ae9546cd06f63280", "0x060b38B197fE60cA5F36EA94452DA7F1bc3c7823", "0x20fe562d797a42dcb3399062ae9546cd06f63280")
  } else {
    // For live networks, use the 0 address to allow the ChainlinkRegistry
    // contract automatically retrieve the correct address for you
    return deployer.deploy(LinkTRS, "0x0000000000000000000000000000000000000000", "0x79fEbF6B9F76853EDBcBc913e6aAE8232cFB9De9", "0x0000000000000000000000000000000000000000")
  }
}
