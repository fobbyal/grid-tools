import React from 'react'
console.log(' ****inside context ******')
const emptyPropGetter = () => {}
// import { createContext } from 'react-broadcast'
const { Provider, Consumer } = React.createContext({
  getColumnHeaderProps: emptyPropGetter,
  getRowProps: emptyPropGetter,
  getCellProps: emptyPropGetter,
  getContainerProps: emptyPropGetter,
  getPagerProps: emptyPropGetter,
  getRowEditorProps: emptyPropGetter,
  headers: [],
  data: [],
})

export { Provider, Consumer }
