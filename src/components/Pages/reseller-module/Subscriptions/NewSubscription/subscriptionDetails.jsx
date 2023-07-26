import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { Typography } from '@material-ui/core'
import Select from 'react-select'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Divider from '@material-ui/core/Divider'
import gql from 'graphql-tag'
import { Query, ApolloConsumer } from 'react-apollo'
import { DatePicker } from 'material-ui-pickers'
import getLoginId from '../../../../../utils/getLoginId'

const GET_BILLING_MODE = gql`
  query {
    billingMode: getAllBillingMode {
      id
      billingMode
    }
  }
`
// const GET_DEVICE_MODELS = gql`
//   query {
//     deviceModel: allDeviceModels {
//       id
//       model_name
//     }
//   }
// `

const GET_DEVICE_MODELS = gql`
  query getResellerDeviceStockByDeviceModel($resellerLoginId: Int!) {
    deviceModel: getResellerDeviceStockByDeviceModel(
      resellerLoginId: $resellerLoginId
    ) {
      deviceModelId
      modelName
    }
  }
`

const GET_ACCESSORY = gql`
  query {
    accessoryDetails: getAllAccessoryTypes {
      id
      accessoryName
    }
  }
`
const GET_SIM_PROVIDER = gql`
  query {
    simDetails: allServiceProviders {
      id
      name
    }
  }
`

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
      <Query
        query={GET_BILLING_MODE}
        variables={{
          resellerLoginId: getLoginId()
        }}
      >
        {({ loading, error, data: { billingMode } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`

          const billingModes = billingMode.map(billingMode => ({
            value: billingMode.id,
            label: billingMode.billingMode
          }))

          return (
            <Query
              query={GET_DEVICE_MODELS}
              variables={{
                resellerLoginId: getLoginId()
              }}
            >
              {({ loading, error, data: { deviceModel } }) => {
                if (loading) return 'Loading...'
                if (error) return `Error!: ${error}`

                const deviceModels = deviceModel.map(deviceModel => ({
                  value: deviceModel.deviceModelId,
                  label: deviceModel.modelName
                }))

                return (
                  <Query query={GET_ACCESSORY}>
                    {({ loading, error, data: { accessoryDetails } }) => {
                      if (loading) return 'Loading...'
                      if (error) return `Error!: ${error}`

                      return (
                        <Query query={GET_SIM_PROVIDER}>
                          {({ loading, error, data: { simDetails } }) => {
                            if (loading) return 'Loading...'
                            if (error) return `Error!: ${error}`

                            const simProviders = simDetails.map(simDetails => ({
                              value: simDetails.id,
                              label: simDetails.name
                            }))
                            return (
                              <Card
                                className={classes.card}
                                style={{ overflow: 'visible' }}
                              >
                                <CardContent>
                                  <Grid container spacing={16}>
                                    <Grid
                                      item
                                      container
                                      spacing={16}
                                      alignItems="center"
                                    >
                                      <Grid item xs={4}>
                                        <Select
                                          classes={classes}
                                          options={billingModes}
                                          value={this.props.billingMode}
                                          onChange={this.props.handleSelectBillingModeChange(
                                            'billingMode'
                                          )}
                                          placeholder="Billing Mode *"
                                        />
                                      </Grid>
                                      <Grid item xs={4}>
                                        <Select
                                          classes={classes}
                                          options={
                                            this.props.billingFrequencies
                                          }
                                          value={this.props.billingFrequency}
                                          onChange={this.props.handleSelectChange(
                                            'billingFrequency'
                                          )}
                                          placeholder="Billing Frequency *"
                                        />
                                      </Grid>
                                      <Grid item xs={4}>
                                        <Select
                                          classes={classes}
                                          options={this.props.billingDates}
                                          value={this.props.billingDate}
                                          onChange={this.props.handleSelectChange(
                                            'billingDate'
                                          )}
                                          placeholder="Billing Day *"
                                        />
                                      </Grid>
                                    </Grid>
                                    <Grid
                                      item
                                      container
                                      spacing={16}
                                      alignItems="center"
                                    >
                                      <Grid item xs={4}>
                                        <Select
                                          classes={classes}
                                          options={this.props.billingLogics}
                                          value={this.props.billingLogic}
                                          onChange={this.props.handleSelectChange(
                                            'billingLogic'
                                          )}
                                          placeholder="Billing Logic *"
                                        />
                                      </Grid>
                                      <Grid item xs={4}>
                                        <Typography variant="caption">
                                          Billing From
                                        </Typography>
                                        <DatePicker
                                          value={
                                            this.props.billingStartFrom.date
                                          }
                                          onChange={this.props.handleDateChange(
                                            'billingStartFrom'
                                          )}
                                        />
                                      </Grid>
                                      <Grid item xs={4}>
                                        <Typography variant="caption">
                                          Billing Upto
                                        </Typography>
                                        <DatePicker
                                          value={this.props.billingPayTill.date}
                                          onChange={this.props.handleDateChange(
                                            'billingPayTill'
                                          )}
                                        />
                                      </Grid>
                                    </Grid>
                                    <Grid
                                      container
                                      spacing={16}
                                      alignItems="center"
                                    >
                                      <Grid item xs={3}>
                                        <TextField
                                          id="quantity"
                                          label="Quantity *"
                                          value={this.props.totalQuantity}
                                          onChange={this.props.handleChange(
                                            'totalQuantity'
                                          )}
                                          type="number"
                                          className={classes.textField}
                                          margin="normal"
                                        />
                                      </Grid>
                                      <Grid item xs={3}>
                                        <TextField
                                          id="amount"
                                          label="Amount per device *"
                                          className={classes.textField}
                                          value={this.props.totalAmount}
                                          onChange={this.props.handleChange(
                                            'totalAmount'
                                          )}
                                          margin="normal"
                                        />
                                      </Grid>
                                      <Grid item xs={3}>
                                        <Select
                                          classes={classes}
                                          options={this.props.gstRates}
                                          value={this.props.gstRate}
                                          onChange={this.props.handleSelectChange(
                                            'gstRate'
                                          )}
                                          placeholder="Gst Rate *"
                                        />
                                      </Grid>
                                      <Grid item xs={3}>
                                        <Typography variant="body1">
                                          Total Amount:{' '}
                                        </Typography>
                                        <Typography variant="body2">
                                          {this.props.grandTotalAmount}
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Divider />
                                    </Grid>
                                    <Grid
                                      container
                                      spacing={8}
                                      alignItems="center"
                                    >
                                      <Grid item xs={12}>
                                        <Typography variant="body1">
                                          Devices
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={3}>
                                        <Select
                                          classes={classes}
                                          options={deviceModels}
                                          value={this.props.deviceModel}
                                          onChange={this.props.handleSelectChange(
                                            'deviceModel'
                                          )}
                                          placeholder="Select Model *"
                                        />
                                      </Grid>
                                      <Grid item xs={1} />
                                      <Grid item xs={2}>
                                        <TextField
                                          id="deviceQuantity"
                                          label="Quantity *"
                                          className={classes.textField}
                                          value={this.props.deviceQuantity}
                                          onChange={this.props.handleChange(
                                            'deviceQuantity'
                                          )}
                                          type="number"
                                          margin="normal"
                                        />
                                      </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Divider />
                                    </Grid>
                                    {/* <Grid
                                      container
                                      spacing={8}
                                      alignItems="center"
                                    >
                                      <Grid item xs={12}>
                                        <Typography variant="body1">
                                          Accessories
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={3}>
                                        <Select
                                          classes={classes}
                                          options={accessoryModels}
                                          value={this.props.accessoryModel}
                                          onChange={this.props.handleSelectChange(
                                            'accessoryModel'
                                          )}
                                          placeholder="Select Type"
                                        />
                                      </Grid>
                                      <Grid item xs={1} />
                                      <Grid item xs={2}>
                                        <TextField
                                          id="accessoryQuantity"
                                          label="Quantity"
                                          className={classes.textField}
                                          value={this.props.accessoryQuantity}
                                          onChange={this.props.handleChange(
                                            'accessoryQuantity'
                                          )}
                                          type="number"
                                          margin="normal"
                                        />
                                      </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Divider />
                                    </Grid> */}
                                    <Grid
                                      container
                                      spacing={8}
                                      alignItems="center"
                                    >
                                      <Grid item xs={12}>
                                        <Typography variant="body1">
                                          SIM Cards
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={3}>
                                        <Select
                                          classes={classes}
                                          options={simProviders}
                                          value={this.props.simModel}
                                          onChange={this.props.handleSelectChange(
                                            'simModel'
                                          )}
                                          placeholder="Select Provider"
                                        />
                                      </Grid>
                                      <Grid item xs={1} />
                                      <Grid item xs={2}>
                                        <TextField
                                          id="simQuantity"
                                          label="Quantity"
                                          className={classes.textField}
                                          value={this.props.simQuantity}
                                          onChange={this.props.handleChange(
                                            'simQuantity'
                                          )}
                                          type="number"
                                          margin="normal"
                                        />
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </CardContent>
                              </Card>
                            )
                          }}
                        </Query>
                      )
                    }}
                  </Query>
                )
              }}
            </Query>
          )
        }}
      </Query>
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
