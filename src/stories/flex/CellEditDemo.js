import React from 'react'
//import R from 'ramda'

import Grid, { flexGridRenderer } from '../../index'

class CellEditDemo extends React.Component {
  render() {
    const { data, headers } = this.props
    return (
      <Grid
        data={data}
        headers={headers}
        render={flexGridRenderer({
          headerRowHeight: 60,
          width: 1100,
          height: 500,
          autoFixColByKey: true,
        })}
        isEditable
        editMode="cell"
      />
    )
  }
}

export default CellEditDemo
