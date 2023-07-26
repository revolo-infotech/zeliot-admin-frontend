import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query, ApolloConsumer } from 'react-apollo'
import { Button, Typography } from '@material-ui/core'
import CustomerDetailsCard from '../../Modules/CustomerDetailsCard'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import ChipInput from 'material-ui-chip-input'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import TextField from '@material-ui/core/TextField'
import getLoginId from '../../../utils/getLoginId'

const GET_CLIENT = gql`
  query clientDetail($loginId: Int) {
    clientDetail(loginId: $loginId) {
      id
      clientName
      contactPerson
      address
      city
      state {
        zone_id
      }
      country {
        country_id
      }
      email
      contactNumber
      login {
        username
      }
      pincode
      panNumber
    }
  }
`

const GET_SUBSCRIPTION = gql`
  query getSubscriptions(
    $subscriptionId: Int
    $clientLoginId: Int
    $partnerLoginId: Int
  ) {
    getSubscriptions(
      id: $subscriptionId
      clientLoginId: $clientLoginId
      partnerLoginId: $partnerLoginId
    ) {
      deviceModel {
        model_name
      }
      accessoryType {
        accessoryName
      }
      serviceProvider {
        name
      }
      deviceModelId
      accessoryTypeId
      serviceProviderId
      unAssignedDeviceQuantity
      unAssignedSimQuantity
      unAssignedAccessoryQuantity
    }
  }
`

const VERIFY_DEVICE = gql`
  query checkDeviceAvailableForSubscription(
    $partnerLoginId: Int!
    $serial_num: Int!
    $deviceModelId: Int!
  ) {
    validation: checkDeviceAvailableForSubscription(
      partnerLoginId: $partnerLoginId
      serial_num: $serial_num
      deviceModelId: $deviceModelId
    ) {
      verification
      uniqueDeviceId
      remark
    }
  }
`

const VERIFY_SIM = gql`
  query checkSimAvailableForSubscription(
    $partnerLoginId: Int!
    $simNumber: String!
    $serviceProviderId: Int!
  ) {
    validation: checkSimAvailableForSubscription(
      partnerLoginId: $partnerLoginId
      simNumber: $simNumber
      serviceProviderId: $serviceProviderId
    ) {
      verification
      uniqueDeviceId
      remark
    }
  }
`

const VERIFY_ACCESSORY = gql`
  query checkAccessoryAvailableForSubscription(
    $partnerLoginId: Int!
    $serialNumber: Int!
    $accessoryTypeId: Int!
  ) {
    validation: checkAccessoryAvailableForSubscription(
      partnerLoginId: $partnerLoginId
      serialNumber: $serialNumber
      accessoryTypeId: $accessoryTypeId
    ) {
      verification
      uniqueAccessoryId
      remark
    }
  }
`

const SAVE_SUBSCRIPTION = gql`
  mutation setSubscriptionInventoryAssignment(
    $uniqueDeviceIdList: [uniqueDeviceIdListInput!]
    $uniqueAccessoryIdList: [uniqueAccessoryIdListInput!]
    $simIdList: [simIdListInput!]
    $deviceModelId: Int!
    $accessoryTypeId: Int
    $serviceProviderId: Int
    $unAssignedDeviceQuantity: Int!
    $unAssignedAccessoryQuantity: Int!
    $unAssignedSimQuantity: Int!
    $partnerLoginId: Int!
    $clientLoginId: Int!
    $subscriptionId: Int!
  ) {
    setSubscriptionInventoryAssignment(
      uniqueDeviceIdList: $uniqueDeviceIdList
      uniqueAccessoryIdList: $uniqueAccessoryIdList
      simIdList: $simIdList
      deviceModelId: $deviceModelId
      accessoryTypeId: $accessoryTypeId
      serviceProviderId: $serviceProviderId
      unAssignedDeviceQuantity: $unAssignedDeviceQuantity
      unAssignedAccessoryQuantity: $unAssignedAccessoryQuantity
      unAssignedSimQuantity: $unAssignedSimQuantity
      partnerLoginId: $partnerLoginId
      clientLoginId: $clientLoginId
      subscriptionId: $subscriptionId
    )
  }
`

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  input: {
    display: 'none'
  }
})

class AssignDevices extends Component {
  constructor(props) {
    super(props)
    this.loginId = this.props.match.params.loginId
    this.subscriptionId = this.props.match.params.subscriptionId
    this.backUrl = this.props.location.state.from
    this.state = {
      subscriptionDetails: [],
      serialNoDetails: { Devices: [], Accessories: [], SIMs: [] },
      uniqueIdDetails: { Devices: [], Accessories: [], SIMs: [] },
      errorText: { Devices: '', Accessories: '', SIMs: '' },
      isError: { Devices: false, Accessories: false, SIMs: false },
      deviceId: null,
      accessoryId: null,
      simId: null,
      deviceQuantity: null,
      accessoryQuantity: null,
      simQuantity: null
    }
  }

