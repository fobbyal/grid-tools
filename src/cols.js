import moment from 'moment'
import R from 'ramda'
import { extractData } from './utils'
const defaultProps = {
  editable: true,
  isKey: false,
  alignment: 'center',
  width: 100,
  sortable: true,
  showInRowEditor: true,
}

export const multiValidator = ({ validators, exitOnFirstInvalid = false }) => props => {
  const errors = []
  for (const validator of validators) {
    const errMessage = validator(props)
    if (errMessage) {
      errors.push(errMessage)
      if (exitOnFirstInvalid) break
    }
  }
  if (errors.length > 0) return errors.reduce((e1, e2) => `${e1}\n${e2}`)
}

export const numberValidator = ({ value }) => value && isNaN(value) && 'Invalid Number'

export const intValidator = ({ value }) =>
  value && (isNaN(value) || !Number.isInteger(+value)) && 'Invalid Integer'

export const dateValidator = ({ value, header }) =>
  value && !moment(value, header.dataFormat).isValid() && 'Invalid Date'

// numearls display is here
export const numCol = (
  { ident, display, displayFormat = '0.00', ...rest } = {
    displayFormat: '0.00',
  }
) => ({
  ident,
  display: display || ident,
  type: 'num',
  displayFormat,
  setInvalidMessage: numberValidator,
  ...defaultProps,
  ...rest,
})

export const intCol = props => ({
  ...numCol(props),
  setInvalidMessage: intValidator,
  displayFormat: '0',
})

export const dollarCol = props => ({
  ...numCol(props),
  displayFormat: '$0,0.00',
})

export const pctCol = props => ({
  ...numCol(props),
  displayFormat: '0.00%',
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

// eslint-disable-next-line standard/object-curly-even-spacing
const dateProps = ({ /* ident, */ dataFormat, displayFormat }) => ({
  sortIndexGetter: ({ rowData, header }) => {
    const data = extractData({ rowData, header, dataFormat })
    return R.isNil(data)
      ? undefined
      : moment.isDate(data) || moment.isMoment(data)
      ? data.valueOf()
      : moment(data, dataFormat).valueOf()
  },
  dataFormat,
  displayFormat,
  setInvalidMessage: dateValidator,
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
  ...dateProps({ ident, dataFormat, displayFormat }),
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
  ...dateProps({ ident, dataFormat, displayFormat }),
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
  ...dateProps({ ident, dataFormat, displayFormat }),
  ...defaultProps,
  ...rest,
})
