import React from 'react'
import styled from 'styled-components'
import R from 'ramda'
import Grid from './Grid'
import { formatData, extractData } from './utils'
import computeGridProps from './computeGridProps'
import DefaultPager from './DefaultPager'
import { BasicCell, BasicColHeader, SortIndicator, BasicCellInput } from './Components'
import CellEditContainer from './CellEditContainer'
import DropdownCellEditor from './DropdownCellEditor'
// import { shallowEqualExplain } from 'shallow-equal-explain'

export const ColHeader = BasicColHeader.extend`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
  max-width: ${props => props.width}px;
`
// export const CellContent = styled.div`
//   white-space: nowrap;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   pointer-events: none;
// `
/* prettier-ignore */
/* to have the ellipsis we need dispay block instead of flex */
export const Cell = BasicCell.extend`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  height: 100%;
  text-align: center;
`

export const CellInputEditor = BasicCellInput.extend`
  flex: 0 0 ${props => props.width}px;
  width: ${props => props.width}px;
  max-width: ${props => props.width}px;
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
  overflow-x: hidden;
  overflow-y: ${props => (props.scrollY ? 'scroll' : 'hidden')};
  background-color: steelblue;
  width: ${props => props.width}px;
`.withComponent(Grid.SyncedScrollPane)

const TableContentContainer = styled(Grid.SyncedScrollPane)`
  position: absolute;
  left: ${props => props.xOffSet || 0}px;
  top: ${props => props.yOffSet || 0}px;
  width: ${props => props.width}px;
  height: ${props => props.height - props.yOffSet}px;
  overflow-x: ${props => (props.scrollX ? 'scroll' : 'hidden')};
  overflow-y: ${props => (props.scrollY ? 'scroll' : 'hidden')};
  & * {
    box-sizing: border-box;
  }
`
const TableContent = ({ scroll, children, ...props }) =>
  props.width === 0 ? null : scroll ? (
    <TableContentContainer {...props}>{children}</TableContentContainer>
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
    console.log('in cell render...')
    return (
      <Cell {...rest}>
        {
          //  <CellContent>{display}</CellContent>
        }
        {display}
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

/* prettier-ignore */
const FlexGridContainer = styled.div`
  position: relative;
  ${({ width }) => (width ? 'width: ' + width + 'px;' : '')} 
  ${({ height }) => (height ? 'height: ' + height + 'px;' : '')}
`

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
  pagerHeight = 35,
  // TODO: have to get css expert
  // fixedScrollHeightAdjustment = 6,
  scrollBarHeightAdjustment,
  scrollBarWidthAdjustment,
  borderSize,
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
  getClipboardHelperProps,
}) => {
  // const rawDataWidth = sumWidth(headers)
  // const rawDataHeight = sumHeight({ data, rowHeight })
  // const normalizedWidth = R.isNil(width) ? rawDataWidth : R.min(width, rawDataWidth)

  // /* do not scroll when we can fit everything */
  // const scroll =
  //   width && height && headerRowHeight && (width < rawDataWidth || height < rawDataHeight)
  // const scrollX = scroll && width < rawDataWidth
  // const scrollY = scroll && height < rawDataHeight
  // const numOfFixedCols = !scrollX ? 0 : autoFixColByKey ? countKeyCols(headers) : fixedColCount
  // // const scrollY = scroll && height <
  // const { rowHeaders, dataHeaders } = splitFixedCols(numOfFixedCols, headers)
  // const scrollSize = 17
  // const borderSize = 1
  // const containerWidth =
  //   normalizedWidth + headers.length - 1 + (scrollY && scrollX ? scrollSize : 0)
  // const scrollPaneHeight = numOfFixedCols > 0 && scrollX ? height + 5 + scrollSize : height + 5
  // const fixedPaneHeight = height + fixedScrollHeightAdjustment

  // TODO: fix width issue for all browsers chrome/safari/firefox
  //
  // const scrollWidth = computeScrollingGridWidths({
  //   normalizedWidth,
  //   rowHeaders,
  //   scrollX,
  //   scrollY,
  //   fixedColCount,
  //   headers,
  //   scrollSize,
  //   borderSize,
  // })
  // const fixedWidth = computeFixedGridWidths({ rowHeaders, borderSize })

  // console.log('provided width', width)
  // console.log('rawDataWidth', rawDataWidth)
  // console.log('rawDataHeight', rawDataHeight)
  // console.log('conatinerWidth', containerWidth)
  // console.log('fixedWidth', fixedWidth)
  // console.log('scrollWidth', scrollWidth)

  // const containerHeight = R.isNil(height)
  //   ? undefined
  //   : height + (scroll ? 17 : 0) + (hasPaging ? pagerHeight : 0)
  const {
    scroll,
    scrollX,
    scrollY,
    numOfFixedCols,
    rowHeaders,
    dataHeaders,
    containerWidth,
    scrollPaneHeight,
    containerHeight,
    hasFixedCols,
    fixedHeaderWidth,
    contentViewPortWidth,
  } = computeGridProps({
    headers,
    data,
    rowHeight,
    width,
    height,
    scrollBarWidthAdjustment,
    scrollBarHeightAdjustment,
    // fixedScrollHeightAdjustment,
    borderSize,
    fixedColCount,
    autoFixColByKey,
    headerRowHeight,
    hasPaging,
    pagerHeight,
  })

  const pagerStyle = {
    height: pagerHeight + 'px',
    position: scroll ? 'absolute' : undefined,
    left: scroll ? '0px' : undefined,
    bottom: scroll ? '0px' : undefined,
    width: scroll ? containerWidth + 'px' : undefined,
  }

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
      <input {...getClipboardHelperProps()} />
      {/* col header non-scrolling part/fixed columns */}
      {hasFixedCols && (
        <FlexGridRow
          {...getRowProps({
            isHeader: true,
            headers: rowHeaders,
            headerRowHeight,
            scroll,
            // width is ommited because it is auto calced
            // if not supplied
          })}
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
          width: contentViewPortWidth,
          headerRowHeight,
          xOffSet: fixedHeaderWidth,
          scrollY,
          scroll,
        })}
      >
        {dataHeaders.map((header, index) => (
          <FlexGridColHeader
            render={colHeaderRenderer}
            {...getColumnHeaderProps({ index, header })}
            scrollY={scrollY}
          />
        ))}
      </FlexGridRow>
      {/* scrollY && <UpperRight headerRowHeight={headerRowHeight} /> */}
      {/* table body fixed columns */}
      {numOfFixedCols > 0 && (
        <TableContent
          height={scrollPaneHeight}
          width={fixedHeaderWidth}
          yOffSet={headerRowHeight}
          headers={rowHeaders}
          scroll={scroll}
          scrollX
          vertical
          horizontal={false}
        >
          {R.range(0, data.length).map(rowIndex => (
            <FlexGridRow
              {...getRowProps({
                index: rowIndex,
                headers: rowHeaders,
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
        width={contentViewPortWidth}
        yOffSet={headerRowHeight}
        headers={dataHeaders}
        scroll={scroll}
        xOffSet={fixedHeaderWidth - 1}
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
