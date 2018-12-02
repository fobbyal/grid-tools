import React from 'react'
import { Grid, ScrollSync } from 'react-virtualized'
import computeGridProps from '../computeGridProps'
import scrollbarSize from 'dom-helpers/util/scrollbarSize'
import { Provider } from './VirtualizedContext'
// import CellEditContainer from './CellEditContainer'
import { defaultCellRender, cellRenderWrapper, defaultRowHeaderRender } from './cellRender'

const colWidthOf = cols => ({ index }) => cols[index].width

const computeScrollTo = ({
  contentGrid,
  gridRenderProps: { getSelectionInfo },
  fixedHeaderWidth,
}) => {
  const scrollPane = contentGrid && contentGrid._scrollingContainer
  if (scrollPane != null) {
    const scrollLeft = scrollPane.scrollLeft
    // const scrollTop = scrollPane.scrollTop
    const selectionInfo = getSelectionInfo()
    let scrollToColumn = selectionInfo.rawPositions.x2
    const scrollToRow = selectionInfo.rawPositions.y2
    // console.log(scrollLeft, scrollTop)
    //
    const offSet = contentGrid.getOffsetForCell({
      alignment: 'start',
      columnIndex: scrollToColumn,
      rowIndex: scrollToRow,
    })

    if (scrollLeft + fixedHeaderWidth >= offSet.scrollLeft)
      return { scrollLeft: offSet.scrollLeft - fixedHeaderWidth }

    return { scrollToColumn, scrollToRow }
  }
  return {}
}

//
//
class VritualizedRender extends React.Component {
  render() {
    const { renderOptions = {}, gridRenderProps } = this.props

    const {
      headers,
      data,
      getContainerProps,
      getClipboardHelperProps,
      getSelectionInfo,
    } = gridRenderProps

    const {
      style,
      className,
      height = 600,
      width = 1100,
      rowHeight = 23,
      headerRowHeight = 60,
      fixedColCount = 0,
      autoFixColByKey,
      cellRender = defaultCellRender,
      rowHeaderRender = defaultRowHeaderRender,
      // colHeaderRenderer,
      // pagerRenderer = defaultPagerRenderer,
      // editByRow = true,
      // editByCell = false,
      // // TODO: have to get css expert
      // fixedScrollHeightAdjustment = 6,
    } = renderOptions

    const {
      scrollY,
      numOfFixedCols,
      // rowHeaders,
      // dataHeaders,
      // containerWidth,
      // scrollPaneHeight,
      // containerHeight,
      // hasFixedCols,
      fixedHeaderWidth,
      // contentViewPortWidth,
    } = computeGridProps({
      headers,
      data,
      rowHeight,
      width,
      height,
      scrollBarWidthAdjustment: scrollbarSize(),
      scrollBarHeightAdjustment: scrollbarSize(),
      fixedColCount,
      autoFixColByKey,
      headerRowHeight,
    })

    // const offSetColumn = numOfFixedCols === 0 ? undefined : withColumnOffset(numOfFixedCols)

    const dataRender = cellRenderWrapper()(cellRender)
    // const dataCellRender = cellRenderWrapper(offSetColumn)(cellRender)
    const headerRender = cellRenderWrapper()(rowHeaderRender)
    // const upperRightRender = cellRenderWrapper(offSetColumn)(rowHeaderRender)

    const scrollInfo = computeScrollTo({
      contentGrid: this.contentGrid,
      gridRenderProps,
      fixedHeaderWidth,
    })

    return (
      <Provider value={gridRenderProps}>
        <ScrollSync>
          {({
            clientHeight,
            clientWidth,
            onScroll,
            scrollHeight,
            scrollLeft,
            scrollTop,
            scrollWidth,
          }) => {
            return (
              <div
                style={{ position: 'relative' }}
                {...getContainerProps({ width, height, refKey: 'ref' })}
                tabIndex="0"
              >
                <input {...getClipboardHelperProps()} />
                <div
                  style={{
                    position: 'absolute',
                    left: `0px`,
                    top: '0px',
                  }}
                >
                  <Grid
                    style={{ overflow: 'hidden' }}
                    cellRenderer={headerRender}
                    columnWidth={colWidthOf(headers)}
                    columnCount={headers.length}
                    height={headerRowHeight}
                    rowHeight={headerRowHeight}
                    rowCount={1}
                    scrollLeft={scrollLeft}
                    width={width}
                  />
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: '0px',
                    top: `${headerRowHeight}px`,
                  }}
                >
                  <Grid
                    cellRenderer={dataRender}
                    columnWidth={colWidthOf(headers)}
                    columnCount={headers.length}
                    height={height - headerRowHeight}
                    rowHeight={rowHeight}
                    rowCount={data.length}
                    onScroll={onScroll}
                    width={width + scrollbarSize()}
                    {...scrollInfo}
                    ref={n => {
                      this.contentGrid = n
                    }}
                  />
                </div>
                {numOfFixedCols > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '0px',
                      top: '0px',
                    }}
                  >
                    <Grid
                      cellRenderer={headerRender}
                      columnWidth={colWidthOf(headers)}
                      columnCount={numOfFixedCols}
                      height={headerRowHeight}
                      rowHeight={headerRowHeight}
                      rowCount={1}
                      width={fixedHeaderWidth}
                    />
                  </div>
                )}
                {numOfFixedCols > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '0px',
                      top: `${headerRowHeight}px`,
                      backgroundColor: 'white',
                      borderRight: '1px solid #ccc',
                    }}
                  >
                    <Grid
                      style={{ overflow: 'hidden' }}
                      cellRenderer={dataRender}
                      columnWidth={colWidthOf(headers)}
                      columnCount={numOfFixedCols}
                      height={height - headerRowHeight - scrollbarSize()}
                      rowHeight={rowHeight}
                      rowCount={data.length}
                      scrollTop={scrollTop}
                      width={fixedHeaderWidth}
                    />
                  </div>
                )}
                {scrollY && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${width}px`,
                      width: scrollbarSize() + 'px',
                      height: `${headerRowHeight}px`,
                      top: '0px',
                      backgroundColor: 'steelblue',
                      borderRight: '1px solid #ccc',
                      borderBottom: '1px solid #ccc',
                      borderLeft: '1px solid #ccc',
                      borderTopRightRadius: '3px',
                    }}
                  />
                )}
              </div>
            )
          }}
        </ScrollSync>
      </Provider>
    )
  }
}

const virtualizedGridRenderer = renderOptions => gridRenderProps => (
  <VritualizedRender renderOptions={renderOptions} gridRenderProps={gridRenderProps} />
)

export default virtualizedGridRenderer
