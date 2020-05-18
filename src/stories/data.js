import Chance from 'chance'
import R from 'ramda'
import moment from 'moment'
import { strCol, numCol, intCol, dollarCol, pctCol, dateCol } from '../cols'

const chance = new Chance()
//* test helpers
export const randomRow = R.compose(
  R.fromPairs,
  R.map(({ ident, type, dataFormat }) => {
    if (ident === 'commitStatusOvr') return [ident, chance.pickone(['UNA', 'ECO', 'EMER', 'MUST'])]
    if (ident === 'unitId') return [ident, chance.pickone(['u1', 'u2', 'u3', 'u4'])]
    if (ident === 'he') return [ident, chance.integer({ min: 1, max: 24 })]
    switch (type) {
      case 'str':
      case 'sel':
        return [ident, chance.word() + ' ' + chance.word() + ' ' + chance.word()]
      case 'num':
        return [ident, chance.floating({ fixed: 2, min: 0, max: 50000 })]
      case 'bool':
        return [ident, chance.bool()]
      case 'date-time':
        return [ident, moment(chance.date()).format(dataFormat)]
    }
  })
)

/**
 * The following are example of what choices and dataFormatter should be
 * They are not normally created this way
 * the toSelectionColProps function in utils.js
 * should be used to create these 2 objects.
 * They are coded this way here to demostrate what their strcutrues should be
 */
// TODO add documentation
/** choices */
const unitChoices = [
  { value: 'u1', text: 'Unit 4' },
  { value: 'u2', text: 'Unit 1' },
  { value: 'u3', text: 'Unit 2' },
  { value: 'u4', text: 'Unit 3' },
]

const unitMap = {
  u1: 'Unit4',
  u2: 'Unit1',
  u3: 'Unit2',
  u4: 'Unit3',
}

// TODO add documentation
/** data-formatter */
const unitDataFormatter = ({ value }) => unitMap[value] || value

/* prettier-ignore */
export const headers = [
  dateCol({ ident: 'transDate', display: 'Trans-Date', width:120, isKey:true, }),
  strCol({ ident: 'unitId', display: 'Unit', width:180, isKey:true, dataFormatter:unitDataFormatter,choices:unitChoices }),
  intCol({ ident: 'he', display: 'HE', width: 40,isKey:true, numFormat:"0", }),
  strCol({ ident: 'fixedGen', display: 'Fixed Gen' , ellipsis : true }),
  numCol({ ident: 'emerMinOvr', display: 'Emer Min', width:120, alignment:'right', displayFormat: null }),
  numCol({ ident: 'ecoMinOvr', display: 'Eco Min', }),
  numCol({ ident: 'ecoMaxOvr', display: 'Eco Max', }),
  numCol({ ident: 'emerMaxOvr', display: 'Emer Max', }),
  strCol({ ident: 'commitStatusOvr', display: 'Commit Status', }),
  numCol({ ident: 'regMwOvr', display: 'Reg Mw', }),
  numCol({ ident: 'regMinOvr', display: 'Reg Min', }),
  numCol({ ident: 'regMaxOvr', display: 'Reg Max', }),
  strCol({ ident: 'regAStatusOvr', display: 'Reg A Status', }),
  strCol({ ident: 'spilling', display: 'Spilling', ellipsis:true }),
  pctCol({ ident: 'reducedRampRatePct', display: 'Reduce Ramp Percent', width:220, }),
  dollarCol({ ident: 'regAPrice', display: 'Reg A Price', width:120, }),
  dollarCol({ ident: 'regACost', display: 'Reg A Cost', width:120, }),
  dollarCol({ ident: 'regAPerfPrice', display: 'Reg A Perf Price', width:120, }),
  dollarCol({ ident: 'regAPerfCost', display: 'Reg A Perf Cost', width:120, }),
  strCol({ ident: 'regDStatus', display: 'Reg D status', }),
  dollarCol({ ident: 'regDPrice', display: 'Reg D Price', width:120, }),
  dollarCol({ ident: 'regDCost', display: 'Reg D Cost', width:120, }),
  dollarCol({ ident: 'regDPerfPrice', display: 'Reg D Perf Price', width:120, }),
  dollarCol({ ident: 'regDPerfCost', display: 'Reg D Perf Cost', width:120, }),
  numCol({ ident: 'spinMwOvr', display: 'Spin Mw', }),
  numCol({ ident: 'spinMaxOvr', display: 'Spin Max', }),
  strCol({ ident: 'spinStatusOvr', display: 'Spin Status', }),
  dollarCol({ ident: 'spinPrice', display: 'Spin Price', width:120, }),
]
const createRow = _ => randomRow(headers)
export const createData = R.compose(
  R.map(createRow),
  R.range(0)
)
