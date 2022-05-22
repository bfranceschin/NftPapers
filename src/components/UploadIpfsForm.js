import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import DropFileInput from '../components/DropFileInput'

export default function UploadIpfsForm(props) {
  return (
    <div>
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
    </div>
  )
}