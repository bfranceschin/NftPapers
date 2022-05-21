// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require('fs');

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const contractFactory = await hre.ethers.getContractFactory("NFT");
  const contract = await contractFactory.deploy();

  await contract.deployed();

  console.log("Contract deployed to:", contract.address);

  fs.writeFileSync('./config.js', `
  export const contractAddress = "${contract.address}"
  `)

  // const baseIpfs = "ipfs://bafybeifz4j5ayidyb4xcu4ant6cetsxcccl6jcwciwrq7clkhvb3l3h7nm" // invisible friends cid
  // const count = 15
  // const donationAmount = ethers.utils.parseEther("1");
  // for (let i = 0; i < count; i++) {
  //   let ref = []
  //   if (i>0) {
  //     ref = [i-1]
  //   }
  //   await contract.createToken(baseIpfs + "/" + (100 + i), ref);
  //   await contract.donate(i, {value: donationAmount})
  // }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
