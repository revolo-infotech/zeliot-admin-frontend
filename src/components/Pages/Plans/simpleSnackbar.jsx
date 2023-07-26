import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

const styles = theme => ({
  close: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4
  }
})

class SimpleSnackbar extends React.Component {
  state = {
    open: false
  }

  handleClick = () => this.props.handleSubmit()

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    this.setState({ open: false })
  }

  render() {
    return (
      <div>
        <Button
          onClick={this.props.handleSubmit}
          color="secondary"
          variant="contained"
        >
          Submit
        </Button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Button onClick={this.props.handleCancel} color="secondary">
          Cancel
        </Button>
      </div>
    )
  }
}

SimpleSnackbar.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(SimpleSnackbar)
