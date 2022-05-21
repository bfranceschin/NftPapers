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
    expect(balance).to.eq(net_donation);
    let treasury_bal = await contract.getTreasuryBalance();
    expect(treasury_bal).to.eq( donationAmount.sub(net_donation) );
    // // testing donations < 100
    const smallDonation = 90;
    await contract.connect(alice).donate(0, {value: smallDonation});
    balance_dash = await contract.tokenDonationBalance(0);
    // // balance_dash should be balance + smallDonation
    expect(balance_dash).to.eq( balance.add(smallDonation) );
    // // treasury_bal should be the same as above
    expect(treasury_bal).to.eq( donationAmount.sub(net_donation) );
  });

  it.skip("Test create/get references", async function () {
    let refs0 = await contract.getReferences(0);
    expect(refs0.length).to.eq(0);
    // 
    // creates _tokenIds[1]
    // tests references of _tokenIds[1]
    await contract.createToken(token0Uri, [0]);
    let refs1 = await contract.getReferences(1);
    expect(refs1.length).to.eq(1);
    expect(refs1[0]).to.eq(0);
    // // 
    // // creates _tokenIds[2]
    // // tests refs
    let ref_2 = [0,1];
    await contract.createToken(token0Uri, ref_2);
    let refs2 = await contract.getReferences(2);
    expect(refs2.length).to.eq(ref_2.length);
    for(i=0 ; i<refs2.length ; i++) {
      expect(refs2[i]).to.eq( ref_2[i] ); 
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
    expect(refs0.length).to.eq(new_refs.length);
    for(i=0 ; i<refs0.length ; i++){
      expect( refs0[i] ).to.eq( new_refs[i] );
    }
    let another_ref = [99];
    await expect(contract.addReferences(0, another_ref)).to.be.revertedWith("addReferences: Invalid tokenId in Reference entries");
    await expect(contract.connect(alice).addReferences(0,[1])).to.be.revertedWith("addReferences: Only owner of token can perform this task")
  });

  it.skip("Tests subtract references", async function () {
    
    await expect(contract.subReferences(0, [1])).to.be.revertedWith("subReferences: There are no references to be subtracted");
        // _tokenIds[1]
    await contract.createToken(token0Uri, []);
    // // _tokenIds[2]
    await contract.createToken(token0Uri, []);
    await contract.addReferences(0,[1,2]);
    await expect(contract.connect(alice).subReferences(0,[1])).to.be.revertedWith("subReferences: Only owner of token can perform this task");
    await contract.subReferences(0, [1]);
    let ref = await contract.getReferences(0);
    expect(ref[0]).to.eq(2);
    await contract.subReferences(0, [2]);
    ref = await contract.getReferences(0);
    expect(ref.length).to.eq(0);
  });

  it("Tests claim donations", async function () {
    let owner_bal = await owner.getBalance();
    const donationAmount = ethers.utils.parseEther("1");
    await contract.connect(alice).donate(0, {value: donationAmount});
    await contract.connect(bob).claimDonation(0);
    let owner_bal_2 = await owner.getBalance();
    const net_donation = ( donationAmount.mul(99) ).div(100);
    expect ( owner_bal_2).to.eq( owner_bal.add(  ( net_donation.mul(99) ).div(100)  ) );
    
    await expect(contract.claimDonation(0)).to.be.revertedWith( "claimDonation: There is no balance to be claimed");
    // // _tokenIds[1]
    await contract.createToken(token0Uri, []);
    // // _tokenIds[2]
    await contract.createToken(token0Uri, []);
    const refs = [1,2];
    await contract.addReferences(0, refs);

    await contract.connect(alice).donate(0, {value: donationAmount});
    owner_bal = await owner.getBalance();
    let bob_bal = await bob.getBalance();
    let tx_claim = await contract.connect(bob).claimDonation(0);
    owner_bal_2 = await owner.getBalance();
    expect ( owner_bal_2 ).to.eq( owner_bal.add( ( ( ( net_donation.mul(99) ).div(100) ).mul(2) ).div(3) ) );
    
    let token1_bal = await contract.tokenDonationBalance(1);
    let token2_bal = await contract.tokenDonationBalance(2);
    expect ( token1_bal ).to.eq( ( ( ( net_donation.mul(99) ).div(100) ).div(3) ).div(refs.length) ) ;
    expect ( token2_bal ).to.eq( ( ( ( net_donation.mul(99) ).div(100) ).div(3) ).div(refs.length) ) ;
    
    let bob_bal_2 = await bob.getBalance();
    receipt = await tx_claim.wait();
    const tx_gasPaid = receipt.gasUsed * receipt.effectiveGasPrice;
    expect(bob_bal_2).to.eq( ( bob_bal.add( net_donation.div(100) ) ).sub(tx_gasPaid) );
  });

});
