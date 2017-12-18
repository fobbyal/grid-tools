import React from 'react'
import ReactDOM from 'react-dom'
import { fromNullable, Just, Nothing } from 'data.maybe'
import R from 'ramda'
import styled from 'styled-components'
import shallowEqual from 'fbjs/lib/shallowEqual'
import { normalizeBounds } from '../utils.js'
import {
  toClipboardData,
  fromPasteEvent,
  expandDataToSelection,
} from '../clipboard-utils'
import { fromEmpty } from '../utils'
import HiddenClipboardHelper from '../HiddenClipboardHelper'

/* grid helper methods */
// const HiddenInput = styled.input`
//   border: none;
//   position: fixed;
//   bottom: 0;
//   right: 0;
//   width: 0px;
//   height: 0px;
// `
const leftArrow = ({ x1, y1, x2, y2, shift }) => {
  const x = shift ? x2 - 1 : x1 - 1
  const y = shift ? y2 : y1
  return x >= 0 ? { x, y, shift } : { x: 0, y, shift }
}

const rightArrow = ({ x1, y1, x2, y2, colCount, shift }) => {
  const x = shift ? x2 + 1 : x1 + 1
  const y = shift ? y2 : y1
  return x <= colCount - 1 ? { x, y, shift } : { x: colCount - 1, y, shift }
}

const upArrow = ({ x1, y1, x2, y2, shift }) => {
  const x = shift ? x2 : x1
  const y = shift ? y2 - 1 : y1 - 1
  return y > 0 ? { x, y, shift } : { x, y: 0, shift }
}

const downArrow = ({ x1, y1, x2, y2, shift, rowCount }) => {
  const x = shift ? x2 : x1
  const y = shift ? y2 + 1 : y1 + 1
  return y < rowCount - 1 ? { x, y, shift } : { x, y: rowCount - 1, shift }
}

const extractPosition = evt => ({
  rowIndex: parseInt(evt.target.getAttribute('data-rowIndex')),
  columnIndex: parseInt(evt.target.getAttribute('data-columnIndex')),
})
const isPosition = pos => !isNaN(pos.rowIndex) && !isNaN(pos.columnIndex)

const empty = {}

const isSelected = selection => ({ rowIndex, columnIndex }) =>
  !R.isNil(selection) &&
  rowIndex >= selection.y1 &&
  rowIndex <= selection.y2 &&
  columnIndex >= selection.x1 &&
  columnIndex <= selection.x2

/* clipboard stuff */

export const copyToClipboard = ({ evt, clipboard }) => txtData => {
  clipboard.setData('Text', txtData)
  evt.preventDefault()
  console.log('copied data: [', clipboard.getData('Text'), ']')
}

/* */

class GenericEditableGrid extends React.Component {
  constructor(props) {
    super(props)
    /* common stuff */
    this._mouseDown = this._mouseDown.bind(this)
    this._mouseUp = this._mouseUp.bind(this)
    this._mouseMove = this._mouseMove.bind(this)
    this._mouseLeave = this._mouseLeave.bind(this)
    this._keyDown = this._keyDown.bind(this)
    this._copy = this._copy.bind(this)
    this._paste = this._paste.bind(this)
    this._moveSelection = this._moveSelection.bind(this)
    this._mouseClicked = this._mouseClicked.bind(this)
    this._commitEdit = this._commitEdit.bind(this)
    this._cancelEdit = this._cancelEdit.bind(this)
    this._ensureCellVisible = this._ensureCellVisible.bind(this)
    this.selecting = false

    this.arrowActions = {
      /* left */
      37: R.compose(this._moveSelection, leftArrow),
      /* right */
      39: R.compose(this._moveSelection, rightArrow),
      9: R.compose(this._moveSelection, rightArrow),
      38: R.compose(this._moveSelection, upArrow),
      40: R.compose(this._moveSelection, downArrow),
    }

    this.editorProps = {
      commitEdit: this._commitEdit,
      cancelEdit: this._cancelEdit,
    }
    this.gridProps = {
      tabIndex: '0',
      onKeyDown: this._keyDown,
      onMouseDown: this._mouseDown,
      onMouseUp: this._mouseUp,
      onMouseMove: this._mouseMove,
      onMouseLeave: this._mouseLeave,
      onCopy: this._copy,
      onPaste: this._paste,
      onClick: this._mouseClicked,
      ref: r => (this.scroll = r),
    }

    this.state = {
      selection: empty,
      editingCell: null,
    }
    /* common stuff */
  }
  /** common methods */
  _moveSelection(action) {
    return fromNullable(action)
      .map(({ shift, x, y }) => {
        shift
          ? this._selectionExpands({ rowIndex: y, columnIndex: x }, true)
          : this.setState({ selection: { x1: x, y1: y, x2: x, y2: y } })
        return { rowIndex: y, columnIndex: x }
      })
      .getOrElse({})
  }

