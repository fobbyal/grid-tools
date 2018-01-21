import React from 'react'
import Overlay from './Overlay'

class RowEditor extends React.Component {
  state = {
    editedRow: this.props.rowData || {},
  }

  valueChanged = ({ ident, value }) => {
    console.log('updating row widther with', ident, value)
    this.setState(({ editedRow }) => ({
      editedRow: { ...editedRow, [ident]: value },
    }))
  }

  onOk = e => {
    this.props.commitEdit({
      currentRow: this.props.rowData,
      editedRow: this.state.editedRow,
    })
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
