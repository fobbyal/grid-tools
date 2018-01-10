import React from 'react'
import styled from 'styled-components'
import { rawToValue } from './tools'
import R from 'ramda'

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
  min-width: 80vw;
  max-width: 80vw;
  max-height: 80vh;
  overflow: scroll;
`
const RowContainer = styled.div`
  display: flex;
  align-item: center;
  justify-content: center;
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

const defaultInputRenderer = ({
  width,
  ref,
  rowData,
  header,
  valueChanged,
}) => (
  <Input
    width={width}
    onChange={e =>
      valueChanged({
        ident: header.ident,
        value: rawToValue({ value: e.target.value, header }),
      })
    }
    innerRef={ref}
    value={rowData[header.ident]}
  />
)
const getMaxWidth = R.compose(R.reduce(R.max, 100), R.map(h => h.width))
const defaultControlsRender = ({ onOk, onCancel }) => (
  <Buttons>
    <button onClick={onOk}>Save</button>
    <button onClick={onCancel}>Cancel</button>
  </Buttons>
)

const rendeRowEditorContent = ({
  headerWidth,
  dataWidth,
  renderEditor = defaultInputRenderer,
  renderControls = defaultControlsRender,
} = {}) => ({
  rowData,
  headers,
  valueChanged,
  onOk,
  onCancel,
  initialFocusRef,
}) => {
  const width = getMaxWidth(headers) + 'px'

  return (
    <Container>
      {headers.map((header, index) => {
        const { ident, display } = header
        return (
          <RowContainer key={ident}>
            <Header width={headerWidth || width}>{display || ident}</Header>
            {renderEditor({
              width: dataWidth || width,
              valueChanged,
              ref: index === 0 ? initialFocusRef : undefined,
              rowData,
              header,
              index,
            })}
          </RowContainer>
        )
      })}
      {renderControls({ onOk, onCancel })}
    </Container>
  )
}

export default rendeRowEditorContent
