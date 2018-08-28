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

test('should do nothing when currentRow and editedRow are not defined', () => {
  const initialEdit = editEngine.generateInitialEditInfo()
  const updated1 = editEngine.updateRow({
    editInfo: initialEdit,
  })
  expect(initialEdit).toBe(updated1)
})

test('should update row properly', () => {
  const row1 = { a: 1, b: '2' }
  const row1Updated = { a: 2, b: '2' }
  const initialEdit = editEngine.generateInitialEditInfo()

  const updated1 = editEngine.updateRow({
    editInfo: initialEdit,
    currentRow: row1,
    editedRow: row1Updated,
  })

  expect(updated1.updated).toContain(row1Updated)
  expect(updated1.dirtyMap.has(row1Updated)).toBe(true)
  expect(updated1.updatedMap.has(row1)).toBe(true)
  expect(updated1.history.length).toBe(1)

  const row2Updated = { a: 2, b: '3' }
  const updated2 = editEngine.updateRow({
    editInfo: updated1,
    currentRow: row1Updated,
    editedRow: row2Updated,
  })

  expect(updated2.updated).toContain(row2Updated)
  expect(updated2.updated.length).toBe(1)
  expect(updated2.dirtyMap.has(row2Updated)).toBe(true)
  expect(updated2.updatedMap.has(row1)).toBe(true)
  expect(updated2.history.length).toBe(2)

  const rowAdded = { a: 5, b: '4' }
  const updated3 = editEngine.updateRow({
    editInfo: updated2,
    currentRow: undefined,
    editedRow: rowAdded,
  })
  expect(updated3.added).toContain(rowAdded)
  expect(updated3.history.length).toBe(3)

  const rowAddedUpdate = { a: 6, b: '4' }

  const updated4 = editEngine.updateRow({
    editInfo: updated3,
    currentRow: rowAdded,
    editedRow: rowAddedUpdate,
  })
  expect(updated4.added).toContain(rowAddedUpdate)
  expect(updated4.added).not.toContain(rowAdded)
  expect(updated4.updated).not.toContain(rowAddedUpdate)
  expect(updated4.updated).not.toContain(rowAdded)
  expect(updated4.dirtyMap.has(rowAdded)).toBe(false)
  expect(updated4.dirtyMap.has(rowAddedUpdate)).toBe(false)
  expect(updated4.updatedMap.has(rowAdded)).toBe(false)
  expect(updated4.updatedMap.has(rowAddedUpdate)).toBe(false)

  const undo1 = editEngine.undo(updated4)
  expect(undo1).toBe(updated3)
  const undo2 = editEngine.undo(undo1)
  expect(undo2).toBe(updated2)
  const undo3 = editEngine.undo(undo2)
  expect(undo3).toBe(updated1)

  const result1 = editEngine.applyEdits({ data: [row1], editInfo: updated4 })
  expect(result1).toContain(rowAddedUpdate)
  expect(result1).toContain(row2Updated)
  expect(result1.length).toBe(2)

  const deleted1 = editEngine.removeRow({
    editInfo: updated4,
    currentRow: rowAddedUpdate,
  })
  expect(deleted1.removed.length).toBe(0)

  const result2 = editEngine.applyEdits({ data: [row1], editInfo: deleted1 })
  expect(result2).toContain(row2Updated)
  expect(result2.length).toBe(1)

  const deleted2 = editEngine.removeRow({
    editInfo: updated4,
    currentRow: row2Updated,
  })
  expect(deleted2.updated.length).toBe(0)
  expect(deleted2.updatedMap.size).toBe(0)
  expect(deleted2.dirtyMap.size).toBe(0)

  const result3 = editEngine.applyEdits({ data: [row1], editInfo: deleted2 })
  expect(result3).toContain(rowAddedUpdate)
  expect(result3.length).toBe(1)
})
