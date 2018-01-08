import React from 'react'

import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
// import { linkTo } from '@storybook/addon-links'
import R from 'ramda'
import { strCol, numCol, intCol, dollarCol, pctCol, dateCol } from '../cols'
import { randomRow } from './data'
import ControlledEditDemo from './ControlledEditDemo'

import Grid, {
  flexGridRenderer,
  FlexCell,
  FlexColHeader,
  defaultFlexCellRenderer,
  defaultFlexColHeaderRenderer,
} from '../index'
import FilterDemo from './FilterDemo'

const createRow = _ => randomRow(headers)

const createData = R.compose(R.map(createRow), R.range(0))

const unitMap = {
  u1: 'Unit4',
  u2: 'Unit1',
  u3: 'Unit2',
  u4: 'Unit3',
}

const unitDataGetter = ({ header, rowData }) =>
  unitMap[rowData[header.ident]] || rowData[header.ident]

/* prettier-ignore */
const headers = [
  dateCol({ ident: 'transDate', display: 'Trans-Date', width:120, isKey:true, }),
  strCol({ ident: 'unitId', display: 'Unit', width:180, isKey:true, dataGetter:unitDataGetter }),
  intCol({ ident: 'he', display: 'HE', width: 40,isKey:true, numFormat:"0", }),
  strCol({ ident: 'fixedGen', display: 'Fixed Gen' }),
  numCol({ ident: 'emerMinOvr', display: 'Emer Min', width:120, alignment:'right', }),
  numCol({ ident: 'ecoMinOvr', display: 'Eco Min', }),
  numCol({ ident: 'ecoMaxOvr', display: 'Eco Max', }),
  numCol({ ident: 'emerMaxOvr', display: 'Emer Max', }),
  strCol({ ident: 'commitStatusOvr', display: 'Commit Status', }),
  numCol({ ident: 'regMwOvr', display: 'Reg Mw', }),
  numCol({ ident: 'regMinOvr', display: 'Reg Min', }),
  numCol({ ident: 'regMaxOvr', display: 'Reg Max', }),
  strCol({ ident: 'regAStatusOvr', display: 'Reg A Status', }),
  strCol({ ident: 'spilling', display: 'Spilling', }),
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
/*   grid code starts here */

const data = createData(80)

const redOn3X3Renderer = props => {
  const { rowIndex, columnIndex, width, height, data, header } = props
  if (rowIndex === 3 && columnIndex === 3) {
    return (
      <FlexCell
        color="red"
        fontSize=".8em"
        fontWeight="bold"
        width={width}
        height={height}
      >
        ${data[rowIndex][header.ident]}
      </FlexCell>
    )
  }
  return defaultFlexCellRenderer(props)
}
const splitColHeaderRenderer = props => {
  const { header } = props
  if (header.ident === 'unitId') {
    return (
      <FlexColHeader backgroundColor="black" width={props.width}>
        <div>Left</div>
        <div>|</div>
        <div>Right</div>
      </FlexColHeader>
    )
  }
  return defaultFlexColHeaderRenderer(props)
}

const commonProps = { headers, data }
const debugHeaders = R.take(5, headers)
const debugData = R.range(0, 13).map(_ => randomRow(debugHeaders))

const debugProps = { headers: debugHeaders, data: debugData }
const tenKData = createData(10000)

storiesOf('Flex Grid', module)
  .add('debug', () => (
    <Grid {...debugProps} isEditable={true} render={flexGridRenderer()} />
  ))
  .add('Broswer Scroll/No Scroll', () => (
    <Grid {...commonProps} render={flexGridRenderer()} />
  ))
  .add('Simple Scroll', () => (
    <Grid
      {...commonProps}
      render={flexGridRenderer({
        headerRowHeight: 60,
        width: 800,
        height: 400,
      })}
    />
  ))
  .add('Scroll with fixed col', () => (
    <Grid
      {...commonProps}
      render={flexGridRenderer({
        headerRowHeight: 60,
        width: 800,
        height: 400,
        autoFixColByKey: true,
      })}
    />
  ))
  .add('Customized Cell Renderer', () => (
    <Grid
      {...commonProps}
      render={flexGridRenderer({
        headerRowHeight: 60,
        width: 800,
        height: 400,
        autoFixColByKey: true,
        cellRenderer: redOn3X3Renderer,
      })}
    />
  ))
  .add('Customized Row Header Renderer', () => (
    <Grid
      {...commonProps}
      render={flexGridRenderer({
        headerRowHeight: 60,
        width: 800,
        height: 400,
        autoFixColByKey: true,
        colHeaderRenderer: splitColHeaderRenderer,
      })}
    />
  ))
  .add('Fuzzy Filter', () => (
    <FilterDemo {...commonProps} render={flexGridRenderer()} />
  ))
  .add('Scrolled Fixed col with paging', () => (
    <Grid
      {...commonProps}
      rowsPerPage={18}
      render={flexGridRenderer({
        headerRowHeight: 60,
        width: 800,
        height: 400,
        autoFixColByKey: true,
      })}
    />
  ))
  .add('No Scroll with paging', () => (
    <Grid {...commonProps} rowsPerPage={15} render={flexGridRenderer()} />
  ))
  .add('10k rows scroll paging', () => (
    <Grid
      headers={headers}
      data={tenKData}
      rowsPerPage={20}
      render={flexGridRenderer({
        headerRowHeight: 60,
        width: 800,
        height: 400,
        autoFixColByKey: true,
      })}
    />
  ))
  .add('10k rows non Scroll paging', () => (
    <Grid
      headers={headers}
      data={tenKData}
      rowsPerPage={15}
      render={flexGridRenderer()}
    />
  ))
  .add('Controlled Row Editor', () => <ControlledEditDemo {...commonProps} />)