  _selectionStarts(pos) {
    this.selecting = true
    const { rowIndex: y1, columnIndex: x1 } = pos
    this.setState({ selection: { x1, y1 } })
  }

  _selectionExpands(pos, ended) {
    this.selecting = ended ? false : this.selecting
    const { rowIndex: y2, columnIndex: x2 } = pos
    this.setState({ selection: { ...this.state.selection, x2, y2 } })
  }

  componentDidMount() {
    if (this.hiddenInput) {
      this.hiddenInput.focus()
    }
  }

  _mouseDown(evt) {
    //prevent focus
    //for left click selection
    const pos = extractPosition(evt)
    //const { editingCell } = this.state
    //kconsole.log('pos datus',pos,editingCell)

    if (isPosition(pos) && this.hiddenInput) {
      evt.preventDefault()
      this.hiddenInput.focus()
    }

    if (evt.buttons === 1 && isPosition(pos)) {
      this._selectionStarts(pos)
    }

    //for righ click selection
    if (evt.buttons === 2) {
      const { rowIndex, columnIndex } = extractPosition(evt)
      const selectionBounds = normalizeBounds(this.state.selection) //getSelectedBounds(getState())
      if (R.isNil(selectionBounds) || R.isEmpty(selectionBounds)) {
        this.setState({
          selection: {
            x1: columnIndex,
            x2: columnIndex,
            y1: rowIndex,
            y2: rowIndex,
          },
        })
      } else {
        const { x1, y1, x2, y2 } = selectionBounds
        if (
          rowIndex < y1 ||
          rowIndex > y2 ||
          columnIndex < x1 ||
          columnIndex > x2
        ) {
          this.setState({
            selection: {
              x1: columnIndex,
              x2: columnIndex,
              y1: rowIndex,
              y2: rowIndex,
            },
          })
        }
      }
    }
  }
  _mouseUp(evt) {
    //return when not selecting
    if (this.selecting) {
      const position = extractPosition(evt)
      this._selectionExpands(position, true)
    }
  }
  _mouseMove(evt) {
    if (this.selecting) {
      const position = extractPosition(evt)
      this._selectionExpands(position)
    }
  }
  _mouseLeave(evt) {
    if (this.selecting) {
      this.selecting = false
    }
  }

  _mouseClicked(evt) {
    const { isCellEditable } = this.props
    if (evt.detail > 1) {
      const { rowIndex, columnIndex } = extractPosition(evt)
      if (!isCellEditable || isCellEditable({ rowIndex, columnIndex })) {
        this.setState({
          editingCell: { rowIndex, columnIndex, editWithValue: true },
        })
      }
      console.log('dbl clicked on [', rowIndex, ':', columnIndex, ']')
    }
  }

  _copy(e) {
    const { getDataInRange } = this.props
    if (getDataInRange) {
      // prettier-ignore
      const clipboardInfo = fromNullable(e.clipboardData)
        .map(clipboard => ({ evt: e, clipboard }))

      const selectedData = fromEmpty(this.state.selection)
        .map(normalizeBounds)
        .map(getDataInRange)
        .map(toClipboardData)

      fromNullable(copyToClipboard)
        .ap(clipboardInfo)
        .ap(selectedData)
    } else {
      /* eslint-disable no-console*/
      console.log(
        'Prop getDataInRange not on GenericEditableGrid. Copy function is disabled'
      )
      /* eslint-enable no-console */
    }
  }

  _paste(e) {
    const { pasteData } = this.props
    if (pasteData) {
      e.preventDefault()
      const paste = selection => data => {
        const dataSet = expandDataToSelection(selection)(data)
        const { x1, y1 } = selection
        pasteData({ columnIndex: x1, rowIndex: y1, dataSet })
      }
      const selection = fromEmpty(this.state.selection).map(normalizeBounds)
      const clipboardData = fromPasteEvent(e)

      Just(paste)
        .ap(selection)
        .ap(clipboardData)
    } else {
      /* eslint-disable no-console*/
      console.log(
        'Prop pasteData not on GenericEditableGrid. Paste function is disabled'
      )
      /* eslint-enable no-console */
    }
  }

