import React from 'react'
import Overlay from './Overlay'

class RowEditor extends React.Component {
  state = {
    editedRow: this.props.rowData,
  }

  valueChanged = e => {
    // TODO has to parse value based on type
    this.setState(({ editedRow }) => ({
      editedRow: { ...editedRow, [e.target.name]: e.target.value },
    }))
  }

  onOk = e => {
    this.props.commitEdit({
      currentRow: this.props.rowData,
      editedRow: this.state.editedRow,
    })
  }

  onCancel = e => {
    this.props.onClose()
  }

  render() {
    const { isEditing, onClose, render } = this.props
    return (
      isEditing && (
        <Overlay onClose={onClose}>
          {render({
            ...this.props,
            valueChanged: this.valueChanged,
            onOk: this.onOk,
            onCancel: this.onCancel,
          })}
        </Overlay>
      )
    )
  }
}

export default RowEditor
//, }