  validateChips = (type, modelId) => async chip => {
    var tempSerialNo = this.state.serialNoDetails
    var tempUniqueId = this.state.uniqueIdDetails
    var tempErrorStatus = this.state.errorText
    var tempIsError = this.state.isError

    if (tempSerialNo[type].indexOf(chip) === -1 && chip) {
      if (type === 'Devices') {
        const { data } = await this.props.client.query({
          query: VERIFY_DEVICE,
          variables: {
            serial_num: chip,
            deviceModelId: modelId,
            partnerLoginId: getLoginId()
          }
        })

        const validationStatus = data.validation

        if (validationStatus.verification === true) {
          tempSerialNo[type].push(chip)
          tempUniqueId[type].push(validationStatus.uniqueDeviceId)
          tempErrorStatus[type] = ''
          tempIsError[type] = false
        } else {
          tempErrorStatus[type] = validationStatus.remark
          tempIsError[type] = true
        }
      } else if (type === 'Accessories') {
        const { data } = await this.props.client.query({
          query: VERIFY_ACCESSORY,
          variables: {
            serialNumber: chip,
            accessoryTypeId: modelId,
            partnerLoginId: getLoginId()
          }
        })

        const validationStatus = data.validation

        if (validationStatus.verification === true) {
          tempSerialNo[type].push(chip)
          tempUniqueId[type].push(validationStatus.uniqueAccessoryId)
          tempErrorStatus[type] = ''
          tempIsError[type] = false
        } else {
          tempErrorStatus[type] = validationStatus.remark
          tempIsError[type] = true
        }
      } else if (type === 'SIMs') {
        const { data } = await this.props.client.query({
          query: VERIFY_SIM,
          variables: {
            simNumber: chip,
            serviceProviderId: modelId,
            partnerLoginId: getLoginId()
          }
        })

        const validationStatus = data.validation

        if (validationStatus.verification === true) {
          tempSerialNo[type].push(chip)
          tempUniqueId[type].push(validationStatus.uniqueDeviceId)
          tempErrorStatus[type] = ''
          tempIsError[type] = false
        } else {
          tempErrorStatus[type] = validationStatus.remark
          tempIsError[type] = true
        }
      }
    } else if (tempSerialNo[type].indexOf(chip) !== -1) {
      tempErrorStatus[type] = 'Already Added!'
      tempIsError[type] = true
    } else if (!chip) {
      tempErrorStatus[type] = 'Cannot Add Empty Chip!'
      tempIsError[type] = true
    }

    this.setState({
      serialNoDetails: tempSerialNo,
      uniqueIdDetails: tempUniqueId,
      errorText: tempErrorStatus,
      isError: tempIsError
    })
  }

  deleteChips = type => chip => {
    var tempSerialNo = this.state.serialNoDetails
    var tempUniqueId = this.state.uniqueIdDetails

    var index = tempSerialNo[type].indexOf(chip)
    tempSerialNo[type].splice(index, 1)
    tempUniqueId[type].splice(index, 1)

    this.setState({
      serialNoDetails: tempSerialNo,
      uniqueIdDetails: tempUniqueId
    })
  }

  handleCancelAssignment = e => {
    this.setState({
      serialNoDetails: { Devices: [], Accessories: [], SIMs: [] },
      uniqueIdDetails: { Devices: [], Accessories: [], SIMs: [] },
      errorText: { Devices: '', Accessories: '', SIMs: '' },
      isError: { Devices: false, Accessories: false, SIMs: false }
    })
  }

  handleSaveAssignment = async e => {
    var devices = []
    var accessories = []
    var sims = []

    var tempObject = {}

    if (this.state.uniqueIdDetails['Devices']) {
      this.state.uniqueIdDetails['Devices'].forEach(device => {
        tempObject = {}
        tempObject['uniqueDeviceId'] = device
        devices.push(tempObject)
      })
    }

    if (this.state.uniqueIdDetails['Accessories']) {
      this.state.uniqueIdDetails['Accessories'].forEach(accessory => {
        tempObject = {}
        tempObject['uniqueAccessoryId'] = accessory
        accessories.push(tempObject)
      })
    }

    if (this.state.uniqueIdDetails['SIMs']) {
      this.state.uniqueIdDetails['SIMs'].forEach(sim => {
        tempObject = {}
        tempObject['simId'] = sim
        sims.push(tempObject)
      })
    }

    await this.props.client.mutate({
      mutation: SAVE_SUBSCRIPTION,
      variables: {
        uniqueDeviceIdList: devices,
        uniqueAccessoryIdList: accessories,
        simIdList: sims,
        deviceModelId: this.state.deviceId,
        accessoryTypeId: this.state.accessoryId,
        serviceProviderId: this.state.simId,
        unAssignedDeviceQuantity:
          this.state.deviceQuantity -
          this.state.uniqueIdDetails['Devices'].length,
        unAssignedAccessoryQuantity:
          this.state.accessoryQuantity -
          this.state.uniqueIdDetails['Accessories'].length,
        unAssignedSimQuantity:
          this.state.simQuantity - this.state.uniqueIdDetails['SIMs'].length,
        partnerLoginId: getLoginId(),
        clientLoginId: this.loginId,
        subscriptionId: this.subscriptionId
      }
    })

    this.setState({
      serialNoDetails: { Devices: [], Accessories: [], SIMs: [] },
      uniqueIdDetails: { Devices: [], Accessories: [], SIMs: [] },
      errorText: { Devices: '', Accessories: '', SIMs: '' },
      isError: { Devices: false, Accessories: false, SIMs: false }
    })
  }

