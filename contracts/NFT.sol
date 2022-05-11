// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract NFT is ERC721URIStorage, ReentrancyGuard, Ownable {
  using Counters for Counters.Counter;
  using SafeMath for uint256;

  Counters.Counter private _tokenIds;

  mapping(uint256 => uint256) private _donationBalance;

  constructor() ERC721("SciGraph", "SCGP") {}

  // TODO add the references
  function createToken (string memory tokenURI) public returns(uint256) {
    uint256 newTokenId = _tokenIds.current();
    _tokenIds.increment();
    _mint(msg.sender, newTokenId);
    _setTokenURI(newTokenId, tokenURI);
    return newTokenId;
  }

  // TODO take a percentage of the donation to the protocol treasure
  function donate (uint256 tokenId) public payable nonReentrant {
    require(tokenId < _tokenIds.current(), "Token does not exist.");
    _donationBalance[tokenId] = _donationBalance[tokenId].add(msg.value);
  }

  function tokenDonationBalance (uint256 tokenId) public view returns (uint256) {
    return _donationBalance[tokenId];
  }

  function numberOfTokens () public view returns (uint256) {
    return _tokenIds.current();
  }

  // claim donation
  // withdraw treasure?
  // opensea royalties?

}