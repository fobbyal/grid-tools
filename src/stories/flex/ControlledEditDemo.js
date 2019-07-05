import React from 'react'
import R from 'ramda'

import Grid, { flexGridRenderer, renderRowEditorContent } from '../../index'

class ControlledEditDemo extends React.Component {
  state = { data: this.props.data, showAdd: false }

  onEdit = ({ originalRow, editedRow }, done) => {
    if (originalRow) {
      this.setState(({ data }) => ({
        data: data.map(row => (row === originalRow ? editedRow : row)),
      }))
    } else {
      this.setState(
        ({ data }) => ({
          data: [editedRow, ...data],
          showAdd: false,
        }),
        done
      )
    }
  }

  onEditCancel = _ => this.setState({ showAdd: false })

  addRow = _ => this.setState({ showAdd: true })

  removeRow = _ =>
    this.setState(({ data }) => ({
      data: data.filter(row => R.isNil(this.selectedRows) || !this.selectedRows.includes(row)),
    }))

  selectionChange = ({ selectedRows }) => {
    this.selectedRows = selectedRows
  }

  render() {
    const { data, showAdd } = this.state
    const { headers, controlled } = this.props
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
          onEdit={controlled ? this.onEdit : undefined}
          onSelectionChange={this.selectionChange}
          isEditable
          showAdd={showAdd}
          onEditCancel={this.onEditCancel}
        />
      </div>
    )
  }
}

export default ControlledEditDemo
