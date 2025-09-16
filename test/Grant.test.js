
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Grant Contract", function () {
  let GrantFactory, grantFactory;
  let GovernanceToken, governanceToken;
  let Grant;
  let owner, funder, grantee, voter1, voter2;

  beforeEach(async function () {
    [owner, funder, grantee, voter1, voter2] = await ethers.getSigners();

    // Deploy GovernanceToken
    GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    governanceToken = await GovernanceToken.deploy();
    await governanceToken.waitForDeployment();

    // Deploy GrantFactory
    GrantFactory = await ethers.getContractFactory("GrantFactory");
    grantFactory = await GrantFactory.deploy(await governanceToken.getAddress());
    await grantFactory.waitForDeployment();

    // Give voters some tokens and voting power
    await governanceToken.mint(voter1.address, ethers.parseEther("1000"));
    await governanceToken.mint(voter2.address, ethers.parseEther("1000"));
    
    await governanceToken.connect(voter1).stake(ethers.parseEther("500"));
    await governanceToken.connect(voter2).stake(ethers.parseEther("500"));
  });

  it("Should create a grant with proper initialization", async function () {
    const grantAmount = ethers.parseEther("10");
    const title = "Test Grant";
    const ipfsHash = "QmTestHash";
    const votingPeriod = 86400; // 1 day
    
    const tx = await grantFactory.connect(funder).createGrant(
      title,
      grantAmount,
      3, // 3 milestones
      ipfsHash,
      votingPeriod,
      { value: grantAmount }
    );
    
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === 'GrantCreated');
    const grantAddress = event.args[0];
    
    Grant = await ethers.getContractFactory("Grant");
    const grant = Grant.attach(grantAddress);
    
    expect(await grant.title()).to.equal(title);
    expect(await grant.funder()).to.equal(funder.address);
    expect(await grant.totalAmount()).to.equal(grantAmount);
    expect(await grant.ipfsHash()).to.equal(ipfsHash);
  });

  it("Should allow milestone submission and voting", async function () {
    // Create grant
    const grantAmount = ethers.parseEther("10");
    const tx = await grantFactory.connect(funder).createGrant(
      "Test Grant",
      grantAmount,
      1,
      "QmTestHash",
      3600, // 1 hour voting period
      { value: grantAmount }
    );
    
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === 'GrantCreated');
    const grantAddress = event.args[0];
    
    Grant = await ethers.getContractFactory("Grant");
    const grant = Grant.attach(grantAddress);
    
    // Assign grantee and set milestone
    await grant.connect(funder).assignGrantee(grantee.address);
    await grant.connect(funder).setMilestoneDetails(
      0,
      "First Milestone",
      "Complete initial work",
      grantAmount
    );
    
    // Submit milestone
    await grant.connect(grantee).submitMilestone(0, "QmProofHash");
    
    // Vote on milestone
    await grant.connect(voter1).vote(1, true); // Yes vote
    await grant.connect(voter2).vote(1, true); // Yes vote
    
    // Fast forward time and finalize
    await ethers.provider.send("evm_increaseTime", [3601]);
    await ethers.provider.send("evm_mine");
    
    await grant.finalizeVoting(0);
    
    const [, , , completed, fundsReleased] = await grant.getMilestone(0);
    expect(completed).to.be.true;
    expect(fundsReleased).to.be.true;
  });
});
