import React from 'react'
import {
  sumWidth,
  isPositionValid,
  extractPosition,
  extractColIdent,
} from './utils'
import PropTypes from 'prop-types'
import ScrollSyncHelper from './ScrollSyncHelper'
import R from 'ramda'
import ScrollPane from './ScrollPane'
import moment from 'moment'

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
  return (
    rowIndex <= y2 && rowIndex >= y1 && columnIndex <= x2 && columnIndex >= x1
  )
}

const isRowSelected = (rowIndex, selection) => {
  const { y1, y2 } = normalizeBounds(selection)
  const { selectionType } = this.props
  return selectionType === 'cell' && rowIndex <= y2 && rowIndex >= y1
}

const toggleSortOrder = order =>
  order === 'asc' ? 'desc' : order === 'desc' ? undefined : 'asc'

const normalizeValue = (val, type) =>
  type === 'num' && typeof val === 'string'
    ? parseFloat(val)
    : type === 'date' && (moment.isDate(val) || moment.isMoment(val))
      ? val.valueOf()
      : type === 'date' && typeof val === 'string' ? moment(val).valueOf() : val

const defaultDataComparator = sortOptions => (a, b) => {
  for (let i = 0; i < sortOptions.length; i++) {
    const { ident, type, sortOrder } = sortOptions[i]
    // TODO may need to look into getting custom data for example date
    const aVal = normalizeValue(a[ident], type)
    const bVal = normalizeValue(b[ident], type)
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
      if (typeof aVal === 'number' && typeof bVal === 'number' && bVal > aVal)
        return lessThanResult
    }
  }
  return 0
}

const computeSortOptions = (sortOptions, { ident, type }) => {
  if (R.find(opt => opt.ident === ident, sortOptions) !== undefined) {
    return sortOptions
      .map(
        opt =>
          opt.ident === ident
            ? { ident, type, sortOrder: toggleSortOrder(opt.sortOrder) }
            : opt
      )
      .filter(opt => opt.sortOrder !== undefined)
  } else {
    return [...sortOptions, { ident, type, sortOrder: 'asc' }]
  }
}

const toFilterableString = (val, type) =>
  R.isNil(val)
    ? ''
    : typeof val === 'string'
      ? val
      : moment.isDate(val)
        ? moment(val).format('MM/DD/YYYY HH:mm:ss')
        : moment.isMoment(val)
          ? val.format('MM/DD/YYYY HH:mm:ss')
          : val.toString()

const matchData = (rowData, fuzzyFilter) => header =>
  (header.dataGetter
    ? toFilterableString(header.dataGetter({ rowData, header }), header.type)
    : toFilterableString(rowData[header.ident], header.type)
  )
    .toLowerCase()
    .includes(fuzzyFilter.toLowerCase())

const filterData = (data, headers, fuzzyFilter) => {
  const filteredHeaders = R.filter(
    ({ isKey, isFiltered }) => isKey || isFiltered,
    headers
  )
  return R.filter(
    rowData => R.any(matchData(rowData, fuzzyFilter), filteredHeaders),
    data
  )
}

