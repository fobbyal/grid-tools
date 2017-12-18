const defaultProps = {
  editable: true,
  isKey: false,
  alignment: 'center',
  width: 80,
}


//numearls display is here
export const numCol = (
  { ident, display, numFormat = '0.00', ...rest } = { numFormat: '0.00' }
) => ({
  ident,
  display: ident || display,
  type: 'num',
  numFormat,
  ...defaultProps,
  ...rest,
})

export const strCol = ({ ident, display, ...rest } = {}) => ({
  ident,
  display: ident || display,
  type: 'str',
  ...defaultProps,
  ...rest,
})

export const boolCol = ({ ident, display, ...rest } = {}) => ({
  ident,
  display: ident || display,
  type: 'bool',
  ...defaultProps,
  ...rest,
})

export const selCol = (
  props = {
    ident,
    display,
    //TODO: add selection options here. think of instances that may require restful service
    renderer: defaultRenderer,
    ...rest,
  }
) => ({
  ident,
  display: ident || display,
  type: 'sel',
  ...defaultProps,
  ...rest,
  renderer,
})
