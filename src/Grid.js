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
  applyEdits,
  generateInitialEditInfo,
  /* TODO need conrols for addRow, removeRow, */
  updateRow,
} from './editEngine'
import { selector, normalizeSelection, isCellSelected, isRowSelected } from './selection-util'

import {
  ROW_INDEX_ATTRIBUTE,
  COLUMN_INDEX_ATTRIBUTE,
  SCROLL_SYNC_CONTEXT,
  COL_IDENT_ATTRIBUTE,
} from './constants.js'

const rowHeightOf = (index, rowHeight) =>
  typeof rowHeight === 'function' ? rowHeight(index) : rowHeight

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
  editInfo,
}) => {
  // TODO have to add edited value
  //
  const editedData = applyEdits({ data, editInfo })

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
    editMode: PropTypes.oneOf(['row', 'cell']).isRequired,
    /* optional stuff */
    sortOptions: PropTypes.array,
    onSortOptionsChange: PropTypes.func,
    fuzzyFilter: PropTypes.string,
    totalPages: PropTypes.number,
    currentPage: PropTypes.number,
    onPageChange: PropTypes.number,
    rowsPerPage: PropTypes.number,
    // this handles row edits
    onEdit: PropTypes.func,
    showAdd: PropTypes.bool,
    addWithSelected: PropTypes.bool,
    onSelectionChange: PropTypes.func,
    renderRowEditor: PropTypes.func,
    // this handles cell edits
    onEditInfoChange: PropTypes.func,
    editInfo: PropTypes.func,
  }

  static defaultProps = {
    selectionType: 'cell',
    selectionMode: 'multi',
    hoverType: 'row',
    editMode: 'row',
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

  localEditInfo = generateInitialEditInfo()

  isEditInfoControlled = () =>
    !R.isNil(this.props.editInfo) && !R.isNil(this.props.onEditInfoChange)

  editInfo = () => (this.isEditInfoControlled() ? this.props.editInfo : this.localEditInfo)

  setEditInfo = editInfo => {
    if (this.isEditInfoControlled()) {
      this.props.onEditInfoChange(editInfo)
      return false
    }
    this.localEditInfo = editInfo
    return true
  }

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
      editInfo: this.editInfo(),
    }),
    sortOptions: this.props.initialSortOptions,
    currentPage: this.props.currentPage || 1,
    editingRow: undefined,
    editingColumn: undefined,
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
    if (this.clipboardHelper && this.clipboardHelper.focus) {
      console.log('found clipboard helper', this.clipboardHelper)
      this.clipboardHelper.focus()
      if (this.clipboardHelper.nodeName !== 'INPUT') {
        console.log(
          'clipboardHelper is not input. please render input with getClipboardHelperProps'
        )
      }
    } else {
      console.log(
        'Please render an INPUT element with getClipboardHelperProps to support copy&paste.'
      )
    }
  }
  componentWillUnmount() {
    window.document.body.removeEventListener('mouseleave', this.bodyMouseRelease)
    window.document.body.removeEventListener('mouseup', this.bodyMouseRelease)
  }

  componentWillReceiveProps(nextProps) {
    const { data, sortOptions, fuzzyFilter, currentPage, editInfo } = this.props
    if (
      data !== nextProps.data ||
      sortOptions !== nextProps.sortOptions ||
      fuzzyFilter !== nextProps.fuzzyFilter ||
      currentPage !== nextProps.currentPage ||
      editInfo !== nextProps.editInfo
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
    editInfo = this.editInfo(),
  } = {}) =>
    computeView({
      data,
      sortOptions,
      fuzzyFilter,
      headers: this.props.headers,
      rowsPerPage: this.props.rowsPerPage,
      currentPage,
      editInfo,
    })

  /*  selection starts */

  selectRight = expand => {
    this.setState(selector.right(this.state, expand, this.props.headers.length))
  }

  selectLeft = expand => {
    this.setState(selector.left(this.state, expand))
  }

  selectTop = expand => {
    this.setState(selector.up(this.state, expand))
  }

  selectBottom = expand => {
    this.setState(selector.down(this.state, expand, this.state.view.length))
  }

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

  /** this is for external listeners only */
  selectionChanged = _ => {
    const { headers, onSelectionChange } = this.props
    if (onSelectionChange) {
      const { x1, x2, y1, y2 } = normalizeSelection(this.state)
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

  isGridEditing() {
    const { editingRow } = this.state
    const { showAdd } = this.props
    return showAdd || !R.isNil(editingRow)
  }

  isRowEditing() {
    const { editingRow, editMode } = this.state
    const { showAdd } = this.props
    return showAdd || (editMode === 'row' && !R.isNil(editingRow))
  }

  isCellEditing(rowIndex, columnIndex) {
    const { editMode } = this.props
    const { editingRow, editingColumn } = this.state
    return editMode === 'cell' && rowIndex === editingRow && columnIndex === editingColumn
  }

  commitRowEdit = ({ currentRow, editedRow }) => {
    if (currentRow !== editedRow) {
      if (this.props.onEdit && this.props.edi) {
        // expect new data to be passed down via props
        this.props.onEdit({ originalRow: currentRow, editedRow })
      } else {
        const updateState = this.setEditInfo(
          updateRow({
            editInfo: this.editInfo(),
            currentRow,
            editedRow,
          })
        )

        if (updateState) {
          this.setState(
            {
              ...this.generateViewProps(),
              editingRow: undefined,
              editingColumn: undefined,
            },
            this.focusGrid
          )
        }
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

  gridKeyDown = e => {
    const { x2: columnIndex, y2: rowIndex } = normalizeSelection(this.state)
    const selectionValid = !R.isNil(columnIndex) && !R.isNil(rowIndex)
    if (selectionValid) {
      const isEditAttempt =
        !this.isGridEditing() &&
        !e.metaKey &&
        !e.ctrlKey &&
        e.keyCode >= 32 &&
        e.keyCode <= 126 &&
        e.key.length === 1
      if (isEditAttempt) {
        console.log('attempting edit', {
          editingColumn: columnIndex,
          editingRow: rowIndex,
          initialEditChar: String.fromCharCode(e.keyCode),
        })
        this.setState({
          editingColumn: columnIndex,
          editingRow: rowIndex,
        })
      }
    }
    if (!this.isGridEditing()) {
      if (e.keyCode === 37) this.selectLeft(e.shiftKey)
      if (e.keyCode === 39) this.selectRight(e.shiftKey)
      if (e.keyCode === 38) this.selectTop(e.shiftKey)
      if (e.keyCode === 40) this.selectBottom(e.shiftKey)
      if (e.keyCode === 9) {
        e.preventDefault()
        this.selectRight()
      }
    }
  }

  focusGrid = () => {
    if (this.clipboardHelper && this.clipboardHelper.focus) {
      // console.log('clipboard focus available focusting')
      this.clipboardHelper.focus()
    } else if (this.gridContainer && this.gridContainer.focus) {
      // console.log('grid focus available focusting')
      this.gridContainer.focus()
    }
  }

  cancelCellEdit = () => {
    this.setState(
      {
        editingColumn: undefined,
        editingRow: undefined,
      },
      this.focusGrid
    )
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
      () => {
        this.focusGrid()
        isSelecting && this.selectionChanged()
      }
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
      key: key || rowIndex + '-x-' + columnIndex + '-' + header.ident,
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
      /* for editor */
      isEditing: this.isCellEditing(rowIndex, columnIndex),
      commitRowEdit: this.commitRowEdit,
      cancelEdit: this.cancelCellEdit,
      selectRight: this.selectRight,
      selectLeft: this.selectLeft,
      selectTop: this.selectTop,
      selectBottom: this.selectBottom,
    }
  }

  getGridContainerProps = ({ width, height, refKey = 'ref' } = {}) => ({
    width,
    height,
    onKeyDown: this.gridKeyDown,
    [refKey]: this.gridContainerRefHandler,
  })

  getColumnHeaderProps = ({ key, index, header }) => ({
    key: key || index + '-x-' + header.ident,
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
    const { y1 } = normalizeSelection(this.state)
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
      isEditing: this.isRowEditing(),
    }
  }

  getClipboardHelperProps = ({ refKey = 'ref' } = {}) => ({
    [refKey]: this.clipboardHelperRefHandler,
    style: {
      position: 'fixed',
      bottom: 0,
      right: 0,
      width: '100vw',
      height: '0px',
      border: 'none',
      outline: 'none',
    },
    onFocus: () => console.log('focused gained'),
    onBlur: () => console.log('focused lost'),
    onCopy: this.onCopy,
    onPaste: this.onPaste,
  })

  gridContainerRefHandler = node => (this.gridContainer = node)

  clipboardHelperRefHandler = node => (this.clipboardHelper = node)

  onCopy = e => console.log('on copy', e)

  onPaste = e => console.log('on paste', e)

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
      getClipboardHelperProps: this.getClipboardHelperProps,
      headers: this.props.headers,
      data: view,
      hasPaging: this.hasPaging(),
      renderRowEditor: this.props.renderRowEditor,
      // gridContainerRefHandler: this.gridContainerRefHandler,
    })
  }
}
Grid.ROW_INDEX_ATTRIBUTE = ROW_INDEX_ATTRIBUTE
Grid.COLUMN_INDEX_ATTRIBUTE = COLUMN_INDEX_ATTRIBUTE
export default Grid
