import React, { useEffect, useRef, useState } from 'react'
import { Grid, ScrollSync } from 'react-virtualized'
import computeGridProps from '../computeGridProps'
import scrollbarSize from 'dom-helpers/util/scrollbarSize'
import { Provider } from './VirtualizedContext'
// import CellEditContainer from './CellEditContainer'
import { defaultCellRender, cellRenderWrapper, defaultRowHeaderRender } from './cellRender'
import { equals } from 'ramda'

const colWidthOf = cols => ({ index }) => cols[index].width

const empty = {}

const computeScrollTo = ({
  contentGrid,
  x2,
  y2,
  previousPosition,
  fixedHeaderWidth,
  numOfFixedCols,
}) => {
  const scrollPane = contentGrid && contentGrid._scrollingContainer
  if (scrollPane != null) {
    let scrollToColumn = x2
    const scrollToRow = y2

    /*
    const scrollLeft = scrollPane.scrollLeft
    // const scrollTop = scrollPane.scrollTop
    // console.log(scrollLeft, scrollTop)
    //
    const offSet = contentGrid.getOffsetForCell({
      alignment: 'start',
      columnIndex: scrollToColumn,
      rowIndex: scrollToRow,
    })
    console.log('offset is', offSet)
    */

    if (x2 < previousPosition.x2) {
      console.log('going left in ', scrollPane.offsetWidth)

      const scrollLeft = scrollPane.scrollLeft

      const offSet = contentGrid.getOffsetForCell({
        alignment: 'start',
        columnIndex: scrollToColumn,
        rowIndex: scrollToRow,
      })
      console.log(scrollLeft, offSet.scrollLeft, offSet.scrollLeft - fixedHeaderWidth)
      if (scrollLeft > offSet.scrollLeft - fixedHeaderWidth) {
        scrollPane.scrollLeft = Math.max(offSet.scrollLeft - fixedHeaderWidth, 0)
      }
      console.log(scrollPane)
      return null
    } else if (x2 > previousPosition.x2) {
      console.log('going right')
      return { scrollToColumn, scrollToRow }
    } else {
      console.log('no left right business')
      return { scrollToColumn, scrollToRow }
    }
  }
  return null
}

//
//
const VirtualizedRender = ({ renderOptions = {}, gridRenderProps }) => {
  const contentGridRef = useRef()
  const positionRef = useRef()
  const [scrollInfo, setScrollInfo] = useState(null)

  const {
    headers,
    data,
    getContainerProps,
    getClipboardHelperProps,
    // getSelectionInfo,
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
    // fixedScrollHeightAdjustment = 6,
  } = renderOptions

  const {
    scrollY,
    scrollX,
    numOfFixedCols,
    // rowHeaders,
    // dataHeaders,
    // containerWidth,
    // scrollPaneHeight,
    // containerHeight,
    // hasFixedCols,
    fixedHeaderWidth,
    // contentViewPortWidth,
    totalWidth,
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

  const dataRender = cellRenderWrapper()(cellRender)
  // const dataCellRender = cellRenderWrapper(offSetColumn)(cellRender)
  const headerRender = cellRenderWrapper()(rowHeaderRender)
  // const upperRightRender = cellRenderWrapper(offSetColumn)(rowHeaderRender)

  const selectionInfo =
    gridRenderProps && gridRenderProps.getSelectionInfo && gridRenderProps.getSelectionInfo()
  const { x2, y2 } = selectionInfo && selectionInfo.rawPositions ? selectionInfo.rawPositions : {}
  useEffect(() => {
    // console.log('pos ref is ', positionRef.current)
    if (positionRef.current != null) {
      // console.log(`transition is ${x2}:${positionRef.current.x2} - ${y2}:${positionRef.current.y2}`)
      const newScrollInfo = computeScrollTo({
        contentGrid: contentGridRef.current,
        x2,
        y2,
        fixedHeaderWidth,
        previousPosition: positionRef.current,
      })
      if (newScrollInfo != null) setScrollInfo(i => (equals(i, newScrollInfo) ? i : newScrollInfo))
    }

    positionRef.current = { x2, y2 }
  }, [contentGridRef.current, fixedHeaderWidth, fixedColCount, x2, y2])

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
              style={{ position: 'relative', ...style }}
              className={className}
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
                  ref={contentGridRef}
                  {...scrollInfo}
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
                    left: `${Math.min(width, totalWidth)}px`,
                    width: `${scrollbarSize() + (scrollX ? 0 : width - totalWidth)}px`,
                    height: `${headerRowHeight}px`,
                    top: '0px',
                    backgroundColor: 'steelblue',
                    borderRight: '1px solid #ccc',
                    borderBottom: '1px solid #ccc',
                    // borderLeft: '1px solid #ccc',
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

const virtualizedGridRenderer = renderOptions => gridRenderProps => (
  <VirtualizedRender renderOptions={renderOptions} gridRenderProps={gridRenderProps} />
)

export default virtualizedGridRenderer
