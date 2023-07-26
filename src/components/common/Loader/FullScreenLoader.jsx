import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'

const FullScreenLoader = ({ showSpinner }) => (
  <Grid
    container
    alignItems="center"
    justify="center"
    style={{ height: '100vh', width: '100%' }}
  >
    <Grid item>
      {showSpinner ? <CircularProgress size={100} /> : 'Loading ...'}
    </Grid>
  </Grid>
)

FullScreenLoader.propTypes = {
  showSpinner: PropTypes.bool
}

FullScreenLoader.defaultProps = {
  showSpinner: true
}

export default FullScreenLoader
