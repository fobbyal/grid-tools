// import FreeEditGrid from './free-edit/FreeEditGrid'
import Grid from './Grid'
import flexGridRenderer, {
  Cell as FlexCell,
  ColHeader as FlexColHeader,
  defaultCellRenderer as defaultFlexCellRenderer,
  defaultColHeaderRenderer as defaultFlexColHeaderRenderer,
} from './flexRenderer'
import defaultRowEditorRenderer from './defaultRowEditorRenderer'

export * from './cols'

export {
  Grid,
  flexGridRenderer,
  FlexCell,
  FlexColHeader,
  defaultFlexCellRenderer,
  defaultFlexColHeaderRenderer,
  defaultRowEditorRenderer,
}
export default Grid
