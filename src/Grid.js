import React from 'react'
import {
  sumWidth,
  isPositionValid,
  extractPosition,
  extractColIdent,
  extractAndFormatData,
  extractData,
} from './utils'
import PropTypes from 'prop-types'
import ScrollSyncHelper from './ScrollSyncHelper'
import R from 'ramda'
import ScrollPane from './ScrollPane'
import moment from 'moment'
import RowEditor from './RowEditor'

import {
  ROW_INDEX_ATTRIBUTE,
  COLUMN_INDEX_ATTRIBUTE,
  SCROLL_SYNC_CONTEXT,
  COL_IDENT_ATTRIBUTE,
} from './constants.js'

const rowHeightOf = (index, rowHeight) =>
  typeof rowHeight === 'function' ? rowHeight(index) : rowHeight

const empty = {}

const normalizeBounds = selection => {
  const { x1, y1, x2, y2 } = selection
  if (R.isNil(x1) && R.isNil(x2) && R.isNil(y1) && R.isNil(y2)) return empty

  const xMin = !R.isNil(x2) ? Math.min(x1, x2) : x1
  const xMax = !R.isNil(x2) ? Math.max(x1, x2) : x1
  const yMin = !R.isNil(y2) ? Math.min(y1, y2) : y1
  const yMax = !R.isNil(y2) ? Math.max(y1, y2) : y1
  return { x1: xMin, x2: xMax, y1: yMin, y2: yMax }
}
const isCellSelected = (rowIndex, columnIndex, selection) => {
  const { x1, x2, y1, y2 } = normalizeBounds(selection)
  return rowIndex <= y2 && rowIndex >= y1 && columnIndex <= x2 && columnIndex >= x1
}

const isRowSelected = (rowIndex, selection) => {
  const { y1, y2 } = normalizeBounds(selection)
  return rowIndex <= y2 && rowIndex >= y1
}

const toggleSortOrder = order => (order === 'asc' ? 'desc' : order === 'desc' ? undefined : 'asc')

const normalizeValue = (val, type) =>
  type === 'num' && typeof val === 'string'
    ? parseFloat(val)
    : type === 'date' && (moment.isDate(val) || moment.isMoment(val))
      ? val.valueOf()
      : type === 'date' && typeof val === 'string' ? moment(val).valueOf() : val

const compare = ({ aVal, bVal, sortOrder }) => {
  const greaterThanResult = sortOrder === 'asc' ? 1 : -1
  const lessThanResult = sortOrder === 'asc' ? -1 : 1

  if (!R.isNil(aVal) || !R.isNil(bVal)) {
    if (R.isNil(aVal)) return greaterThanResult
    if (R.isNil(bVal)) return lessThanResult
    if (
      typeof aVal === 'string' &&
      typeof bVal === 'string' &&
      aVal.toLowerCase().localeCompare(bVal.toLowerCase()) === 1
    )
      return greaterThanResult
    if (
      typeof aVal === 'string' &&
      typeof bVal === 'string' &&
      bVal.toLowerCase().localeCompare(aVal.toLowerCase()) === 1
    )
      return lessThanResult

    if (typeof aVal === 'number' && typeof bVal === 'number' && aVal > bVal)
      return greaterThanResult
    if (typeof aVal === 'number' && typeof bVal === 'number' && bVal > aVal) return lessThanResult
  }
  return 0
}

const defaultDataComparator = ({ sortOptions, headers }) => (a, b) => {
  const headerMap = R.compose(R.fromPairs, R.map(header => [header.ident, header]))(headers)

  for (let i = 0; i < sortOptions.length; i++) {
    const { ident, sortOrder } = sortOptions[i]
    const header = headerMap[ident]
    const { type, sortIndexGetter } = header
    // TODO may need to look into getting custom data for example date
    const aVal = normalizeValue(
      sortIndexGetter
        ? sortIndexGetter({ rowData: a, header })
        : extractData({ rowData: a, header }),
      type
    )
    const bVal = normalizeValue(
      sortIndexGetter
        ? sortIndexGetter({ rowData: b, header })
        : extractData({ rowData: b, header }),
      type
    )
    const res = compare({ aVal, bVal, sortOrder })
    if (res !== 0) return res
  }
  return 0
}

