import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { Typography } from '@material-ui/core'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Divider from '@material-ui/core/Divider'
import { ApolloConsumer } from 'react-apollo'
import moment from 'moment'

const style = theme => ({
  textField: {
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    width: '100%'
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
      <Card className={classes.card} style={{ overflow: 'visible' }}>
        <CardContent>
          <Grid container spacing={16}>
            <Grid item container spacing={16}>
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
                  <i>Billing Date: </i>
                  {this.props.billingDate}
                </Typography>
              </Grid>
            </Grid>
            <Grid item container spacing={16}>
              <Grid item xs={4}>
                <Typography variant="subheading">
                  <i>Billing Logic: </i>
                  {this.props.billingLogic}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                {/* eslint-disable */}
                <Typography variant="subheading">
                  <i>Billing Started From: </i>
                  {this.props.billingStartedFrom === '0'
                    ? 'NA'
                    : moment
                        .unix(this.props.billingStartedFrom)
                        .format('DD/MM/YYYY')}
                  {/* eslint-enable */}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                {/* eslint-disable */}
                <Typography variant="subheading">
                  <i>Billing Upto: </i>
                  {this.props.billingPayTill === '0'
                    ? 'NA'
                    : moment
                        .unix(this.props.billingPayTill)
                        .format('DD/MM/YYYY')}
                </Typography>
                {/* eslint-enable */}
              </Grid>
            </Grid>
            <Grid item container spacing={16}>
              <Grid item xs={3}>
                <Typography variant="subheading">
                  <i>Total Quantity: </i>
                  {this.props.totalQuantity}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subheading">
                  <i>Amount per device: </i>
                  {this.props.totalAmount}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subheading">
                  <i>GST: </i>
                  {this.props.gstRate * 100}%
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subheading">
                  <i>Total Amount: </i>
                  {this.props.grandTotalAmount}
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item container spacing={16} alignItems="center">
              <Grid item xs={12}>
                <Typography variant="subheading">Devices</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2">
                  {this.props.deviceModel}
                </Typography>
              </Grid>
              <Grid item xs={1} />
              <Grid item xs={2}>
                <TextField
                  id="deviceQuantity"
                  label="Quantity"
                  className={classes.textField}
                  value={this.props.deviceQuantity}
                  onChange={this.props.handleChange('deviceQuantity')}
                  type="number"
                  margin="normal"
                />
              </Grid>
            </Grid>

            {/* Accessories */}
            {this.props.accessoryQuantity ? (
              <Grid item xs={12}>
                <Divider />
              </Grid>
            ) : null}
            {this.props.accessoryQuantity ? (
              <Grid item container spacing={16} alignItems="center">
                <Grid item xs={12}>
                  <Typography variant="subheading">Accessories</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">
                    {this.props.accessoryModel}
                  </Typography>
                </Grid>
                <Grid item xs={1} />
                <Grid item xs={2}>
                  <TextField
                    id="accessoryQuantity"
                    label="Quantity"
                    className={classes.textField}
                    value={this.props.accessoryQuantity}
                    onChange={this.props.handleChange('accessoryQuantity')}
                    type="number"
                    margin="normal"
                  />
                </Grid>
              </Grid>
            ) : null}

            {/* SIM Cards */}
            {this.props.simQuantity ? (
              <Grid item xs={12}>
                <Divider />
              </Grid>
            ) : null}
            {this.props.simQuantity ? (
              <Grid item container spacing={16} alignItems="center">
                <Grid item xs={12}>
                  <Typography variant="subheading">SIM Cards</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">{this.props.simModel}</Typography>
                </Grid>
                <Grid item xs={1} />
                <Grid item xs={2}>
                  <TextField
                    id="simQuantity"
                    label="Quantity"
                    placeholder="Quantity"
                    className={classes.textField}
                    value={this.props.simQuantity}
                    onChange={this.props.handleChange('simQuantity')}
                    type="number"
                    margin="normal"
                  />
                </Grid>
              </Grid>
            ) : null}
          </Grid>
        </CardContent>
      </Card>
    )
  }
}

SubscriptionDetails.PropTypes = {
  classes: PropTypes.object.isRequired
}

const withApolloClient = Component => props => (
  <ApolloConsumer>
    {client => <Component client={client} {...props} />}
  </ApolloConsumer>
)

export default withStyles(style)(withApolloClient(SubscriptionDetails))
