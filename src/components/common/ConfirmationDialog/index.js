import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'

export default function ConfirmationalDialog(props) {
  const {
    isDialogOpen,
    dialogTitle,
    dialogMessage,
    positiveResponseButtonText,
    negativeResponseButtonText,
    positiveResponseHandler,
    negativeResponseHandler,
    dialogCloseHandler
  } = props

  return (
    <Dialog
      open={isDialogOpen}
      onEscapeKeyDown={dialogCloseHandler || negativeResponseHandler}
      onBackdropClick={dialogCloseHandler || negativeResponseHandler}
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText>{dialogMessage}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={negativeResponseHandler}>
          {negativeResponseButtonText}
        </Button>
        <Button color="secondary" onClick={positiveResponseHandler}>
          {positiveResponseButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

ConfirmationalDialog.defaultProps = {
  dialogTitle: 'Confirmation',
  dialogMessage: 'Are you sure you want to continue?',
  negativeResponseButtonText: 'No',
  positiveResponseButtonText: 'Yes'
}

ConfirmationalDialog.propTypes = {
  isDialogOpen: PropTypes.bool.isRequired,
  dialogTitle: PropTypes.string,
  dialogMessage: PropTypes.string,
  positiveResponseButtonText: PropTypes.string,
  negativeResponseButtonText: PropTypes.string,
  positiveResponseHandler: PropTypes.func.isRequired,
  negativeResponseHandler: PropTypes.func.isRequired,
  dialogCloseHandler: PropTypes.func
}
