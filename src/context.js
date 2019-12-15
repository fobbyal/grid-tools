import React from 'react'

const options = {
  debug: false,
  columnHeaderProps: { backgroundColor: "steelblue" }
}

const GridToolsContext = React.createContext(options)

export default GridToolsContext
