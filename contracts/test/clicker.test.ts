import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Clicker Contract", function () {
  let contract: any;
  let owner: any, user1: any, user2: any;

  before(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const Clicker = await ethers.getContractFactory("Clicker");
    contract = await Clicker.deploy();
  });

  it("Should initialize with zero clicks", async () => {
    const player = await contract.players(owner.address);
    expect(player.totalClicks).to.equal(0);
    expect(player.nftCount).to.equal(0);
  });

  it("Should claim 100 clicks and mint Common NFT", async () => {
    await expect(contract.claimClicks(100))
      .to.emit(contract, "ClickClaimed")
      .withArgs(owner.address, 100)
      .and.to.emit(contract, "NFTMinted")
      .withArgs(owner.address, 1, "Common");

    const player = await contract.players(owner.address);
    expect(player.totalClicks).to.equal(100);
    expect(player.nftCount).to.equal(1);
  });

  it("Should handle multiple claims correctly", async () => {
    // Первый вызов: 250 кликов (3 Common NFT: 200, 300)
    await contract.claimClicks(250);
    let player = await contract.players(owner.address);
    expect(player.totalClicks).to.equal(350);
    expect(player.nftCount).to.equal(3); // 1 (предыдущий) + 2

    // Второй вызов: 650 кликов (7 Common: 400,500,600,700,800,900,1000)
    await contract.claimClicks(650);
    player = await contract.players(owner.address);
    expect(player.totalClicks).to.equal(1000);
    expect(player.nftCount).to.equal(10); // 3 + 7
  });

  it("Should mint Legendary NFT with 10% chance", async () => {
    await ethers.provider.send("evm_setNextBlockTimestamp", [Date.now()]);
    await contract.claimClicks(1000); // 1000 кликов → 1 шанс на Legendary

    const balance = await contract.balanceOf(owner.address);
    expect(balance).to.be.gte(9); // 9 Common + возможный Legendary
  });

  it("Should prevent zero clicks claim", async () => {
    await expect(contract.claimClicks(0)).to.be.revertedWith(
      "InvalidClickCount"
    );
  });

  it("Should return correct token URI", async () => {
    const tokenURI = await contract.tokenURI(1);
    expect(tokenURI).to.include("Common NFT");
    expect(tokenURI).to.include("ipfs://QmXYZ/Common.png");
  });

  it("Should handle multiple users", async () => {
    await contract.connect(user1).claimClicks(200);
    await contract.connect(user2).claimClicks(500);

    const player1 = await contract.players(user1.address);
    const player2 = await contract.players(user2.address);

    expect(player1.totalClicks).to.equal(200);
    expect(player2.nftCount).to.equal(5);
  });
});
