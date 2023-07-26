import React from 'react'
import { SharedSnackbarConsumer } from '../../Reusable/SharedSnackbar/SharedSnackbar.context'

export default Component => props => (
  <SharedSnackbarConsumer>
    {({ openSnackbar }) => <Component openSnackbar={openSnackbar} {...props} />}
  </SharedSnackbarConsumer>
)
