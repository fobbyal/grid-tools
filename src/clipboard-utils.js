import R from 'ramda'
import { fromNullable } from 'data.maybe'
import { fromEmpty } from './utils'

// prettier-ignore
const combineClipboardCells = R.reduce( (a, b) => (a === '' ? b : `${a}\t${b}`), '')

// prettier-ignore
const combineClipboardRows = R.reduce( (a, b) => (a === '' ? b : `${a}\n${b}`), '')

const normalizeCellsForClipboard = R.map(a => fromEmpty(a).getOrElse(''))

export const toClipboardData = R.compose(
  combineClipboardRows,
  R.map(combineClipboardCells),
  R.map(normalizeCellsForClipboard)
)

const clearNil = row => row.map(d => (R.isEmpty(d) ? undefined : d))

export const normalizePasteInfo = selection => data => {
  const dataSet = expandDataToSelection(selection)(data)
  const { x1, y1 } = selection
  return { columnIndex: x1, rowIndex: y1, dataSet }
}

const parseClipData = rawData =>
  rawData
    .split(rawData.includes('\r') ? '\r\n' : '\n')
    // excel may copy extra 0 length line
    .filter(row => row != null && row.trim().length > 0)
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

export const copyToClipboard = ({ evt, clipboard }) => txtData => {
  clipboard.setData('Text', txtData)
  evt.preventDefault()
  // console.log('copied data: [', clipboard.getData('Text'), ']')
}

export const normalizeCopiedContentForNumber = txtContent =>
  txtContent == null || txtContent.trim().length === 0 ? null : txtContent.replace('$', '')
