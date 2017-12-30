import React from 'react'
import styled from 'styled-components'
import R from 'ramda'
import Grid from './Grid'
import { sumWidth } from './utils'
import numeral from 'numeral'

const mapAlignmentToJustifyContent = alignment =>
  alignment === 'left'
    ? 'flex-start'
    : alignment === 'right' ? 'flex-end' : alignment

export const ColHeader = styled.div`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
  border-right: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  user-select: none;
  cursor: ${props => (props.sortable ? 'pointer' : 'default')};
  background-color: ${props => props.backgroundColor || 'steelblue'};
  color: ${props => props.color || 'white'};
  font-weight: ${props => props.fontWeight || 'bold'};
  font-size: ${props => props.fontSize || '0.85em'};
  padding-left: 0.2em;
  padding-right: 0.2em;
`
export const Cell = styled.div`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
  text-overflow: ellipsis;
  overflow: hidden;
  border-right: 1px solid #ccc;
  display: flex;
  align-items: center;
  user-select: none;
  cursor: default;
  justify-content: ${props =>
    mapAlignmentToJustifyContent(props.alignment) || 'center'};
  ${props => (props.fontSize ? 'font-size:' + props.fontSize + ';' : '')};
  ${props =>
    props.isSelected && !props.isHovered
      ? 'color: #efefef;'
      : props.color ? 'color:' + props.color + ';' : ''};
  ${props =>
    props.isHovered
      ? 'background-color:#ddd;'
      : props.isSelected
        ? 'background-color:#666;'
        : props.backgroundColor
          ? 'background-color:' + props.backgroundColor + ';'
          : ''};
  ${props => (props.fontWeight ? 'font-weight:' + props.fontWeight + ';' : '')};
`

/* prettier-ignore */
const Row = styled.div`
  display: flex;
  width: ${props => props.width}px;
  ${props => props.height ? 'height: '+ props.height + 'px;' : ''} 
  border-bottom: 1px solid #ccc;
`

const ScrollingHeaderRow = Row.extend`
  position: absolute;
  top: 0px;
  left: ${props => props.xOffSet || '0'}px;
  overflow: hidden;
  /*
   * colCount is for the 1px border for each Header... 
   * box-sizing doesn't work here because it does not count children
 */
  width: ${props => props.width}px;
`.withComponent(Grid.SyncedScrollPane)

const TableContentContainer = styled(Grid.SyncedScrollPane)`
  position: absolute;
  left: ${props => props.xOffSet || 0}px;
  top: ${props => props.headerRowHeight}px;
  /*header.length is for the border box and 17 is for the scroll height = width */
  width: ${props => props.width + (props.showScroll ? 17 : 0)}px;
  height: ${props =>
    props.height - props.headerRowHeight + (props.showScroll ? 17 : 0)}px;
  overflow: ${props => (props.showScroll ? 'scroll' : 'hidden')};
`

const TableContent = ({ scroll, showScroll, children, ...props }) =>
  R.isNil(props.width) || props.width === 0 ? null : scroll ? (
    <TableContentContainer showScroll={showScroll} {...props}>
      {children}
    </TableContentContainer>
  ) : (
    children
  )

// const ScrollingPane

class FlexGridRow extends React.PureComponent {
  render() {
    const { children, scroll, ...rest } = this.props
    return R.isNil(rest.width) || rest.width === 0 ? null : scroll ? (
      <ScrollingHeaderRow {...rest}>{children}</ScrollingHeaderRow>
    ) : (
      <Row {...rest}>{children}</Row>
    )
  }
}

const formatData = ({ displayMapper, type, numFormat, value }) =>
  displayMapper
    ? displayMapper(value)
    : R.isNil(value)
      ? ''
      : type === 'num' && numFormat ? numeral(value).format(numFormat) : value

export const defaultCellRenderer = ({
  rowIndex,
  columnIndex,
  header,
  width,
  height,
  data,
  render,
  ...rest
}) => {
  const value = data[rowIndex][header.ident]
  const display = formatData({ ...header, value })
  return (
    <Cell {...rest} width={width} height={height} title={value}>
      {display}
    </Cell>
  )
}

class FlexGridCell extends React.PureComponent {
  render() {
    //console.log('rendering cell..')
    const { render = defaultCellRenderer } = this.props
    return render(this.props)
  }
}

const SortIndicator = styled.i`
  justify-self: flex-end;
  margin-left: 0.2em;
`

