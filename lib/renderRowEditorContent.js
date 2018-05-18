import React from 'react'
import styled from 'styled-components'
import R from 'ramda'
import { extractData, extractAndFormatData } from './utils'

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
  width: ${props => props.width || '45vw'};
  min-width: 45vw;
  max-width: 80vw;
  max-height: 80vh;
  overflow: auto;
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
  display: flex;
  align-items: center;
`
const Input = styled.input`
  flex: 0 0 ${props => props.width || '80px'};
  width: ${props => props.width || '80px'};
`

const RO = styled.div`
  flex: 0 0 ${props => props.width || '80px'};
  width: ${props => props.width || '80px'};
`

export const defaultInputRowEditRender = ({
  width,
  ref,
  rowData,
  header,
  valueChanged,
  onOk,
  onCancel,
  isKey,
  showAdd,
}) =>
  !showAdd && isKey ? (
    <RO width={width}> {extractAndFormatData({ header, rowData })} </RO>
  ) : (
    <Input
      width={width}
      onChange={e =>
        valueChanged({
          header,
          value: e.target.value,
        })
      }
      onKeyDown={e => {
        if (e.keyCode == 13) onOk()
        if (e.keyCode == 17) onCancel()
      }}
      innerRef={ref}
      value={extractData({ header, rowData }) || ''}
    />
  )
const getMaxWidth = R.compose(R.reduce(R.max, 100), R.map(h => h.width))
const defaultControlsRender = ({ onOk, onCancel }) => (
  <Buttons>
    <button onClick={onOk}>Save</button>
    <button onClick={onCancel}>Cancel</button>
  </Buttons>
)

const stripPx = val =>
  val && val.endsWith && val.endsWith('px')
    ? parseFloat(val.substring(0, val.length - 2))
    : parseFloat(val)

const rendeRowEditorContent = ({
  headerWidth,
  dataWidth,
  renderEditor = defaultInputRowEditRender,
  renderControls = defaultControlsRender,
} = {}) => ({ showAdd, rowData, headers, valueChanged, onOk, onCancel, initialFocusRef }) => {
  const width = getMaxWidth(headers) + 'px'
  const containerWidth =
    (stripPx(headerWidth) || getMaxWidth(headers)) +
    (stripPx(dataWidth) || getMaxWidth(headers)) +
    80 +
    'px'
  return (
    <Container width={containerWidth}>
      {headers.map((header, index) => {
        if (header.showInRowEditor) {
          const { ident, display, isKey } = header
          return (
            <RowContainer key={ident || '-editor'}>
              <Header isKey={isKey} width={headerWidth || width}>
                {display || ident}
              </Header>
              {renderEditor({
                width: dataWidth || width,
                valueChanged,
                ref: index === 0 ? initialFocusRef : undefined,
                rowData,
                header,
                index,
                onOk,
                onCancel,
                isKey,
                showAdd,
              })}
            </RowContainer>
          )
        } else return null
      })}
      {renderControls({ onOk, onCancel })}
    </Container>
  )
}

export default rendeRowEditorContent
