import React from 'react'
import R from 'ramda'
import styled from 'styled-components'

const PageButton = styled.button`
  font-weight: ${props => (props.disabled ? 'bold' : 'normal')};
  color: ${props => (props.disabled ? 'brown' : 'black')};
  height: 25px;
`

const Select = styled.select`
  height: 25px;
  margin-left: 5px;
`
const TotalPages = styled.span`
  margin-left: 5px;
  margin-right: 5px;
`

const Pager = ({
  style,
  className,
  totalPages,
  currentPage,
  setCurrentPage,
  incrementPage,
  decrementPage,
}) => {
  console.log('current page is', currentPage)
  return (
    <div
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className={className}
    >
      {totalPages <= 12
        ? R.range(1, totalPages + 1).map(page => (
            <PageButton
              disabled={page === currentPage}
              key={'page' + page}
              onClick={_ => setCurrentPage(page)}
            >
              {page}
            </PageButton>
          ))
        : [
            <PageButton key="left" onClick={decrementPage}>
              &#x25c0;
            </PageButton>,
            <Select key="select" value={currentPage} onChange={e => setCurrentPage(e.target.value)}>
              {R.range(1, totalPages + 1).map(page => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </Select>,
            <TotalPages key="tp">of {totalPages}</TotalPages>,
            <PageButton key="right" onClick={incrementPage}>
              &#x25b6;
            </PageButton>,
          ]}
    </div>
  )
}

//
export default Pager
