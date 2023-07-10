import React, { useRef, useState } from 'react'
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

const GridWithScrollTrigger = () => {
  const [rowNo, setRowNo] = useState()
  const gridRef = useRef()
  return (
    <div>
      <div style={{ margin: 10 }}>
        <input type="number" value={rowNo} onChange={e => setRowNo(e.target.value)} />
        <button
          onClick={() => {
            if (gridRef.current && rowNo) {
              gridRef.current.scrollToCell({ rowIndex: +rowNo })
            }
          }}
        >
          Scroll To
        </button>
      </div>
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
          contentGridRef: gridRef,
        })}
        editMode="cell"
        isEditable={() => true}
      />
    </div>
  )
}

const GridWithScrollSync = () => {
  const gridRef = useRef()
  const divRef = useRef()
  return (
    <div>
      <div
        ref={divRef}
        style={{ overflow: 'auto', width: 1100 }}
        onScroll={e => {
          const scrollLeft = e.target.scrollLeft
          if (scrollLeft && gridRef.current) {
            gridRef.current.scrollToPosition({ scrollLeft })
          }
        }}
      >
        <div
          style={{
            padding: 20,
            background: 'red',
            width: headers.map(h => h.width || 150).reduce((sum, val) => sum + val, 0),
          }}
        >
          Scroll Me!!!
        </div>
      </div>
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
          contentGridRef: gridRef,
          onScroll: ({ scrollLeft }) => {
            if (scrollLeft && divRef.current) {
              divRef.current.scrollTo({
                left: scrollLeft,
              })
            }
          },
        })}
        editMode="cell"
        isEditable={() => true}
      />
    </div>
  )
}

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
    <GridToolContext.Provider
      value={{
        columnHeaderProps: {
          backgroundColor: 'pink',
          color: '#3F4752',
          border: '1px solid #ccc',
          fontSize: '14px',
          headerRowHeight: 30,
        },
        rowContentProps: {
          color: '#3F4752',
          border: '1px solid #ccc',
          // rowHeight: 30,
          fontSize: '14px',
        },
        fixedColData: {
          border: '1px solid #ccc',
          color: '#3F4752',
          rowHeight: 30,
          verticalAlign: 'baseline',
        },
      }}
    >
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
  .add('Scroll Trigger', () => <GridWithScrollTrigger />)
  .add('Scroll Sync', () => <GridWithScrollSync />)
  .add('ngrid', () => (
    <GridToolContext.Provider
      value={{
        columnHeaderProps: {
          backgroundColor: '#EFEFEF',
          color: '#3F4752',
          border: '1px solid #DADADA',
          fontSize: '12px',
          fontWeight: 500,
          headerRowHeight: 30,
          fontFamily: 'sans-serif',
        },
        rowContentProps: {
          color: '#0D0106',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DADADA',
          rowHeight: 30,
          fontSize: '12px',
          fontWeight: 400,
          fontFamily: 'sans-serif',
          paddingTop: '4px',
        },
        fixedColHead: {
          backgroundColor: '#EFEFEF',
          border: '1px solid #DADADA',
          color: '#0D0106',
          rowHeight: 30,
          fontSize: '12px',
          fontWeight: 400,
          fontFamily: 'sans-serif',
          paddingTop: '4px',
        },
        fixedColData: {
          backgroundColor: '#f2f2f2',
          border: '1px solid #DADADA',
          borderRadius: '12px 12px 0px 0px',
          color: '#0D0106',
          rowHeight: 30,
          fontFamily: 'sans-serif',
          fontSize: '12px',
          fontWeight: 400,
        },
      }}
    >
      <Grid
        isEditable={() => false}
        editMode="cell"
        data={data}
        headers={headers}
        render={virtualizedGridRenderer({
          autoFixColByKey: true,
          // cellRender: fixedCellRender,
        })}
      />
    </GridToolContext.Provider>
  ))
