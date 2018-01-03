import React from 'react'
import Overlay from './Overlay'

class RowEditor extends React.Component {
  state = {
    editedRow: this.props.rowData,
  }

  valueChanged = ({ ident, value }) => {
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

  componentWillReceiveProps(nextProps) {
    if (this.props.rowData !== nextProps.rowData) {
      this.setState({ editedRow: nextProps.rowData })
    }
  }

  render() {
    const { isEditing, onClose, render } = this.props
    console.log('editor props', this.props)
    return (
      isEditing && (
        <Overlay onClose={onClose}>
          {render({
            ...this.props,
            rowData: this.state.editedRow,
            valueChanged: this.valueChanged,
            onOk: this.onOk,
            onCancel: onClose,
          })}
        </Overlay>
      )
    )
  }
}

export default RowEditor
//, }
