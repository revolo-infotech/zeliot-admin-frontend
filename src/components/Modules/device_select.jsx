import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit
  }
})

class DeviceSelect extends React.Component {
  state = {
    age: '',
    open: false
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  handleOpen = () => {
    this.setState({ open: true })
  }

  render() {
    const { classes } = this.props

    return (
      <form autoComplete="on">
        <FormControl className={classes.formControl}>
          <Select
            value={this.state.age}
            onChange={this.handleChange}
            displayEmpty
            name="age"
            fullWidth={true}
            className={classes.selectEmpty}
          >
            <MenuItem value="">
              <em>Select Device Type</em>
            </MenuItem>
            <MenuItem value={10}>TS101 Basic</MenuItem>
            <MenuItem value={20}>S101 </MenuItem>
            <MenuItem value={30}>Bharat 101</MenuItem>
            <MenuItem value={30}>TS101 Advanced</MenuItem>
          </Select>
        </FormControl>
      </form>
    )
  }
}

DeviceSelect.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(DeviceSelect)
