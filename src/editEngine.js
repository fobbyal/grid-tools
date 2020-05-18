import R from 'ramda'

export const generateInitialEditInfo = () => ({
  updated: [],
  added: [],
  removed: [],
  // originalRow => editedRow
  updatedMap: new Map(),
  // editedRow => orignalRow
  dirtyMap: new Map(),
  history: [],
})

const immutableOp = op => map => op(new Map(map))

const immutableSet = (key, value) =>
  immutableOp(m => {
    m.set(key, value)
    return m
  })

export const batchRemove = ({ editInfo = generateInitialEditInfo(), rows }) => {
  const { added, updated, dirtyMap, updatedMap, removed, history, ...rest } = editInfo
  const rowsToRemoveFromAdded = []
  const rowsToRemoveFromUpdated = []
  const rowsToAddInRemoved = []

  let modifiedDirtyMap = dirtyMap
  let modifiedUpdatedMap = updatedMap
  for (let i = 0; i < rows.length; i++) {
    const currentRow = rows[i]
    if (currentRow) {
      const isAdded = added.includes(currentRow)
      if (isAdded) {
        rowsToRemoveFromAdded.push(currentRow)
      } else {
        const originalRow = dirtyMap.get(currentRow)
        const isUpdated = dirtyMap.has(currentRow)
        if (isUpdated) {
          rowsToRemoveFromUpdated.push(currentRow)
          rowsToAddInRemoved.push(originalRow)
          modifiedDirtyMap.delete(currentRow)
          modifiedUpdatedMap.delete(originalRow)
        } else {
          rowsToAddInRemoved.push(currentRow)
        }
      }
    }
  }
  return {
    removed: [...removed, ...rowsToAddInRemoved],
    added: added.filter(row => !rowsToRemoveFromAdded.includes(row)),
    updated: updated.filter(row => !rowsToRemoveFromUpdated.includes(row)),
    dirtyMap: modifiedDirtyMap,
    updatedMap: modifiedUpdatedMap,
    history: [editInfo, ...history],
    ...rest,
  }
}

export const removeRow = ({ editInfo = generateInitialEditInfo(), currentRow }, ignoreHistory) => {
  const { added, updated, dirtyMap, updatedMap, removed, history, ...rest } = editInfo

  const originalRow = dirtyMap.get(currentRow)
  const isUpdated = dirtyMap.has(currentRow)
  const isAdded = added.includes(currentRow)

  return {
    removed: isAdded ? removed : [...removed, isUpdated ? originalRow : currentRow],
    added: isAdded ? added.filter(row => row !== currentRow) : added,
    updated: isUpdated ? updated.filter(row => row !== currentRow) : updated,
    dirtyMap: isUpdated
      ? immutableOp(m => {
          m.delete(currentRow)
          return m
        })(dirtyMap)
      : dirtyMap,
    updatedMap: isUpdated
      ? immutableOp(m => {
          m.delete(originalRow)
          return m
        })(updatedMap)
      : updatedMap,
    history: ignoreHistory ? undefined : [editInfo, ...history],
    ...rest,
  }
}

export const batchAddRow = ({ editInfo = generateInitialEditInfo(), rows }) => {
  const { added, history, ...rest } = editInfo
  return {
    added: [...added, ...rows],
    // dirtyMap: immutableSet(editedRow, undefined)(dirtyMap),
    history: [editInfo, ...history],
    ...rest,
  }
}

export const addRow = ({ editInfo = generateInitialEditInfo(), editedRow }) =>
  updateRow({ editInfo, editedRow })