  handleReset = type => e => {
    var tempSerialNo = this.state.serialNoDetails
    var tempUniqueId = this.state.uniqueIdDetails
    var tempErrorStatus = this.state.errorText
    var tempIsError = this.state.isError

    tempSerialNo[type] = []
    tempUniqueId[type] = []
    tempErrorStatus[type] = ''
    tempIsError[type] = false

    this.setState({
      serialNoDetails: tempSerialNo,
      uniqueIdDetails: tempUniqueId,
      errorText: tempErrorStatus,
      isError: tempIsError
    })
  }

  getSubscriptions = async () => {
    const { data } = await this.props.client.query({
      query: GET_SUBSCRIPTION,
      variables: {
        subscriptionId: this.subscriptionId,
        loginId: this.loginId,
        partnerLoginId: getLoginId()
      }
    })

    // prepare the arrays you need to display device assignment card

    /* eslint-disable */
    var tempSubscriptionDetails = [
      { type: 'Devices', id: null, quantity: null, name: '' },
      { type: 'Accessories', id: null, quantity: null, name: '' },
      { type: 'SIMs', id: null, quantity: null, name: '' }
    ]
    /* eslint-enable */
    const tempSubscriptionObject = data.getSubscriptions
    var deviceId = null
    var deviceQuantity = null
    var accessoryQuantity = null
    var simQuantity = null
    var accessoryId = null
    var simId = null

    tempSubscriptionDetails.forEach(subscription => {
      if (subscription.type === 'Devices') {
        if (tempSubscriptionObject.deviceModelId !== null) {
          subscription.id = tempSubscriptionObject.deviceModelId
          subscription.quantity =
            tempSubscriptionObject.unAssignedDeviceQuantity
          subscription.name = tempSubscriptionObject.deviceModel.model_name
          deviceId = tempSubscriptionObject.deviceModelId
          deviceQuantity = tempSubscriptionObject.unAssignedDeviceQuantity
        }
      } else if (subscription.type === 'Accessories') {
        if (tempSubscriptionObject.accessoryTypeId !== null) {
          subscription.id = tempSubscriptionObject.accessoryTypeId
          subscription.quantity =
            tempSubscriptionObject.unAssignedAccessoryQuantity
          subscription.name = tempSubscriptionObject.accessoryType.accessoryName
          accessoryId = tempSubscriptionObject.accessoryTypeId
          accessoryQuantity = tempSubscriptionObject.unAssignedAccessoryQuantity
        }
      } else if (subscription.type === 'SIMs') {
        if (tempSubscriptionObject.serviceProviderId !== null) {
          subscription.id = tempSubscriptionObject.serviceProviderId
          subscription.quantity = tempSubscriptionObject.unAssignedSimQuantity

          subscription.name = tempSubscriptionObject.serviceProvider.name
          simId = tempSubscriptionObject.serviceProviderId
          simQuantity = tempSubscriptionObject.unAssignedSimQuantity
        }
      }
    })

    this.setState({
      subscriptionDetails: tempSubscriptionDetails,
      deviceId: deviceId,
      accessoryId: accessoryId,
      simId: simId,
      simQuantity: simQuantity,
      deviceQuantity: deviceQuantity,
      accessoryQuantity: accessoryQuantity
    })
  }

  componentDidMount() {
    this.getSubscriptions()
  }

