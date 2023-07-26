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
const VERIFY_DEVICE = gql`
  query checkDeviceAvailableForSubscription(
    $partnerLoginId: Int!
    $serial_num: [DeviceListInput!]!
    $deviceModelId: Int!
  ) {
    validation: checkDeviceAvailableForSubscription(
      partnerLoginId: $partnerLoginId
      deviceList: $serial_num
      deviceModelId: $deviceModelId
    ) {
      serial_num
      uniqueDeviceId
    }
  }
`
const VERIFY_SIM = gql`
  query checkSimAvailableForSubscription(
    $partnerLoginId: Int!
    $simNumber: [SimListInput!]!
    $serviceProviderId: Int!
  ) {
    validation: checkSimAvailableForSubscription(
      partnerLoginId: $partnerLoginId
      simList: $simNumber
      serviceProviderId: $serviceProviderId
    ) {
      simNumber
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
        manufacturer {
          manufacturerCode
        }
      }
      accessoryType {
        accessoryName
        manufacturer {
          manufacturerCode
        }
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
const VERIFY_ACCESSORY = gql`
  query checkAccessoryAvailableForSubscription(
    $partnerLoginId: Int!
    $serialNumber: [AccessoryListInput!]!
    $accessoryTypeId: Int!
  ) {
    validation: checkAccessoryAvailableForSubscription(
      partnerLoginId: $partnerLoginId
      serialNumberList: $serialNumber
      accessoryTypeId: $accessoryTypeId
    ) {
      serialNumber
      uniqueAccessoryId
    }
  }
