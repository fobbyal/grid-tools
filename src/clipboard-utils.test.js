/* eslint-env jest */
import { expandDataToSelection } from './clipboard-utils'

it('should not fit if selection size matches data', () => {
  const selection = { x1: 1, x2: 1, y1: 1, y2: 2 }
  const data = [['a'], ['b']]
  expect(expandDataToSelection(selection)(data)).toBe(data)
})

it('should not fit selection size is 1:1', () => {
  const selection = { x1: 1, x2: 1, y1: 1, y2: 1 }
  const data = [['a'], ['b']]
  expect(expandDataToSelection(selection)(data)).toBe(data)
})

it('should fit data to selection size', () => {
  const selection = { x1: 1, x2: 1, y1: 1, y2: 2 }
  const data = [['a'], ['b'], ['c']]
  expect(expandDataToSelection(selection)(data)).toBe(data)
})

it('should fit repeat data to selection size when there are extra selected rows', () => {
  const selection = { x1: 1, x2: 1, y1: 1, y2: 2 }
  const data = [['a', 'b']]
  expect(expandDataToSelection(selection)(data)).toEqual([
    ['a', 'b'],
    ['a', 'b'],
  ])
})

it('should fit repeat data to selection size when there are extra selected cols and rows', () => {
  const selection = { x1: 1, x2: 3, y1: 1, y2: 2 }
  const data = [['a', 'b']]
  expect(expandDataToSelection(selection)(data)).toEqual([
    ['a', 'b', 'a'],
    ['a', 'b', 'a'],
  ])
})

it('should fit repeat data to selection size when there are extra selected cols and rows', () => {
  const selection = { x1: 1, x2: 3, y1: 1, y2: 1 }
  const data = [['a', 'b'], ['c', 'd']]
  expect(expandDataToSelection(selection)(data)).toEqual([
    ['a', 'b', 'a'],
    ['c', 'd', 'c'],
  ])
})
