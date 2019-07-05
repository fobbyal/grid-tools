import { sumWidth, sumHeight } from './utils'
import R from 'ramda'

const splitFixedCols = (numOfFixedCols, headers) => ({
  rowHeaders: R.take(numOfFixedCols, headers),
  dataHeaders: R.drop(numOfFixedCols, headers),
})

const countKeyCols = R.compose(
  l => l.length,
  R.takeWhile(h => h.isKey)
)

const computeGridViewProps = ({
  headers,
  data,
  rowHeight,
  width,
  height,
  scrollBarWidthAdjustment = 17,
  scrollBarHeightAdjustment = 17,
  //  fixedScrollHeightAdjustment = 6,
  borderSize = 1,
  fixedColCount,
  autoFixColByKey,
  headerRowHeight,
  hasPaging,
  pagerHeight,
}) => {
  const rawDataWidth = sumWidth(headers)
  const rawDataHeight = sumHeight({ data, rowHeight })
  const normalizedWidth = R.isNil(width) ? rawDataWidth : R.min(width, rawDataWidth)

  /* do not scroll when we can fit everything */
  const scroll =
    width && height && headerRowHeight && (width < rawDataWidth || height < rawDataHeight)
  const scrollX = scroll && width < rawDataWidth
  const scrollY = scroll && height < rawDataHeight
  const numOfFixedCols = !scrollX ? 0 : autoFixColByKey ? countKeyCols(headers) : fixedColCount

  const { rowHeaders, dataHeaders } = splitFixedCols(numOfFixedCols, headers)

  const containerWidth =
    normalizedWidth + (headers.length - 1) * borderSize + (scrollY ? scrollBarWidthAdjustment : 0)

  const scrollPaneHeight =
    numOfFixedCols > 0 && scrollX ? height + 5 + scrollBarHeightAdjustment : height + 5

  const fixedPaneHeight = height

  // TODO: min of rawDataHeight or specified width
  const containerHeight = R.isNil(height)
    ? undefined
    : height + (scroll ? scrollBarHeightAdjustment : 0) + (hasPaging ? pagerHeight : 0)

  const hasFixedCols = numOfFixedCols > 0

  return {
    scroll,
    scrollX,
    scrollY,
    numOfFixedCols,
    rowHeaders,
    dataHeaders,
    containerWidth,
    scrollPaneHeight,
    fixedPaneHeight,
    containerHeight,
    hasFixedCols,
    fixedHeaderWidth: sumWidth(rowHeaders),
    contentViewPortWidth: hasFixedCols
      ? containerWidth - sumWidth(rowHeaders)
      : scroll
      ? containerWidth
      : null,
    totalWidth: sumWidth(headers),
  }
}
export default computeGridViewProps
