import R from 'ramda'
import { fromNullable, Just, Nothing } from 'data.maybe'
import {
  ROW_INDEX_ATTRIBUTE,
  COLUMN_INDEX_ATTRIBUTE,
  COL_IDENT_ATTRIBUTE,
} from './constants.js'
import moment from 'moment'
import numeral from 'numeral'

export const fromEmpty = d =>
  fromNullable(d).chain(v => (R.isEmpty(v) ? Nothing() : Just(v)))

export const normalizeBounds = selection => {
  if (R.isEmpty(selection)) return selection

  const { x1, y1, x2, y2 } = selection

  const xMin = !R.isNil(x2) ? Math.min(x1, x2) : x1
  const xMax = !R.isNil(x2) ? Math.max(x1, x2) : x1
  const yMin = !R.isNil(y2) ? Math.min(y1, y2) : y1
  const yMax = !R.isNil(y2) ? Math.max(y1, y2) : y1
  return { x1: xMin, x2: xMax, y1: yMin, y2: yMax }
}

export const sumWidth = R.compose(R.sum, R.map(({ width }) => width))

export const extractPosition = evt => ({
  rowIndex: fromNullable(evt.target.getAttribute(ROW_INDEX_ATTRIBUTE))
    .map(parseInt)
    .getOrElse(undefined),
  columnIndex: fromNullable(evt.target.getAttribute(COLUMN_INDEX_ATTRIBUTE))
    .map(parseInt)
    .getOrElse(undefined),
})

export const extractColIdent = evt =>
  evt.target.getAttribute(COL_IDENT_ATTRIBUTE)

export const isPositionValid = pos =>
  !R.isNil(pos) && !R.isNil(pos.rowIndex) && !R.isNil(pos.columnIndex)

export const eventBroadcaster = listeners => e =>
  listeners.filter(l => !R.isNil(l)).forEach(l => l(e))

export const extractData = ({ header, rowData, dataFormat }) => {
  const { dataGetter, type, ident } = header
  const rawData = rowData[ident]
  return dataGetter
    ? dataGetter({ header, rowData })
    : type === 'date-time'
      ? R.isNil(rowData)
        ? undefined
        : moment.isDate(rowData)
          ? moment(rawData).format(dataFormat)
          : moment.isMoment(rowData) ? rowData.formatData(dataFormat) : rawData
      : rawData
}

export const formatData = ({ header, value }) => {
  const { type, dataFormat, displayFormat, dataFormatter } = header
  return dataFormatter
    ? dataFormatter({ header, value })
    : R.isNil(value)
      ? ''
      : type === 'num' && displayFormat
        ? numeral(value).format(displayFormat)
        : type === 'date-time' && displayFormat
          ? moment(value, dataFormat).format(displayFormat)
          : value + ''
}

export const extractAndFormatData = ({ header, rowData }) =>
  formatData({ header, value: extractData({ header, rowData }) })

export const toSelectionColProps = keyValues => {
  if (keyValues instanceof Map) {
    const choices = []
    keyValues.forEach((value, key) => choices.push({ text: value, value: key }))
    return {
      choices,
      dataFormatter: ({ header, value }) =>
        keyValues.has(value) ? keyValues.get(value) : value,
    }
  } else {
    return {
      choices: R.compose(
        R.map(([value, text]) => ({ value, text })),
        R.toPairs
      )(keyValues),
      dataFormatter: ({ header, value }) =>
        R.isNil(keyValues[value]) ? value : keyValues[value],
    }
  }
}
