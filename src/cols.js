const defaultProps = {
  editable: true,
  isKey: false,
  alignment: 'center',
  width: 80,
}

// numearls display is here
export const numCol = (
  { ident, display, numFormat = '0.00', ...rest } = { numFormat: '0.00' }
) => ({
  ident,
  display: display || ident,
  type: 'num',
  numFormat,
  ...defaultProps,
  ...rest,
})

export const strCol = ({ ident, display, ...rest } = {}) => ({
  ident,
  display: display || ident,
  type: 'str',
  ...defaultProps,
  ...rest,
})

export const boolCol = ({ ident, display, ...rest } = {}) => ({
  ident,
  display: display || ident,
  type: 'bool',
  ...defaultProps,
  ...rest,
})

export const selCol = ({
  ident,
  display,
  // TODO: add selection options here. think of instances that may require restful service
  ...rest
}) => ({
  ident,
  display: display || ident,
  type: 'sel',
  ...defaultProps,
  ...rest,
})
