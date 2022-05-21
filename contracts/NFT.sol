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
  
  mapping(uint256 => uint256[]) private _references;

  uint private _treasuryBalance;

  event ReferencesUpdated(uint256 tokenId);

  event BalanceUpdated(uint256 tokenId, uint256 value);

  event DonationClaimed(uint256 tokenId, uint256 totalFunds);
  
  constructor() ERC721("SciGraph", "SCGP") {}

  
  function createToken (string memory tokenURI, uint256[] memory refs) public returns(uint256) {
    uint256 newTokenId = _tokenIds.current();
    _tokenIds.increment();
    _mint(msg.sender, newTokenId);
    _setTokenURI(newTokenId, tokenURI);
    _createReferences(newTokenId, refs);
    return newTokenId;
  }

  // receives a donation and tokenId
  // updates _donationBalance[tokenId]
  // takes a cut for the treasury
  // 
  function donate (uint256 tokenId) public payable nonReentrant {
    require(tokenId < _tokenIds.current(), "Token does not exist.");
    uint256 _tax = msg.value / 100;
    _donationBalance[tokenId] = _donationBalance[tokenId].add(msg.value -_tax);
    emit BalanceUpdated(tokenId, msg.value - _tax);
    _treasuryBalance += _tax;
  }

  function tokenDonationBalance (uint256 tokenId) public view returns (uint256) {
    return _donationBalance[tokenId];
  }

  function numberOfTokens () public view returns (uint256) {
    return _tokenIds.current();
  }

    function getTreasuryBalance() public view returns (uint256) {
    return _treasuryBalance;
  }

// returns a list of references of a tokenId
// 
  function getReferences (uint256 tokenId) public view returns(uint256[] memory) {
    require(tokenId >= 0 && tokenId < _tokenIds.current(), "_getReferences : enter a valid token Id");
    return _references[tokenId];
  }

// creates the list of references for tokenId in _references mapping 
// verifies if the entries in the list are valid _tokenIds
// 
  function _createReferences (uint256 tokenId, uint256[] memory refs) private { 
    uint i;
    for (i=0 ; i < refs.length ; i++){
      require( refs[i] < _tokenIds.current() , "_createReferences: Invalid tokenId in Reference entries" );
    } 
    
    _references[tokenId] = refs;

  }


// receives a tokenId and a list of references (refs)
// adds refs entries to _references[tokenId]
// only callable by token owner
// 
  function addReferences(uint256 tokenId, uint256[] memory refs) public {
    require(ownerOf(tokenId) == msg.sender, "addReferences: Only owner of token can perform this task");
    uint i;
    for(i = 0 ; i < refs.length ; i++) {
      require(refs[i] < _tokenIds.current(), "addReferences: Invalid tokenId in Reference entries" );
      _references[tokenId].push(refs[i]);
      }
    emit ReferencesUpdated(tokenId);
  }

// receives a tokenId and a list of references (refs)
// subtracts refs entries from _references[tokenId] (in case of common entries)
// Note: 
//  - in case of repeated entries in _references 
// its only gonna subtract the quantity of repeated entries in refs
//  - only callable by token owner
// 
  function subReferences(uint256 tokenId, uint256[] memory refs) public {
    require(ownerOf(tokenId) == msg.sender, "subReferences: Only owner of token can perform this task" );
    require(_references[tokenId].length > 0 , "subReferences: There are no references to be subtracted" );
    uint256 i;
    uint256 j;
    for(i=0 ; i < refs.length ; i++){
      for(j=0 ; j < _references[tokenId].length ; j++){
        if (refs[i] == _references[tokenId][j]){
          // moves last entry to position j and pops
          _references[tokenId][j]=_references[tokenId][_references[tokenId].length-1];
          _references[tokenId].pop();
          break;
        }
      }
      emit ReferencesUpdated(tokenId);
    }
  }

// receives a tokenId
// distributes part of funds to references
// transfers the rest to token owner
// 
  function claimDonation (uint256 tokenId) public payable nonReentrant {
    require(_donationBalance[tokenId] > 0, "claimDonation: There is no balance to be claimed" );
    
    uint256 claimer_cut = (_donationBalance[tokenId])/100; // 1% claim fee
    emit DonationClaimed(tokenId, _donationBalance[tokenId]);
    _donationBalance[tokenId] -= claimer_cut;

    address payable owner = payable( ownerOf(tokenId) );
    uint256 owner_cut;

    if(_references[tokenId].length >0 ){
      
      owner_cut = _fundRefs(tokenId);
    }
    else{

      owner_cut = _donationBalance[tokenId];
    }
    
    _donationBalance[tokenId] = 0 ;

    // owner.transfer(owner_cut);
    (bool success, ) = owner.call{value: owner_cut}("");
    require(success, "claimDonation: Transfer of owner's funds failed");
    
    (bool success_, ) = payable(msg.sender).call{value: claimer_cut}("");
    require(success_ , "claimDonation: Transfer of claimer's funds failed");
  }

// distributes part of the funds in _donationBalance[tokenId] to the references
// 
  function _fundRefs (uint256 _tokenId) private returns(uint256 owner_cut)  {

    uint256 _owner_cut;
    uint256 refs_cut;

    _owner_cut = ( _donationBalance[_tokenId] * 2 ) / 3;
    refs_cut =  _donationBalance[_tokenId] /3 ;
    _owner_cut += ( _donationBalance[_tokenId] - _owner_cut - refs_cut );
    refs_cut = refs_cut / _references[_tokenId].length ; 


    uint256 i;
    for(i=0 ; i < _references[_tokenId].length ; i++){
      _donationBalance[ _references[_tokenId][i] ] = _donationBalance[ _references[_tokenId][i] ].add(refs_cut);
      emit BalanceUpdated( _references[_tokenId][i], refs_cut );
    }

    return _owner_cut;
  }
 
  
  // withdraw treasure?
  // opensea royalties?

}