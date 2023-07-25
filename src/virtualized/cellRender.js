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
  border: ${props => props.border};
`

export const EllipsisCell = Cell.extend`
  display: initial;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: ${props => props.verticalAlign || 'center'};
  padding-top: ${props => props.paddingTop};
`

export const ColHeaderBase = BasicColHeader.extend`
  border: ${props => props.border};
`
const flattenCellProps = ({ style, ...props }) => ({ ...style, ...props })

export const OptimizedContentCell = pureComponent(Cell, flattenCellProps)

export const OptimizedEllipsisCell = pureComponent(EllipsisCell, flattenCellProps)

const ColHeader = ({ header, sortOrder, width, typeData = 'nonfixed-data', ...rest }) => {
  const gridContext = React.useContext(GridToolsContext)
  const contextProps =
    typeData === 'nonfixed-data'
      ? gridContext.columnHeaderProps
      : { ...gridContext.columnHeaderProps, ...gridContext.fixedColHead }
  return (
    <ColHeaderBase width={width} {...rest} {...contextProps} sortable={header.sortable}>
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
    // getRowContentProps,
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
  gridContext,
  typeData = 'nonfixed-data',
  getRowStyle = _ => ({}),
  ...rest
}) => {
  console.log(rest)
  let cellProps = getCellProps({
    rowIndex: rowIndex,
    columnIndex,
    header: headers[columnIndex],
    data,
    style,
    isLastInRow: headers.length === columnIndex + 1,
    ...rest,
  })
  if (cellProps.isEditing) {
    const computedEditRender =
      cellProps.editRender || (cellProps.header.choices ? dropdownEditRender : inputCellEditRender)

    cellProps = { ...cellProps, style: { ...cellProps.style } }

    return <CellEditContainer {...cellProps} render={computedEditRender} />
  }

  // const { getRowStyle } = data[rowIndex]
  const rowStyle = getRowStyle
    ? getRowStyle({ cellProps, headers, data, rowIndex, columnIndex })
    : {}
  // let currentCellStyle = { ...cellProps.style, ...rowStyle }
  let customizeColumnStyle = {}
  const { formatCell } = headers[columnIndex]
  if (formatCell) {
    customizeColumnStyle = formatCell({ headers, data, rowIndex, columnIndex }) || {}
    // cellProps = {
    //   ...cellProps,
    //   style: { ...cellProps.style, ...customizeColumnStyle },
    // }
  }
  const contextProps =
    typeData === 'nonfixed-data'
      ? gridContext.rowContentProps
      : { ...gridContext.rowContentProps, ...gridContext.fixedColData } || {}
  cellProps = { ...cellProps, style: { ...cellProps.style, ...rowStyle, ...customizeColumnStyle } }
  if (cellProps.header.ellipsis) {
    return (
      <OptimizedEllipsisCell {...R.omit(['data'], cellProps)} {...contextProps}>
        {extractAndFormatData({
          rowData: data[rowIndex],
          header: headers[columnIndex],
        })}
      </OptimizedEllipsisCell>
    )
  }
  // cellProps = { ...cellProps, style: { ...cellProps.style, ...rowStyle, ...customizeColumnStyle } }
  // if (cellProps.style.position == null) console.log('no position')
  return (
    <OptimizedContentCell {...R.omit(['data'], cellProps)} {...contextProps}>
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
