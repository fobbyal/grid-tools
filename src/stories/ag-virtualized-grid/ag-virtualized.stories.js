import React from 'react'
import { storiesOf } from '@storybook/react'
import { createData, headers } from '../data'
// import R from 'ramda'
// import { CellInputEditor } from '../../Components'
import Grid, { strCol, intCol, numCol, virtualizedGridRenderer, GridToolContext } from '../../index'

const colSpecificData = [
  { a: 'abc', b: 'xddyz', c: 17, d: 101 },
  { a: 'opd', b: 'xyccz', c: 12, d: 75 },
  { a: 'abasdc', b: 'xvvyz', c: 12, d: 203 },
  { a: 'ass', b: 'vvv', c: 25, d: 23 },
  { a: 'aaabc', b: 'xyvvvz', c: 12, d: 26 },
  { a: 'abffc', b: 'xyznbn', c: 25, d: 105 },
]

const hour25Style = ({ data, rowIndex }) => {
  const val = data[rowIndex].c
  console.log(val)
  if (val === 25) {
    return { backgroundColor: 'lightblue' }
  } else {
    return {}
  }
}
const colSpecificHeaders = [
  strCol({
    ident: 'a',
    display: 'Unit',
    width: 180,
    isKey: true,
    formatCell: props => {
      const hour = hour25Style(props)
      return { backgroundColor: 'yellow', ...hour }
    },
  }),
  strCol({ ident: 'b', display: 'Fixed Gen', ellipsis: true, formatCell: hour25Style }),
  intCol({
    ident: 'c',
    display: 'HE',
    width: 40,
    isKey: true,
    numFormat: '0',
    formatCell: hour25Style,
  }),
  numCol({
    ident: 'd',
    display: 'Emer Min',
    width: 120,
    alignment: 'right',
    displayFormat: null,
    ellipsis: true,
    formatCell: ({ headers, data, rowIndex, columnIndex }) => {
      const val = data[rowIndex].d
      const hour = hour25Style({ headers, data, rowIndex, columnIndex })
      console.log(val)
      if (val > 100) {
        return { ...hour, backgroundColor: 'pink' }
      } else return hour
    },
  }),
]

