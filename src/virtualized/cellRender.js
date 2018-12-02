import React from 'react'
import {
  BasicCell,
  BasicColHeader,
  SortIndicator,
  inputCellEditRender,
  dropdownEditRender,
} from '../Components'
import pureComponent from '../AdvancedPureComponent'
import { extractAndFormatData } from '../utils'
import { Consumer } from './VirtualizedContext'
/* justify-content: ${props => mapAlignmentToJustifyContent(props.alignment) || 'center'}; */
import CellEditContainer from '../CellEditContainer'
import DropdownCellEditor from '../DropdownCellEditor'

export const Cell = BasicCell.extend`
  border-bottom: 1px solid #ccc;
`
export const ColHeaderBase = BasicColHeader.extend`
  border-bottom: 1px solid #ccc;
`

const flattenCellProps = ({ style, ...props }) => ({ ...style, ...props })

const OptimzedContentCell = pureComponent(Cell, flattenCellProps)

const ColHeader = ({ header, sortOrder, width, ...rest }) => (
  <ColHeaderBase width={width} {...rest} sortable={header.sortable}>
    {header.display}
    {sortOrder === 'asc' ? (
      <SortIndicator>&#x25b2;</SortIndicator>
    ) : sortOrder === 'desc' ? (
      <SortIndicator>&#x25bc;</SortIndicator>
    ) : null}
  </ColHeaderBase>
)

export const cellRenderWrapper = (propPreProcessor = _ => _) => render => reactVirtualizedProps => (
  <Consumer key={reactVirtualizedProps.key}>
    {gridToolProps => render(propPreProcessor({ gridToolProps, reactVirtualizedProps }))}
  </Consumer>
)

export const defaultRowHeaderRender = ({
  gridToolProps: {
    getColumnHeaderProps,
    getRowProps,
    getCellProps,
    getContainerProps,
    headers,
    data,
  },
  reactVirtualizedProps: { columnIndex, key, rowIndex, style },
}) => (
  <ColHeader
    {...getColumnHeaderProps({
      index: columnIndex,
      header: headers[columnIndex],
    })}
    style={style}
  >
    {extractAndFormatData({
      rowData: data[rowIndex],
      header: headers[columnIndex],
    })}
  </ColHeader>
)

export const defaultCellRender = ({
  gridToolProps: {
    getColumnHeaderProps,
    getRowProps,
    getCellProps,
    getContainerProps,
    getPagerProps,
    getRowEditorProps,
    headers,
    data,
    editInfo,
  },
  reactVirtualizedProps: { columnIndex, key, rowIndex, style },
}) => {
  const cellProps = getCellProps({
    rowIndex: rowIndex,
    columnIndex,
    header: headers[columnIndex],
    data,
    style,
  })
  if (cellProps.isEditing) {
    const computedEditRender =
      cellProps.editRender || cellProps.header.choices ? dropdownEditRender : inputCellEditRender

    return <CellEditContainer {...cellProps} render={computedEditRender} />
  }
  return (
    <OptimzedContentCell {...cellProps}>
      {extractAndFormatData({
        rowData: data[rowIndex],
        header: headers[columnIndex],
      })}
    </OptimzedContentCell>
  )
}

export const withColumnOffset = offSet => props => ({
  ...props,
  reactVirtualizedProps: {
    ...props.reactVirtualizedProps,
    columnIndex: props.reactVirtualizedProps.columnIndex + offSet,
  },
})
