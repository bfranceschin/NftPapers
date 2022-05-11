const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Testing the NFT contract", function () {

  let contractFactory;
  let contract;
  let owner;
  let alice;
  let bob;
  let ownerAddress;
  let aliceAddress;
  let bobAddress;

  const token0Uri = "https://protocol.ai/"

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    aliceAddress = await alice.getAddress();
    bobAddress = await bob.getAddress();
    contractFactory = await ethers.getContractFactory("NFT");
    contract = await contractFactory.deploy();
    await contract.createToken(token0Uri);
  });

  it("Test name and tokenUri", async function () {
    expect(await contract.name()).to.equal("SciGraph");
    expect(await contract.tokenURI(0)).to.equal(token0Uri);
  });

  it("Test donate method", async function () {
    // Parse the etherString representation of ether 
    // into a BigNumber instance of the amount of wei.
    const donationAmount = ethers.utils.parseEther("1");
    expect(await contract.tokenDonationBalance(0)).to.equal(0);
    await contract.connect(alice).donate(0, {value: donationAmount});
    expect(await contract.tokenDonationBalance(0)).to.equal(donationAmount);
  });

  
});
