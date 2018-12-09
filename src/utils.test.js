/* eslint-env jest */
import { computeAltIndexes } from './utils'

it('should create alt index information properly', () => {
  let data = [
    { unitId: 'a', fuel: 'b' },
    { unitId: 'a', fuel: 'b' },
    { unitId: 'b', fuel: 'b' },
    { unitId: 'b', fuel: 'b' },
    { unitId: 'b', fuel: 'c' },
    { unitId: 'b', fuel: 'c' },
  ]

  const altBy = row => row.unitId + '||' + row.fuel
  let actual = computeAltIndexes({ data, altBy })
  expect(actual).toEqual([false, false, true, true, false, false])

  data = [
    { unitId: 'a', fuel: 'b' },
    { unitId: 'a', fuel: 'c' },
    { unitId: 'b', fuel: 'b' },
    { unitId: 'b', fuel: 'c' },
    { unitId: 'b', fuel: 'c' },
  ]

  actual = computeAltIndexes({ data, altBy })
  expect(actual).toEqual([false, true, false, true, true])

  data = [
    { unitId: 'a', fuel: 'b' },
    { unitId: 'a', fuel: 'c' },
    { unitId: 'a', fuel: 'b' },
    { unitId: 'a', fuel: 'c' },
    { unitId: 'a', fuel: 'b' },
  ]

  actual = computeAltIndexes({ data, altBy })
  expect(actual).toEqual([false, true, false, true, false])
})
