import React from 'react'
import PropTypes from 'prop-types'
import CircularProgress from '@material-ui/core/CircularProgress'
import FullScreenLoader from './FullScreenLoader.jsx'

const Loader = ({
  style,
  mergeStyle,
  fullscreen,
  showSpinner,
  spinnerSize
}) => {
  if (fullscreen) return <FullScreenLoader showSpinner={showSpinner} />

  const defaultLoaderStyle = {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }

  let loaderStyle = {}

  if (style) {
    if (mergeStyle) {
      loaderStyle = {
        ...defaultLoaderStyle,
        ...style
      }
    } else {
      loaderStyle = style
    }
  } else {
    loaderStyle = defaultLoaderStyle
  }

  const loader = showSpinner ? (
    <CircularProgress size={spinnerSize} />
  ) : (
    'Loading ...'
  )

  return (
    <div style={loaderStyle} id="1">
      {loader}
    </div>
  )
}

Loader.propTypes = {
  style: PropTypes.object,
  mergeStyle: PropTypes.bool,
  fullscreen: PropTypes.bool,
  showSpinner: PropTypes.bool,
  spinnerSize: PropTypes.number
}

Loader.defaultProps = {
  fullscreen: false,
  showSpinner: true,
  spinnerSize: 24
}

export default Loader
