import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import PropTypes from 'prop-types'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CustomerAutocomplete from '../../Modules/customer_autocomplete'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Divider from '@material-ui/core/Divider'
import DeviceSelect from '../../Modules/device_select'
import AccessorySelect from '../../Modules/accessory_select'
import SIMSelect from '../../Modules/sim_select'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import DeviceAccessoryList from '../../Modules/device_accessory_list'

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  }
})

class InventoryOutward extends React.Component {
  constructor(props) {
    super(props)
    this.classes = props
    this.state = {
      open: false
    }
  }

  openDeviceAccessoryList = e => {
    console.log('DialogOpen')
    this.setState({ open: true })
  }

  closeDeviceAccessoryList = e => {
    console.log('DialogOpen')
    this.setState({ open: false })
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <Grid container spacing={16} direction="row">
          <Grid item xs={12}>
            <Typography variant="title" gutterBottom>
              Assign Inventory
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <CustomerAutocomplete />
          </Grid>
          <Grid item container spacing={16} xs={12}>
            <Grid item xs={6}>
              <Paper>
                <div className={this.classes.demo}>
                  <List dense={true}>
                    <ListItem>
                      <ListItemText primary={'Address Line 1'} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={'Address Line 2'} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={'City'} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={'PIN Code'} />
                    </ListItem>
                  </List>
                </div>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper>
                <Table className={this.classes.table}>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography variant="subheading" gutterBottom>
                          Total Devices
                        </Typography>
                      </TableCell>
                      <TableCell numeric>
                        <Typography variant="title" gutterBottom>
                          121
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="subheading" gutterBottom>
                          Registered Devices
                        </Typography>
                      </TableCell>
                      <TableCell numeric>
                        <Typography variant="title" gutterBottom>
                          85
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="subheading" gutterBottom>
                          Unregistered Devices
                        </Typography>
                      </TableCell>
                      <TableCell numeric>
                        <Typography variant="title" gutterBottom>
                          36
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subheading"
                color="textSecondary"
                gutterBottom
              >
                Devices
              </Typography>
            </Grid>
            <Grid item container spacing={16} xs={12}>
              <Grid item xs={6}>
                <DeviceSelect />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  id="number"
                  type="number"
                  placeholder="Quantity"
                  className={this.classes.textField}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  className={this.classes.button}
                  fullWidth={true}
                  onClick={this.openDeviceAccessoryList}
                >
                  Choose Sl No
                </Button>
              </Grid>
              <Grid item xs={1}>
                <Button className={this.classes.button} margin="normal">
                  +
                </Button>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subheading"
                color="textSecondary"
                gutterBottom
              >
                Accessories
              </Typography>
            </Grid>
            <Divider inset />
            <Grid item container spacing={16} xs={12}>
              <Grid item xs={6}>
                <AccessorySelect />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  id="number"
                  type="number"
                  placeholder="Quantity"
                  className={this.classes.textField}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={this.openDeviceAccessoryList}
                  className={this.classes.button}
                  fullWidth={true}
                >
                  Choose Sl No
                </Button>
              </Grid>
              <Grid item xs={1}>
                <Button className={this.classes.button} margin="normal">
                  +
                </Button>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subheading"
                color="textSecondary"
                gutterBottom
              >
                SIM Cards
              </Typography>
            </Grid>
            <Divider inset />
            <Grid item container spacing={16} xs={12}>
              <Grid item xs={6}>
                <SIMSelect />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  id="number"
                  type="number"
                  placeholder="Quantity"
                  className={this.classes.textField}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={this.openDeviceAccessoryList}
                  className={this.classes.button}
                  fullWidth={true}
                >
                  Choose SIM No
                </Button>
              </Grid>
              <Grid item xs={1}>
                <Button className={this.classes.button} margin="normal">
                  +
                </Button>
              </Grid>
            </Grid>
            <Grid item container spacing={16} xs={12} alignItems="stretch">
              <Grid item xs={2}>
                <Button
                  variant="extendedFab"
                  aria-label="Delete"
                  className={this.classes.button}
                  color="primary"
                >
                  Assign
                </Button>
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="extendedFab"
                  aria-label="Delete"
                  className={this.classes.button}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <DeviceAccessoryList
            open={this.state.open}
            onClose={this.closeDeviceAccessoryList}
          />
        </Grid>
      </div>
    )
  }
}

InventoryOutward.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(style)(InventoryOutward)
