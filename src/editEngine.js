import R from 'ramda'

export const initialEditInfo = {
  updated: [],
  added: [],
  removed: [],
  // originalRow => editedRow
  updatedMap: new Map(),
  // editedRow => orignalRow
  dirtyMap: new Map(),
  history: [],
}

const immutableOp = op => map => op(new Map(map))

const immutableSet = (key, value) =>
  immutableOp(m => {
    m.set(key, value)
    return m
  })

export const removeData = ({ editInfo = initialEditInfo, currentRow }) => {
  const { removed, history, ...rest } = editInfo
  return {
    removed: [...removed, currentRow],
    history: [...history, editInfo],
    ...rest,
  }
}

export const addData = ({ editInfo = initialEditInfo, editedRow }) => {
  return updateData(editInfo, editedRow)
}

export const updateData = ({
  editInfo = initialEditInfo,
  currentRow,
  editedRow,
}) => {
  if (
    currentRow === undefined &&
    editedRow !== undefined &&
    editedRow !== null
  ) {
    const { /*dirtyMap,*/ added, history, ...rest } = editInfo
    return {
      added: [...added, editedRow],
      // dirtyMap: immutableSet(editedRow, undefined)(dirtyMap),
      history: [editInfo, ...history],
      ...rest,
    }
  } else if (currentRow !== editedRow) {
    const { added, dirtyMap, updatedMap, updated, history, ...rest } = editInfo
    if (added.includes(editedRow)) {
      return {
        added: [...added.filter(row => row !== currentRow), editedRow],
        // dirtyMap: immutableOp(m => {
        //   // remove  transitive row
        //   m.delete(currentRow)
        //   // add new edited row
        //   m.set(editedRow, undefined)
        //   return m
        // })(dirtyMap),
        updatedMap,
        updated,
        history: [editInfo, ...history],
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
        updatedMap: immutableSet(originalRow, editedRow),
        updated: [...R.filter(row => row !== currentRow, updated), editedRow],
        history: [editInfo, ...history],
        ...rest,
      }
    } else {
      return {
        added,
        dirtyMap: immutableSet(editedRow, currentRow),
        updatedMap: immutableSet(currentRow, editedRow),
        updated: [...updated, editedRow],
        history: [editInfo, ...history],
      }
    }
  }
  return editInfo
}

export const undo = (editInfo = initialEditInfo) =>
  editInfo.history[0] || initialEditInfo

export const isDirty = (editInfo = initialEditInfo) =>
  (editInfo !== initialEditInfo && editInfo.added.length > 0) ||
  editInfo.removed.length > 0 ||
  editInfo.updated.length > 0

export const apply = editInfo =>
  R.compose(
    R.filter(row => !editInfo.removed.includes(row)),
    R.map(row => editInfo.updatedMap.get(row) || row)
  )

export const applyEdits = ({ data, editInfo }) =>
  isDirty(editInfo) ? [...apply(editInfo)(data), ...editInfo.added] : data
