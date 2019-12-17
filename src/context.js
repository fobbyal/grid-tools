import React from 'react'

const options = {
  debug: false,
  columnHeaderProps: { color: 'white', backgroundColor: 'steelblue', fontWeight: 'bold', fontSize: '0.85em' }
}

const GridToolsContext = React.createContext(options)

export default GridToolsContext
