import React, { useEffect, useRef, useCallback } from 'react'
import { Grid } from 'react-virtualized'
import computeGridProps from '../computeGridProps'
import scrollbarSize from 'dom-helpers/util/scrollbarSize'
import { Provider } from './VirtualizedContext'
// import CellEditContainer from './CellEditContainer'
import { defaultCellRender, cellRenderWrapper, defaultRowHeaderRender } from './cellRender'
import GridToolsContext from '../context'

const totalColWidth = cols => cols.map(c => c.width).reduce((c1, c2) => c1 + c2, 0)

const colWidthOf = cols => ({ index }) => cols[index].width

const handleSelectionScroll = ({ contentGrid, x2, y2, previousPosition, fixedHeaderWidth }) => {
  const scrollPane = contentGrid && contentGrid._scrollingContainer
  if (x2 === previousPosition.x2 && y2 === previousPosition.y2) return
  if (scrollPane != null) {
    let scrollToColumn = x2
    const scrollToRow = y2
    const scrollLeft = scrollPane.scrollLeft
    if (x2 < previousPosition.x2) {
      const offSet = contentGrid.getOffsetForCell({
        alignment: 'start',
        columnIndex: scrollToColumn,
        rowIndex: scrollToRow,
      })
      if (scrollLeft > offSet.scrollLeft - fixedHeaderWidth) {
        // scrollPane.scrollLeft = Math.max(offSet.scrollLeft - fixedHeaderWidth, 0)
        const scrollTop = scrollPane.scrollTop
        contentGrid.scrollToPosition({
          scrollLeft: Math.max(offSet.scrollLeft - fixedHeaderWidth, 0),
          scrollTop,
        })
        // console.log('need scroll fix')
      }
      // console.log('scroll towards left')
    } else if (x2 > previousPosition.x2) {
      // console.log('scroll towards right')
      contentGrid.scrollToCell({ columnIndex: scrollToColumn, rowIndex: scrollToRow })
    } else {
      // console.log('up and down')
      contentGrid.scrollToCell({ columnIndex: scrollToColumn, rowIndex: scrollToRow })
    }
  }
  return null
}

//
//
const VirtualizedRender = ({ renderOptions = {}, gridRenderProps }) => {
  const internalContentGridRef = useRef()
  const rowHeaderGridRef = useRef()
  const columnHeaderGridRef = useRef()
  const positionRef = useRef()

  const {
    headers,
    data,
    getContainerProps,
    getClipboardHelperProps,
    // getSelectionInfo,
  } = gridRenderProps

  const previousColumnWidth = useRef(totalColWidth(headers))

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
    contentGridRef: externalContentGridRef,
    onScroll,
    // colHeaderRenderer,
    // pagerRenderer = defaultPagerRenderer,
    // editByRow = true,
    // editByCell = false,
    // fixedScrollHeightAdjustment = 6,
  } = renderOptions

  const contentGridRef = externalContentGridRef || internalContentGridRef

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
      handleSelectionScroll({
        contentGrid: contentGridRef.current,
        x2,
        y2,
        fixedHeaderWidth,
        previousPosition: positionRef.current,
      })
    }
    positionRef.current = { x2, y2 }
  }, [contentGridRef.current, fixedHeaderWidth, fixedColCount, x2, y2])

  useEffect(() => {
    const currentTotalColumnWidth = totalColWidth(headers)
    if (previousColumnWidth.current !== currentTotalColumnWidth) {
      previousColumnWidth.current = currentTotalColumnWidth
      contentGridRef.current && contentGridRef.current.recomputeGridSize()
      rowHeaderGridRef.current && rowHeaderGridRef.current.recomputeGridSize()
      numOfFixedCols > 0 &&
        columnHeaderGridRef.current &&
        columnHeaderGridRef.current.recomputeGridSize()
    }
  }, [headers])

  /** scroll sync listener **/
  const onMainGridScroll = useCallback(scrollInfo => {
    const { scrollLeft, scrollTop } = scrollInfo
    if (rowHeaderGridRef.current != null) {
      rowHeaderGridRef.current.scrollToPosition({ scrollLeft, scrollTop: 0 })
    }
    if (columnHeaderGridRef.current != null) {
      columnHeaderGridRef.current.scrollToPosition({ scrollLeft: 0, scrollTop })
    }
  }, [])
  const gridContext = React.useContext(GridToolsContext)

  return (
    <Provider value={gridRenderProps}>
      <div
        style={{ position: 'relative', ...style }}
        className={className}
        {...getContainerProps({ width, height, refKey: 'ref' })}
        tabIndex="0"
      >
        <input {...getClipboardHelperProps()} />

        {/* row headers */}
        <div
          style={{
            position: 'absolute',
            left: `0px`,
            top: '0px',
          }}
        >
          <Grid
            style={{
              overflowX: 'hidden',
              overflowY: 'hidden',
            }}
            cellRenderer={headerRender}
            columnWidth={colWidthOf(headers)}
            columnCount={headers.length}
            height={headerRowHeight}
            rowHeight={headerRowHeight}
            rowCount={1}
            width={width}
            ref={rowHeaderGridRef}
          />
        </div>
        {/* main grid */}
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
            width={width + scrollbarSize()}
            ref={contentGridRef}
            onScroll={scrollInfo => {
              onMainGridScroll(scrollInfo)
              if (onScroll != null) {
                onScroll(scrollInfo)
              }
            }}
          />
        </div>
        {/* fixed headers upper left - corner */}
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
        {/* fixed body (column headers) */}
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
              width={fixedHeaderWidth}
              ref={columnHeaderGridRef}
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
              backgroundColor: gridContext.columnHeaderProps.backgroundColor,
              borderRight: '1px solid #ccc',
              borderBottom: '1px solid #ccc',
              // borderLeft: '1px solid #ccc',
              borderTopRightRadius: '3px',
            }}
          />
        )}
      </div>
    </Provider>
  )
}

const virtualizedGridRenderer = renderOptions => gridRenderProps => (
  <VirtualizedRender renderOptions={renderOptions} gridRenderProps={gridRenderProps} />
)

export default virtualizedGridRenderer
