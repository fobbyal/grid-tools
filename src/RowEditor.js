import React from 'react'
import Overlay from './Overlay'
import { rawToValue, extractData } from './utils'
import R from 'ramda'

import renderContent from './renderRowEditorContent'
import { validate, isTypeValid, emptyValidations } from './validation-util'

const renderEditor = ({
  rowData,
  valueChanged,
  onOk,
  onCancel,
  initialFocusRef,
  isEditing,
  onClose,
  ...props
}) => {
  return (
    isEditing && (
      <Overlay onClose={onClose}>
        {renderContent()({
          ...props,
          rowData,
          valueChanged,
          onOk,
          onCancel,
          initialFocusRef,
        })}
      </Overlay>
    )
  )
}

// eslint-disable-next-line standard/object-curly-even-spacing
const createEditRow = ({ showAdd, headers, rowData /*, modifyNewData */ }) => {
  if (!rowData) return {}
  if (!showAdd) return rowData
  const newData = { ...rowData }
  headers.filter(h => h.isKey).forEach(h => (newData[h.ident] = null))
  return newData
}

const modifyRow = ({ header, value, rowData }) => {
  // console.log('editing row with raw info', header, value)
  const parsedValue = rawToValue({ value, header })
  // console.log('row editor parsed ', parsedValue)
  if (parsedValue !== undefined) {
    return header.dataSetter
      ? header.dataSetter({
          rowData,
          header,
          value: parsedValue,
        })
      : { ...rowData, [header.ident]: parsedValue }
  }
  return rowData
}

class RowEditor extends React.Component {
  state = {
    editedRow: createEditRow(this.props),
    validations: emptyValidations,
    startValidation: false,
  }

  valueChanged = editInfo =>
    this.setState(({ editedRow }) => {
      const rowData = modifyRow({ ...this.props, ...editInfo, rowData: editedRow })
      if (rowData !== editedRow) {
        if (this.state.startValidation) {
          const { validationSpec } = this.props
          const validations = validate({
            spec: validationSpec,
            data: rowData,
            editorProps: { ...this.props, extractData },
          })
          return { editedRow: rowData, validations }
        } else {
          return { editedRow: rowData }
        }
      }
    })

  runValidation = () => {
    const { validationSpec } = this.props
    const { editedRow } = this.state
    const validations = validate({
      spec: validationSpec,
      data: editedRow,
      editorProps: { ...this.props, extractData },
    })
    // console.log(validations)
    this.setState({ validations, startValidation: true })

    return validations.length === 0
  }

  // componentDidMount() {
  //   this.runValidation()
  // }
  // componentDidUpdate(prevProps, prevState) {
  //   if (this.props !== prevProps) this.runValidation()
  // }

  onOk = _e => {
    const { rowData, headers } = this.props
    const { editedRow } = this.state
    // const validations = validate({
    //   spec: validationSpec,
    //   data: rowData,
    //   editorProps: { ...this.props, extractData },
    // })
    // this.setState({ validations })
    // has validations
    if (!this.runValidation()) return

    if (rowData !== editedRow) {
      const removeDotsOnEditedNums = R.compose(
        R.reduce((a, b) => ({ ...a, ...b }), editedRow),
        R.map(([header, value]) => {
          const val = rawToValue({
            header,
            value: value.endsWith('-.')
              ? value.substr(0, value.length - 2)
              : value.substr(0, value.length - 1),
          })
          return header.dataSetter
            ? header.dataSetter({ rowData: editedRow, header, value: val })
            : { [header.ident]: val }
        }),
        R.filter(
          ([_, value]) => typeof value === 'string' && (value.endsWith('.') || value.endsWith('-'))
        ),
        R.map(header => [header, extractData({ rowData: editedRow, header })]),
        R.filter(
          header => extractData({ rowData, header }) !== extractData({ rowData: editedRow, header })
        ),
        R.filter(h => h.type === 'num')
      )
      const data = removeDotsOnEditedNums(headers)
      // console.log('normalized data is ', data)
      this.props.commitEdit({
        currentRow: this.props.showAdd ? undefined : this.props.rowData,
        editedRow: data,
      })
    } else {
      this.props.commitEdit({
        currentRow: this.props.showAdd ? undefined : this.props.rowData,
        editedRow: this.state.editedRow,
      })
    }
  }

  componentDidUpdate(prevProps, _prevState) {
    if (!prevProps.isEditing && this.props.isEditing) {
      if (this.focusNode) {
        if (this.focusNode) this.focusNode.focus()
        if (this.focusNode.setSelectionRange) {
          this.focusNode.setSelectionRange(0, this.focusNode.value.length)
        }
      }
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ startValidation: false, validations: [] })
    }
    if (this.props.rowData !== prevProps.rowData) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ editedRow: createEditRow(this.props) || {} })
    }
  }

  // componentWillReceiveProps(nextProps) {
  //   if (this.props.rowData !== nextProps.rowData) {
  //     this.setState({ editedRow: createEditRow(nextProps) || {} })
  //   }
  // }

  render() {
    const { render = renderEditor } = this.props
    const { validations } = this.state
    // console.log('passing down to row editor renderer',this.state.editedRow,this.state)
    //
    return render({
      ...this.props,
      rowData: this.state.editedRow,
      valueChanged: this.valueChanged,
      onOk: this.onOk,
      onCancel: this.props.onClose,
      initialFocusRef: n => (this.focusNode = n),
      isTypeValid,
      validations,
      extractData,
    })
  }
}

export default RowEditor
