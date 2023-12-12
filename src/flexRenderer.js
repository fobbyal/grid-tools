import React from 'react'
import styled from 'styled-components'
import R from 'ramda'
import Grid from './Grid'
import { formatData, extractData } from './utils'
import computeGridProps from './computeGridProps'
import DefaultPager from './DefaultPager'
import {
  BasicCell,
  BasicColHeader,
  SortIndicator,
  inputCellEditRender,
  dropdownEditRender,
} from './Components'
import CellEditContainer from './CellEditContainer'
import GridToolsContext from './context'
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
  /*display: block;*/
  height: 100%;
  text-align: ${props => props.alignment || 'center'};
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

const defaultNoDataRender = ({ top, width, height }) => (
  <div
    style={{
      position: top > 0 ? 'absolute' : undefined,
      left: '0px',
      top: top,
      height: height + 'px',
      width: width + 'px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2.5em',
      color: '#999',
      borderLeft: '3px dashed #ddd',
      borderRight: '3px dashed #ddd',
      borderBottom: '3px dashed #ddd',
      borderBottomRightRadius: '6px',
      borderBottomLeftRadius: '6px',
    }}
  >
    Data Not Available
  </div>
)

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
    return <Cell {...rest}> {display} </Cell>
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
  altIndexes,
  altBgColor,
  ...rest
}) => {
  const value = extractData({ header, rowData: data[rowIndex] })
  const display = formatData({ header, value, rowData: data[rowIndex] })
  /* todo may consider passing down just the hader */

  // moved all this to grid getCellProps
  // const {
  //   fontSize,
  //   fontWeight,
  //   backgroundColor,
  //   hoverSelectionBackgroundColor,
  //   hoverBackgroundColor,
  //   selectionBackgroundColor,
  //   hoverSelectionColor,
  //   hoverColor,
  //   selectionColor,
  //   color,
  // } = header

  // fontSize={fontSize}
  // fontWeight={fontWeight}
  // backgroundColor={backgroundColor || (altIndexes && altIndexes[rowIndex] && altBgColor)}
  // hoverSelectionBackgroundColor={hoverSelectionBackgroundColor}
  // hoverBackgroundColor={hoverBackgroundColor}
  // selectionBackgroundColor={selectionBackgroundColor}
  // hoverSelectionColor={hoverSelectionColor}
  // hoverColor={hoverColor}
  // selectionColor={selectionColor}
  // color={color}
  return (
    <PureCell
      title={rest.invalidMessage || value + ''}
      width={width}
      height={height}
      display={display}
      {...rest}
    />
  )
}

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

export const defaultColHeaderRenderer = ({ header, sortOrder, width, ...rest }) => {
  const gridContext = React.useContext(GridToolsContext)
  return (
    <ColHeader
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
    </ColHeader>
  )
}

// <SortIndicator className="fa fa-caret-up" aria-hidden="true" />
// <SortIndicator className="fa fa-caret-down" aria-hidden="true" />

const FlexGridColHeader = React.memo(({ render = defaultColHeaderRenderer, ...rest }) =>
  render(rest)
)

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
  editRenderer,
  colHeaderRenderer,
  pagerRenderer = defaultPagerRenderer,
  // editByRow = true,
  // editByCell = false,
  pagerHeight = 35,
  // TODO: have to get css expert
  // fixedScrollHeightAdjustment = 6,
  scrollBarHeightAdjustment,
  scrollBarWidthAdjustment,
  borderSize,
  noDataRender = defaultNoDataRender,
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
  // gridContainerRefHandler,
  getClipboardHelperProps,
}) => {
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
            {...getColumnHeaderProps({ index: index + numOfFixedCols, header })}
            scrollY={scrollY}
          />
        ))}
      </FlexGridRow>
      {/* scrollY && <UpperRight headerRowHeight={headerRowHeight} /> */}
      {/* table body fixed columns */}
      {numOfFixedCols > 0 && data && data.length > 0 && (
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
              {rowHeaders.map((header, columnIndex, all) => (
                <FlexGridCell
                  render={cellRenderer}
                  editRender={editRenderer}
                  {...getCellProps({
                    rowIndex,
                    columnIndex,
                    header,
                    data,
                    isLastInRow: all.length === columnIndex + 1,
                  })}
                />
              ))}
            </FlexGridRow>
          ))}
        </TableContent>
      )}
      {/* table body data columns */}
      {data && data.length > 0 && (
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
              {dataHeaders.map((header, columnIndex, all) => (
                <FlexGridCell
                  render={cellRenderer}
                  editRender={editRenderer}
                  {...getCellProps({
                    rowIndex,
                    columnIndex: columnIndex + numOfFixedCols,
                    header,
                    data,
                    isLastInRow: all.length === columnIndex + 1,
                  })}
                />
              ))}
            </FlexGridRow>
          ))}
        </TableContent>
      )}
      {data &&
        data.length === 0 &&
        noDataRender &&
        noDataRender({
          top: headerRowHeight,
          height: scrollPaneHeight,
          width: containerWidth,
        })}
      {hasPaging && pagerRenderer(getPagerProps({ style: pagerStyle }))}
      {renderRowEditor(getRowEditorProps())}
    </FlexGridContainer>
  )
}

export default flexGridRenderer
