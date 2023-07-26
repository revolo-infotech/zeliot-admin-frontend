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

class AccessorySelect extends React.Component {
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
            className={classes.selectEmpty}
          >
            <MenuItem value="">
              <em>Select Accessory Type</em>
            </MenuItem>
            <MenuItem value={10}>Fuel Probe</MenuItem>
            <MenuItem value={20}>Panic Button</MenuItem>
            <MenuItem value={30}>Immobilizer</MenuItem>
          </Select>
        </FormControl>
      </form>
    )
  }
}

AccessorySelect.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(AccessorySelect)