  viewSubscription = e => {
    this.props.history.push({
      pathname: '/home/customers/view/' + this.loginId,
      state: {
        from: this.props.location.pathname
      }
    })
  }
  handleChange = name => event => {
    console.log('hello', name, event.target.value)
    this.setState({
      [name]: event.target.value
    })
  }
  render() {
    const { classes } = this.props
    return (
      <Query
        query={GET_CLIENT}
        variables={{
          loginId: this.loginId
        }}
      >
        {({ loading, error, data: { clientDetail } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`
          return (
            <div className={classes.root}>
              {/* Place back button */}
              <Grid container spacing={16} direction="row">
                <Grid item container spacing={16} direction="row">
                  <Grid item>
                    {/* TODO: Back button functionality */}
                    <Button
                      variant="outlined"
                      color="secondary"
                      className={classes.button}
                      // onClick={() => this.viewSubscription(this.backUrl)}
                      onClick={() => this.props.history.goBack()}
                      // href={'/home/customers/view/' + this.loginId}
                    >
                      <ArrowBackIcon className={classes.iconSmall} />
                    </Button>
                  </Grid>
                </Grid>

                {/* Place the customer details card */}
                <Grid item container spacing={16} direction="row">
                  <Grid item xs={12}>
                    <CustomerDetailsCard clientDetail={clientDetail} />
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subheading">
                    Assigned Inventory Details{' '}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      {/* {console.log('hhh', this.state.subscriptionDetails)} */}
                      {this.state.subscriptionDetails.map(inventoryDetail => {
                        return inventoryDetail.id !== null ? (
                          <Grid
                            item
                            container
                            spacing={16}
                            direction="row"
                            alignItems="center"
                          >
                            <Grid item xs={12}>
                              <Typography variant="subheading">
                                {inventoryDetail.type}
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Typography variant="body1">
                                <i>Model:</i>
                              </Typography>
                            </Grid>
                            <Grid item xs={2}>
                              <Typography variant="body2">
                                {inventoryDetail.name}
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Typography variant="body1">
                                <i>Quantity:</i>
                              </Typography>
                            </Grid>
                            <Grid item xs={1}>
                              <Typography variant="body2">
                                {inventoryDetail.quantity}
                              </Typography>
                            </Grid>
                            <Grid item xs={5}>
                              {
                                /* <ChipInput
                                fullWidth
                                label="Enter Serial Numbers followed by 'Enter' to check availability"
                                error={this.state.isError[inventoryDetail.type]}
                                helperText={
                                  this.state.errorText[inventoryDetail.type]
                                }
                                value={
                                  /* eslint-disable */
                                //     this.state.serialNoDetails[
                                //       inventoryDetail.type
                                //     ]
                                //     /* eslint-enable */
                                //   }
                                //   onDelete={this.deleteChips(
                                //     inventoryDetail.type
                                //   )}
                                //   onBeforeAdd={this.validateChips(
                                //     inventoryDetail.type,
                                //     inventoryDetail.id
                                //   )}
                                // />
                                <TextField
                                  fullWidth
                                  id="outlined-multiline-flexible"
                                  label="Enter Serial Number With Comma Seprate"
                                  multiline
                                  value={
                                    /* eslint-disable */
                                    this.state.serialNoDetails[
                                      inventoryDetail.type
                                    ]
                                    /* eslint-enable */
                                  }
                                  onChange={this.handleChange(
                                    /* eslint-disable */
                                    this.state.serialNoDetails[
                                      inventoryDetail.type
                                    ]
                                    /* eslint-enable */
                                  )}
                                  className={classes.textField}
                                  margin="normal"
                                  helperText={
                                    this.state.errorText[inventoryDetail.type]
                                  }
                                  error={
                                    this.state.isError[inventoryDetail.type]
                                  }
                                  variant="outlined"
                                />
                              }
                            </Grid>
                            <Grid item xs={1}>
                              <Button
                                variant="raised"
                                color="secondary"
                                className={classes.button}
                                onClick={this.handleReset(inventoryDetail.type)}
                              >
                                Validate
                              </Button>
                            </Grid>
                            &nbsp;
                            <Grid item xs={1}>
                              <Button
                                variant="raised"
                                color="primary"
                                className={classes.button}
                                onClick={this.handleReset(inventoryDetail.type)}
                              >
                                Reset
                              </Button>
                            </Grid>
                          </Grid>
                        ) : null
                      })}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item container spacing={16} justify="center">
                  <Grid item xs={2}>
                    <Button
                      color="primary"
                      variant="raised"
                      onClick={this.handleSaveAssignment}
                    >
                      Save
                    </Button>
                  </Grid>
                  <Grid item xs={2}>
                    <Button
                      color="secondary"
                      variant="raised"
                      onClick={this.handleCancelAssignment}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </div>
          )
        }}
      </Query>
    )
  }
}

AssignDevices.propTypes = {
  classes: PropTypes.object.isRequired
}

const withApolloClient = Component => props => (
  <ApolloConsumer>
    {client => <Component client={client} {...props} />}
  </ApolloConsumer>
)

export default withStyles(styles)(withApolloClient(AssignDevices))
