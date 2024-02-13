import React from 'react'
// console.log(' ****inside context ******')
// console.log('test')
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
