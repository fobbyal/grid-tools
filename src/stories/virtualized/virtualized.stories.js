import React from 'react'

import { storiesOf } from '@storybook/react'

import Grid, { virtualizedGridRenderer } from '../../index'

import { createData, headers } from '../data'

const data = createData(80)
storiesOf('Free edit grid', module).add('Basic', () => (
  <Grid data={data} headers={headers} render={virtualizedGridRenderer()} />
))
