import React from 'react'
import styled from 'styled-components'

const Buttons = styled.div`
  margin-top: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
`
const Container = styled.div`
  background-color: white;
  padding: 1.5em;
  border: solid #ccc 1px;
  border-radius: 3px;
  box-shadow: 6px 1px 12px 1px rgba(0, 0, 0, 0.5);
`
const RowContainer = styled.div`
  display: flex;
  align-item: center;
`
const Header = styled.div`
  flex: 0 0 ${props => props.headerWidth || '80px'};
  font-size: 0.75em;
  font-weight: bold;
`

const defaultRowEditorRenderer = ({
  rowData,
  headers,
  valueChanged,
  onOk,
  onCancel,
}) => (
  <Container>
    {headers.map(({ ident, type, display }) => (
      <RowContainer key={ident}>
        <Header>{display || ident}</Header>
        <input
          onChange={e => valueChanged({ ident, value: e.target.value })}
          value={rowData[ident]}
        />
      </RowContainer>
    ))}
    <Buttons>
      <button onClick={onOk}>OK</button>
      <button onClick={onCancel}>Cancel</button>
    </Buttons>
  </Container>
)
//

export default defaultRowEditorRenderer