const computeView = ({
  data,
  sortOptions,
  comparator = defaultDataComparator,
  fuzzyFilter,
  headers,
  rowsPerPage,
  currentPage,
}) => {
  // TODO have to add edited value
  const filteredData =
    !R.isNil(fuzzyFilter) && !R.isEmpty(fuzzyFilter)
      ? filterData(data, headers, fuzzyFilter)
      : data

  const sortredData =
    R.isNil(sortOptions) || R.isEmpty(sortOptions)
      ? filteredData
      : R.sort(comparator(sortOptions), filteredData)

  console.log('displaying', currentPage)

  const pagedData = R.isNil(rowsPerPage)
    ? sortredData
    : R.compose(R.take(rowsPerPage), R.drop((currentPage - 1) * rowsPerPage))(
        sortredData
      )
  console.log('paged data is ', pagedData)

  return pagedData
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
    selectionType: PropTypes.oneOf(['row', 'cell']),
    hoverType: PropTypes.oneOf(['row', 'cell']),
    sortOptions: PropTypes.array,
    onSort: PropTypes.func,
    fuzzyFilter: PropTypes.string,
    totalPages: PropTypes.number,
    currentPage: PropTypes.number,
    onPageChange: PropTypes.number,
    rowsPerPage: PropTypes.number,
  }

  static defaultProps = {
    selectionType: 'cell',
    hoverType: 'row',
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

  state = {
    hoveredRow: undefined,
    hoveredColumn: undefined,
    x1: undefined,
    x2: undefined,
    y1: undefined,
    y2: undefined,
    view: computeView({
      data: this.props.data,
      sortOptions: this.props.initialSortOptions || this.props.sortOptions,
      fuzzyFilter: this.props.fuzzyFilter,
      headers: this.props.headers,
      rowsPerPage: this.props.rowsPerPage,
      currentPage: this.props.currentPage || 1,
    }),
    sortOptions: this.props.initialSortOptions,
    currentPage: 1,
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
    window.document.body.removeEventListener(
      'mouseleave',
      this.bodyMouseRelease
    )
    window.document.body.removeEventListener('mouseup', this.bodyMouseRelease)
  }

  componentWillReceiveProps(nextProps) {
    const { data, sortOptions, fuzzyFilter } = this.props.data
    if (
      data !== nextProps.data ||
      sortOptions !== nextProps.sortOptions ||
      fuzzyFilter !== nextProps.fuzzyFilter
    )
      this.generateView({
        data: data !== nextProps.data ? nextProps.data : data,
        sortOptions:
          sortOptions !== nextProps.sortOptions
            ? nextProps.sortOptions
            : sortOptions,
        fuzzyFilter:
          fuzzyFilter !== nextProps.fuzzyFilter
            ? nextProps.fuzzyFilter
            : fuzzyFilter,
      })
  }

  /* paging starts */

  hasPaging = () =>
    this.props.rowsPerPage !== undefined &&
    this.props.data.length > this.props.rowsPerPage

  isPagingControlled = () =>
    this.props.totalPages !== undefined &&
    this.props.currentPage !== undefined &&
    this.props.onPageChange !== undefined

  currentPage = () =>
    this.hasPaging()
      ? this.props.currentPage || this.state.currentPage
      : undefined

  totalPages = () => {
    return !this.hasPaging()
      ? undefined
      : R.isNil(this.props.totalPages)
        ? Math.ceil(this.props.data.length / this.props.rowsPerPage)
        : this.props.totalPages
  }

  setCurrentPage = page => {
    if (this.hasPaging()) {
      const guardedPage = Math.max(Math.min(this.totalPages(), page), 1)
      if (guardedPage !== this.currentPage()) {
        const view = computeView({
          data: this.props.data,
          sortOptions: this.sortOptions(),
          fuzzyFilter: this.props.fuzzyFilter,
          headers: this.props.headers,
          rowsPerPage: this.props.rowsPerPage,
          currentPage: guardedPage,
        })

        if (this.isPagingControlled()) {
          this.props.onPageChange(guardedPage)
        } else {
          this.setState(_ => ({ currentPage: guardedPage, view }))
        }
      }
    }
  }

  incrementPage = () => {
    if (this.hasPaging()) {
      if (this.isPagingControlled()) {
        this.props.onPageChange(
          Math.max(Math.min(this.totalPages(), this.currentPage() + 1), 1)
        )
      } else {
        this.setState(({ currentPage, view }) => {
          const totalPages = Math.ceil(
            this.props.data.length / this.props.rowsPerPage
          )
          const newPage = Math.max(Math.min(totalPages, currentPage + 1), 1)
          if (newPage !== this.currentPage()) {
            const view = computeView({
              data: this.props.data,
              sortOptions: this.sortOptions(),
              fuzzyFilter: this.props.fuzzyFilter,
              headers: this.props.headers,
              rowsPerPage: this.props.rowsPerPage,
              currentPage: newPage,
            })

            return {
              currentPage: newPage,
              view,
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
        this.props.onPageChange(
          Math.max(Math.min(this.totalPages(), this.currentPage() - 1), 1)
        )
      } else {
        this.setState(({ currentPage, view }) => {
          const totalPages = Math.ceil(
            this.props.data.length / this.props.rowsPerPage
          )
          const newPage = Math.max(Math.min(totalPages, currentPage - 1), 1)
          if (newPage !== this.currentPage()) {
            const view = computeView({
              data: this.props.data,
              sortOptions: this.sortOptions(),
              fuzzyFilter: this.props.fuzzyFilter,
              headers: this.props.headers,
              rowsPerPage: this.props.rowsPerPage,
              currentPage: newPage,
            })
            return {
              currentPage: newPage,
              view,
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
    this.props.sortOptions !== undefined && this.props.onSort !== undefined

  toggleSort = header => {
    if (this.isSortControlled()) {
      this.props.onSort(computeSortOptions(this.sortOptions(), header))
    } else {
      this.setState(({ sortOptions = [] }) => {
        const newOptions = computeSortOptions(sortOptions, header)
        const view = computeView({
          data: this.props.data,
          sortOptions: newOptions,
          fuzzyFilter: this.props.fuzzyFilter,
          headers: this.props.headers,
          rowsPerPage: this.props.rowsPerPage,
          currentPage: this.currentPage(),
        })
        return {
          sortOptions: newOptions,
          view,
        }
      })
    }
  }

  sortOptions() {
    return this.isSortControlled()
      ? this.props.sortOptions
      : this.state.sortOptions
  }

  /* sorting ends */

  generateView({
    data = this.props.data,
    sortOptions = this.sortOptions(),
    fuzzyFilter = this.props.fuzzyFilter,
  }) {
    // TODO need to apply edit first
    const view = computeView({
      data,
      sortOptions,
      fuzzyFilter,
      headers: this.props.headers,
      rowsPerPage: this.props.rowsPerPage,
      currentPage: this.currentPage(),
    })
    this.setState(_ => ({ view }))
  }

  /*  selection starts */
  startSelectionState(rowIndex, columnIndex) {
    this.selecting = true
    return { x1: columnIndex, y1: rowIndex, x2: columnIndex, y2: rowIndex }
  }

  expandSelectionState(rowIndex, columnIndex, ended) {
    if (this.selecting) {
      this.selecting = ended ? false : this.selecting
      return { y2: rowIndex, x2: columnIndex }
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

  cellMouseDown = e => {
    const pos = extractPosition(e)
    const { rowIndex, columnIndex } = pos
    if (e.button === 2 && isCellSelected(rowIndex, columnIndex, this.state))
      return
    this.setState(_ => this.startSelectionState(rowIndex, columnIndex))
  }

  cellMouseUp = e => {
    const pos = extractPosition(e)
    const { rowIndex, columnIndex } = pos
    this.setState(_ => this.expandSelectionState(rowIndex, columnIndex, true))
  }

  cellMouseEnter = e => {
    const pos = extractPosition(e)
    const { rowIndex, columnIndex } = pos
    this.setState(_ => ({
      ...this.hoverState(rowIndex, columnIndex),
      ...this.expandSelectionState(rowIndex, columnIndex),
    }))
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
  }) => ({
    key: key || index,
    width: width === undefined || width === null ? sumWidth(headers) : width,
    height: isHeader ? headerRowHeight : rowHeightOf(index, rowHeight),
    colCount: headers.length,
    isHeader,
  })

  getCellProps = ({
    key,
    rowIndex,
    columnIndex,
    header,
    data,
    rowData,
    rowHeight,
    ...rest
  }) => {
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
      isSelected:
        selectionType === 'cell'
          ? isCellSelected(rowIndex, columnIndex, this.state)
          : isRowSelected(rowIndex, this.state),
      isHovered:
        hoverType === 'cell'
          ? this.state.hoveredRow === rowIndex &&
            this.state.hoveredColumn === columnIndex
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
    onClick: this.columnHeaderClick,
    sortOrder: sortOrderOf(header)(this.state.sortOptions),
  })

  getPagerProps = props => ({
    ...props,
    totalPages: this.totalPages(),
    currentPage: this.currentPage(),
    setCurrentPage: this.setCurrentPage,
    incrementPage: this.incrementPage,
    decrementPage: this.decrementPage,
  })

  render() {
    const { view } = this.state
    console.log('render grid..')
    return this.props.render({
      getColumnHeaderProps: this.getColumnHeaderProps,
      getRowProps: this.getRowProps,
      getCellProps: this.getCellProps,
      getContainerProps: this.getGridContainerProps,
      getPagerProps: this.getPagerProps,
      headers: this.props.headers,
      data: view,
      hasPaging: this.hasPaging(),
    })
  }
}
Grid.ROW_INDEX_ATTRIBUTE = ROW_INDEX_ATTRIBUTE
Grid.COLUMN_INDEX_ATTRIBUTE = COLUMN_INDEX_ATTRIBUTE
export default Grid
