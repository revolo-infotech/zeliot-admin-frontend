import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import Grid from '@material-ui/core/Grid'
// import ButtonBase from '@material-ui/core/ButtonBase'
import Typography from '@material-ui/core/Typography'
import CardHeader from '@material-ui/core/CardHeader'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import CardContent from '@material-ui/core/CardContent'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Button from '@material-ui/core/Button'
import moment from 'moment'

const GET_SUBSCRIPTION = gql`
  query getResellerSubscriptions($subcriptionid: Int) {
    subscription: getResellerSubscriptions(id: $subcriptionid) {
      id
      client {
        loginId
        clientName
      }
      billingMode {
        billingMode
      }
      billingFrequency {
        frequency
      }
      deviceQuantity

      amount
      createdAt
      unAssignedDeviceQuantity
    }
  }
`
const styles = theme => ({
  card: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary,
    width: '100%'
  },
  buttonBase: {
    width: '100%',
    textAlign: 'left'
  }
})

class SubscriptionDetails extends Component {
  constructor(props) {
    super(props)
    this.subscriptionId = this.props.subscriptionId
    this.clientLoginId = this.props.clientLoginId
    this.viewVehicles = this.props.viewVehicles
  }

  assignDevice = () => {
    // console.log('subscriptionId', this.subscriptionId)
    // console.log('this.clientId', this.clientLoginId)
    // this.clientLoginId = 16
    this.props.history.push({
      pathname:
        '/home/reseller/subscriptions/assign/' +
        this.clientLoginId +
        '/' +
        this.subscriptionId
    })
  }

  getFormattedDate = timestamp =>
    moment(timestamp * 1000).format('MMM Do YYYY, h:mm a')

  render() {
    const { classes } = this.props
    return (
      <Query
        query={GET_SUBSCRIPTION} // TODO: Change Query
        variables={{
          subcriptionid: parseInt(this.subscriptionId, 10)
        }}
      >
        {({ loading, error, data: { subscription } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`
          return (
            // <ButtonBase
            //   className={classes.buttonBase}
            //   // onClick={this.props.showSubscription(this.props.subscriptionId)}
            //   // disabled={this.props.isDisabled}
            // >
            <Card className={classes.card} raised="true">
              <CardHeader
                action={
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                }
                title={subscription.billingFrequency.frequency}
                // subheader={subscription.createdAt}
                subheader={this.getFormattedDate(subscription.createdAt)}
              />
              <CardContent>
                <Grid container spacing={16} alignItems="center">
                  <Grid item>
                    <Typography variant="body2">Quantity:</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body1">
                      {subscription.deviceQuantity}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2">Amount:</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body1">
                      {subscription.amount + ' /-'}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2">
                      Un-assigned Quantity
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body1">
                      {subscription.unAssignedDeviceQuantity}
                    </Typography>
                  </Grid>
                  {this.viewVehicles && (
                    <Grid item>
                      <Typography variant="body1">
                        <Button
                          color="primary"
                          variant="outlined"
                          onClick={this.props.showSubscription(
                            this.props.subscriptionId
                          )}
                        >
                          View Vehicles
                        </Button>
                      </Typography>
                    </Grid>
                  )}
                </Grid>
                <Grid container spacing={16} alignItems="center">
                  <Grid item>
                    <Typography variant="body2">Bill Date:</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body1">
                      {/* {subscription.createdAt} */}
                      {this.getFormattedDate(subscription.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2">Bill Mode:</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body1">
                      {subscription.billingMode.billingMode}
                    </Typography>
                  </Grid>
                  {subscription.unAssignedDeviceQuantity > 0 && (
                    // console.log('propsubid:', this.props.subscriptionId)
                    <Grid item xs={2}>
                      <Typography variant="body1">
                        <Button
                          color="primary"
                          variant="outlined"
                          // onClick={this.assignDevice}
                          onClick={() => this.assignDevice(this.backUrl)}
                        >
                          Assign Device
                        </Button>
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )
        }}
      </Query>
    )
  }
}

SubscriptionDetails.PropTypes = {
  classes: PropTypes.object.isRequired
}

export default withRouter(withStyles(styles)(SubscriptionDetails))
