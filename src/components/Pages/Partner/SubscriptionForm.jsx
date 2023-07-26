import React, { Component } from 'react'
import gql from 'graphql-tag'
import { withRouter } from 'react-router-dom'
import { Query, withApollo } from 'react-apollo'
import Select from 'react-select'
import {
  Typography,
  Grid,
  withStyles,
  Divider,
  TextField,
  Button,
  IconButton,
  CircularProgress
} from '@material-ui/core'
import BackIcon from '@material-ui/icons/ArrowBack'
import Loader from '../../common/Loader'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'

const GET_BILLING_FREQUENCIES = gql`
  query getAllBillingFrequency($billingModeId: Int!) {
    billingFrequencies: getAllBillingFrequency(billingModeId: $billingModeId) {
      id
      frequency
      billingModeId
      numberOfMonths
    }
  }
`

const styles = theme => ({
  container: {
    padding: theme.spacing.unit * 2
  },

  formContainer: {
    marginTop: theme.spacing.unit * 2
  },

  dropdown: {
    maxWidth: '100%',
    width: 300
  }
})

const GET_OR_EDIT_SUBSCRIPTION = gql`
  mutation(
    $partnerLoginId: Int!
    $billingModeId: Int!
    $billingFrequencyId: Int!
    $gst: Float!
    $mmtc: Int!
    $noOfDevices: Int!
    $subscriptionId: Int
  ) {
    createPartnerSubscription(
      partnerLoginId: $partnerLoginId
      billingModeId: $billingModeId
      billingFrequencyId: $billingFrequencyId
      gst: $gst
      mmtc: $mmtc
      noOfDevices: $noOfDevices
      subscriptionId: $subscriptionId
    )
  }
`

class SubscriptionForm extends Component {
  state = {
    selectedBillingMode: null,
    selectedBillingFrequency: null,
    deviceRate: '',
    deviceQuantity: '',
    gst: '',
    totalAmount: '',
    formSaving: false
  }

  handleChange = e => {
    this.setState(
      {
        [e.target.name]: e.target.value
      },
      () => {
        if (this.state.deviceQuantity && this.state.deviceRate) {
          this.setState(({ deviceQuantity, deviceRate }) => ({
            totalAmount: deviceRate * deviceQuantity
          }))
        } else {
          this.setState({ totalAmount: '' })
        }
      }
    )
  }

  handleBillingFrequencyChange = billingFrequency => {
    this.setState({
      selectedBillingFrequency: billingFrequency.value
    })
  }

  handleBillingModeChange = billingMode => {
    this.setState(
      {
        selectedBillingMode: billingMode.value,
        selectedBillingFrequency: null
      },
      this.fetchBillingFrequencies
    )
  }

  handleSubmit = async e => {
    e.preventDefault()
    if (
      this.state.selectedBillingMode === null ||
      this.state.selectedBillingFrequency === null ||
      this.state.deviceQuantity === '' ||
      this.state.deviceRate === '' ||
      this.state.gst === ''
    ) {
      this.props.openSnackbar('Invalid form')
    } else {
      let variables = {
        partnerLoginId: parseInt(this.props.match.params.loginId, 10),
        billingModeId: parseInt(this.state.selectedBillingMode, 10),
        billingFrequencyId: parseInt(this.state.selectedBillingFrequency, 10),
        gst: parseFloat(this.state.gst),
        mmtc: parseInt(this.state.deviceRate, 10),
        noOfDevices: parseInt(this.state.deviceQuantity, 10)
      }

      if (this.props.location.state.subscriptionDetails) {
        variables.subscriptionId = parseInt(
          this.props.location.state.subscriptionDetails.id,
          10
        )
      }

      this.setState({
        formSaving: true
      })

      const { data } = await this.props.client.mutate({
        mutation: GET_OR_EDIT_SUBSCRIPTION,
        variables
      })

      this.setState({
        formSaving: false
      })

      if (data && data.createPartnerSubscription) {
        if (this.props.location.state.edit) {
          this.props.openSnackbar('Edited subscription successfully')
        } else {
          this.props.openSnackbar('Created subscription successfully')
        }

        this.props.history.goBack()
      } else {
        if (this.props.location.state.edit) {
          this.props.openSnackbar('Subscription edit failed')
        } else {
          this.props.openSnackbar('Subscription creation failed')
        }
      }
    }
  }

