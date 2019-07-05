import React from 'react'
import R from 'ramda'
import Chance from 'chance'
import Grid, { flexGridRenderer, toSelectionColProps } from '../../index'
import { headers as rawHeaders, randomRow } from '../data'

const chance = new Chance()

const mapWithIndex = R.addIndex(R.map)
const toKeyValue = R.compose(
  R.fromPairs,
  mapWithIndex((text, value) => [value, text])
)

const keyValues = toKeyValue(chance.unique(() => chance.word({ syllables: 4 }), 1000))

const headers = R.take(5, rawHeaders).map(a => {
  if (a.ident === 'fixedGen') {
    return { ...a, ...toSelectionColProps(keyValues) }
  }
  return a
})

const keys = Object.keys(keyValues)

const data = R.range(0, 5)
  .map(_ => randomRow(headers))
  .map(val => ({ ...val, fixedGen: chance.pickone(keys) }))

const CellEditDemo = () => (
  <Grid
    data={data}
    headers={headers}
    render={flexGridRenderer({
      headerRowHeight: 60,
      width: 1100,
      height: 500,
      autoFixColByKey: true,
    })}
    isEditable
    editMode="cell"
  />
)

export default CellEditDemo
