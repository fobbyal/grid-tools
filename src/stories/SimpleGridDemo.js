import React from 'react'
import R from 'ramda'
import { strCol, numCol, boolCol, selCol } from '../cols'
import Grid, { flexGridRenderer } from '../index'
import Chance from 'chance'
const chance = new Chance()
//* test helpers
const randomRow = R.compose(
  R.fromPairs,
  R.map(({ ident, type }) => {
    if (ident === 'commitStatusOvr')
      return [ident, chance.pickone(['UNA', 'ECO', 'EMER', 'MUST'])]
    switch (type) {
      case 'str':
      case 'sel':
        return [ident, chance.word()]
      case 'num':
        return [ident, chance.floating({ fixed: 2, min: 0, max: 50000 })]
      case 'bool':
        return [ident, chance.bool()]
    }
  })
)

const createRow = _ => randomRow(headers)

const createData = R.compose(R.map(createRow), R.range(1))

/* prettier-ignore */
const headers = [
  strCol({ ident: 'unitId', display: 'Unit', width:180 }),
  numCol({ ident: 'he', display: 'HE', width: 40 }),
  strCol({ ident: 'fixedGen', display: 'Fixed Gen' }),
  numCol({ ident: 'emerMinOvr', display: 'Emer Min' }),
  numCol({ ident: 'ecoMinOvr', display: 'Eco Min' }),
  numCol({ ident: 'ecoMaxOvr', display: 'Eco Max' }),
  numCol({ ident: 'emerMaxOvr', display: 'Emer Max' }),
  strCol({ ident: 'commitStatusOvr', display: 'Commit Status', }),
  numCol({ ident: 'regMwOvr', display: 'Reg Mw' }),
  numCol({ ident: 'regMinOvr', display: 'Reg Min' }),
  numCol({ ident: 'regMaxOvr', display: 'Reg Max' }),
  strCol({ ident: 'regAStatusOvr', display: 'Reg A Status' }),
  strCol({ ident: 'spilling', display: 'Spilling' }),
  numCol({ ident: 'reducedRampRatePct', display: 'Reduce Ramp Percent', }),
  numCol({ ident: 'regAPrice', display: 'Reg A Price' }),
  numCol({ ident: 'regACost', display: 'Reg A Cost' }),
  numCol({ ident: 'regAPerfPrice', display: 'Reg A Perf Price', }),
  numCol({ ident: 'regAPerfCost', display: 'Reg A Perf Cost' }),
  strCol({ ident: 'regDStatus', display: 'Reg D status' }),
  numCol({ ident: 'regDPrice', display: 'Reg D Price' }),
  numCol({ ident: 'regDCost', display: 'Reg D Cost' }),
  numCol({ ident: 'regDPerfPrice', display: 'Reg D Perf Price', }),
  numCol({ ident: 'regDPerfCost', display: 'Reg D Perf Cost' }),
  numCol({ ident: 'spinMwOvr', display: 'Spin Mw' }),
  numCol({ ident: 'spinMaxOvr', display: 'Spin Max' }),
  strCol({ ident: 'spinStatusOvr', display: 'Spin Status' }),
  numCol({ ident: 'spinPrice', display: 'Spin Price' }),
]
/*   grid code starts here */

console.log(JSON.stringify(headers))

const GridDemo = () => {
  return (
    <Grid
      render={flexGridRenderer({
        headers,
        data: createData(15),
      })}
    />
  )
}

export default GridDemo
