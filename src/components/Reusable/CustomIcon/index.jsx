import React from 'react'
import PropTypes from 'prop-types'

export default function CustomIcon(props) {
  return (
    <img
      src={props.src}
      width={props.width || '24px'}
      height={props.height || '24px'}
      alt={props.alt || 'Icon'}
    />
  )
}

CustomIcon.propTypes = {
  src: PropTypes.string.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
  alt: PropTypes.string
}
