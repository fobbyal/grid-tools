import React from 'react'
import { formatData, extractData } from './utils'
/* eslint-disable no-unused-vars  */
import { ROW_INDEX_ATTRIBUTE, COLUMN_INDEX_ATTRIBUTE } from './constants.js'
/* eslint-enable  no-unused-vars */
// import PropTypes from 'prop-types'

//TODO: determin prop types later
const getInitialState = ({ rowIndex, columnIndex, header, width, height, data, render }) => {
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
    // TODO: prevent string and number
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

  cancelEdit = _ => {
    if (this.props.cancelEdit) {
      this.props.cancelEdit()
    }
  }

  /** navigation props ***/

  selectLeftCell = () => {
    const { selectLeft } = this.props
    this.commitEdit()
    selectLeft && selectLeft()
  }

  selectRightCell = () => {
    const { selectRight } = this.props
    this.commitEdit()
    selectRight && selectRight()
  }

  selectTopCell = () => {
    const { selectTop } = this.props
    this.commitEdit()
    selectTop && selectTop()
  }

  selectBottomCell = () => {
    const { selectBottom } = this.props
    this.commitEdit()
    selectBottom && selectBottom()
  }

  inputKeyDown = e => {
    console.log('key typed in input', e.keyCode)
    // enter
    if (e.keyCode === 13) {
      this.commitEdit()
    }
    // escape
    if (e.keyCode === 27) {
      this.cancelEdit()
    }
    // right arrow
    if (
      e.keyCode === 39 &&
      this.node &&
      typeof this.node.selectionStart === 'number' &&
      this.node.selectionStart === this.node.value.length &&
      this.node.selectionStart === this.node.selectionEnd
    ) {
      this.selectRightCell()
    }

    // tab
    if (e.keyCode === 9) this.selectRightCell()
    // left arrow
    if (
      e.keyCode === 37 &&
      this.node &&
      typeof this.node.selectionStart === 'number' &&
      this.node.selectionStart === 0 &&
      this.node.selectionStart === this.node.selectionEnd
    ) {
      this.selectLeftCell()
    }

    // up arrow
    if (e.keyCode === 38) this.selectTopCell()
    // down arrow
    if (e.keyCode === 40) this.selectBottomCell()
  }

  getCommonProps = () => {
    const {
      style,
      className,
      rowIndex,
      columnIndex,
      width,
      alignment,
      height,
      fontSize,
      fontWeight,
    } = this.props

    const { value, display } = this.state
    return {
      style,
      className,
      COLUMN_INDEX_ATTRIBUTE: columnIndex,
      ROW_INDEX_ATTRIBUTE: rowIndex,
      width,
      height,
      fontSize,
      fontWeight,
      value,
      display,
      alignment,
    }
  }

  getInputProps = ({ refKey }) => ({
    ...this.getCommonProps(),
    onBlur: this.commitEdit,
    [refKey]: this.refHandler,
    // ref: this.refHandler,
    onChange: this.inputValueChanged,
    onKeyDown: this.inputKeyDown,
  })

  getDropdownProps = () => ({})

  render() {
    const { render } = this.props
    return render({ getInputProps: this.getInputProps })
  }
}

export default CellEditContainer
