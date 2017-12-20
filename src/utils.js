import R from 'ramda'
import { fromNullable, Just, Nothing } from 'data.maybe'
import { ROW_INDEX_ATTRIBUTE, COLUMN_INDEX_ATTRIBUTE } from './constants.js'

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
  rowIndex: parseInt(evt.target.getAttribute(ROW_INDEX_ATTRIBUTE)),
  columnIndex: parseInt(evt.target.getAttribute(COLUMN_INDEX_ATTRIBUTE)),
})

export const isPositionValid = pos =>
  !R.isNil(pos) && !R.isNil(pos.rowIndex) && !R.isNil(pos.columnIndex)

export const eventBroadcaster = listeners => e =>
  listeners.filter(l => !R.isNil(l)).forEach(l => l(e))
