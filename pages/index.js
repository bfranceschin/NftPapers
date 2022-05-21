import styles from '../styles/Home.module.css'
import { ethers } from 'ethers'
import axios, { Axios } from 'axios'
// import {Web3Modal} from "web3modal"
import Web3Modal from "web3modal"
import { useEffect, useState } from 'react'
import { 
  donate,
  getNfts,
  createToken,
  ipfsToHTTP
} from '../src/client_utils'
import SearchBar from '../src/components/searchbar'
// import NftItem from '../src/components/nft_item'
import NftList from '../src/components/nft_list'

import {
  contractAddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

let numberOfNftsDisplayed = 10

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [filterStr, setFilterStr] = useState('')

  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs () {
    // fetch last nfts from the blockchain
    const provider = new ethers.providers.JsonRpcProvider()
    const contract = new ethers.Contract(contractAddress, NFT.abi, provider)
    const newNfts = await getNfts(provider)
    if (newNfts.length > 0) {
      setNfts(newNfts)
    }
    setLoadingState('loaded')
    console.log(newNfts.slice(-numberOfNftsDisplayed))
  }

  const donateButton = (nft) => {
    const eth = ethers.utils.parseEther("1")
    console.log(eth)
    console.log(eth.toString())
    donate(nft.tokenId, ethers.utils.parseEther("1").toString(), () => {loadNFTs()})
  }

  // const testMint = () => {
  //   const baseIpfs = "ipfs://bafybeifz4j5ayidyb4xcu4ant6cetsxcccl6jcwciwrq7clkhvb3l3h7nm" // invisible friends cid
  //   const ref = [0, 1, 2]
  //   // const ref = []
  //   createToken(baseIpfs + "/" + nfts.length, ref, () => {loadNFTs()})
  // }

  const searchChange = (event) => {
    console.log(event.target.value)
    setFilterStr(event.target.value)
  }

  const getDisplayTokens = () => {
    let displayNfts = nfts
    let numberFilter = parseInt(filterStr)
    if (!isNaN(numberFilter) && numberFilter < displayNfts.length) {
      displayNfts = [displayNfts[numberFilter]]
    }
    else if (filterStr !== '' ) {
      displayNfts = displayNfts.filter(nft => nft.name.toLowerCase().includes(filterStr.toLocaleLowerCase()))
    }
    return displayNfts.slice(-numberOfNftsDisplayed).reverse()
  }

  // hook to reload nfts as a token is minted
  // hook to update donation balance

  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No papers minted yet.</h1>)

  return (
    <div>
      <p> Should show some instructions and the latest papers published.</p>
      <SearchBar onSearchChange={searchChange}></SearchBar>
      {/* <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={testMint}>Test Mint</button> */}
      <NftList nfts={getDisplayTokens()} buttonTitle="Donate" buttonFunc={donateButton}></NftList>
      {/* <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: '1600px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              getDisplayTokens().map((nft, i) => (
                <NftItem key={nft.tokenId} nft={nft} buttonTitle={"Donate"} buttonFunc={() => donateButton(nft)} ></NftItem>
              ))
            }
          </div>
        </div>
      </div> */}
    </div>
  )
}
