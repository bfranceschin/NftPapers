import styles from '../styles/Home.module.css'

import { useEffect, useState } from 'react'
import { useForm } from "react-hook-form"
import { useRouter } from 'next/router';
import Image from 'next/image'

import DropFileInput from '../src/components/DropFileInput'
import TokenId from '../src/components/TokenId'

import { NFTStorage, File } from 'nft.storage'
import { NFTStorageKey } from '../nftStorageApi'

const NUMBER_OF_TOKENS = 10

async function storeNFT(image, pdf, title, abstract, keywords) {
    const nftstorage = new NFTStorage({ token: NFTStorageKey })

    return nftstorage.store({
        image,
        name: title,
        description: 'This is a NFT of the project NFTPapers',
        properties: {
          pdf,
          title, 
          abstract,
          keywords
        }
    })
}

export default function Publish() {
  const { handleSubmit, formState } = useForm();
  const { isSubmitting, isSubmitted } = formState;
  const [currentFiles, setCurrentFiles] = useState([])
  const [title, setTitle] = useState('')
  const [abstract, setAbstract] = useState('')
  const [keywords, setKeywords] = useState('')
  const [storageResponse, setStorageResponse] = useState({})
  const router = useRouter();

  const onFileChange = (files) => {
    setCurrentFiles(files)
    console.log(files); //debug
    console.log(currentFiles); //debug
  }

  const onSubmit = async () => {
    if (currentFiles.length !== 2) {
      alert('Error on file upload: please submit one image file and one pdf')
      return null
    }

    const imageFile = currentFiles.filter(file => file.type.split('/')[0] === 'image')
    const pdfFile = currentFiles.filter(file => file.type.split('/')[1] === 'pdf')

    console.log('imageFile ', imageFile) //debug
    console.log('pdfFile', pdfFile) //debug
    console.log('title', title) //debug
    console.log('abstract', abstract) //debug
    console.log('keywords', keywords) //debug

    if (imageFile.length === 0 || pdfFile.length === 0) {
      alert('Error on file upload: please submit one image file and one pdf')
      return null
    }

    const response = await storeNFT(imageFile[0], pdfFile[0], title, abstract, keywords)
    setStorageResponse({response})
  }

  const handleClick = () => {
    // console.log('[handleClick] storageResponse.response.url', storageResponse.response.url)
    router.push('/dashboard')
  }

  return (
    <div>
      <div className={styles.container}>
        <h1>Publish</h1>
        <br></br>
        <p> Should handle the user input and and store it in ipfs and interact with the smart contracts.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          <textarea 
            placeholder='Title of the paper' 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            rows={1}
            cols={50}
          />
        </label>
        <label>
          <textarea 
            placeholder='Keywords' 
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            rows={1}
            cols={50}
          />
        </label>
        <label> 
        <textarea
          placeholder='Abstract' 
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          rows={5}
          cols={50}
        />
        </label>
        <div className="boxPublish">
            <h2 className="headerPublish">
                React drop files input
            </h2>
            <DropFileInput
                onFileChange={(files) => onFileChange(files)}
            />
        </div>
        <button disabled={isSubmitting} className="btn btn-primary mr-1">
            {isSubmitting && <span className="spinner-border spinner-border-sm mr-1"></span>}
            Upload to IPFS
        </button>
      </form>
      {isSubmitted && <div> Upload is completed! </div>}
      <TokenId isSubmitted={isSubmitted} nTokens={NUMBER_OF_TOKENS}/>
      <button 
        disabled={!isSubmitted} 
        className="btn btn-primary mr-1"
        onClick={handleClick}
      >
        Mint NFT
      </button>
    </div>
  )
}
