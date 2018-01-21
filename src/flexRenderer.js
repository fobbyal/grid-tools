import React from 'react'
import styled from 'styled-components'
import R from 'ramda'
import Grid from './Grid'
import { sumWidth, formatData, extractData } from './utils'
import DefaultPager from './DefaultPager'
import RowEditor from './RowEditor'
import rowEditorContentRenderer from './renderRowEditorContent'

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
  &:first-child {
    border-left: 1px solid steelblue;
    border-top-left-radius: 3px;
  }
`
/* prettier-ignore */
export const Cell = styled.div`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
  text-overflow: ellipsis;
  overflow: hidden;
  border-left: 1px solid #ccc;
  display: flex;
  align-items: center;
  user-select: none;
  cursor: default;
  justify-content: ${props =>
    mapAlignmentToJustifyContent(props.alignment) || 'center'};
  ${props => (props.fontSize ? 'font-size:' + props.fontSize + ';' : '')}
  ${props =>
    props.isSelected && props.isHovered ?
      'color:white;':
    props.isSelected && !props.isHovered
      ? 'color: #efefef;'
      : props.color ? 'color:' + props.color + ';' : ''}
  ${props =>
    props.isHovered && props.isSelected ? 
      'background-color:#333;':
    props.isHovered
      ? 'background-color:#ddd;'
      : props.isSelected
        ? 'background-color:#666;'
        : props.backgroundColor
          ? 'background-color:' + props.backgroundColor + ';'
          : ''}
  ${props => (props.fontWeight ? 'font-weight:' + props.fontWeight + ';' : '')}
  padding-left: 0.2em;
  padding-right: 0.2em;
  &:last-child {
    border-right: 1px solid #ccc;
  }
`

/* prettier-ignore */
const Row = styled.div`
  display: flex;
  width: ${props => props.width}px;
  ${props => props.height ? 'height: '+ props.height + 'px;' : ''} 
  border-bottom: 1px solid #ccc;
  min-height: 23px;
`

const ScrollingHeaderRow = Row.extend`
  position: absolute;
  top: ${props => props.yOffSet || '0'}px;
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
  top: ${props => props.yOffSet || 0}px;
  /*header.length is for the border box and 17 is for the scroll height = width */
  width: ${props => props.width + (props.showScroll ? 17 : 0)}px;
  height: ${props =>
    props.height - props.yOffSet + (props.showScroll ? 17 : 0)}px;
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
  const value = extractData({ header, rowData: data[rowIndex] })
  const display = formatData({ header, value, rowData: data[rowIndex] })
  return (
    <Cell {...rest} width={width} height={height} title={value}>
      {display}
    </Cell>
  )
}

const defaultPagerRenderer = props => <DefaultPager {...props} />

class FlexGridCell extends React.PureComponent {
  render() {
    // console.log('rendering cell..')
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
      <SortIndicator>&#x25b2;</SortIndicator>
    ) : sortOrder === 'desc' ? (
      <SortIndicator>&#x25bc;</SortIndicator>
    ) : null}
  </ColHeader>
)

// <SortIndicator className="fa fa-caret-up" aria-hidden="true" />
// <SortIndicator className="fa fa-caret-down" aria-hidden="true" />

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

/* prettier-ignore */
const FlexGridContainer = styled.div`
  position: relative;
  ${({ width }) => (width ? 'width: ' + width + 'px;' : '')} 
  ${({ height }) => (height ? 'height: ' + height + 'px;' : '')}
`

const countKeyCols = R.compose(l => l.length, R.takeWhile(h => h.isKey))

const UpperRight = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  background-color: steelblue;
  border-left: 1px solid #ccc;
  border-top-right-radius: 3px;
  width: 17px;
  height: ${props => props.headerRowHeight}px;
`

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
  pagerRenderer = defaultPagerRenderer,
  renderRowEditorContent = rowEditorContentRenderer(),
  editByRow = true,
  editByCell = false,
} = {}) => ({
  getColumnHeaderProps,
  getRowProps,
  getCellProps,
  getContainerProps,
  getPagerProps,
  getRowEditorProps,
  headers,
  data,
  hasPaging,
  isEditing,
}) => {
  const pagerHeight = 35
  const normalizedWidth = R.min(width, sumWidth(headers))
  const numOfFixedCols = autoFixColByKey
    ? countKeyCols(headers)
    : fixedColCount || 0
  const scroll = width && height && headerRowHeight
  const { rowHeaders, dataHeaders } = splitFixedCols(numOfFixedCols, headers)
  const rowHeaderWidth = sumWidth(rowHeaders)
  const dataScrollWidth =
    numOfFixedCols > 0
      ? normalizedWidth - rowHeaderWidth + dataHeaders.length
      : scroll ? normalizedWidth + headers.length : sumWidth(headers)

  const containerWidth = R.isNil(width)
    ? undefined
    : normalizedWidth + headers.length + (scroll ? 17 : 0)

  const containerHeight = R.isNil(height)
    ? undefined
    : height + (scroll ? 17 : 0) + (hasPaging ? pagerHeight : 0)

  const pagerStyle = {
    height: pagerHeight + 'px',
    position: scroll ? 'absolute' : undefined,
    left: scroll ? '0px' : undefined,
    bottom: scroll ? '0px' : undefined,
    width: scroll ? containerWidth + 'px' : '100vw',
  }

  const topOffSet = 0

  // TODO: fix width issue for all browsers chrome/safari/firefox
  console.log('provided width', width)
  console.log('sumWidth', sumWidth(headers))
  console.log('rowHeaderWidth', rowHeaderWidth)
  console.log('containerWidth', containerWidth)
  console.log('dataScrollWidth', dataScrollWidth)
  console.log('normalizedWidth', normalizedWidth)

  return (
    <FlexGridContainer
      {...getContainerProps({
        width: containerWidth,
        height: containerHeight,
      })}
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
            yOffSet: topOffSet,
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
          yOffSet: topOffSet,
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
      <UpperRight headerRowHeight={headerRowHeight} />
      {/* table body fixed columns */}
      {numOfFixedCols > 0 && (
        <TableContent
          height={height}
          width={rowHeaderWidth}
          yOffSet={headerRowHeight + topOffSet}
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
        yOffSet={headerRowHeight + topOffSet}
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
      {hasPaging && pagerRenderer(getPagerProps({ style: pagerStyle }))}
      <RowEditor render={renderRowEditorContent} {...getRowEditorProps()} />
    </FlexGridContainer>
  )
}

export default flexGridRenderer
