import React from 'react'
import ReactDOM from 'react-dom'
import { sumWidth, isPositionValid, extractPosition } from './utils'
import PropTypes from 'prop-types'
import ScrollSyncHelper from './ScrollSyncHelper'

import { ROW_INDEX_ATTRIBUTE, COLUMN_INDEX_ATTRIBUTE } from './constants.js'

const rowHeightOf = (index, rowHeight) =>
  typeof rowHeight === 'function' ? rowHeight(index) : rowHeight

const SCROLL_SYNC_CONTEXT = '$$GRID_SCROLL_SYNC_CONTEXT$$'

class ScrollPane extends React.Component {
  static propTypes = {
    horizontal: PropTypes.bool.isRequired,
  }
  static defaultProps = {
    horizontal: true,
  }
  static contextTypes = {
    [SCROLL_SYNC_CONTEXT]: PropTypes.object.isRequired,
  }
  componentDidMount() {
    const { horizontal } = this.props
    const scrollSync = this.context[SCROLL_SYNC_CONTEXT]
    const node = ReactDOM.findDOMNode(this.pane)
    //console.log('registering', node, 'with', scrollSync)
    scrollSync.registerPane(
      node,
      horizontal ? ScrollSyncHelper.HORIZONTAL : ScrollSyncHelper.VERTICAL
    )
  }

  render() {
    const { children, vertical, ...props } = this.props
    return (
      <div ref={n => (this.pane = n)} {...props}>
        {children}
      </div>
    )
  }
}

class Grid extends React.PureComponent {
  static propTypes = {
    render: PropTypes.func.isRequired,
  }
  static SyncedScrollPane = ScrollPane
  static childContextTypes = {
    [SCROLL_SYNC_CONTEXT]: PropTypes.object.isRequired,
  }
  getChildContext() {
    return {
      [SCROLL_SYNC_CONTEXT]: this.scrollSync,
    }
  }

  /** move over code to select and copy data */
  static extractPosition = evt => ({
    rowIndex: parseInt(evt.target.getAttribute(ROW_INDEX_ATTRIBUTE)),
    columnIndex: parseInt(evt.target.getAttribute(COLUMN_INDEX_ATTRIBUTE)),
  })

  state = { selectedRow: undefined, hoveredRow: undefined }
  scrollSync = new ScrollSyncHelper()

  getColumnHeaderProps = ({ key, index, header }) => ({
    key: key || header.ident,
    header,
    width: header.width,
  })

  getRowProps = ({
    key,
    index,
    isHeader = false,
    headers,
    width,
    rowHeight,
    headerRowHeight,
  }) => ({
    key: key || index,
    width: width === undefined || width === null ? sumWidth(headers) : width,
    height: isHeader ? headerRowHeight : rowHeightOf(index, rowHeight),
    colCount: headers.length,
    isHeader,
  })

  /** find out ways to not use rowIndex, columnIndex
   * listener on each Cell. that is supposedly optimized by react
   * meaning even though a lot of listeners are created. only one actually exists
   * **/
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
    rowData,
    rowHeight,
    ...rest
  }) => ({
    key: key || rowIndex + '*' + header.ident,
    'data-row-index': rowIndex,
    'data-column-index': columnIndex,
    header,
    onMouseDown: this.cellMouseDown,
    onMouseOver: this.cellMouseOver,
    isSelected: this.state.selectedRow === rowIndex,
    isHovered: this.state.hoveredRow === rowIndex,
    data,
    rowIndex,
    columnIndex,
    height: rowHeightOf(rowIndex, rowHeight),
    width: header.width,
    alignment: header.alignment,
  })

  getGridContainerProps = () => ({
    display: 'relative',
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
