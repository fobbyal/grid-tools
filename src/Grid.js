import React from 'react'
import { sumWidth, isPositionValid, extractPosition } from './utils'
import { ROW_INDEX_ATTRIBUTE, COLUMN_INDEX_ATTRIBUTE } from './constants.js'

class Grid extends React.Component {
  /** move over code to select and copy data */
  static extractPosition = evt => ({
    rowIndex: parseInt(evt.target.getAttribute(ROW_INDEX_ATTRIBUTE)),
    columnIndex: parseInt(evt.target.getAttribute(COLUMN_INDEX_ATTRIBUTE)),
  })

  state = { selectedRow: undefined, hoveredRow: undefined }

  getColumnHeaderProps = ({ key, index, header }) => ({
    key: key || header.ident,
    header,
  })

  getRowProps = ({ key, index, isHeader = false, headers, rowWidth }) => ({
    key: key || index,
    rowWidth:
      rowWidth === undefined || rowWidth === null
        ? sumWidth(headers)
        : rowWidth,
  })

  cellMouseDown = e => {
    const pos = extractPosition(e)
    if (isPositionValid(pos)) {
      const { rowIndex, columnIndex } = pos
      this.setState(_ => ({ selectedRow: rowIndex }))
    }
  }

  cellMouseOver = e => {
    const pos = extractPosition(e)
    if (isPositionValid(pos)) {
      const { rowIndex, columnIndex } = pos
      this.setState(_ => ({ hoveredRow: rowIndex }))
    }
  }

  getCellProps = ({
    key,
    rowIndex,
    columnIndex,
    header,
    data,
    style,
    rowData,
    ...rest
  }) => ({
    key: key || rowIndex + '*' + header.ident,
    'data-row-index': rowIndex,
    'data-column-index': columnIndex,
    header,
    // style: {
    //   ...flexCellStyle({ ...header }),
    //   ...style,
    // },
    // TODO no broadcast... use rowIndex and columnIndex to identify clicked cells
    // and use common onClicked event
    onMouseDown: this.cellMouseDown,
    onMouseOver: this.cellMouseOver,
    isSelected: this.state.selectedRow === rowIndex,
    isHovered: this.state.hoveredRow === rowIndex,
    data,
    rowIndex,
    columnIndex,
  })

  render() {
    return this.props.render({
      getColumnHeaderProps: this.getColumnHeaderProps,
      getRowProps: this.getRowProps,
      getCellProps: this.getCellProps,
    })
  }
}
Grid.ROW_INDEX_ATTRIBUTE = ROW_INDEX_ATTRIBUTE
Grid.COLUMN_INDEX_ATTRIBUTE = COLUMN_INDEX_ATTRIBUTE
export default Grid