const computeSortOptions = (sortOptions, { ident }) => {
  if (R.find(opt => opt.ident === ident, sortOptions) !== undefined) {
    return sortOptions
      .map(
        opt => (opt.ident === ident ? { ident, sortOrder: toggleSortOrder(opt.sortOrder) } : opt)
      )
      .filter(opt => opt.sortOrder !== undefined)
  } else {
    return [...sortOptions, { ident, sortOrder: 'asc' }]
  }
}

const matchData = (rowData, fuzzyFilter) => header =>
  extractAndFormatData({ rowData, header })
    .toLowerCase()
    .includes(fuzzyFilter.toLowerCase())

const filterData = (data, headers, fuzzyFilter) => {
  const filteredHeaders = R.filter(({ isKey, isFiltered }) => isKey || isFiltered, headers)
  return R.filter(rowData => R.any(matchData(rowData, fuzzyFilter), filteredHeaders), data)
}

const computeView = ({
  data,
  sortOptions,
  comparator = defaultDataComparator,
  fuzzyFilter,
  headers,
  rowsPerPage,
  currentPage,
  editedMap,
}) => {
  // TODO have to add edited value
  //
  const editedData =
    R.isNil(editedMap) || editedMap.size === 0
      ? data
      : R.map(row => editedMap.get(row) || row, data)

  const filteredData =
    !R.isNil(fuzzyFilter) && !R.isEmpty(fuzzyFilter)
      ? filterData(editedData, headers, fuzzyFilter)
      : editedData

  const sortredData =
    R.isNil(sortOptions) || R.isEmpty(sortOptions)
      ? filteredData
      : R.sort(comparator({ sortOptions, headers }), filteredData)

  const normalizedCurrentPage = Math.min(filteredData.length, currentPage)

  const pagedData = R.isNil(rowsPerPage)
    ? sortredData
    : R.compose(R.take(rowsPerPage), R.drop((normalizedCurrentPage - 1) * rowsPerPage))(sortredData)

  return {
    view: pagedData,
    filteredDataLength: filteredData.length,
    currentPage: normalizedCurrentPage,
  }
}

const sortOrderOf = header => options => {
  if (R.isNil(options)) return undefined
  return R.compose(
    opt => (opt ? opt.sortOrder : undefined),
    R.find(opt => opt.ident === header.ident)
  )(options)
}

class Grid extends React.PureComponent {
  /* compond components */
  static SyncedScrollPane = ScrollPane

