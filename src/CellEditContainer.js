import React from 'react'
import R from 'ramda'
import { formatData, extractData } from './utils'
/* eslint-disable no-unused-vars  */
import { ROW_INDEX_ATTRIBUTE, COLUMN_INDEX_ATTRIBUTE } from './constants.js'
/* eslint-enable  no-unused-vars */
// import PropTypes from 'prop-types'

// TODO: determin prop types later
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

  commitEdit = commitedValue => {
    /**
     * TODO the following could be dynamic for example 1 value changing 2
     * may need special logic or tricks from header to describe this logic
     **/
    const { rowIndex, header, data, commitRowEdit } = this.props
    const value = R.isNil(commitedValue) ? this.state.value : commitedValue

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

  leaveEditState = () => {
    if (this.props.value !== this.state.value) {
      this.commitEdit()
      return
    }
    this.cancelEdit()
  }

  /** navigation props ***/

  selectLeftCell = () => {
    const { selectLeft } = this.props
    this.leaveEditState()
    selectLeft && selectLeft()
  }

  selectRightCell = () => {
    const { selectRight } = this.props
    this.leaveEditState()
    selectRight && selectRight()
  }

  selectTopCell = () => {
    const { selectTop } = this.props
    this.leaveEditState()
    selectTop && selectTop()
  }

  selectBottomCell = () => {
    const { selectBottom } = this.props
    this.leaveEditState()
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
    if (e.keyCode === 9) {
      e.preventDefault()
      this.selectRightCell()
    }
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

  dropdownKeyDown = e => {
    console.log('key typed in input', e.keyCode)
    // escape
    if (e.keyCode === 27) this.cancelEdit()
    // right arrow
    if (e.keyCode === 39) this.selectRightCell()

    // tab
    if (e.keyCode === 9) {
      e.preventDefault()
      this.selectRightCell()
    }
    // left arrow
    if (e.keyCode === 37) this.selectLeftCell()
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

  getInputProps = ({ refKey = 'ref' }) => ({
    ...this.getCommonProps(),
    onBlur: this.leaveEditState,
    [refKey]: this.refHandler,
    // ref: this.refHandler,
    onChange: this.inputValueChanged,
    onKeyDown: this.inputKeyDown,
  })

  dropdownValueChanged = ({ value }) => {
    console.log('selected and committing', value)
    this.commitEdit(value)
  }

  getDropdownProps = ({ refKey = 'ref' }) => ({
    ...this.getCommonProps(),
    onBlur: this.leaveEditState,
    [refKey]: this.refHandler,
    onChange: this.dropdownValueChanged,
    onKeyDown: this.dropdownKeyDown,
    choices: this.props.header.choices,
  })

  render() {
    const { render } = this.props
    return render({ getInputProps: this.getInputProps, getDropdownProps: this.getDropdownProps })
  }
}

export default CellEditContainer
