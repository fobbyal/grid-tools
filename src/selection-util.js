import R from 'ramda'
import { extractData } from './utils'

const empty = {}

export const normalizeSelection = selection => {
  const { x1, y1, x2, y2 } = selection
  if (R.isNil(x1) && R.isNil(x2) && R.isNil(y1) && R.isNil(y2)) return empty

  const xMin = !R.isNil(x2) ? Math.min(x1, x2) : x1
  const xMax = !R.isNil(x2) ? Math.max(x1, x2) : x1
  const yMin = !R.isNil(y2) ? Math.min(y1, y2) : y1
  const yMax = !R.isNil(y2) ? Math.max(y1, y2) : y1
  return { x1: xMin, x2: xMax, y1: yMin, y2: yMax }
}
export const isCellSelected = (rowIndex, columnIndex, selection) => {
  const { x1, x2, y1, y2 } = normalizeSelection(selection)
  return rowIndex <= y2 && rowIndex >= y1 && columnIndex <= x2 && columnIndex >= x1
}

export const isRowSelected = (rowIndex, selection) => {
  const { y1, y2 } = normalizeSelection(selection)
  return rowIndex <= y2 && rowIndex >= y1
}

export const left = (selection, expand, colCount, rowCount) => {
  const { x1, y1, x2, y2 } = selection

  if (!expand) {
    let x = x1 - 1
    let y = y1
    if (x < 0) {
      x = colCount - 1
      if (y > 0) {
        y--
      } else {
        y = rowCount - 1
      }
    }
    return { x1: x, x2: x, y1: y, y2: y }
  }
  const x = Math.max(x2 - 1, 0)

  return { x1, x2: x, y1, y2 }
}

export const right = (selection, expand, colCount, rowCount) => {
  const { x1, y1, x2, y2 } = selection

  if (!expand) {
    let x = x1 + 1
    let y = y1
    if (x > colCount - 1) {
      x = 0
      if (y < rowCount - 1) {
        y++
      } else {
        y = 0
      }
    }
    return { x1: x, x2: x, y1: y, y2: y }
  }
  const x = Math.min(x2 + 1, colCount - 1)

  return { x1, x2: x, y1, y2 }
}

export const up = (selection, expand) => {
  const { x1, y1, x2, y2 } = selection
  if (!expand) {
    const y = Math.max(y1 - 1, 0)
    return { x1, y1: y, x2: x1, y2: y }
  }
  const y = Math.max(y2 - 1, 0)
  return { y1: y1, y2: y, x1, x2 }
}

export const down = (selection, expand, rowCount) => {
  const { x1, y1, x2, y2 } = selection
  if (!expand) {
    const y = Math.min(y1 + 1, rowCount - 1)
    return { x1, y1: y, x2: x1, y2: y }
  }
  const y = Math.min(y2 + 1, rowCount - 1)

  return { x1, x2, y1, y2: y }
}

export const selectAll = (colCount, rowCount) => ({
  x1: 0,
  x2: colCount - 1,
  y1: 0,
  y2: rowCount - 1,
})

export const selector = { left, right, up, down, selectAll }

export const getSelectedData = ({ data, headers }, { x1, y1, x2, y2 }) => {
  const rows = R.range(y1, y2 + 1)
  const cols = R.range(x1, x2 + 1)
  // console.log('rows', rows, 'cols', cols, 'data ', data, ' headers ', headers, { x1, y1, x2, y2 })

  const getData = rowIdx => colIndex =>
    extractData({ rowData: data[rowIdx], header: headers[colIndex] })

  return rows.map(rowIdx => cols.map(getData(rowIdx)))
}
