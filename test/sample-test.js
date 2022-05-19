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
  let bobAddress
  let token_0;

  const token0Uri = "https://protocol.ai/"

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    aliceAddress = await alice.getAddress();
    bobAddress = await bob.getAddress();
    contractFactory = await ethers.getContractFactory("NFT");
    contract = await contractFactory.deploy();
    token_0 = await contract.createToken(token0Uri, []);
  });

  it.skip("Test name and tokenUri", async function () {
    expect(await contract.name()).to.equal("SciGraph");
    expect(await contract.tokenURI(0)).to.equal(token0Uri);
  });

  it.skip("Test donate method", async function () {
    // Parse the etherString representation of ether 
    // into a BigNumber instance of the amount of wei.
    const donationAmount = ethers.utils.parseEther("1");
    expect(await contract.tokenDonationBalance(0)).to.equal(0);
    expect(await contract.getTreasuryBalance()).to.equal(0);
    // 
    await contract.connect(alice).donate(0, {value: donationAmount});
    let net_donation = donationAmount.sub(donationAmount.div(100));
    let balance = await contract.tokenDonationBalance(0);
    expect(balance.eq(net_donation));
    let treasury_bal = await contract.getTreasuryBalance();
    expect(treasury_bal.eq(donationAmount.sub(net_donation)));
    // testing donasions < 100
    const smallDonation = 90;
    await contract.connect(alice).donate(0, {value: smallDonation});
    balance_dash = await contract.tokenDonationBalance(0);
    // balance_dash should be balance + smallDonation
    expect(balance_dash.eq(balance.add(smallDonation)));
    // treasury_bal should be the same as above
    expect(treasury_bal.eq(donationAmount.sub(net_donation)));
  });

  it.skip("Test create/get references", async function () {
    let refs0 = await contract.getReferences(0);
    expect(refs0.length == 0);
    // 
    // creates _tokenIds[1]
    // tests references of _tokenIds[1]
    await contract.createToken(token0Uri, [0]);
    let refs1 = await contract.getReferences(1);
    expect(refs1[0] == 0 && refs1.length == 1);
    // 
    // creates _tokenIds[2]
    // tests refs
    let ref_2 = [0,1];
    await contract.createToken(token0Uri, ref_2);
    let refs2 = await contract.getReferences(2);
    expect(refs2.length == ref_2.length);
    for(i=0 ; i<refs2.length ; i++) {
      expect(refs2[i] == ref_2[i]); 
    }
    // creates _tokenIds[3] with wrong entry as ref
    // tests revert
    let ref_3 = [0,1,99];
    await expect (contract.createToken(token0Uri, ref_3)).to.be.revertedWith("_createReferences: Invalid tokenId in Reference entries");
  });

  it.skip("Test add references", async function (){
    // _tokenIds[1]
    await contract.createToken(token0Uri, []);
    // _tokenIds[2]
    await contract.createToken(token0Uri, []);

    let new_refs = [1,2];
    await contract.addReferences(0, new_refs);
    let refs0 =  await contract.getReferences(0);
    expect(refs0.length == 2);
    for(i=0 ; i<refs0.length ; i++){
      expect( refs0[i ]== new_refs[i] );
    }
    let another_ref = [99];
    await expect(contract.addReferences(0, another_ref)).to.be.revertedWith("addReferences: Invalid tokenId in Reference entries");
    await expect(contract.connect(alice).addReferences(0,[1])).to.be.revertedWith("addReferences: Only owner of token can perform this task")
  });

  it.skip("Tests subtract references", async function () {
    expect(contract.subReferences(0, [1])).to.be.revertedWith("subReferences: There are no references to be subtracted");
    
    // _tokenIds[1]
    await contract.createToken(token0Uri, []);
    // _tokenIds[2]
    await contract.createToken(token0Uri, []);
    await contract.addReferences(0,[1,2]);
    await expect(contract.connect(alice).subReferences(0,[1])).to.be.revertedWith("subReferences: Only owner of token can perform this task");
    await contract.subReferences(0, [1]);
    expect(await contract.getReferences(0)[0] == 2);
    await contract.subReferences(0, [2]);
    expect(await contract.getReferences(0).length == 0);
  });

  it("Tests claim donations", async function () {
    let owner_bal = await owner.getBalance();
    const donationAmount = ethers.utils.parseEther("1");
    await contract.connect(alice).donate(0, {value: donationAmount});
    await contract.claimDonation(0);
    let owner_bal_2 = await owner.getBalance();
    expect ( owner_bal_2.eq( owner_bal.add( donationAmount)));
    await expect(contract.claimDonation(0)).to.be.revertedWith( "claimDonation: There is no balance to be claimed");
    // _tokenIds[1]
    await contract.createToken(token0Uri, []);
    // _tokenIds[2]
    await contract.createToken(token0Uri, []);
    await contract.addReferences(0, [1,2]);

    await contract.connect(alice).donate(0, {value: donationAmount});
    owner_bal = await owner.getBalance();
    bob_bal = await bob.getBalance();
    await contract.connect(bob).claimDonation(0);
    owner_bal_2 = await owner.getBalance();
    expect ( owner_bal_2.eq( owner_bal.add( ethers.BigNumber.from("653400000000000000")) ));
    let token1_bal = await contract.tokenDonationBalance(1);
    let token2_bal = await contract.tokenDonationBalance(2);
    expect ( token1_bal.eq( ethers.BigNumber.from("163350000000000000")) );
    expect ( token2_bal.eq( ethers.BigNumber.from("163350000000000000") ) );
    let bob_bal_2 = await bob.getBalance();
    expect ( bob_bal_2.eq( bob_bal.add(ethers.BigNumber.from("9900000000000000") ) ) );
  });

});
