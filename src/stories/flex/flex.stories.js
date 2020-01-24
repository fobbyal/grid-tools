import React, { useState } from 'react'

import { storiesOf } from '@storybook/react'
// import { action } from '@storybook/addon-actions'
// import { linkTo } from '@storybook/addon-links'
import R from 'ramda'
import { createData, headers, randomRow } from '../data'
import ControlledEditDemo from './ControlledEditDemo'
import CellEditDemo from './CellEditDemo'

import Grid, {
  flexGridRenderer,
  FlexCell,
  FlexColHeader,
  defaultFlexCellRenderer,
  defaultFlexColHeaderRenderer,
  createControlledEditProps,
  GridToolContext,
} from '../../index'
import FilterDemo from './FilterDemo'

// const createRow = _ => randomRow(headers)

// const createData = R.compose(R.map(createRow), R.range(0))

/*   grid code starts here */

const data = createData(80)

const redOn3X3Renderer = props => {
  const { rowIndex, columnIndex, width, height, data, header } = props
  if (rowIndex === 3 && columnIndex === 3) {
    return (
      <FlexCell
        style={{ position: 'relative' }}
        color="red"
        fontSize=".8em"
        fontWeight="bold"
        width={width}
        height={height}
      >
        ${data[rowIndex][header.ident]}
        <div
          style={{
            position: 'absolute',
            top: '0px',
            right: '0px',
            width: '10px',
            height: '10px',
            backgroundColor: 'blue',
          }}
        />
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
const debugData = R.range(0, 5).map(_ => randomRow(debugHeaders))

const debugProps = { headers: debugHeaders, data: debugData }
const tenKData = createData(10000)

const OnEditCopyPasteDemo = () => {
  const [data, setData] = useState(debugData)

  const processEdit = ({ editedRow, originalRow }) => d =>
    d.map(row => (row === originalRow ? editedRow : row))

  return (
    <GridToolContext.Provider
      value={{ debug: true, columnHeaderProps: { backgroundColor: 'green' } }}
    >
      <Grid
        data={data}
        headers={debugHeaders}
        isEditable
        editMode="cell"
        {...createControlledEditProps({ data, setData, processEdit })}
        render={flexGridRenderer({
          headerRowHeight: 60,
          width: 1100,
          height: 400,
          autoFixColByKey: true,
        })}
      />
    </GridToolContext.Provider>
  )
}

storiesOf('Flex Grid', module)
  .add('debug', () => (
    <Grid
      {...debugProps}
      isEditable
      render={flexGridRenderer({
        headerRowHeight: 60,
        width: 1100,
        height: 400,
        autoFixColByKey: true,
      })}
    />
  ))
  .add('On Edit Copy & Paste', () => <OnEditCopyPasteDemo />)
  .add('Browser Scroll/No Scroll', () => <Grid {...commonProps} render={flexGridRenderer()} />)
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
    <FilterDemo headers={headers} data={tenKData} rowsPerPage={15} render={flexGridRenderer()} />
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

  .add('10k rows scroll with alt rows', () => (
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
      altBgColor="red"
      altBy={data => data.unitId}
    />
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
    <Grid headers={headers} data={tenKData} rowsPerPage={15} render={flexGridRenderer()} />
  ))
  .add('Controlled Row Editor', () => <ControlledEditDemo {...commonProps} controlled />)
  .add('Un-Controlled Row Editor', () => <ControlledEditDemo {...commonProps} />)
  .add('Free Edit', () => <CellEditDemo {...debugProps} />)
  .add('No Data Render', () => (
    <Grid
      headers={headers}
      data={[]}
      isEditable
      render={flexGridRenderer({
        headerRowHeight: 60,
        width: 1100,
        height: 400,
        autoFixColByKey: true,
      })}
    />
  ))
  .add('hide No Data Render', () => (
    <Grid
      headers={headers}
      data={[]}
      isEditable
      render={flexGridRenderer({
        headerRowHeight: 60,
        width: 1100,
        height: 400,
        autoFixColByKey: true,
        noDataRender: null,
      })}
    />
  ))
