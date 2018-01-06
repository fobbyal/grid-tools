import moment from 'moment'
import R from 'ramda'
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

export const yesNoCol = ({ ident, display, ...rest } = {}) => ({
  ident,
  display: display || ident,
  type: 'bool',
  ...defaultProps,
  ...rest,
})

export const dateCol = ({
  ident,
  display,
  dataFormat = 'YYYY-MM-DD',
  displayFormat = 'MM/DD/YYYY',
  ...rest
} = {}) => ({
  ident,
  display: display || ident,
  type: 'date-time',
  dataFormat,
  displayFormat,
  dataGetter: ({ rowData }) =>
    R.isNil(rowData[ident])
      ? undefined
      : moment(rowData[ident], dataFormat).format(displayFormat),
  sortIndexGetter: ({ rowData }) =>
    R.isNil(rowData[ident])
      ? undefined
      : moment(rowData[ident], dataFormat).valueOf(),
  ...defaultProps,
  ...rest,
})

export const dateTimeCol = ({
  ident,
  display,
  dataFormat = 'YYYY-MM-DD[T]HH:mm:ss',
  displayFormat = 'MM/DD/YYYY HH:mm:ss',
  ...rest
} = {}) => ({
  ident,
  display: display || ident,
  type: 'date-time',
  dataFormat,
  displayFormat,
  dataGetter: ({ rowData }) =>
    R.isNil(rowData[ident])
      ? undefined
      : moment(rowData[ident], dataFormat).format(displayFormat),
  sortIndexGetter: ({ rowData }) =>
    R.isNil(rowData[ident])
      ? undefined
      : moment(rowData[ident], dataFormat).valueOf(),
  ...defaultProps,
  ...rest,
})

export const tStampCol = ({
  ident,
  display,
  dataFormat = 'YYYY-MM-DD[T]HH:mm:ss.SSSZ',
  displayFormat = 'MM/DD/YYYY HH:mm:ss.SSSZ',
  ...rest
} = {}) => ({
  ident,
  display: display || ident,
  type: 'date-time',
  dataFormat,
  displayFormat,
  dataGetter: ({ rowData }) =>
    R.isNil(rowData[ident])
      ? undefined
      : moment(rowData[ident], dataFormat).format(displayFormat),
  sortIndexGetter: ({ rowData }) =>
    R.isNil(rowData[ident])
      ? undefined
      : moment(rowData[ident], dataFormat).valueOf(),
  ...defaultProps,
  ...rest,
})
