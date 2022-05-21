import { ethers } from 'ethers'
import Web3Modal from "web3modal"
import axios, { Axios } from 'axios'

import {
  contractAddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

export const ipfsToHTTP = (ipfsName) => ipfsName.replace("ipfs://", "https://ipfs.io/ipfs/");

const getSignerContract = async () => {
  const web3Modal = new Web3Modal()
  const connection = await web3Modal.connect()
  const provider = new ethers.providers.Web3Provider(connection)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, NFT.abi, signer)
  return contract
}

// it doesnt need a callback, you can do this using await or .then() on the caller
export const donate = async (tokenId, amount, callBack) => {
  const contract = await getSignerContract()
  console.log("Donate", tokenId)
  console.log("Value", amount)
  const transaction = await contract.donate(ethers.BigNumber.from(tokenId), {value: amount})
  console.log(transaction)
  await transaction.wait()
  callBack()
}

// it doesnt need a callback, you can do this using await or .then() on the caller
export const createToken = async (uri, references, callBack) => {
  const contract = await getSignerContract()
  const transaction = await contract.createToken(uri, references)
  await transaction.wait()
  callBack()
}

const forEachNft = async (provider, func) => {
  const values = []
  try {
    const contract = new ethers.Contract(contractAddress, NFT.abi, provider)
    const numberOfTokens = (await contract.numberOfTokens()).toNumber()
    for (let i = 0; i<numberOfTokens; i++) {
      values.push(func(contract, i))
    } 
  }
  catch (error) {
    console.error(error);
  }
  return Promise.all(values)
}

export const getURIs = async (provider) => {
  return forEachNft(provider, (contract, tokenId) => contract.tokenURI(tokenId))
}

export const getDonationBalances = async (provider) => {
  return forEachNft(provider, (contract, tokenId) => contract.tokenDonationBalance(tokenId))
}

export const getNftMetaData = async (provider) => {
  const func = async (contract, tokenId) => {
    const uri = await contract.tokenURI(tokenId)
    const request =  await axios.get(ipfsToHTTP(uri))
    return request.data
  }
  return forEachNft(provider, func)
}

export const getNfts = async (provider) => {
  const [metaData, donationBalances] = await Promise.all([getNftMetaData(provider), getDonationBalances(provider)])
  const nfts = metaData.map((meta, i) => {
    const nft = {...meta}
    if (donationBalances[i]) {
      nft.donationBalance = ethers.utils.formatEther(donationBalances[i].toString())
    }
    nft.tokenId = i
    nft.image = ipfsToHTTP(nft.image)
    return nft
  })
  return nfts
}

