import React from 'react'
import R from 'ramda'
import styled from 'styled-components'

const PageButton = styled.button`
  font-weight: ${props => (props.disabled ? 'bold' : 'normal')};
  color: ${props => (props.disabled ? 'brown' : 'black')};
`

const Pager = ({
  style,
  className,
  totalPages,
  currentPage,
  setCurrentPage,
  incrementPage,
  decrementPage,
}) => (
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
            onClick={e => setCurrentPage(page)}
          >
            {page}
          </PageButton>
        ))
      : [
          <PageButton key="left" onClick={decrementPage}>
            {'<'}
          </PageButton>,
          <select
            value={currentPage}
            onChange={e => setCurrentPage(e.target.value)}
          >
            {R.range(1, totalPages + 1).map(page => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>,
          <span key="tp">of {totalPages}</span>,
          <PageButton key="right" onClick={incrementPage}>
            {'>'}
          </PageButton>,
        ]}
  </div>
)

//
export default Pager
