import React from 'react'
import styled from 'styled-components'

/* 100 vw due to some issue with semantic ui stuff */
const HiddenInput = styled.input`
  border: none;
  position: fixed;
  bottom: 0;
  right: 0;
  width: 100vw;
  height: 0px;
  &:focus {
    outline: none;
  }
`

export default HiddenInput
