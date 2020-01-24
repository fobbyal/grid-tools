import React from 'react'
import {
  BasicCell,
  BasicColHeader,
  SortIndicator,
  inputCellEditRender,
  dropdownEditRender,
} from '../Components'
import R from 'ramda'
import pureComponent from '../AdvancedPureComponent'
import { extractAndFormatData } from '../utils'
import { Consumer } from './VirtualizedContext'
/* justify-content: ${props => mapAlignmentToJustifyContent(props.alignment) || 'center'}; */
import CellEditContainer from '../CellEditContainer'
import GridToolsContext from '../context'

export const Cell = BasicCell.extend`
  border-bottom: 1px solid #ccc;
`
export const ColHeaderBase = BasicColHeader.extend`
  border-bottom: 1px solid #ccc;
`

const flattenCellProps = ({ style, ...props }) => ({ ...style, ...props })

export const OptimizedContentCell = pureComponent(Cell, flattenCellProps)

const ColHeader = ({ header, sortOrder, width, ...rest }) => {
  const gridContext = React.useContext(GridToolsContext)
  return (
    <ColHeaderBase
      width={width}
      {...rest}
      {...gridContext.columnHeaderProps}
      sortable={header.sortable}
    >
      {header.display}
      {sortOrder === 'asc' ? (
        <SortIndicator>&#x25b2;</SortIndicator>
      ) : sortOrder === 'desc' ? (
        <SortIndicator>&#x25bc;</SortIndicator>
      ) : null}
    </ColHeaderBase>
  )
}

export const cellRenderWrapper = (propPreProcessor = _ => _) => render => reactVirtualizedProps => (
  <Consumer key={reactVirtualizedProps.key}>
    {gridToolProps => render(propPreProcessor({ gridToolProps, reactVirtualizedProps }))}
  </Consumer>
)

export const defaultRowHeaderRender = ({
  gridToolProps: {
    getColumnHeaderProps,
    // getRowProps,
    // getCellProps,
    // getContainerProps,
    headers,
    data,
  },
  reactVirtualizedProps: { columnIndex, /* key, */ rowIndex, style },
}) => (
  <ColHeader
    {...getColumnHeaderProps({
      index: columnIndex,
      header: headers[columnIndex],
      style,
    })}
  >
    {extractAndFormatData({
      rowData: data[rowIndex],
      header: headers[columnIndex],
    })}
  </ColHeader>
)

export const defaultCellRender = ({
  gridToolProps: {
    getCellProps,
    headers,
    data,
    // getContainerProps,
    // getPagerProps,
    // getRowEditorProps,
    // getColumnHeaderProps,
    // getRowProps,
    // editInfo,
  },
  reactVirtualizedProps: { columnIndex, /* key, */ rowIndex, style },
  ...rest
}) => {
  const cellProps = getCellProps({
    rowIndex: rowIndex,
    columnIndex,
    header: headers[columnIndex],
    data,
    style,
    ...rest,
  })
  if (cellProps.isEditing) {
    const computedEditRender =
      cellProps.editRender || cellProps.header.choices ? dropdownEditRender : inputCellEditRender

    return <CellEditContainer {...cellProps} render={computedEditRender} />
  }

  // if (cellProps.style.position == null) console.log('no position')
  return (
    <OptimizedContentCell {...R.omit(['data'], cellProps)}>
      {extractAndFormatData({
        rowData: data[rowIndex],
        header: headers[columnIndex],
      })}
    </OptimizedContentCell>
  )
}

export const withColumnOffset = offSet => props => ({
  ...props,
  reactVirtualizedProps: {
    ...props.reactVirtualizedProps,
    columnIndex: props.reactVirtualizedProps.columnIndex + offSet,
  },
})
