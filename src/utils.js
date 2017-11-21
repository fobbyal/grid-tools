import R from 'ramda'
import { fromNullable, Just, Nothing } from 'data.maybe'

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
