import React from 'react'
import Overlay from './Overlay'
import { rawToValue, extractData } from './utils'
import R from 'ramda'

class RowEditor extends React.Component {
  state = {
    editedRow: this.props.rowData || {},
  }

  valueChanged = ({ header, value }) => {
    console.log('editing row with raw info', header, value)
    const parsedValue = rawToValue({ value, header })
    console.log('row editor parsed ', parsedValue)
    if (parsedValue !== undefined) {
      this.setState(({ editedRow }) => ({
        editedRow: header.dataSetter
          ? header.dataSetter({
              rowData: editedRow,
              header,
              value: parsedValue,
            })
          : { ...editedRow, [header.ident]: parsedValue },
      }))
    }
  }

  onOk = e => {
    const { rowData, headers } = this.props
    const { editedRow } = this.state

    if (rowData !== editedRow) {
      const removeDotsOnEditedNums = R.compose(
        R.reduce((a, b) => ({ ...a, ...b }), editedRow),
        R.map(([header, value]) => {
          const val = rawToValue({
            header,
            value: value.substr(0, value.length - 1),
          })
          return header.dataSetter
            ? header.dataSetter({ rowData: editedRow, header, value: val })
            : { [header.ident]: val }
        }),
        R.filter(
          ([_, value]) => typeof value === 'string' && value.endsWith('.')
        ),
        R.map(header => [header, extractData({ rowData: editedRow, header })]),
        R.filter(
          header =>
            extractData({ rowData, header }) !==
            extractData({ rowData: editedRow, header })
        ),
        R.filter(h => h.type === 'num')
      )
      const data = removeDotsOnEditedNums(headers)
      console.log('normalized data is ', data)
      this.props.commitEdit({
        currentRow: this.props.rowData,
        editedRow: data,
      })
    } else {
      this.props.commitEdit({
        currentRow: this.props.rowData,
        editedRow: this.state.editedRow,
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.isEditing && this.props.isEditing) {
      if (this.focusNode) {
        if (this.focusNode) this.focusNode.focus()
        if (this.focusNode.setSelectionRange) {
          this.focusNode.setSelectionRange(0, this.focusNode.value.length)
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.rowData !== nextProps.rowData) {
      this.setState({ editedRow: nextProps.rowData || {} })
    }
  }

  render() {
    const { isEditing, onClose, render } = this.props
    return (
      isEditing && (
        <Overlay onClose={onClose}>
          {render({
            ...this.props,
            rowData: this.state.editedRow,
            valueChanged: this.valueChanged,
            onOk: this.onOk,
            onCancel: onClose,
            initialFocusRef: n => (this.focusNode = n),
          })}
        </Overlay>
      )
    )
  }
}

export default RowEditor
