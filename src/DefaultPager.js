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
      : null}
  </div>
)

//
export default Pager
