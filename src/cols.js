const defaultProps = {
  editable: true,
  isKey: false,
  alignment: 'center',
  width: 100,
  sortable: true,
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

export const intCol = props => ({
  ...numCol(props),
  numFormat: '0',
})

export const dollarCol = props => ({
  ...numCol(props),
  numFormat: '$0,0.00',
})

export const pctCol = props => ({
  ...numCol(props),
  numFormat: '0.00%',
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
