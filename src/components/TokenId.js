import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const TagContainer = styled.div `
  display: flex;
  overflow: scroll;
  width: 100%;   
  max-width: 100%;
  padding-left: 14px;
  border: 1px grey solid;
  border-radius: 5px;
  color: black;
`

const Input = styled.input` 
  width: 100%;
  min-width: 50%;
  border: none;
  border-radius: 5px;
  padding: 14px;
  padding-left: 14px;
`

const Tag = styled.div`
  display: flex;
  align-items: center;
  margin: 7px 0;
  margin-right: 10px;
  padding: 0 10px;
  padding-right: 5px;
  border: 1px solid orange;
  border-radius: 5px;
  background-color: orange;
  white-space: nowrap;
  color: white;
`

const Button = styled.button`
  display: flex;
  padding: 6px;
  border: none;
  background-color: unset;
  cursor: pointer;
  color: white;
`

export default function TokenId(props) {
  const [input, setInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isKeyReleased, setIsKeyReleased] = useState(false);

  const onChange = (e) => {
    const { value } = e.target;
    setInput(value);
  };

  const onKeyDown = (e) => {
    const { key } = e;
    const trimmedInput = input.trim();
    const separators = [',', ' ', ';', '-', '_'];

    if (tags.includes(trimmedInput) && key !== "Backspace") {
      e.preventDefault();

      alert('Duplicated token ids are not allowed.');
      setInput('');
      setIsKeyReleased(false);
      return;
    }

    if (separators.includes(key) && trimmedInput.length) { //&& !tags.includes(trimmedInput)) {
      e.preventDefault();

      const trimmedInputNumber = parseInt(trimmedInput);
      if (trimmedInputNumber < 0 || trimmedInputNumber >= props.nTokens || typeof(trimmedInputNumber) === 'undefined') {
        alert('Please provide a valid token id.');
      } else {
        setTags(prevState => [...prevState, trimmedInput]);
        setInput('');
      }
    }

    if (key === "Backspace" && !input.length && tags.length && isKeyReleased) {
      const tagsCopy = [...tags];
      const poppedTag = tagsCopy.pop();
      e.preventDefault();
      setTags(tagsCopy);
      setInput(poppedTag);
    }

    setIsKeyReleased(false);
  };

  const onKeyUp = () => {
    setIsKeyReleased(true);
  }

  const deleteTag = (index) => {
    setTags(prevState => prevState.filter((tag, i) => i !== index))
  }
  
  return (
    <TagContainer>
      {tags.map((tag, index) => (
        <Tag key={index}>
          {tag}
          <Button onClick={() => deleteTag(index)}>x</Button>
        </Tag>
      ))}
      <Input
        disabled={!props.isSubmitted}
        value={input}
        placeholder="References (tokens ids)"
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onChange={onChange}
      />
    </TagContainer>
  )
}

TokenId.propTypes = {
    isSubmitted: PropTypes.bool,
    nTokens: PropTypes.number
}