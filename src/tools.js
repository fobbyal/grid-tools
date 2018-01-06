import moment from 'moment'
import numeral from 'numeral'

export const rawToValue = ({
  value,
  header: { type, numFormat, dataFormat, displayFormat },
}) => {
  console.log('value is ', value)
  // TODO: timezone issue
  if (moment.isMoment(value)) {
    return value.format(dataFormat)
  }
  if (moment.isDate(value)) {
    return moment(value).format(dataFormat)
  }
  if (type === 'num' && typeof value === 'string') {
    return numeral(value).value()
  }
  if (type === 'bool' && typeof value === 'string') {
    return [value.toLowerCase()].map(
      v => v === 'y' || v === 'yes' || v === 'true'
    )[0]
  }
  return value
}
