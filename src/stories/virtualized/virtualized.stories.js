import React from 'react'
import { storiesOf } from '@storybook/react'
import R from 'ramda'
import Grid, {
  extractAndFormatData,
  virtualizedGridRenderer,
  GridToolContext,
  defaultVirtualizedCellRender,
  VirtualizedCell,
} from '../../index'
import { createData, headers } from '../data'
import { CellInputEditor } from '../../Components'

const customizedCellRender = params => {
  const { gridToolProps, reactVirtualizedProps, ...rest } = params

  const { getCellProps, headers, data } = gridToolProps

  const { columnIndex, rowIndex, style } = reactVirtualizedProps
  const cellProps = getCellProps({
    rowIndex: rowIndex,
    columnIndex,
    header: headers[columnIndex],
    data,
    style,
    ...rest,
  })

  const cellData = extractAndFormatData({
    rowData: data[rowIndex],
    header: headers[columnIndex],
  })

  // console.log('cell data is',cellData)
  // eslint-disable-next-line eqeqeq
  if (columnIndex == 1 && rowIndex == 1) {
    return (
      <VirtualizedCell {...R.omit(['data'], cellProps)} title={cellData}>
        {cellData}
        <div
          title="purple marker"
          style={{
            position: 'absolute',
            top: '0px',
            right: '0px',
            width: '10px',
            height: '10px',
            backgroundColor: 'purple',
          }}
        />
      </VirtualizedCell>
    )
  }

  return defaultVirtualizedCellRender(params)
}

export const dateInputCellEditRender = ({ getInputProps }) => (
  <CellInputEditor type="date" {...getInputProps({ refKey: 'innerRef' })} />
)

const data = createData(200)
storiesOf('Virtualized grid', module)
  .add('Basic', () => (
    <Grid
      data={data}
      headers={headers}
      render={virtualizedGridRenderer({
        cellRender: props => {
          const type = props.gridToolProps.headers[props.reactVirtualizedProps.columnIndex].type
          return defaultVirtualizedCellRender({
            ...props,
            editRender: (type === 'date-time' || type === 'date') && dateInputCellEditRender,
          })
        },
      })}
      editMode="cell"
      isEditable={() => true}
    />
  ))
  .add('Fixed Col and Free edit', () => (
    <GridToolContext.Provider value={{ columnHeaderProps: { backgroundColor: 'pink' } }}>
      <Grid
        isEditable={() => true}
        editMode="cell"
        data={data}
        headers={headers}
        altBgColor="#d7d7e7"
        altBy={data => data.unitId}
        render={virtualizedGridRenderer({
          autoFixColByKey: true,
          cellRender: customizedCellRender,
        })}
      />
    </GridToolContext.Provider>
  ))
