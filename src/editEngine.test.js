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

test('should add row properly', () => {
  const editInfo = editEngine.generateInitialEditInfo()

  const editedRow = {}
  const addedInfo = editEngine.addRow({
    editInfo,
    editedRow,
  })

  expect(addedInfo.added.length).toBe(1)
  expect(addedInfo.added[0]).toBe(editedRow)
  expect(addedInfo.history.length).toBe(1)
  expect(addedInfo.history[0]).toBe(editInfo)
})
test('should update row properly', () => {
  const row1 = { a: 1, b: '2' }
  const row1Updated = { a: 2, b: '2' }
  const data = [row1]
  const initialEdit = editEngine.generateInitialEditInfo()

  const updated1 = editEngine.updateRow({
    editInfo: initialEdit,
    currentRow: row1,
    editedRow: row1Updated,
  })

  console.log(updated1)

})
