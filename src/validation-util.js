import R from 'ramda'
export const emptyValidations = []
export const validate = ({ spec, editorProps, data }) => {
  if (spec) {
    const customValidations = R.compose(
      R.filter(v => v !== null),
      R.map(v => (v.test(data) ? v : null))
    )(spec)
    //add default valiations basically number as number + and key cannot be nulls
    return customValidations
  }
  return emptyValidations
}

export const clearValidations = ({ validations, type }) =>
  R.filter(v => v.type !== type, validations)

export const isTypeValid = ({ validations, type }) =>
  R.isNil(R.find(v => v.type === type, validations))

/* eslint-disable*/
export const validEmailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