  static propTypes = {
    render: PropTypes.func.isRequired,
    data: PropTypes.array.isRequired,
    headers: PropTypes.array.isRequired,
    selectionMode: PropTypes.oneOf(['single', 'multi']).isRequired,
    selectionType: PropTypes.oneOf(['row', 'cell']).isRequired,
    hoverType: PropTypes.oneOf(['row', 'cell']).isRequired,
    sortEnabled: PropTypes.bool.isRequired,
    isEditable: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]).isRequired,
    /* optional stuff */
    sortOptions: PropTypes.array,
    onSortOptionsChange: PropTypes.func,
    fuzzyFilter: PropTypes.string,
    totalPages: PropTypes.number,
    currentPage: PropTypes.number,
    onPageChange: PropTypes.number,
    rowsPerPage: PropTypes.number,
    onEdit: PropTypes.func,
    showAdd: PropTypes.bool,
    addWithSelected: PropTypes.bool,
    onSelectionChange: PropTypes.func,
    renderRowEditor: PropTypes.func,
  }

  static defaultProps = {
    selectionType: 'cell',
    selectionMode: 'multi',
    hoverType: 'row',
    sortEnabled: true,
    isEditable: false,
    showAdd: false,
    addWithSelected: false,
    renderRowEditor: props => <RowEditor {...props} />,
  }

  static childContextTypes = {
    [SCROLL_SYNC_CONTEXT]: PropTypes.object.isRequired,
  }
  getChildContext() {
    return {
      [SCROLL_SYNC_CONTEXT]: this.scrollSync,
    }
  }

  scrollSync = new ScrollSyncHelper()
  /* 
   * two way map is used here because the data can be filtered or sorted
  /* orignal data to modified data or [data] -- for undo purpose */
  editedMap = new Map()
  /* modified data to original */
  dirtyMap = new Map()

  state = {
    hoveredRow: undefined,
    hoveredColumn: undefined,
    x1: undefined,
    x2: undefined,
    y1: undefined,
    y2: undefined,
    ...computeView({
      data: this.props.data,
      sortOptions: this.props.initialSortOptions || this.props.sortOptions,
      fuzzyFilter: this.props.fuzzyFilter,
      headers: this.props.headers,
      rowsPerPage: this.props.rowsPerPage,
      currentPage: this.props.currentPage || 1,
      editedMap: this.editedMap,
    }),
    sortOptions: this.props.initialSortOptions,
    currentPage: this.props.currentPage || 1,
    editingRow: undefined,
    editingColumn: undefined,
    editInfo: {},
  }

  bodyMouseRelease = e => {
    /* 
    * this will only work with one grid on screen 
    * may need to figureout another solution
    * isPositionValid only cares if data-row-index data-column-index is there
    * */
    if (this.selecting && !isPositionValid(extractPosition(e))) {
      this.selecting = false
    }
  }

  componentDidMount() {
    window.document.body.addEventListener('mouseup', this.bodyMouseRelease)
    window.document.body.addEventListener('mouseleave', this.bodyMouseRelease)
  }
  componentWillUnmount() {
    window.document.body.removeEventListener('mouseleave', this.bodyMouseRelease)
    window.document.body.removeEventListener('mouseup', this.bodyMouseRelease)
  }

  componentWillReceiveProps(nextProps) {
    const { data, sortOptions, fuzzyFilter } = this.props
    if (
      data !== nextProps.data ||
      sortOptions !== nextProps.sortOptions ||
      fuzzyFilter !== nextProps.fuzzyFilter ||
      this.props.currentPage !== nextProps.currentPage
    ) {
      this.setState(
        ({ editingRow, editingColumn, x1, x2, y1, y2, currentPage }) => ({
          // x1: data !== nextProps.data ? undefined : x1,
          // x2: data !== nextProps.data ? undefined : x2,
          // y1: data !== nextProps.data ? undefined : y1,
          // y2: data !== nextProps.data ? undefined : y2,
          ...this.generateViewProps({
            data: data !== nextProps.data ? nextProps.data : data,
            sortOptions: sortOptions !== nextProps.sortOptions ? nextProps.sortOptions : undefined,
            fuzzyFilter:
              fuzzyFilter !== nextProps.fuzzyFilter ? nextProps.fuzzyFilter : fuzzyFilter,
            currentPage:
              this.isPagingControlled() && this.props.currentPage !== nextProps.currentPage
                ? nextProps.currentPage
                : currentPage,
          }),
          editingRow: data !== nextProps.data ? undefined : editingRow,
          editingColumn: data !== nextProps.data ? undefined : editingColumn,
        }),
        this.selectionChanged
      )
    }
  }

  /* paging starts */

  hasPaging = ({ data = this.props.data } = {}) =>
    this.props.rowsPerPage !== undefined && data.length > this.props.rowsPerPage

  isPagingControlled = () =>
    this.props.totalPages !== undefined &&
    this.props.currentPage !== undefined &&
    this.props.onPageChange !== undefined

  currentPage = () =>
    this.hasPaging() ? this.props.currentPage || this.state.currentPage : undefined

  totalPages = () => {
    return !this.hasPaging()
      ? undefined
      : R.isNil(this.props.totalPages)
        ? Math.ceil(this.state.filteredDataLength / this.props.rowsPerPage)
        : this.props.totalPages
  }

  setCurrentPage = page => {
    if (isNaN(parseInt(page))) return

    if (this.hasPaging()) {
      const guardedPage = Math.max(Math.min(this.totalPages(), parseInt(page)), 1)
      if (guardedPage !== this.currentPage()) {
        if (this.isPagingControlled()) {
          this.props.onPageChange(guardedPage)
        } else {
          this.setState(_ => ({
            currentPage: guardedPage,
            ...this.generateViewProps({ currentPage: guardedPage }),
          }))
        }
      }
    }
  }

  incrementPage = () => {
    if (this.hasPaging()) {
      if (this.isPagingControlled()) {
        this.props.onPageChange(Math.max(Math.min(this.totalPages(), this.currentPage() + 1), 1))
      } else {
        this.setState(({ currentPage, view }) => {
          const totalPages = Math.ceil(this.props.data.length / this.props.rowsPerPage)
          const newPage = Math.max(Math.min(totalPages, currentPage + 1), 1)
          if (newPage !== currentPage) {
            return {
              currentPage: newPage,
              ...this.generateViewProps({ currentPage: newPage }),
            }
          } else {
            return null
          }
        })
      }
    }
  }

  decrementPage = () => {
    if (this.hasPaging()) {
      if (this.isPagingControlled()) {
        this.props.onPageChange(Math.max(Math.min(this.totalPages(), this.currentPage() - 1), 1))
      } else {
        this.setState(({ currentPage, view }) => {
          const totalPages = Math.ceil(this.props.data.length / this.props.rowsPerPage)
          const newPage = Math.max(Math.min(totalPages, currentPage - 1), 1)
          if (newPage !== currentPage) {
            return {
              currentPage: newPage,
              ...this.generateViewProps({ currentPage: newPage }),
            }
          } else {
            return null
          }
        })
      }
    }
  }
  /* paging ends */

  /* sorting starts */

  isSortControlled = () =>
    this.props.sortOptions !== undefined && this.props.onSortOptionsChange !== undefined

  toggleSort = header => {
    if (this.isSortControlled()) {
      this.props.onSortOptionsChange(computeSortOptions(this.sortOptions(), header))
    } else {
      this.setState(({ sortOptions = [] }) => {
        const newOptions = computeSortOptions(sortOptions, header)
        return {
          sortOptions: newOptions,
          ...this.generateViewProps({ sortOptions: newOptions }),
        }
      })
    }
  }

  sortOptions() {
    return this.isSortControlled() ? this.props.sortOptions : this.state.sortOptions
  }

  /* sorting ends */

  generateViewProps = ({
    data = this.props.data,
    sortOptions = this.sortOptions(),
    fuzzyFilter = this.props.fuzzyFilter,
    currentPage = this.currentPage(),
  } = {}) =>
    computeView({
      data,
      sortOptions,
      fuzzyFilter,
      headers: this.props.headers,
      rowsPerPage: this.props.rowsPerPage,
      currentPage,
      editedMap: this.editedMap,
    })

  /*  selection starts */
  startSelectionState(rowIndex, columnIndex) {
    this.selecting = this.props.selectionMode === 'multi' && true
    return { x1: columnIndex, y1: rowIndex, x2: columnIndex, y2: rowIndex }
  }

  expandSelectionState(rowIndex, columnIndex, ended) {
    if (this.selecting && this.props.selectionMode === 'multi') {
      this.selecting = ended ? false : this.selecting
      return { y2: rowIndex, x2: columnIndex }
    }
  }

  /** this is for external listeners only*/
  selectionChanged = _ => {
    const { headers, onSelectionChange } = this.props
    if (onSelectionChange) {
      const { x1, x2, y1, y2 } = normalizeBounds(this.state)
      const selectedRows = []
      const selectedHeaders = []
      const { view } = this.state

      for (let r = y1; r <= y2; r++) {
        selectedRows.push(view[r])
      }
      for (let c = x1; c <= x2; c++) {
        selectedHeaders.push(headers[c])
      }
      onSelectionChange({ selectedRows, selectedHeaders })
    }
  }

  /* selection ends */

  /* hover starts */
  hoverState(rowIndex, columnIndex) {
    const { hoverType } = this.props
    return hoverType === 'cell'
      ? { hoveredRow: rowIndex, hoveredColumn: columnIndex }
      : { hoveredRow: rowIndex }
  }
  /* hover ends */

  /* editing starts */

  isEditable = props => {
    const { isEditable } = this.props
    return typeof isEditable === 'function' ? isEditable(props) : isEditable
  }

  edit(rowIndex, columnIndex) {
    const header = this.props.headers[columnIndex]
    const rowData = this.state.view[rowIndex]
    if (this.isEditable({ header, rowData })) {
      this.setState({ editingRow: rowIndex, editingColumn: columnIndex })
    }
  }

  isEditing() {
    const { editingRow } = this.state
    const { showAdd } = this.props
    return showAdd || !R.isNil(editingRow)
  }

  commitRowEdit = ({ currentRow, editedRow }) => {
    // TODO use immutable js here ? so we can implement undo easily?
    // TODO currentRow == undefined for new rows
    if (currentRow !== editedRow) {
      if (this.props.onEdit) {
        this.props.onEdit({ originalRow: currentRow, editedRow })
      } else {
        if (this.dirtyMap.has(currentRow)) {
          const originalRow = this.dirtyMap.get(currentRow)
          this.editedMap.set(originalRow, editedRow)
          this.dirtyMap.set(editedRow, originalRow)
          this.dirtyMap.delete(currentRow)
        } else {
          this.editedMap.set(currentRow, editedRow)
          this.dirtyMap.set(editedRow, currentRow)
        }
        this.setState({
          ...this.generateViewProps(),
          editingRow: undefined,
          editingColumn: undefined,
        })
      }
    }
  }

  cancelEdit = () =>
    this.setState(
      _ => ({ editingRow: undefined, editingColumn: undefined }),
      this.props.onEditCancel
    )

  undoEdit() {
    /* tobe implemented via short-cut key */
  }

  /* editing ends */

  cellDoubleClick = e => {
    const pos = extractPosition(e)
    const { rowIndex, columnIndex } = pos
    this.edit(rowIndex, columnIndex)
  }

  cellMouseDown = e => {
    const pos = extractPosition(e)
    const { rowIndex, columnIndex } = pos
    if (e.button === 2 && isCellSelected(rowIndex, columnIndex, this.state)) return
    this.setState(_ => this.startSelectionState(rowIndex, columnIndex), this.selectionChanged)
  }

  cellMouseUp = e => {
    const pos = extractPosition(e)
    const { rowIndex, columnIndex } = pos
    const isSelecting = this.selecting
    this.setState(
      _ => this.expandSelectionState(rowIndex, columnIndex, true),
      isSelecting ? this.selectionChanged : undefined
    )
  }

  cellMouseEnter = e => {
    const pos = extractPosition(e)
    const { rowIndex, columnIndex } = pos
    const isSelecting = this.selecting
    this.setState(
      _ => ({
        ...this.hoverState(rowIndex, columnIndex),
        ...this.expandSelectionState(rowIndex, columnIndex),
      }),
      isSelecting ? this.selectionChanged : undefined
    )
  }

  cellMouseLeave = e => {
    this.setState(_ => ({ ...this.hoverState() }))
  }

  columnHeaderClick = e => {
    const ident = extractColIdent(e)
    const header = this.props.headers.filter(h => h.ident === ident)[0]
    if (!R.isNil(header)) {
      this.toggleSort(header)
    }
  }

  /** prop getters */

  getRowProps = ({
    key,
    index,
    isHeader = false,
    headers,
    width,
    rowHeight,
    headerRowHeight,
    yOffSet,
  }) => ({
    key: key || index,
    width: width === undefined || width === null ? sumWidth(headers) : width,
    height: isHeader ? headerRowHeight : rowHeightOf(index, rowHeight),
    colCount: headers.length,
    isHeader,
    yOffSet,
  })

  getCellProps = ({ key, rowIndex, columnIndex, header, data, rowData, rowHeight, ...rest }) => {
    const { selectionType, hoverType } = this.props
    return {
      [ROW_INDEX_ATTRIBUTE]: rowIndex,
      key: key || rowIndex + '*' + header.ident,
      [COLUMN_INDEX_ATTRIBUTE]: columnIndex,
      header,
      onMouseDown: this.cellMouseDown,
      onMouseEnter: this.cellMouseEnter,
      onMouseUp: this.cellMouseUp,
      onMouseLeave: this.cellMouseLeave,
      onDoubleClick: this.cellDoubleClick,
      isSelected:
        selectionType === 'cell'
          ? isCellSelected(rowIndex, columnIndex, this.state)
          : isRowSelected(rowIndex, this.state),
      isHovered:
        hoverType === 'cell'
          ? this.state.hoveredRow === rowIndex && this.state.hoveredColumn === columnIndex
          : this.state.hoveredRow === rowIndex,
      data,
      rowIndex,
      columnIndex,
      height: rowHeightOf(rowIndex, rowHeight),
      width: header.width,
      alignment: header.alignment,
    }
  }

  getGridContainerProps = ({ width, height } = {}) => ({ width, height })

  getColumnHeaderProps = ({ key, index, header }) => ({
    key: key || header.ident,
    header,
    width: header.width,
    [COL_IDENT_ATTRIBUTE]: header.ident,
    onClick: this.props.sortEnabled ? this.columnHeaderClick : undefined,
    sortOrder: this.props.sortEnabled ? sortOrderOf(header)(this.state.sortOptions) : undefined,
  })

  getPagerProps = props => ({
    ...props,
    totalPages: this.totalPages(),
    currentPage: this.currentPage(),
    setCurrentPage: this.setCurrentPage,
    incrementPage: this.incrementPage,
    decrementPage: this.decrementPage,
  })

  getRowEditorProps = _ => {
    const { y1 } = normalizeBounds(this.state)
    const { addWithSelected } = this.props
    return {
      onClose: this.cancelEdit,
      commitEdit: this.commitRowEdit,
      // TODO: add feature to pop up editor based on some row for add featrues
      showAdd: this.props.showAdd,
      rowData: this.props.showAdd
        ? addWithSelected ? this.state.view[y1] : {}
        : this.state.view[this.state.editingRow],
      headers: this.props.headers,
      isEditing: this.isEditing(),
    }
  }

  render() {
    console.log('grid renderer.... ')
    const { view } = this.state
    return this.props.render({
      getColumnHeaderProps: this.getColumnHeaderProps,
      getRowProps: this.getRowProps,
      getCellProps: this.getCellProps,
      getContainerProps: this.getGridContainerProps,
      getPagerProps: this.getPagerProps,
      getRowEditorProps: this.getRowEditorProps,
      headers: this.props.headers,
      data: view,
      hasPaging: this.hasPaging(),
      isEditing: this.isEditing(),
      renderRowEditor: this.props.renderRowEditor,
    })
  }
}
Grid.ROW_INDEX_ATTRIBUTE = ROW_INDEX_ATTRIBUTE
Grid.COLUMN_INDEX_ATTRIBUTE = COLUMN_INDEX_ATTRIBUTE
export default Grid
