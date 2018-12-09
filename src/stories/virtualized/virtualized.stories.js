import React from 'react'

import { storiesOf } from '@storybook/react'

import Grid, { virtualizedGridRenderer } from '../../index'

import { createData, headers } from '../data'

const data = createData(80)
storiesOf('Virtualized grid', module)
  .add('Basic', () => <Grid data={data} headers={headers} render={virtualizedGridRenderer()} />)
  .add('Fixed Col and Free edit', () => (
    <Grid
      isEditable={() => true}
      editMode="cell"
      data={data}
      headers={headers}
      altBgColor="red"
      altBy={data => data.unitId}
      render={virtualizedGridRenderer({ autoFixColByKey: true })}
    />
  ))
