# Grid Tools

This library contians a setup of tools to help React developers to easily create grids for tabula data.

## Basic Usage

## Props

## GridRenders

### FLex Renderer

### Virtualized Renderer

# Notes

- About data-row-index, data-column-index
- Comparator -- not finished yet.. currenlty cannot handle mapped values unitId/unitName
- DataGetter
- Ref - Ref can be assigned to grid to access various methods like `setSelectedRect` to set selection in grid. Refer story `Custom Selection Range` to see the actual usage
- Copy Helper

## DataGetter

currenlty data getter signature is `({rowData, header })`. Due to the fact that the data can be filtered and or sorted there is no way to identify the data using rowIndex. This results the lib to be less flexible as `({data,rowIndex,columnIndex})`. Data needs to be converted into simple array of objects format when using the libraray. Ways will be considered later to refactor so that a core version of Grid can be used for more flexible data shapes.

Things to consider (transposing the data)

## Header Shape

```javascript
{
  ident: 'COLNAME',
  type: 'str',
  editable: true,
  isKey: false,
  alignment: 'center',
  width: 100,
  sortable: true,
  //numFormat:
  //dateFormat:
  //
}
```
