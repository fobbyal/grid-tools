import React from 'react'
import styled from 'styled-components'
import R from 'ramda'
import Grid from './Grid'
import { sumWidth, formatData, extractData, sumHeight } from './utils'
import DefaultPager from './DefaultPager'
import { BasicCell, BasicColHeader, SortIndicator, BasicCellInput } from './Components'
import CellEditContainer from './CellEditContainer'
import DropdownCellEditor from './DropdownCellEditor'
// import { shallowEqualExplain } from 'shallow-equal-explain'

export const ColHeader = BasicColHeader.extend`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
`
export const CellContent = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
`
/* prettier-ignore */
export const Cell = BasicCell.extend`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
`

export const CellInputEditor = BasicCellInput.extend`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
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

class PureCell extends React.PureComponent {
  render() {
    const { display, ...rest } = this.props
    return (
      <Cell {...rest}>
        <CellContent>{display}</CellContent>
      </Cell>
    )
  }
  // componentDidUpdate(prevProps) {
  //   const currentProps = this.props
  //   const shallowEqualExplanation = shallowEqualExplain(prevProps, currentProps)

  //   console.log({ prevProps, currentProps, shallowEqualExplanation })
  // }
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
  return <PureCell {...rest} width={width} height={height} title={value + ''} display={display} />
}
export const inputCellEditRender = ({ getInputProps }) => (
  <CellInputEditor {...getInputProps({ refKey: 'innerRef' })} />
)

export const dropdownEditRender = ({ getDropdownProps }) => (
  <DropdownCellEditor {...getDropdownProps({ refKey: 'innerRef' })} />
)

const defaultPagerRenderer = props => <DefaultPager {...props} />

class FlexGridCell extends React.PureComponent {
  render() {
    // console.log('rendering cell..')
    // TODO: strip props that are not for editing here
    const { isEditing, render = defaultCellRenderer, editRender, ...rest } = this.props
    if (isEditing) {
      const computedEditRender =
        editRender || (rest.header.choices ? dropdownEditRender : inputCellEditRender)
      return <CellEditContainer {...rest} render={computedEditRender} />
    }
    return render(this.props)
  }
}

export const defaultColHeaderRenderer = ({ header, sortOrder, width, ...rest }) => (
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
  renderRowEditor,
  gridContainerRefHandler,
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
        refKey: 'innerRef',
      })}
      style={style}
      className={className}
      tabIndex="0"
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
