import React from 'react'
import styled from 'styled-components'
import R from 'ramda'
import Grid from './Grid'
import { sumWidth, formatData, extractData, sumHeight } from './utils'
import DefaultPager from './DefaultPager'

const mapAlignmentToJustifyContent = alignment =>
  alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : alignment

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
  &:last-child {
    ${props => !props.scrollY && 'border-top-right-radius: 3px;'};
  }
`
export const CellContent = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
`
/* prettier-ignore */
export const Cell = styled.div`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
  max-width: ${props => props.width}px;
  display: flex;
  border-left: 1px solid #ccc;
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
  width: ${props => props.width}px;
  height: ${props => props.height - props.yOffSet}px;
  /*overflow: ${props => (props.showScroll ? 'scroll' : 'hidden')};*/
  overflow-x:${props => (props.scrollX ? 'scroll' : 'hidden')};
  overflow-y:${props => (props.scrollY ? 'scroll' : 'hidden')};
  
  ${props => (!props.scrollX ? 'border-bottom: 1px solid #ccc;' : '')}
  ${props =>
    props.fixed
      ? `
    box-sizing: content-box;
    border-bottom: ${22 - (props.fixedScrollHeightAdjustment || 6)}px solid #ccc;
    border-bottom-left-radius: 3px;
  `
      : ''}
  & * {
    box-sizing: border-box;
  }
`
/* header.length is for the border box and 17 is for the scroll height = width */
// width: ${props => props.width + (props.showScroll ? 17 : 0)}px;
// height: ${props => props.height - props.yOffSet + (props.showScroll ? 17 : 0)}px;

const TableContent = ({ scroll, showScroll, children, ...props }) =>
  props.width === 0 ? null : scroll ? (
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
    <Cell {...rest} width={width} height={height} title={value + ''}>
      <CellContent> {display} </CellContent>
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

export const defaultColHeaderRenderer = ({ header, sortOrder, width, render, ...rest }) => (
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
    console.log('scroll y is ', this.props.scrollY)
    const { render = defaultColHeaderRenderer, ...rest } = this.props
    return render(rest)
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
  width: 16px;
  height: ${props => props.headerRowHeight - 1}px;
`

const computeFixedGridWidths = ({ rowHeaders, borderSize }) => {
  const width = sumWidth(rowHeaders) // (rowHeaders.length > 0 ? (rowHeaders.length - 1) * borderSize : 0)
  return { headerWidth: width + 1, containerWidth: width }
}

const computeScrollingGridWidths = ({
  normalizedWidth,
  rowHeaders,
  scrollX,
  scrollY,
  fixedColCount,
  headers,
  scrollSize,
  borderSize,
}) => {
  if (!scrollX) return {}
  const numOfCols = headers.length - fixedColCount
  const borderWidths = (numOfCols - 1) * borderSize
  const headerWidth = normalizedWidth - sumWidth(rowHeaders) + borderWidths
  const containerWidth = headerWidth + (scrollY && scrollX ? scrollSize : 0)
  return { headerWidth, containerWidth }
}

const flexGridRenderer = ({
  style,
  className,
  height,
  width,
  rowHeight = 23,
  headerRowHeight,
  fixedColCount = 0,
  autoFixColByKey,
  cellRenderer,
  colHeaderRenderer,
  pagerRenderer = defaultPagerRenderer,
  editByRow = true,
  editByCell = false,
  // TODO: have to get css expert
  fixedScrollHeightAdjustment = 6,
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
  renderRowEditor,
}) => {
  const pagerHeight = 35
  const rawDataWidth = sumWidth(headers)
  const rawDataHeight = sumHeight({ data, rowHeight })
  const normalizedWidth = R.isNil(width) ? rawDataWidth : R.min(width, rawDataWidth)

  /* do not scroll when we can fit everything */
  const scroll =
    width && height && headerRowHeight && (width < rawDataWidth || height < rawDataHeight)
  const scrollX = scroll && width < rawDataWidth
  const scrollY = scroll && height < rawDataHeight
  const numOfFixedCols = !scrollX ? 0 : autoFixColByKey ? countKeyCols(headers) : fixedColCount
  // const scrollY = scroll && height <
  const { rowHeaders, dataHeaders } = splitFixedCols(numOfFixedCols, headers)
  const scrollSize = 17
  const borderSize = 1
  const containerWidth =
    normalizedWidth + headers.length - 1 + (scrollY && scrollX ? scrollSize : 0)
  const scrollPaneHeight = numOfFixedCols > 0 && scrollX ? height + 5 + scrollSize : height + 5
  const fixedPaneHeight = height + fixedScrollHeightAdjustment

  // TODO: fix width issue for all browsers chrome/safari/firefox
  //
  const scrollWidth = computeScrollingGridWidths({
    normalizedWidth,
    rowHeaders,
    scrollX,
    scrollY,
    fixedColCount,
    headers,
    scrollSize,
    borderSize,
  })
  const fixedWidth = computeFixedGridWidths({ rowHeaders, borderSize })

  // console.log('provided width', width)
  // console.log('rawDataWidth', rawDataWidth)
  // console.log('rawDataHeight', rawDataHeight)
  // console.log('conatinerWidth', containerWidth)
  // console.log('fixedWidth', fixedWidth)
  // console.log('scrollWidth', scrollWidth)

  const containerHeight = R.isNil(height)
    ? undefined
    : height + (scroll ? 17 : 0) + (hasPaging ? pagerHeight : 0)

  const pagerStyle = {
    height: pagerHeight + 'px',
    position: scroll ? 'absolute' : undefined,
    left: scroll ? '0px' : undefined,
    bottom: scroll ? '0px' : undefined,
    width: scroll ? containerWidth + 'px' : undefined,
  }

  const topOffSet = 0

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
          width: scrollWidth.headerWidth,
          headerRowHeight,
          yOffSet: topOffSet,
        })}
        xOffSet={fixedWidth.headerWidth}
        scroll={scroll}
      >
        {dataHeaders.map((header, index) => (
          <FlexGridColHeader
            render={colHeaderRenderer}
            {...getColumnHeaderProps({ index, header })}
            scrollY={scrollY}
          />
        ))}
      </FlexGridRow>
      {scrollY && <UpperRight headerRowHeight={headerRowHeight} />}
      {/* table body fixed columns */}
      {numOfFixedCols > 0 && (
        <TableContent
          height={fixedPaneHeight}
          width={fixedWidth.containerWidth}
          yOffSet={headerRowHeight + topOffSet}
          headers={rowHeaders}
          scroll
          showScroll={false}
          vertical
          horizontal={false}
          fixed
          fixedScrollHeightAdjustment={fixedScrollHeightAdjustment}
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
        height={scrollPaneHeight}
        width={scrollWidth.containerWidth}
        yOffSet={headerRowHeight + topOffSet}
        headers={dataHeaders}
        scroll={scroll}
        xOffSet={fixedWidth.containerWidth}
        showScroll={scroll}
        scrollX={scrollX}
        scrollY={scrollY}
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
      {renderRowEditor(getRowEditorProps())}
    </FlexGridContainer>
  )
}

export default flexGridRenderer
