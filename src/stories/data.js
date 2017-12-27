import Chance from 'chance'
import R from 'ramda'

const chance = new Chance()
//* test helpers
export const randomRow = R.compose(
  R.fromPairs,
  R.map(({ ident, type }) => {
    if (ident === 'commitStatusOvr')
      return [ident, chance.pickone(['UNA', 'ECO', 'EMER', 'MUST'])]
    if (ident === 'he') return [ident, chance.integer({ min: 1, max: 24 })]
    switch (type) {
      case 'str':
      case 'sel':
        return [ident, chance.word()]
      case 'num':
        return [ident, chance.floating({ fixed: 2, min: 0, max: 50000 })]
      case 'bool':
        return [ident, chance.bool()]
    }
  })
)

