import React from 'react'
import R from 'ramda'

import Grid, { flexGridRenderer, renderRowEditorContent } from '../index'

class ControlledEditDemo extends React.Component {
  state = { data: this.props.data, showAdd: false }

  onEdit = ({ originalRow, editedRow }) => {
    if (originalRow) {
      this.setState(({ data }) => ({
        data: data.map(row => (row === originalRow ? editedRow : row)),
      }))
    } else {
      this.setState(({ data }) => ({
        data: [editedRow, ...data],
        showAdd: false,
      }))
    }
  }

  onEditCancel = _ => this.setState({ showAdd: false })

  addRow = _ => this.setState({ showAdd: true })

  removeRow = _ =>
    this.setState(({ data }) => ({
      data: data.filter(
        row => R.isNil(this.selectedRows) || !this.selectedRows.includes(row)
      ),
    }))

  selectionChanged = ({ selectedRows, selectedHeaders }) => {
    this.selectedRows = selectedRows
  }

  render() {
    const { data, showAdd } = this.state
    const { headers } = this.props
    return (
      <div>
        <div style={{ marginBottom: '.3em' }}>
          <button onClick={this.addRow}>Add Row</button>
          <button onClick={this.removeRow}>Remove Row</button>
        </div>
        <Grid
          data={data}
          headers={headers}
          rowsPerPage={15}
          render={flexGridRenderer({
            renderRowEditorContent: renderRowEditorContent({
              headerWidth: '130px',
            }),
          })}
          onEdit={this.onEdit}
          onSelectionChanged={this.selectionChanged}
          isEditable
          showAdd={showAdd}
          onEditCancel={this.onEditCancel}
        />
      </div>
    )
  }
}

export default ControlledEditDemo
