// eslint-disable-next-line no-async-promise-executor
import React from 'react'
import R from 'ramda'
import { formatData, extractData } from './utils'
/* eslint-disable no-unused-vars  */
import { ROW_INDEX_ATTRIBUTE, COLUMN_INDEX_ATTRIBUTE } from './constants.js'
/* eslint-enable  no-unused-vars */
// import PropTypes from 'prop-types'

// TODO: determine prop types later
// eslint-disable-next-line standard/object-curly-even-spacing
const getInitialState = ({ rowIndex, header, data /* columnIndex, width, height, render */ }) => {
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
    // console.log('value changed to', value)
    // TODO: prevent string and number
    const { header, data, rowIndex } = this.props
    const display = formatData({ header, value, rowData: data[rowIndex] })
    this.setState({ value, display })
  }

  inputValueChanged = e => {
    this.valueChanged(e.target.value)
  }

  refHandler = n => (this.node = n)

  commitEdit = committedValue => {
    /**
     * TODO the following could be dynamic for example 1 value changing 2
     * may need special logic or tricks from header to describe this logic
     **/
    const { rowIndex, header, data, commitRowEdit } = this.props
    const value = R.isNil(committedValue) ? this.state.value : committedValue

    const rowData = data[rowIndex]

    // if (header.setInvalidMessage && header.setInvalidMessage({ header, rowData, value, rowIndex, data })) {
    //   this.cancelEdit()
    //   return
    // }

    if (commitRowEdit) {
      commitRowEdit({
        currentRow: rowData,
        editedRow: { ...rowData, [header.ident]: value },
        rowIndex,
        header,
        data,
      })
    } else {
      console.warn('commitRowEdit must be set on CellEditContainer for edit to have effect')
    }
  }

  cancelEdit = _ => {
    const { rowIndex, header, data, cancelEdit } = this.props
    if (cancelEdit) {
      cancelEdit({ rowIndex, header, data })
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
    // console.log('key typed in input', e.keyCode)
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
    // console.log('key typed in dropdown selector', e.keyCode)
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

  dropdownInputKeyDown = e => {
    // console.log('key typed in dropdown input', e.keyCode)
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
    'data-testid': 'cell-editing-element',
  })

  dropdownValueChanged = ({ value }) => {
    // console.log('selected and committing', value)
    this.commitEdit(value)
  }

  getDropdownProps = ({ refKey = 'ref' }) => {
    const choices = this.props.header && this.props.header.choices
    const acceptRawText = (this.props.header && this.props.header.acceptRawText) || false
    const virtualized = choices && choices.length > 10
    const onKeyDown = virtualized ? this.dropdownInputKeyDown : this.dropdownKeyDown
    return {
      ...this.getCommonProps(),
      onBlur: this.leaveEditState,
      [refKey]: this.refHandler,
      onChange: this.dropdownValueChanged,
      onKeyDown,
      choices,
      virtualized,
      acceptRawText,
      valueChanged: this.valueChanged,
      'data-testid': 'cell-editing-element',
    }
  }

  render() {
    const { render, ...rest } = this.props
    return render({
      ...rest,
      getInputProps: this.getInputProps,
      getDropdownProps: this.getDropdownProps,
    })
  }
}

export default CellEditContainer
