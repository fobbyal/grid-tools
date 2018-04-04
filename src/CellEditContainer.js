import React from 'react'
import { BasicCellInput } from './Components'
import { sumWidth, formatData, extractData, sumHeight } from './utils'
import { ROW_INDEX_ATTRIBUTE, COLUMN_INDEX_ATTRIBUTE } from './constants.js'

export const CellEditor = BasicCellInput.extend`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
`

const getInitialState = ({
  rowIndex,
  columnIndex,
  header,
  width,
  height,
  data,
  render,
  isEditing,
  ...rest
}) => {
  const value = extractData({ header, rowData: data[rowIndex] }) || ''
  const display = formatData({ header, value, rowData: data[rowIndex] })
  return { value, display }
}

class CellEditContainer extends React.Component {
  state = getInitialState(this.props)

  componentDidMount() {
    // console.log(this.node)
    // console.log(this.node.focus)
    if (this.node && this.node.focus) {
      this.node.focus()
      if (this.node.setSelectionRange) {
        this.node.setSelectionRange(0, this.node.value.length)
      }
    }
  }

  valueChanged = value => {
    console.log('value changed to', value)
    const { header, data, rowIndex } = this.props
    const display = formatData({ header, value, rowData: data[rowIndex] })
    this.setState({ value, display })
  }

  inputValueChanged = e => {
    this.valueChanged(e.target.value)
  }

  refHandler = n => (this.node = n)

  commitEdit = _ => {
    /**
     * TODO the following could be dynamic for example 1 value changing 2
     * may need special logic or tricks from header to describe this logic
     **/
    const { rowIndex, header, data, commitRowEdit } = this.props
    const { value } = this.state

    const rowData = data[rowIndex]
    if (commitRowEdit) {
      commitRowEdit({ currentRow: rowData, editedRow: { ...rowData, [header.ident]: value } })
    } else {
      console.warn('commitRowEdit must be set on CellEditContainer for edit to have effect')
    }
  }

  cancelEdit = _ => {}

  render() {
    const { rowIndex, columnIndex, width, alignment, height, fontSize, fontWeight } = this.props

    const { value, display } = this.state

    return (
      <CellEditor
        {...{
          COLUMN_INDEX_ATTRIBUTE: columnIndex,
          ROW_INDEX_ATTRIBUTE: rowIndex,
          width,
          height,
          fontSize,
          fontWeight,
          value,
          display,
          alignment,
        }}
        onBlur={this.commitEdit}
        innerRef={this.refHandler}
        onChange={this.inputValueChanged}
      />
    )
  }
}

export default CellEditContainer
