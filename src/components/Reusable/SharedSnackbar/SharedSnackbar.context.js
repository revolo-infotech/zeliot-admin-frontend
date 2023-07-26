import React, { Component } from 'react'
import SharedSnackbar from './SharedSnackbar.component'

const SharedSnackbarContext = React.createContext()

export class SharedSnackbarProvider extends Component {
  state = {
    isOpen: false,
    message: '',
    duration: 3000,
    verticalPosition: 'bottom',
    horizontalPosition: 'left',
    autoHide: true
  }

  openSnackbar = (message, options) => {
    let snackbarOptions = {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'left',
      autoHide: true
    }
    if (options) {
      snackbarOptions = options
    }
    this.setState({
      message,
      isOpen: true,
      ...snackbarOptions
    })
  }

  closeSnackbar = () => {
    this.setState({ isOpen: false })
  }

  render() {
    const { children } = this.props

    return (
      <SharedSnackbarContext.Provider
        value={{
          openSnackbar: this.openSnackbar,
          closeSnackbar: this.closeSnackbar,
          snackbarIsOpen: this.state.isOpen,
          message: this.state.message,
          duration: this.state.duration,
          verticalPosition: this.state.verticalPosition,
          horizontalPosition: this.state.horizontalPosition,
          autoHide: this.state.autoHide
        }}
      >
        <SharedSnackbar />
        {children}
      </SharedSnackbarContext.Provider>
    )
  }
}

export const SharedSnackbarConsumer = SharedSnackbarContext.Consumer