`

const SAVE_SUBSCRIPTION = gql`
  mutation setSubscriptionInventoryAssignment(
    $uniqueDeviceIdList: [uniqueDeviceIdListInput!]
    $uniqueAccessoryIdList: [uniqueAccessoryIdListInput!]
    $simIdList: [simListInput!]
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
      simList: $simIdList
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
class AssignLicenses extends Component {
  constructor(props) {
    super(props)
    this.loginId = this.props.match.params.loginId
    this.subscriptionId = this.props.match.params.subscriptionId
    this.state = {
      deviceSerialNo: '',
      deviceUniqueNo: '',
      deviceModelId: '',
      deviceModelName: '',
      deviceQuantity: '',
      manufacturerCode: '',
      duplicateDeviceList: '',
      simSerialNo: '',
      simProviderName: '',
      simProviderId: '',
      simQuantity: '',
      duplicateSimList: '',
      accessorySerialNo: '',
      accessoryType: '',
      accessoryTypeId: null,
      accessoryQuantity: '',
      accManufacturerCode: '',
      deviceStatus: true,
      simStatus: true,
      accessoryStatus: true
      // assignedDeviceList: null,
      // assignedAccessoryList: null,
      // assignedSimList: null
    }
  }
  getSubscriptions = async () => {
    const { data } = await this.props.client.query({
      query: GET_SUBSCRIPTION,
      variables: {
        subscriptionId: this.subscriptionId,
        loginId: this.loginId,
        partnerLoginId: getLoginId()
      },
      fetchPolicy: 'network-only'
    })
    // console.log('sub=', data)
    if (data.getSubscriptions.unAssignedDeviceQuantity > 0) {
      this.setState({
        deviceStatus: false
      })
    } else {
      this.setState({
        simStatus: false,
        accssoryStatus: false
      })
    }
    this.setState({
      deviceModelName: data.getSubscriptions.deviceModel.model_name,
      deviceQuantity: data.getSubscriptions.unAssignedDeviceQuantity,
      deviceModelId: data.getSubscriptions.deviceModelId,
      manufacturerCode:
        data.getSubscriptions.deviceModel.manufacturer.manufacturerCode
    })
    if (data.getSubscriptions.accessoryType !== null) {
      this.setState({
        accessoryType: data.getSubscriptions.accessoryType.accessoryName,
        accessoryTypeId: data.getSubscriptions.accessoryTypeId,
        accessoryQuantity: data.getSubscriptions.unAssignedAccessoryQuantity,
        accManufacturerCode:
          data.getSubscriptions.accessoryType.manufacturer.manufacturerCode
      })
    }
    if (data.getSubscriptions.serviceProvider !== null) {
      this.setState({
        simProviderName: data.getSubscriptions.serviceProvider.name,
        // simProviderId: data.getSubscriptions.serviceProvider.id,
        simProviderId: data.getSubscriptions.serviceProviderId,
        simQuantity: data.getSubscriptions.unAssignedSimQuantity
      })
    }
    // console.log(
    //   this.state.deviceStatus,
    //   this.state.simStatus,
    //   this.state.accessoryStatus
    // )
  }

  componentDidMount() {
    this.getSubscriptions()
  }
  handleDeviceValidate = type => async () => {
    let deviceArr = this.state.deviceSerialNo.split(',')

    let tempArr = []

    deviceArr.forEach(serialno => {
      let temp = {}
      temp.serial_num = serialno
      temp.uniqueDeviceId = this.state.manufacturerCode + '_' + serialno
      tempArr.push(temp)
    })
    // console.log('tempArr', tempArr)
    const { data } = await this.props.client.query({
      query: VERIFY_DEVICE,
      variables: {
        serial_num: tempArr,
        deviceModelId: this.state.deviceModelId,
        partnerLoginId: getLoginId()
      }
    })
    // console.log(data)
    let response = ''
    Object.values(data.validation).map(
      res => (response = response + ',' + res['serial_num'])
    )
    // console.log(
    //   'input=',
    //   deviceArr.length,
    //   'devqty=',
    //   this.state.deviceQuantity
    // )
    if (deviceArr.length > this.state.deviceQuantity) {
      this.setState({
        duplicateDeviceList:
          'You can not assign devices more than requested quantity'
      })
    } else {
      this.setState({ duplicateDeviceList: response })
    }

    if (
      data.validation.length === 0 &&
      deviceArr.length !== 0 &&
      deviceArr.length <= this.state.deviceQuantity
    ) {
      this.setState({ deviceStatus: true })
    }
  }
  handleSimValidate = type => async () => {
    let simArr = this.state.simSerialNo.split(',')

    let tempArr = []
    if (simArr.length > 0) {
      simArr.forEach(serialno => {
        let temp = {}
        temp.simNumber = serialno

        tempArr.push(temp)
      })
      // console.log('tempArr', tempArr)
      const { data } = await this.props.client.query({
        query: VERIFY_SIM,
        variables: {
          simNumber: tempArr,
          serviceProviderId: this.state.simProviderId,
          partnerLoginId: getLoginId()
        }
      })
      // console.log(data)
      let response = ''
      Object.values(data.validation).map(
        res => (response = response + ',' + res['simNumber'])
      )
      if (simArr.length > this.state.simQuantity) {
        this.setState({
          duplicateSimList:
            'You can not assign sim more than requested quantity'
        })
      } else {
        this.setState({ duplicateSimList: response })
      }
      // console.log('Sim=', data.validation.length, simArr.length)

      if (
        data.validation.length === 0 &&
        simArr.length !== 0 &&
        simArr.length <= this.state.simQuantity
      ) {
        this.setState({ simStatus: true })
      }
    }
    // console.log('device', this.state.simStatus)
  }
  handleAccessoryValidate = type => async () => {
    let accArr = this.state.accessorySerialNo.split(',')

    let tempArr = []

    if (accArr.length > 0) {
      accArr.forEach(serialno => {
        let temp = {}
        temp.serialNumber = serialno
        temp.uniqueAccessoryId = this.state.accManufacturerCode + '_' + serialno
        tempArr.push(temp)
      })
      // console.log('tempArr', tempArr)
      const { data } = await this.props.client.query({
        query: VERIFY_ACCESSORY,
        variables: {
          serialNumber: tempArr,
          accessoryTypeId: this.state.accessoryTypeId,
          partnerLoginId: getLoginId()
        }
      })
      // console.log(data)
      let response = ''
      Object.values(data.validation).map(
        res => (response = response + ',' + res['serialNumber'])
      )

      if (accArr.length > this.state.accessoryQuantity) {
        this.setState({
          duplicateAccessoryList:
            'You can not assign Accessory more than requested quantity'
        })
      } else {
        this.setState({ duplicateAccessoryList: response })
      }

      // console.log('list=', this.state.duplicateAccessoryList)
      // console.log('accArr=', data.validation.length, accArr.length)

      if (
        data.validation.length === 0 &&
        accArr.length !== 0 &&
        accArr.length <= this.state.accessoryQuantity
      ) {
        this.setState({ accessoryStatus: true })
      }
    }
    // console.log('device', this.state.accssoryStatus)
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
    this.setState({
      [name]: event.target.value
    })
  }
  handleReset = type => event => {
    // console.log('type', type)
    if (type === 'device') {
      this.setState({
        deviceSerialNo: '',
        deviceUniqueNo: '',
        deviceStatus: false,
        duplicateDeviceList: ''
      })
    }
    if (type === 'sim') {
      this.setState({
        simSerialNo: '',

        simStatus: false,
        duplicateSimList: ''
      })
    }
    if (type === 'accessory') {
      this.setState({
        accessorySerialNo: '',
        accessoryUniqueNo: '',
        accessoryStatus: false,
        duplicateAccessoryList: ''
      })
    }
  }
  handleSaveAssignment = async e => {
    var devices = []
    var accessories = []
    var sims = []
    var deviceArr = []
    var simArr = []
    var accArr = []

    if (this.state.deviceSerialNo !== '') {
      deviceArr = this.state.deviceSerialNo.split(',')
      deviceArr.forEach(serialno => {
        let temp = {}
        temp.uniqueDeviceId = this.state.manufacturerCode + '_' + serialno
        devices.push(temp)
      })
    }

    if (this.state.simSerialNo !== '') {
      simArr = this.state.simSerialNo.split(',')
      simArr.forEach(serialno => {
        let temp = {}
        temp.simNumber = serialno

        sims.push(temp)
      })
    }

    if (this.state.accessorySerialNo !== '') {
      accArr = this.state.accessorySerialNo.split(',')
      accArr.forEach(serialno => {
        let temp = {}

        temp.uniqueAccessoryId = this.state.accManufacturerCode + '_' + serialno
        accessories.push(temp)
      })
    }

    // console.log('all3=', devices, sims, accessories)
    const response = await this.props.client.mutate({
      mutation: SAVE_SUBSCRIPTION,
      variables: {
        uniqueDeviceIdList: devices,
        uniqueAccessoryIdList: accessories,
        simIdList: sims,
        deviceModelId: this.state.deviceModelId,
        accessoryTypeId: this.state.accessoryTypeId,
        serviceProviderId: this.state.simProviderId,
        unAssignedDeviceQuantity: this.state.deviceQuantity - deviceArr.length,
        unAssignedAccessoryQuantity:
          this.state.accessoryQuantity - accArr.length,
        unAssignedSimQuantity: this.state.simQuantity - simArr.length,
        partnerLoginId: getLoginId(),
        clientLoginId: this.loginId,
        subscriptionId: this.subscriptionId
      }
    })

    this.setState({
      deviceSerialNo: '',
      simSerialNo: '',
      accessorySerialNo: '',
      duplicateDeviceList: '',
      duplicateAccessoryList: '',
      duplicateSimList: ''
    })
    console.log('response=', response)
  }
  render() {
    const { classes } = this.props
    const models = ['S101', 'TS101']
    return (
      <Query
        query={GET_CLIENT}
        variables={{
          loginId: this.loginId
        }}
        fetchPolicy="network-only"
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
                      // onClick={this.viewSubscription}
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
                    Process Purchase Request{' '}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Grid
                        item
                        container
                        spacing={16}
                        direction="row"
                        alignItems="center"
                      >
                        <Grid item xs={12}>
                          <Typography variant="subheading">Device :</Typography>
                        </Grid>

                        {models.map(inventoryDetail => {
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
                                  {inventoryDetail}
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
                                  <TextField
                                    fullWidth
                                    id="outlined-multiline-flexible"
                                    label="Enter Serial Number With Comma Seprate"
                                    multiline
                                    value={
                                      /* eslint-disable */
                                      this.state.deviceSerialNo
                                      /* eslint-enable */
                                    }
                                    onChange={this.handleChange(
                                      'deviceSerialNo'
                                    )}
                                    onBlur={this.handleDeviceValidate('device')}
                                    className={classes.textField}
                                    margin="normal"
                                    helperText={this.state.duplicateDeviceList}
                                    error={this.state.duplicateDeviceList}
                                    variant="outlined"
                                  />
                                }
                              </Grid>
                              <Grid item xs={1}>
                                <Button
                                  variant="raised"
                                  color="secondary"
                                  className={classes.button}
                                  onClick={this.handleReset(
                                    inventoryDetail.type
                                  )}
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
                                  onClick={this.handleReset(
                                    inventoryDetail.type
                                  )}
                                >
                                  Reset
                                </Button>
                              </Grid>
                            </Grid>
                          ) : null
                        })}
                      </Grid>
                      <Grid
                        item
                        container
                        spacing={16}
                        direction="row"
                        alignItems="center"
                      >
                        <Grid item xs={12}>
                          <Typography variant="subheading">
                            Licenses :
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="body1">
                            <i>License:</i>
                          </Typography>
                        </Grid>
                        <Grid item xs={1}>
                          <Typography variant="body2">
                            {this.state.simProviderName}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="body1">
                            <i>Quantity:</i>
                          </Typography>
                        </Grid>
                        <Grid item xs={1}>
                          <Typography variant="body2">
                            {this.state.simQuantity}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item container spacing={16} justify="center">
                  <Grid item xs={2}>
                    <Button
                      color="primary"
                      variant="raised"
                      onClick={this.handleSaveAssignment}
                      disabled={
                        !(this.state.deviceStatus && this.state.simStatus)
                      }
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

AssignLicenses.propTypes = {
  classes: PropTypes.object.isRequired
}

const withApolloClient = Component => props => (
  <ApolloConsumer>
    {client => <Component client={client} {...props} />}
  </ApolloConsumer>
)

export default withStyles(styles)(withApolloClient(AssignLicenses))
