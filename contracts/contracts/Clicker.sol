// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Clicker is ERC721 {
    struct Player {
        uint256 totalClicks;
        uint256 nftCount;
    }

    uint256 private constant COMMON_TRIGGER = 100;
    uint256 private constant LEGENDARY_TRIGGER = 1000;
    uint256 private constant LEGENDARY_CHANCE = 10;

    uint256 private _tokenId;
    mapping(address => Player) public players;
    mapping(uint256 => string) private _tokenURIs;

    event ClickClaimed(address user, uint256 total);
    event NFTMinted(address user, uint256 id, string rarity);

    constructor() ERC721("ClickerNFT", "CLKRNFT") {}

    function claimClicks(uint256 clickCount) external {
        require(clickCount > 0, "InvalidClickCount"); // Проверка на нулевые клики
        Player storage player = players[msg.sender];
        player.totalClicks += clickCount;

        _checkRewards(msg.sender, clickCount);
        emit ClickClaimed(msg.sender, player.totalClicks);
    }

    function _checkRewards(address user, uint256 newClicks) private {
        Player memory player = players[user];
        uint256 total = player.totalClicks;

        // Common NFT: каждые 100 кликов
        uint256 newCommonRewards = (total / COMMON_TRIGGER) - ((total - newClicks) / COMMON_TRIGGER);
        for (uint256 i = 0; i < newCommonRewards; i++) {
            _mintNFT(user, "Common");
        }

        // Legendary NFT: каждые 1000 кликов с шансом 10%
        uint256 newLegendaryRewards = (total / LEGENDARY_TRIGGER) - ((total - newClicks) / LEGENDARY_TRIGGER);
        for (uint256 i = 0; i < newLegendaryRewards; i++) {
            if (uint256(keccak256(abi.encodePacked(block.prevrandao, user, i))) % 100 < LEGENDARY_CHANCE) {
                _mintNFT(user, "Legendary");
            }
        }
    }

    function _mintNFT(address to, string memory rarity) private {
        _tokenId++;
        _safeMint(to, _tokenId);
        _tokenURIs[_tokenId] = string(abi.encodePacked(
            '{"name": "', rarity, ' NFT", "image": "ipfs://QmXYZ/', rarity, '.png"}'
        ));
        players[to].nftCount++;
        emit NFTMinted(to, _tokenId, rarity);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }
}