  _ensureCellVisible({ rowIndex, columnIndex }) {
    if (this.scroll) {
      //cosnt {rowCount, colCount} = this.props
      const scroll = ReactDOM.findDOMNode(this.scroll)
      if (scroll) {
        const elements = scroll.getElementsByTagName('*')
        const findNode = R.find(e => {
          const cellRow = e.getAttribute('data-rowIndex')
          const cellColumn = e.getAttribute('data-columnIndex')
          return cellColumn == columnIndex && cellRow == rowIndex
        })
        const cell = findNode(elements)
        const xOffset = scroll.offsetLeft
        const yOffset = scroll.offsetTop
        const offsetWidth = scroll.offsetWidth
        const offsetHeight = scroll.offsetHeight
        const scrollLeft = scroll.scrollLeft
        const scrollTop = scroll.scrollTop
        const cellBounds = cell.getBoundingClientRect()
        const cellWidth = cellBounds.width
        const cellHeight = cellBounds.bottom - cellBounds.top
        const cellRight = cell.offsetLeft + cellWidth - xOffset
        const cellLeft = cell.offsetLeft - xOffset
        const cellTop = cell.offsetTop + yOffset
        const cellBottom = cell.offsetTop + yOffset + cellHeight

        if (cellRight > scrollLeft + offsetWidth) {
          scroll.scrollLeft = cellRight - offsetWidth
        }
        if (cellLeft < scrollLeft) {
          scroll.scrollLeft = cellLeft
        }
        if (cellBottom > scrollTop + offsetHeight) {
          scroll.scrollTop = cellBottom - offsetHeight
        }
        if (cellTop < scrollTop) {
          scroll.scrollTop = cellTop
        }
        scroll.left = 256
      }
    }
  }

  _keyDown(e) {
    //have col and row size has to be pased
    //TODO: this stuff must be passed from parent
    //cosnt {rowCount, colCount} = this.props
    const { isCellEditable, rowCount, colCount } = this.props
    console.log(rowCount, colCount)

    console.log('key Pressed....', e.keyCode, e.key, e.shift, e.metaKey)
    const arrowAction = this.arrowActions[e.keyCode]
    const editing = !R.isNil(this.state.editingCell)
    //console.log('entery is editing',editing)
    /* prevent default on enter escape and tab */
    if ([13, 9, 27].includes(e.keyCode)) {
      e.preventDefault()
    }

    const isDelete = e.keyCode == 46
    const isEditAttempt =
      !e.metaKey &&
      !e.ctrlKey &&
      e.keyCode >= 32 &&
      e.keyCode <= 126 &&
      e.key.length === 1

    if (!editing) {
      /*arrow keys */
      if (arrowAction) {
        const {
          scrollToColumn: scrollToColumnPrevious,
          scrollToRow: scrollToRowPrevious,
        } = this.state
        const movedPosition = arrowAction({
          ...this.state.selection,
          shift: e.shiftKey,
          colCount,
          rowCount,
        })
        console.log('moved position', movedPosition)
        this._ensureCellVisible(movedPosition)
        e.preventDefault()
        e.stopPropagation()
      } else if (isDelete) {
        //TODO: need to implment edelete
        const { onDelete } = this.props
        if (onDelete) {
          onDelete(this.state.selection)
        }
        e.preventDefault()
        e.stopPropagation()
      } else if (isEditAttempt) {
        const { x2: columnIndex, y2: rowIndex } = this.state.selection
        const editingCell = { columnIndex, rowIndex }
        console.log('cell editable', isCellEditable)
        if (!isCellEditable || isCellEditable(editingCell)) {
          this.setState({ editingCell })
          console.log(
            'trying to edit... with ',
            e.key,
            '@ [',
            rowIndex,
            ':',
            columnIndex,
            ']'
          )
        }
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { selection: currentSelection, ...currentState } = this.state
    const { selection: nextSelection, ...nState } = nextState
    return (
      !shallowEqual(currentSelection, nextSelection) ||
      !shallowEqual(this.props, nextProps) ||
      !shallowEqual(currentState, nextState)
    )
  }

  _commitEdit(editInfo) {
    this.setState({ editingCell: null })
    const { commitEdit } = this.props
    if (commitEdit) {
      commitEdit(editInfo)
    } else {
      /* eslint-disable no-console*/
      console.log(
        'Prop commitEdit not on GenericEditableGrid. edit function is disabled'
      )
      /* eslint-enable no-console */
    }

    //call into props.commitEdit when refactoring
  }

  _cancelEdit() {
    this.setState({ editingCell: null })
  }

  /** end-common methods **/

  /** api methods **/

  render() {
    /*start editing grid*/
    const { editingCell } = this.state
    const selection = normalizeBounds(this.state.selection)
    const isCellSelected = isSelected(selection)
    const isCellEditing = (rowIndex, columnIndex) =>
      fromNullable(editingCell)
        .map(c => rowIndex === c.rowIndex && columnIndex === c.columnIndex)
        .getOrElse(false)
    const editWithValue = fromNullable(editingCell)
      .chain(({ editWithValue }) => fromNullable(editWithValue))
      .getOrElse(false)
    /*end editor grid */
    const { className, children } = this.props

    const props = {
      selection,
      isCellSelected,
      isCellEditing,
      editorProps: this.editorProps,
      gridProps: this.gridProps,
      editWithValue,
      className,
      copyAndPasteFix: (
        <HiddenClipboardHelper
          innerRef={r => (this.hiddenInput = r)}
          type="text"
        />
      ),
    }

    return children(props)
  }
}

export default GenericEditableGrid
