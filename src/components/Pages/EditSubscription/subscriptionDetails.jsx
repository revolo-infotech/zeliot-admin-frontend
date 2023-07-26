import React, { Component, Fragment } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Divider from '@material-ui/core/Divider'
import { withApollo } from 'react-apollo'
import moment from 'moment'

const style = theme => ({
  card: {
    overflow: 'visible'
  },
  root: {
    padding: theme.spacing.unit * 2,
    flexGrow: 1
  },
  input: {
    display: 'flex',
    padding: 0
  }
})

class SubscriptionDetails extends Component {
  render() {
    const { classes } = this.props
    return (
      <Card className={classes.card}>
        <CardHeader title="Subscription Details" />
        <CardContent>
          <Grid container spacing={16}>
            <Grid item container alignItems="center">
              <Grid item xs={4}>
                <Typography variant="subheading">
                  <i>Billing Mode: </i>
                  {this.props.billingMode}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subheading">
                  <i>Billing Frequency: </i>
                  {this.props.billingFrequency}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subheading">
                  <i>Next Payment Date: </i>
                  {this.props.nextPaymentDate === '0'
                    ? 'NA'
                    : moment
                      .unix(parseInt(this.props.nextPaymentDate, 10))
                      .format('DD/MM/YYYY')}
                </Typography>
              </Grid>
            </Grid>
            <Grid item container alignItems="center">
              <Grid item xs={4}>
                <Typography variant="subheading">
                  <i>Total Quantity: </i>
                  {this.props.totalQuantity}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="totalAmount"
                  label="Amount"
                  value={this.props.totalAmount}
                  onChange={this.props.handleChange('totalAmount')}
                  type="number"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subheading">
                  <i>Total Amount: </i>
                  {this.props.grandTotalAmount}
                </Typography>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item container alignItems="center">
              <Grid item xs={12}>
                <Typography variant="subheading">Devices</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">
                  {this.props.deviceModel}
                </Typography>
              </Grid>
              <Grid item>
                <TextField
                  id="deviceQuantity"
                  label="Quantity"
                  value={this.props.deviceQuantity}
                  onChange={this.props.handleChange('deviceQuantity')}
                  type="number"
                  margin="normal"
                />
              </Grid>
            </Grid>

            {/* Accessories */}
            {this.props.accessoryQuantity ? (
              <Fragment>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item container alignItems="center">
                  <Grid item xs={12}>
                    <Typography variant="subheading">Accessories</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2">
                      {this.props.accessoryModel}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <TextField
                      id="accessoryQuantity"
                      label="Quantity"
                      value={this.props.accessoryQuantity}
                      onChange={this.props.handleChange('accessoryQuantity')}
                      type="number"
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </Fragment>
            ) : null}

            {/* SIM Cards */}
            {this.props.simQuantity ? (
              <Fragment>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item container alignItems="center">
                  <Grid item xs={12}>
                    <Typography variant="subheading">SIM Cards</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2">
                      {this.props.simModel}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <TextField
                      id="simQuantity"
                      label="Quantity"
                      placeholder="Quantity"
                      value={this.props.simQuantity}
                      onChange={this.props.handleChange('simQuantity')}
                      type="number"
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </Fragment>
            ) : null}
          </Grid>
        </CardContent>
        <CardActions>
          <Button
            color="secondary"
            variant="raised"
            onClick={this.props.handleUpdateClick}
          >
            Update
          </Button>
          <Button color="secondary" onClick={this.props.handleCancelClick}>
            Cancel
          </Button>
        </CardActions>
      </Card>
    )
  }
}

SubscriptionDetails.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(style)(withApollo(SubscriptionDetails))
