import React from 'react'

/* 100 vw due to some issue with semantic ui stuff */
const style = {
  border: 'none',
  position: 'fixed',
  bottom: 0,
  right: 0,
  width: '100vw',
  height: '0px',
  outline: 'none',
}

const HiddenInput = () => <input className="grid-hidden-helper" style={style} />
//
export default HiddenInput
