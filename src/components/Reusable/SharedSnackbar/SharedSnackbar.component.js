import IconButton from '@material-ui/core/IconButton'
import Snackbar from '@material-ui/core/Snackbar'
import Close from '@material-ui/icons/Close'
import React from 'react'
import { SharedSnackbarConsumer } from './SharedSnackbar.context'

const SharedSnackbar = () => (
  <SharedSnackbarConsumer>
    {({
      snackbarIsOpen,
      message,
      closeSnackbar,
      duration,
      verticalPosition,
      horizontalPosition,
      autoHide
    }) => (
      <Snackbar
        anchorOrigin={{
          vertical: verticalPosition,
          horizontal: horizontalPosition
        }}
        open={snackbarIsOpen}
        autoHideDuration={autoHide ? duration : undefined}
        onClose={closeSnackbar}
        message={message}
        action={[
          <IconButton key="close" color="inherit" onClick={closeSnackbar}>
            <Close />
          </IconButton>
        ]}
      />
    )}
  </SharedSnackbarConsumer>
)

export default SharedSnackbar