export const defaultColHeaderRenderer = ({
  header,
  sortOrder,
  width,
  render,
  ...rest
}) => (
  <ColHeader width={width} {...rest} sortable={header.sortable}>
    {header.display}
    {sortOrder === 'asc' ? (
      <SortIndicator className="fa fa-caret-up" aria-hidden="true" />
    ) : sortOrder === 'desc' ? (
      <SortIndicator className="fa fa-caret-down" aria-hidden="true" />
    ) : null}
  </ColHeader>
)

class FlexGridColHeader extends React.PureComponent {
  render() {
    const { render = defaultColHeaderRenderer } = this.props
    return render(this.props)
  }
}

const splitFixedCols = (numOfFixedCols, headers) => ({
  rowHeaders: R.take(numOfFixedCols, headers),
  dataHeaders: R.drop(numOfFixedCols, headers),
})

const FlexGridContainer = styled.div`
  position: relative;
`

const countKeyCols = R.compose(l => l.length, R.takeWhile(h => h.isKey))

const flexGridRenderer = ({
  style,
  className,
  height,
  width,
  rowHeight,
  headerRowHeight,
  fixedColCount,
  autoFixColByKey,
  cellRenderer,
  colHeaderRenderer,
} = {}) => ({
  getColumnHeaderProps,
  getRowProps,
  getCellProps,
  getContainerProps,
  data,
  headers,
}) => {
  const numOfFixedCols = autoFixColByKey
    ? countKeyCols(headers)
    : fixedColCount || 0
  const scroll = width && height && headerRowHeight && true
  const { rowHeaders, dataHeaders } = splitFixedCols(numOfFixedCols, headers)
  const rowHeaderWidth = sumWidth(rowHeaders)
  const dataScrollWidth =
    numOfFixedCols > 0
      ? width - rowHeaderWidth + dataHeaders.length
      : scroll ? width + headers.length : sumWidth(headers) + headers.length
  //console.log('rendering grid ...', scroll, width, dataScrollWidth)

  return (
    <FlexGridContainer
      {...getContainerProps()}
      style={style}
      className={className}
    >
      {/* col header non-scrolling part/fixed columns */}
      {numOfFixedCols > 0 && (
        <FlexGridRow
          {...getRowProps({
            isHeader: true,
            headers: rowHeaders,
            headerRowHeight,
          })}
          scroll={scroll}
        >
          {rowHeaders.map((header, index) => (
            <FlexGridColHeader
              render={colHeaderRenderer}
              {...getColumnHeaderProps({ index, header })}
            />
          ))}
        </FlexGridRow>
      )}
      {/* col header scrolling part */}
      <FlexGridRow
        {...getRowProps({
          isHeader: true,
          headers: dataHeaders,
          width: dataScrollWidth,
          headerRowHeight,
        })}
        xOffSet={rowHeaderWidth}
        scroll={scroll}
      >
        {dataHeaders.map((header, index) => (
          <FlexGridColHeader
            render={colHeaderRenderer}
            {...getColumnHeaderProps({ index, header })}
          />
        ))}
      </FlexGridRow>
      {/* table body fixed columns */}
      {numOfFixedCols > 0 && (
        <TableContent
          height={height}
          width={rowHeaderWidth}
          headerRowHeight={headerRowHeight}
          headers={rowHeaders}
          scroll
          showScroll={false}
          vertical
          horizontal={false}
        >
          {R.range(0, data.length).map(rowIndex => (
            <FlexGridRow
              {...getRowProps({
                index: rowIndex,
                headers,
                rowHeight,
              })}
            >
              {rowHeaders.map((header, columnIndex) => (
                <FlexGridCell
                  render={cellRenderer}
                  {...getCellProps({
                    rowIndex,
                    columnIndex,
                    header,
                    data,
                  })}
                />
              ))}
            </FlexGridRow>
          ))}
        </TableContent>
      )}
      {/* table body data columns */}
      <TableContent
        height={height}
        width={dataScrollWidth}
        headerRowHeight={headerRowHeight}
        headers={dataHeaders}
        scroll={scroll}
        xOffSet={rowHeaderWidth}
        showScroll={scroll}
        vertical
        horizontal
      >
        {R.range(0, data.length).map(rowIndex => (
          <FlexGridRow
            {...getRowProps({
              index: rowIndex,
              headers: dataHeaders,
              rowHeight,
            })}
          >
            {dataHeaders.map((header, columnIndex) => (
              <FlexGridCell
                render={cellRenderer}
                {...getCellProps({
                  rowIndex,
                  columnIndex: columnIndex + numOfFixedCols,
                  header,
                  data,
                })}
              />
            ))}
          </FlexGridRow>
        ))}
      </TableContent>
    </FlexGridContainer>
  )
}

export default flexGridRenderer