const data = createData(200)
storiesOf('AG-Virtualized grid', module)
  .add('fix Row Editor', () => (
    <GridToolContext.Provider
      value={{
        columnHeaderProps: {
          backgroundColor: '#EFEFEF',
          color: '#3F4752',
          border: '1px solid #DADADA',
          fontSize: '12px',
          fontWeight: 500,
          headerRowHeight: 30,
          fontFamily: 'sans-serif',
        },
        rowContentProps: {
          color: '#0D0106',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DADADA',
          rowHeight: 30,
          fontSize: '12px',
          fontWeight: 400,
          fontFamily: 'sans-serif',
          paddingTop: '4px',
        },
        fixedColHead: {
          backgroundColor: '#EFEFEF',
          border: '1px solid #DADADA',
          color: '#0D0106',
          rowHeight: 30,
          fontSize: '12px',
          fontWeight: 400,
          fontFamily: 'sans-serif',
          paddingTop: '4px',
        },
        fixedColData: {
          backgroundColor: '#f2f2f2',
          border: '1px solid #DADADA',
          borderRadius: '12px 12px 0px 0px',
          color: '#0D0106',
          rowHeight: 30,
          fontFamily: 'sans-serif',
          fontSize: '12px',
          fontWeight: 400,
        },
      }}
    >
      <Grid
        isEditable={() => true}
        editMode="cell"
        data={data}
        headers={headers}
        render={virtualizedGridRenderer({
          autoFixColByKey: true,
        })}
      />
    </GridToolContext.Provider>
  ))
  .add('ngrid2', () => (
    <GridToolContext.Provider
      value={{
        columnHeaderProps: {
          backgroundColor: '#EFEFEF',
          color: '#3F4752',
          border: '1px solid #DADADA',
          fontSize: '12px',
          fontWeight: 500,
          headerRowHeight: 40,
        },
        rowContentProps: {
          color: '#0D0106',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DADADA',
          rowHeight: 40,
          fontSize: '14px',
          fontWeight: 400,
          paddingTop: '4px',
        },
        fixedColHead: {
          backgroundColor: '#EFEFEF',
          border: '1px solid #DADADA',
          color: '#0D0106',
          rowHeight: 30,
          fontSize: '12px',
          fontWeight: 500,
          paddingTop: '4px',
        },
        fixedColData: {
          backgroundColor: '#f2f2f2',
          border: '1px solid #DADADA',
          borderRadius: '12px 12px 0px 0px',
          color: '#0D0106',
          rowHeight: 30,
          fontSize: '14px',
          fontWeight: 400,
        },
      }}
    >
      <Grid
        isEditable={() => false}
        editMode="cell"
        data={data}
        headers={headers}
        render={virtualizedGridRenderer({
          // autoFixColByKey: true,
        })}
      />
    </GridToolContext.Provider>
  ))
  .add('ngrid3', () => (
    <GridToolContext.Provider
      value={{
        columnHeaderProps: {
          backgroundColor: '#EFEFEF',
          color: '#3F4752',
          border: '1px solid #DADADA',
          fontSize: '12px',
          fontWeight: 500,
          headerRowHeight: 40,
        },
        rowContentProps: {
          color: '#0D0106',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DADADA',
          rowHeight: 40,
          fontSize: '14px',
          fontWeight: 400,
          paddingTop: '4px',
        },
      }}
    >
      <Grid
        isEditable={() => true}
        editMode="cell"
        data={data}
        headers={headers}
        render={virtualizedGridRenderer({
          // autoFixColByKey: true,
        })}
      />
    </GridToolContext.Provider>
  ))
  .add('alt color non-fixed grid', () => (
    <GridToolContext.Provider
      value={{
        columnHeaderProps: {
          backgroundColor: '#EFEFEF',
          color: '#3F4752',
          border: '1px solid #DADADA',
          fontSize: '12px',
          fontWeight: 500,
          headerRowHeight: 40,
        },
        rowContentProps: {
          color: '#0D0106',
          border: '1px solid #cccc',
          rowHeight: 40,
          fontSize: '14px',
          fontWeight: 400,
          paddingTop: '4px',
        },
      }}
    >
      <Grid
        isEditable={() => true}
        editMode="cell"
        data={data}
        headers={headers}
        altBgColor="#d7d7e7"
        altBy={data => data.unitId}
        render={virtualizedGridRenderer({})}
      />
    </GridToolContext.Provider>
  ))
  .add('alt color non-fixed grid-2', () => (
    <GridToolContext.Provider
      value={{
        columnHeaderProps: {
          backgroundColor: '#EFEFEF',
          color: '#3F4752',
          border: '1px solid #DADADA',
          fontSize: '12px',
          fontWeight: 500,
          headerRowHeight: 40,
        },
        rowContentProps: {
          color: '#0D0106',
          border: '1px solid #cccc',
          rowHeight: 40,
          fontSize: '14px',
          fontWeight: 400,
          paddingTop: '4px',
        },
      }}
    >
      <Grid
        isEditable={() => true}
        editMode="cell"
        data={data}
        headers={headers}
        altBgColor="#d7d7e7"
        altBy={data => data.unitId}
        render={virtualizedGridRenderer({
          height: 700,
          width: 700,
        })}
      />
      {/* </GridToolContext.Provider> */}
    </GridToolContext.Provider>
  ))
  .add('columnStyle', () => (
    <GridToolContext.Provider
      value={{
        columnHeaderProps: {
          backgroundColor: '#EFEFEF',
          color: '#3F4752',
          border: '1px solid #DADADA',
          fontSize: '12px',
          fontWeight: 500,
          headerRowHeight: 30,
          fontFamily: 'sans-serif',
        },
        rowContentProps: {
          color: '#0D0106',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DADADA',
          rowHeight: 30,
          fontSize: '12px',
          fontWeight: 400,
          fontFamily: 'sans-serif',
          paddingTop: '4px',
        },
      }}
    >
      <Grid
        isEditable={() => true}
        editMode="cell"
        data={colSpecificData}
        headers={colSpecificHeaders}
        render={virtualizedGridRenderer({
          autoFixColByKey: true,
        })}
      />
    </GridToolContext.Provider>
  ))
  .add('columnStyle non-editable', () => (
    <GridToolContext.Provider
      value={{
        columnHeaderProps: {
          backgroundColor: '#EFEFEF',
          color: '#3F4752',
          border: '1px solid #DADADA',
          fontSize: '12px',
          fontWeight: 500,
          headerRowHeight: 30,
          fontFamily: 'sans-serif',
        },
        rowContentProps: {
          color: '#0D0106',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DADADA',
          rowHeight: 30,
          fontSize: '12px',
          fontWeight: 400,
          fontFamily: 'sans-serif',
          paddingTop: '4px',
        },
      }}
    >
      <Grid
        isEditable={() => false}
        editMode="cell"
        data={colSpecificData}
        headers={colSpecificHeaders}
        render={virtualizedGridRenderer({
          autoFixColByKey: true,
        })}
      />
    </GridToolContext.Provider>
  ))
  .add('with getRowStyle', () => (
    <GridToolContext.Provider
      value={{
        columnHeaderProps: {
          backgroundColor: '#EFEFEF',
          color: '#3F4752',
          border: '1px solid #DADADA',
          fontSize: '12px',
          fontWeight: 500,
          headerRowHeight: 30,
          fontFamily: 'sans-serif',
        },
        rowContentProps: {
          color: '#0D0106',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DADADA',
          rowHeight: 30,
          fontSize: '12px',
          fontWeight: 400,
          fontFamily: 'sans-serif',
          paddingTop: '4px',
        },
        fixedColHead: {
          backgroundColor: '#EFEFEF',
          border: '1px solid #DADADA',
          color: '#0D0106',
          rowHeight: 30,
          fontSize: '12px',
          fontWeight: 400,
          fontFamily: 'sans-serif',
          paddingTop: '4px',
        },
        fixedColData: {
          backgroundColor: '#f2f2f2',
          border: '1px solid #DADADA',
          borderRadius: '12px 12px 0px 0px',
          color: '#0D0106',
          rowHeight: 30,
          fontFamily: 'sans-serif',
          fontSize: '12px',
          fontWeight: 400,
        },
      }}
    >
      <Grid
        isEditable={() => true}
        editMode="cell"
        data={data}
        headers={headers}
        render={virtualizedGridRenderer({
          autoFixColByKey: true,
          getRowStyle: _ => ({ backgroundColor: 'green', color: 'white' }),
        })}
      />
    </GridToolContext.Provider>
  ))
  .add('without context', () => (
    <Grid
      isEditable={() => false}
      editMode="cell"
      data={data}
      headers={headers}
      render={virtualizedGridRenderer({
        autoFixColByKey: true,
      })}
    />
  ))
