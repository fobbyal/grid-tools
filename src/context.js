import React from 'react'

const options = {
  debug: false,
  columnHeaderProps: {
    color: 'white',
    backgroundColor: 'steelblue',
    border: '1px solid #DADADA',
    borderRadius: '12px 12px 0px 0px',
    headerRowHeight: 30,
    fontWeight: 'bold',
    fontSize: '12px',
    fontFamily: 'sans-serif',
    verticalAlign: 'baseline',
  },
  rowContentProps: {
    color: '#0D0106',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DADADA',
    paddingTop: '1px',
    rowHeight: 30,
    fontSize: '12px',
    fontWeight: 400,
    fontFamily: 'sans-serif',
    verticalAlign: 'baseline',
    justifyContent: 'center',
  },
  dropDownZIndex: 10000,
  fixedColHead: {
    backgroundColor: '#DADADA',
    border: '1px solid #DADADA',
    color: '#0D0106',
    rowHeight: 30,
    fontSize: '12px',
    fontWeight: 400,
    fontFamily: 'sans-serif',
    verticalAlign: 'baseline',
  },
  fixedColData: {
    backgroundColor: '#f2f2f2',
    border: '1px solid #DADADA',
    borderRadius: '12px 12px 0px 0px',
    color: '#0D0106',
    rowHeight: 30,
    fontSize: '12px',
    fontWeight: 400,
    fontFamily: 'sans-serif',
    verticalAlign: 'baseline',
  },
}

const GridToolsContext = React.createContext(options)

export default GridToolsContext
