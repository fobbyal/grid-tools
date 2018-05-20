import R from 'ramda'
import { fromNullable, Just, Nothing } from 'data.maybe'
import moment from 'moment'
import numeral from 'numeral'
import { ROW_INDEX_ATTRIBUTE, COLUMN_INDEX_ATTRIBUTE, COL_IDENT_ATTRIBUTE } from './constants.js'

export const fromEmpty = d => fromNullable(d).chain(v => (R.isEmpty(v) ? Nothing() : Just(v)))

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

export const extractColIdent = evt => evt.target.getAttribute(COL_IDENT_ATTRIBUTE)

export const isPositionValid = pos =>
  !R.isNil(pos) && !R.isNil(pos.rowIndex) && !R.isNil(pos.columnIndex)

export const eventBroadcaster = listeners => e =>
  listeners.filter(l => !R.isNil(l)).forEach(l => l(e))

export const extractData = ({ header, rowData = [], dataFormat }) => {
  const { dataGetter, type, ident } = header
  const rawData = rowData[ident]
  return dataGetter
    ? dataGetter({ header, rowData })
    : type === 'date-time'
      ? R.isNil(rowData)
        ? undefined
        : moment.isDate(rowData)
          ? moment(rawData).format(dataFormat)
          : moment.isMoment(rawData) ? rawData.formatData(dataFormat) : rawData
      : rawData
}

export const formatData = ({ header, value, rowData }) => {
  const { type, dataFormat, displayFormat, dataFormatter } = header
  return dataFormatter
    ? dataFormatter({ header, value, rowData })
    : R.isNil(value)
      ? ''
      : type === 'num' && displayFormat
        ? numeral(value).format(displayFormat)
        : type === 'date-time' && displayFormat
          ? moment(value, dataFormat).format(displayFormat)
          : value + ''
}

export const extractAndFormatData = ({ header, rowData }) =>
  formatData({ header, value: extractData({ header, rowData }), rowData })

export const toSelectionColProps = keyValues => {
  if (!keyValues) {
    console.warn('called select Colprops with null or undefined')
    return {}
  }
  if (keyValues instanceof Map) {
    const choices = []
    keyValues.forEach((value, key) => choices.push({ text: value, value: key }))
    return {
      choices,
      dataFormatter: ({ header, value }) => (keyValues.has(value) ? keyValues.get(value) : value),
    }
  } else {
    return {
      choices: R.compose(
        R.map(([value, text]) => ({ value, text })),
        R.sortBy(([_, name]) => name.toLowerCase()),
        R.toPairs
      )(keyValues),
      dataFormatter: ({ header, value }) => (R.isNil(keyValues[value]) ? value : keyValues[value]),
    }
  }
}

const isIntermediateNumber = value =>
  value.endsWith('.') &&
  value.lastIndexOf('.') === value.indexOf('.') &&
  !R.isNil(numeral(value.replace('.', '')))

export const rawToValue = ({ value, header: { type, numFormat, dataFormat } }) => {
  console.log('raw value is ', value)
  // TODO: timezone issue
  if (moment.isMoment(value)) {
    return value.format(dataFormat)
  }
  if (moment.isDate(value)) {
    return moment(value).format(dataFormat)
  }
  if (type === 'num' && typeof value === 'string') {
    if (value.trim().length === 0) return ''
    if (isIntermediateNumber(value)) return value

    const parsedValue = numeral(value).value()
    console.log('parsed value is ', parsedValue)
    if (isNaN(parsedValue) || R.isNil(parsedValue)) return undefined
    return parsedValue
  }
  if (type === 'bool' && typeof value === 'string') {
    return [value.toLowerCase()].map(v => v === 'y' || v === 'yes' || v === 'true')[0]
  }
  return value
}

export const sumHeight = ({ data = [], rowHeight }) => {
  if (typeof rowHeight === 'function') {
    return R.range(0, data.length)
      .map(rowHeight)
      .reduce(R.add)
  }
  return rowHeight * data.length
}
