import React from 'react'

import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
// import { linkTo } from '@storybook/addon-links'
import R from 'ramda'
import { strCol, numCol, boolCol, selCol } from '../cols'
import { randomRow } from './data'

import Grid, {
  flexGridRenderer,
  FlexCell,
  FlexColHeader,
  defaultFlexCellRenderer,
  defaultFlexColHeaderRenderer,
} from '../index'

const createRow = _ => randomRow(headers)

const createData = R.compose(R.map(createRow), R.range(1))

/* prettier-ignore */
const headers = [
  strCol({ ident: 'unitId', display: 'Unit', width:180,isKey:true }),
  numCol({ ident: 'he', display: 'HE', width: 40,isKey:true }),
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

const data = createData(80)

const redOn3X3Renderer = props => {
  const { rowIndex, columnIndex, width, height, data, header } = props
  if (rowIndex == 3 && columnIndex == 3) {
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

storiesOf('Flex Grid', module)
  .add('Scroll', () => (
    <Grid
      render={flexGridRenderer({
        headers,
        data,
      })}
    />
  ))
  .add('Simple Scroll', () => (
    <Grid
      render={flexGridRenderer({
        headers,
        data,
        headerRowHeight: 60,
        width: 800,
        height: 400,
      })}
    />
  ))
  .add('Scroll with fixed col', () => (
    <Grid
      render={flexGridRenderer({
        headers,
        data,
        headerRowHeight: 60,
        width: 800,
        height: 400,
        autoFixColByKey: true,
      })}
    />
  ))
  .add('Customized Cell Renderer', () => (
    <Grid
      render={flexGridRenderer({
        headers,
        data,
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
      render={flexGridRenderer({
        headers,
        data,
        headerRowHeight: 60,
        width: 800,
        height: 400,
        autoFixColByKey: true,
        colHeaderRenderer: splitColHeaderRenderer,
      })}
    />
  ))
