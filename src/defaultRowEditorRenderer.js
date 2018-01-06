import React from 'react'
import styled from 'styled-components'
import { rawToValue } from './tools'

const Buttons = styled.div`
  margin-top: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
`
const Container = styled.div`
  background-color: white;
  padding: 1.5em 20px;
  border: solid #ccc 1px;
  border-radius: 3px;
  box-shadow: 6px 1px 12px 1px rgba(0, 0, 0, 0.5);
  min-width: ${props => props.minWidth || '300px'};
`
const RowContainer = styled.div`
  display: flex;
  align-item: center;
  margin-bottom: 0.5em;
`
const Header = styled.div`
  flex: 0 0 ${props => props.width || '80px'};
  font-size: 0.75em;
  font-weight: bold;
`
const Input = styled.input`
  flex: 0 0 ${props => props.width || '80px'};
  width: ${props => props.width || '80px'};
`

const stripPx = val =>
  val.endsWith('px')
    ? val.substr(0, val.length - 2)
    : val.endsWith('em') ? undefined : val

const defaultRowEditorRenderer = ({
  headerWidth = '80px',
  inputWidth = '80px',
  containerMinWidth = '300px',
  /**
   * add renders for differentTypes
   */
} = {}) => ({
  rowData,
  headers,
  valueChanged,
  onOk,
  onCancel,
  initialFocusRef,
}) => {
  const calculatedWidth =
    parseFloat(stripPx(headerWidth)) + parseFloat(stripPx(inputWidth)) + 40

  return (
    <Container
      minWidth={
        isNaN(calculatedWidth) ? containerMinWidth : calculatedWidth + 'px'
      }
    >
      {headers.map((header, index) => {
        const { ident, display } = header
        return (
          <RowContainer key={ident}>
            <Header width={headerWidth}>{display || ident}</Header>
            <Input
              width={inputWidth}
              onChange={e =>
                valueChanged({
                  ident,
                  value: rawToValue({ value: e.target.value, header }),
                })
              }
              innerRef={index === 0 ? initialFocusRef : undefined}
              value={rowData[ident]}
            />
          </RowContainer>
        )
      })}
      <Buttons>
        <button onClick={onOk}>OK</button>
        <button onClick={onCancel}>Cancel</button>
      </Buttons>
    </Container>
  )
}
//

export default defaultRowEditorRenderer
