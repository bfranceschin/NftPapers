import react from "react";
import NftItem from './nft_item'

const NftList = ({nfts, buttonTitle, buttonFunc}) => {
  return (
    <div>
      <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: '1600px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <NftItem key={nft.tokenId} nft={nft} buttonTitle={buttonTitle} buttonFunc={() => buttonFunc(nft)} ></NftItem>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )

}

export default NftList