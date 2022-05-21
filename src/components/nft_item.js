import react from "react";

const NftItem = ({nft, buttonTitle, buttonFunc}) => {
  // console.log("nft.tokenId", nft.tokenId)
  // console.log("nft.name", nft.name)
  return (
    // <div key={"nft" + nft.tokenId} className="border shadow rounded-xl overflow-hidden">
    <div  className="border shadow rounded-xl overflow-hidden">
      <img src={nft.image} />
      <div className="p-4">
        <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
        <div style={{ height: '70px', overflow: 'hidden' }}>
          <p className="text-gray-400">{nft.description}</p>
        </div>
      </div>
      <div className="p-4 bg-black">
        <p className="text-2xl font-bold text-white">{nft.donationBalance} ETH</p>
        <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={buttonFunc}>{buttonTitle}</button>
      </div>
    </div>
  )
}

export default NftItem