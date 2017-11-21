import R from 'ramda'
import { fromNullable, Just, Nothing } from 'data.maybe'
import { fromEmpty } from './utils'

// prettier-ignore
const combineCliboardCells = R.reduce( (a, b) => (a === '' ? b : `${a}\t${b}`), '')

// prettier-ignore
const combineCliboardRows = R.reduce( (a, b) => (a === '' ? b : `${a}\r${b}`), '')

const normalizeCellsForClipboard = R.map(a => fromEmpty(a).getOrElse(''))

export const toClipboardData = R.compose(
  combineCliboardRows,
  R.map(combineCliboardCells),
  R.map(normalizeCellsForClipboard)
)

const clearNil = row => row.map(d => (R.isEmpty(d) ? undefined : d))

const parseClipData = rawData =>
  rawData
    .split(rawData.includes('\r') ? '\r' : '\n')
    //excel may copy extra 0 length line
    .filter(row => row.length > 0)
    .map(row => clearNil(row.split('\t')))

export const expandDataToSelection = selection => data => {
  const { x1, x2, y1, y2 } = selection
  const colCount = x2 - x1 + 1
  const rowCount = y2 - y1 + 1
  if (
    (!data.length && data.length === 0) ||
    (rowCount <= data.length && colCount <= data[0].length) ||
    (colCount === 1 && rowCount === 1)
  ) {
    return data
  }

  const fittedData = []
  for (let row = 0; row < rowCount || row < data.length; row++) {
    const rowData = []
    const originalRow = data[row % data.length]
    for (let col = 0; col < colCount || col < originalRow.length; col++) {
      rowData.push(originalRow[col % originalRow.length])
    }
    fittedData.push(rowData)
  }
  return fittedData
}

// prettier-ignore
export const fromPasteEvent = evt =>
  fromNullable(evt.clipboardData)
    .chain(clipData => fromEmpty(clipData.getData('Text')))
    .map(parseClipData)