export const batchUpdateRow = ({ editInfo = generateInitialEditInfo(), updates = [] }) => {
  const { added, dirtyMap, updatedMap, updated, history, ...rest } = editInfo
  const rowsToRemoveFromAdded = []
  const rowsToAddInAdded = []
  const rowsToRemoveFromUpdated = []
  const rowsToAddInUpdated = []

  let modifiedDirtyMap = dirtyMap
  let modifiedUpdatedMap = updatedMap
  for (let i = 0; i < updates.length; i++) {
    if (updates[i]) {
      const { currentRow, editedRow } = updates[i]
      if ((currentRow === undefined || R.isEmpty(currentRow)) && !R.isNil(editedRow)) {
        rowsToAddInAdded.push(editedRow)
      } else if (added.includes(currentRow)) {
        rowsToRemoveFromAdded.push(currentRow)
        rowsToAddInAdded.push(editedRow)
      } else {
        if (dirtyMap.has(currentRow)) {
          const originalRow = dirtyMap.get(currentRow)
          rowsToRemoveFromUpdated.push(currentRow)
          modifiedDirtyMap.delete(currentRow)
          modifiedDirtyMap.set(editedRow, originalRow)
          modifiedUpdatedMap.set(originalRow, editedRow)
        } else {
          modifiedDirtyMap.set(editedRow, currentRow)
          modifiedUpdatedMap.set(currentRow, editedRow)
        }
        rowsToAddInUpdated.push(editedRow)
      }
    }
  }

  return {
    added: [...added.filter(row => !rowsToRemoveFromAdded.includes(row)), ...rowsToAddInAdded],
    updated: [
      ...updated.filter(row => !rowsToRemoveFromUpdated.includes(row)),
      ...rowsToAddInUpdated,
    ],
    dirtyMap: modifiedDirtyMap,
    updatedMap: modifiedUpdatedMap,
    history: [editInfo, ...history],
    ...rest,
  }
}

export const updateRow = (
  { editInfo = generateInitialEditInfo(), currentRow, editedRow },
  ignoreHistory
) => {
  if ((currentRow === undefined || R.isEmpty(currentRow)) && !R.isNil(editedRow)) {
    const { added, history, ...rest } = editInfo
    return {
      added: [...added, editedRow],
      // dirtyMap: immutableSet(editedRow, undefined)(dirtyMap),
      history: [editInfo, ...history],
      ...rest,
    }
  } else if (currentRow !== editedRow) {
    const { added, dirtyMap, updatedMap, updated, history, ...rest } = editInfo
    if (added.includes(currentRow)) {
      return {
        added: [...added.filter(row => row !== currentRow), editedRow],
        dirtyMap,
        updatedMap,
        updated,
        history: ignoreHistory ? undefined : [editInfo, ...history],
        ...rest,
      }
      // editing data that has been editted before
    } else if (dirtyMap.has(currentRow)) {
      const originalRow = dirtyMap.get(currentRow)
      return {
        added,
        dirtyMap: immutableOp(m => {
          // remove  transitive row
          m.delete(currentRow)
          // add new edited row
          m.set(editedRow, originalRow)
          return m
        })(dirtyMap),
        updatedMap: immutableSet(originalRow, editedRow)(updatedMap),
        updated: [...R.filter(row => row !== currentRow, updated), editedRow],
        history: ignoreHistory ? undefined : [editInfo, ...history],
        ...rest,
      }
    } else {
      return {
        added,
        dirtyMap: immutableSet(editedRow, currentRow)(dirtyMap),
        updatedMap: immutableSet(currentRow, editedRow)(updatedMap),
        updated: [...updated, editedRow],
        history: ignoreHistory ? undefined : [editInfo, ...history],
        ...rest,
      }
    }
  }
  return editInfo
}

export const undo = (editInfo = generateInitialEditInfo()) =>
  editInfo.history[0] || generateInitialEditInfo()

export const isDirty = (editInfo = generateInitialEditInfo()) =>
  editInfo.added.length > 0 || editInfo.removed.length > 0 || editInfo.updated.length > 0

export const apply = editInfo =>
  R.compose(
    R.filter(row => !editInfo.removed.includes(row)),
    R.map(row => editInfo.updatedMap.get(row) || row)
  )

export const applyEdits = ({ data, editInfo }) =>
  isDirty(editInfo) ? [...apply(editInfo)(data), ...editInfo.added] : data