  fetchBillingFrequencies = async billingMode => {
    const { data } = await this.props.client.query({
      query: GET_BILLING_FREQUENCIES,
      variables: {
        billingModeId: billingMode || this.state.selectedBillingMode
      }
    })

    return new Promise(resolve => {
      this.setState(
        {
          billingFrequencies: data.billingFrequencies.map(billingFrequency => ({
            label: billingFrequency.frequency,
            value: billingFrequency.id
          }))
        },
        resolve
      )
    })
  }

  fillDetailsForEditMode = async subscriptionDetails => {
    await this.fetchBillingFrequencies(subscriptionDetails.selectedBillingMode)
    this.setState(subscriptionDetails)
  }

  componentDidMount() {
    if (this.props.location.state.subscriptionDetails) {
      const {
        id,
        ...subscriptionDetails
      } = this.props.location.state.subscriptionDetails

      this.fillDetailsForEditMode(subscriptionDetails)
    }
  }

  render() {
    const { classes } = this.props

    const formTitle = this.props.location.state.edit
      ? 'Edit Subscription'
      : 'Create Subscription'

    return (
      <Grid container className={classes.container}>
        <Grid item xs={12}>
          <Grid container alignItems="center">
            <Grid item>
              <IconButton onClick={this.props.history.goBack}>
                <BackIcon />
              </IconButton>
            </Grid>

            <Grid item>
              <Typography variant="title">{formTitle}</Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        <Grid item xs={12}>
          <form className={classes.formContainer} onSubmit={this.handleSubmit}>
            <Grid container spacing={32}>
              <Grid item xs={12}>
                <Select
                  clearable={false}
                  className={classes.dropdown}
                  options={this.props.billingModes}
                  onChange={this.handleBillingModeChange}
                  value={this.state.selectedBillingMode}
                  placeholder="Billing Mode*"
                />
              </Grid>

              <Grid item xs={12}>
                <Select
                  clearable={false}
                  className={classes.dropdown}
                  options={this.state.billingFrequencies}
                  onChange={this.handleBillingFrequencyChange}
                  value={this.state.selectedBillingFrequency}
                  placeholder="Billing Frequency*"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  placeholder="Device Quantity"
                  type="number"
                  value={this.state.deviceQuantity}
                  onChange={this.handleChange}
                  inputProps={{
                    name: 'deviceQuantity'
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  placeholder="Amount per Device"
                  type="number"
                  value={this.state.deviceRate}
                  onChange={this.handleChange}
                  inputProps={{
                    name: 'deviceRate'
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  placeholder="GST(%)"
                  type="number"
                  value={this.state.gst}
                  onChange={this.handleChange}
                  inputProps={{
                    name: 'gst'
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography>
                  Total Amount per month(excluding GST): &nbsp;
                  <b>{this.state.totalAmount || '--'}</b>
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="outlined"
                  disabled={this.state.formSaving}
                >
                  {this.state.formSaving ? (
                    <CircularProgress size={16} />
                  ) : (
                    'Submit'
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    )
  }
}

const WrappedSubscriptionForm = withStyles(styles)(
  withSharedSnackbar(withApollo(SubscriptionForm))
)

const GET_BILLING_MODES = gql`
  query {
    billingModes: getAllBillingMode {
      id
      billingMode
    }
  }
`

export default withRouter(props => {
  return (
    <Query query={GET_BILLING_MODES}>
      {({ loading, error, data, client }) => {
        if (loading) return <Loader fullscreen={true} />
        if (error) {
          return <Typography>Error Loading subscription form</Typography>
        }

        return (
          <WrappedSubscriptionForm
            {...props}
            client={client}
            billingModes={data.billingModes.map(billingMode => ({
              label: billingMode.billingMode,
              value: billingMode.id
            }))}
          />
        )
      }}
    </Query>
  )
})
