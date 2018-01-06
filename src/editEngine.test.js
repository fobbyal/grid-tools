/* eslint-env jest */
import * as editEngine from './editEngine'

test('initial edit info should not be dirty', () => {
  expect(editEngine.isDirty(editEngine.generateInitialEditInfo())).toBe(false)
})

test('edit info should be dirty after add', () => {
  const editInfo = editEngine.generateInitialEditInfo()
  const addedInfo = editEngine.addRow({
    editInfo,
    editedRow: {},
  })
  expect(editEngine.isDirty(addedInfo)).toBe(true)
})
