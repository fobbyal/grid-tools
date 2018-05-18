import React from 'react'
import { Grid } from 'react-virtualized'
import { extractAndFormatData } from './utils'
import { createContext } from 'react-broadcast'
import { BasicCell, BasicColHeader, SortIndicator } from './Components'
import pureComponent from './AdvancedPureComponent'

/* justify-content: ${props => mapAlignmentToJustifyContent(props.alignment) || 'center'}; */
export const Cell = BasicCell.extend`
  border-bottom: 1px solid #ccc;
`
export const ColHeaderBase = BasicColHeader.extend`
  border-bottom: 1px solid #ccc;
`
const emptyPropGetter = () => {}

const { Provider, Consumer } = createContext({
  getColumnHeaderProps: emptyPropGetter,
  getRowProps: emptyPropGetter,
  getCellProps: emptyPropGetter,
  getContainerProps: emptyPropGetter,
  getPagerProps: emptyPropGetter,
  getRowEditorProps: emptyPropGetter,
  headers: [],
  data: [],
})

const flattenCellProps = ({ style, ...props }) => ({ ...style, ...props })
const OptimzedContentCell = pureComponent(Cell, flattenCellProps)

export const ColHeader = ({ header, sortOrder, width, ...rest }) => (
  <ColHeaderBase width={width} {...rest} sortable={header.sortable}>
    {header.display}
    {sortOrder === 'asc' ? (
      <SortIndicator>&#x25b2;</SortIndicator>
    ) : sortOrder === 'desc' ? (
      <SortIndicator>&#x25bc;</SortIndicator>
    ) : null}
  </ColHeaderBase>
)

const cellRenderer = ({ columnIndex, key, rowIndex, style }) => (
  <Consumer key={key}>
    {({
      getColumnHeaderProps,
      getRowProps,
      getCellProps,
      getContainerProps,
      getPagerProps,
      getRowEditorProps,
      headers,
      data,
    }) =>
      rowIndex === 0 ? (
        <ColHeader
          {...getColumnHeaderProps({
            index: columnIndex,
            header: headers[columnIndex],
          })}
          style={style}
        >
          {extractAndFormatData({
            rowData: data[rowIndex - 1],
            header: headers[columnIndex],
          })}
        </ColHeader>
      ) : (
        <OptimzedContentCell
          {...getCellProps({
            rowIndex: rowIndex - 1,
            columnIndex,
            header: headers[columnIndex],
            data,
          })}
          style={style}
        >
          {extractAndFormatData({
            rowData: data[rowIndex - 1],
            header: headers[columnIndex],
          })}
        </OptimzedContentCell>
      )
    }
  </Consumer>
)
//

const freeEditRenderer = ({
  style,
  className,
  height = 600,
  width = 1100,
  // rowHeight = 23,
  // headerRowHeight,
  // fixedColCount = 0,
  // autoFixColByKey,
  // cellRenderer,
  // colHeaderRenderer,
  // pagerRenderer = defaultPagerRenderer,
  // editByRow = true,
  // editByCell = false,
  // // TODO: have to get css expert
  // fixedScrollHeightAdjustment = 6,
} = {}) => ({
  getColumnHeaderProps,
  getRowProps,
  getCellProps,
  getContainerProps,
  getPagerProps,
  getRowEditorProps,
  headers,
  data,
  // hasPaging,
  // isEditing,
  // renderRowEditor,
}) => {
  return (
    <Provider
      value={{
        getColumnHeaderProps,
        getRowProps,
        getCellProps,
        getContainerProps,
        getPagerProps,
        getRowEditorProps,
        headers,
        data,
      }}
    >
      <Grid
        cellRenderer={cellRenderer}
        columnCount={headers.length}
        columnWidth={({ index }) => headers[index].width}
        height={height}
        width={width}
        rowCount={data.length + 1}
        rowHeight={30}
      />
    </Provider>
  )
}

export default freeEditRenderer
