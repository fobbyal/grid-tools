import R from 'ramda'
export const emptyValidations = []

// {
//   test: ({ mode, userName }) =>
//     mode === 'new' && (R.isNil(userName) || R.isEmpty(userName)),
//   type: 'userName',
//   text: 'User Name must be entered',
// },

const requiredData = ({ extractData }) => data => header => {
  const required = header.isKey || header.isRequired
  const inputData = extractData({ header, rowData: data })
  const notEntered = R.isNil(inputData) || R.isEmpty(inputData)
  return required && notEntered
    ? { text: header.display + ' must be entered', type: header.ident }
    : undefined
}

export const validate = ({ spec, editorProps, data = {} }) => {
  const { headers } = editorProps
  const defaultValidation = R.compose(
    R.filter(v => !R.isNil(v)),
    R.map(requiredData(editorProps)(data))
  )(headers)

  if (spec) {
    const customValidations = R.compose(
      R.filter(v => v !== null),
      R.map(v => (v.test(data) ? v : null))
    )(spec)
    // add default valiations basically number as number + and key cannot be nulls
    return [...defaultValidation, ...customValidations]
  }
  return defaultValidation.length === 0 ? emptyValidations : defaultValidation
}

export const clearValidations = ({ validations, type }) =>
  R.filter(v => v.type !== type, validations)

export const isTypeValid = ({ validations, type }) =>
  R.isNil(R.find(v => v.type === type, validations))

/* eslint-disable*/
export const validEmailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
