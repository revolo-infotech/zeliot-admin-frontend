import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query, ApolloConsumer } from 'react-apollo'
import { Button, Typography } from '@material-ui/core'
import CustomerDetailsCard from '../../../../Modules/CustomerDetailsCard'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import TextField from '@material-ui/core/TextField'
import getLoginId from '../../../../../utils/getLoginId'
import MUIDataTable from 'mui-datatables'

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
  query checkDeviceAvailableForResellerSubscription(
    $resellerLoginId: Int!
    $serial_num: [DeviceListInput!]!
    $deviceModelId: Int!
  ) {
    validation: checkDeviceAvailableForResellerSubscription(
      resellerLoginId: $resellerLoginId
      deviceList: $serial_num
      deviceModelId: $deviceModelId
    ) {
      serial_num
      uniqueDeviceId
    }
  }
`
const VERIFY_SIM = gql`
  query checkSimAvailableForResellerSubscription(
    $resellerLoginId: Int!
    $simNumber: [SimListInput!]!
    $serviceProviderId: Int!
  ) {
    validation: checkSimAvailableForResellerSubscription(
      resellerLoginId: $resellerLoginId
      simList: $simNumber
      serviceProviderId: $serviceProviderId
    ) {
      simNumber
    }
  }
`
const GET_SUBSCRIPTION = gql`
  query getResellerSubscriptions(
    $subscriptionId: Int
    $clientLoginId: Int
    $resellerLoginId: Int
  ) {
    getResellerSubscriptions(
      id: $subscriptionId
      clientLoginId: $clientLoginId
      resellerLoginId: $resellerLoginId
    ) {
      deviceModel {
        model_name
        manufacturer {
          manufacturerCode
        }
      }
      licenseType {
        licenseType
      }
      licenseQuantity
      unAssignedLicenseQuantity
      serviceProvider {
        name
      }
      deviceModelId

      serviceProviderId
      unAssignedDeviceQuantity
      unAssignedSimQuantity
      licenseTypeId
      resellerLicenseInventory {
        id
        licenseExpiryTime
        approvedQuantity
        assignedQuantityToClient
      }
      reseller {
        licenseExpiryPeriod
      }
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
  mutation setResellerSubscriptionInventoryAssignment(
    $uniqueDeviceIdList: [uniqueDeviceIdListInput!]
    $licenseList: [licenseListInput!]
    $simIdList: [simListInput!]
    $deviceModelId: Int!
    $licenseTypeId: Int
    $serviceProviderId: Int
    $unAssignedDeviceQuantity: Int!
    $unAssignedLicenseQuantity: Int!
    $unAssignedSimQuantity: Int!
    $resellerLoginId: Int!
    $clientLoginId: Int!
    $subscriptionId: Int!
  ) {
    setResellerSubscriptionInventoryAssignment(
      uniqueDeviceIdList: $uniqueDeviceIdList
      licenseList: $licenseList
      simList: $simIdList
      deviceModelId: $deviceModelId
      licenseTypeId: $licenseTypeId
      serviceProviderId: $serviceProviderId
      unAssignedDeviceQuantity: $unAssignedDeviceQuantity
      unAssignedLicenseQuantity: $unAssignedLicenseQuantity
      unAssignedSimQuantity: $unAssignedSimQuantity
      resellerLoginId: $resellerLoginId
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
    this.loginId = parseInt(this.props.match.params.loginId, 10)
    this.subscriptionId = parseInt(this.props.match.params.subscriptionId, 10)
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
      accessoryStatus: true,
      licenseStock: [],
      licenseName: '',
      selectLicenceQty: [],
      selectLicenceQtyArr: [],
      licenseSelectedArr: ''
    }
  }
  getSubscriptions = async () => {
    const { data } = await this.props.client.query({
      query: GET_SUBSCRIPTION,
      variables: {
        subscriptionId: this.subscriptionId,
        loginId: this.loginId,
        resellerLoginId: getLoginId()
      }
    })
    console.log('data', data)
    if (data.getResellerSubscriptions.unAssignedDeviceQuantity > 0) {
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
      deviceModelName: data.getResellerSubscriptions.deviceModel.model_name,
      deviceQuantity: data.getResellerSubscriptions.unAssignedDeviceQuantity,
      deviceModelId: data.getResellerSubscriptions.deviceModelId,
      manufacturerCode:
        data.getResellerSubscriptions.deviceModel.manufacturer.manufacturerCode,
      licenseName: data.getResellerSubscriptions.licenseType.licenseType,
      licenseExpiryPeriod:
        data.getResellerSubscriptions.reseller.licenseExpiryPeriod
    })

    if (data.getResellerSubscriptions.serviceProvider !== null) {
      this.setState({
        simProviderName: data.getResellerSubscriptions.serviceProvider.name,
        // simProviderId: data.getSubscriptions.serviceProvider.id,
        simProviderId: data.getResellerSubscriptions.serviceProviderId,
        simQuantity: data.getResellerSubscriptions.unAssignedSimQuantity
      })
    }
    this.mapToArr(data.getResellerSubscriptions.resellerLicenseInventory)
  }

  columns = ['LICENSE NAME', 'LICENSE EXPIRY', 'TOTAL STOCK', 'SELECT QUANTITY']

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15
  }
  state = {
    open: false,
    open1: false
  }

  mapToArr(licenses) {
    var rowData = []
    var fullData = []
    // this.clientId = []
    licenses.forEach((element, index) => {
      rowData = []
      // this.clientId.push(element.id)
      rowData.push(this.state.licenseName)
      rowData.push(element.licenseExpiryTime)
      rowData.push(element.approvedQuantity)
      rowData.push(
        <TextField
          margin="dense"
          id="selectLicenceQty"
          name="selectLicenceQty"
          label="Enter Quantity"
          type="text"
          required
          fullWidth
          value={this.state.selectLicenceQty[element.id]}
          onChange={this.handleInputChange(
            index,
            element.id,
            element.licenseExpiryTime
          )}
        />
      )
      fullData.push(rowData)
    })
    this.setState({
      licenseStock: fullData
    })
  }
  submitArr = []
  handleInputChange = (index, id, expiry) => event => {
    let tempArr = {
      resellerLicenseInventoryId: id,
      licenseExpiryTime: expiry,
      licenseExpiryPeriod: this.state.licenseExpiryPeriod,
      quantity: parseInt(event.target.value, 10)
    }
    this.submitArr[index] = tempArr
    this.setState({
      licenseSelectedArr: this.submitArr
    })
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

    const { data } = await this.props.client.query({
      query: VERIFY_DEVICE,
      variables: {
        serial_num: tempArr,
        deviceModelId: parseInt(this.state.deviceModelId, 10),
        resellerLoginId: getLoginId()
      }
    })

    let response = ''
    Object.values(data.validation).map(
      res => (response = response + ',' + res['serial_num'])
    )

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

      const { data } = await this.props.client.query({
        query: VERIFY_SIM,
        variables: {
          simNumber: tempArr,
          serviceProviderId: parseInt(this.state.simProviderId, 10),
          resellerLoginId: getLoginId()
        }
      })

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

      if (
        data.validation.length === 0 &&
        simArr.length !== 0 &&
        simArr.length <= this.state.simQuantity
      ) {
        this.setState({ simStatus: true })
      }
    }
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

      const { data } = await this.props.client.query({
        query: VERIFY_ACCESSORY,
        variables: {
          serialNumber: tempArr,
          accessoryTypeId: this.state.accessoryTypeId,
          partnerLoginId: getLoginId()
        }
      })

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

      if (
        data.validation.length === 0 &&
        accArr.length !== 0 &&
        accArr.length <= this.state.accessoryQuantity
      ) {
        this.setState({ accessoryStatus: true })
      }
    }
  }
  viewSubscription = e => {
    this.props.history.push({
      pathname: '/home/reseller/customers/view/' + this.loginId,
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

    await this.props.client.mutate({
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
        resellerLoginId: getLoginId(),
        clientLoginId: this.loginId,
        subscriptionId: this.subscriptionId,
        licenseList: this.state.licenseSelectedArr,
        unAssignedLicenseQuantity: this.state.deviceQuantity - deviceArr.length
      }
    })

    this.setState({
      deviceSerialNo: '',
      simSerialNo: '',
      accessorySerialNo: '',
      duplicateDeviceList: '',
      duplicateAccessoryList: '',
      duplicateSimList: '',
      licenseList: ''
    })
  }
  render() {
    const { classes } = this.props
    // console.log('selectLicenceQty', this.state.selectLicenceQty)
    return (
      <Query
        query={GET_CLIENT}
        variables={{
          loginId: parseInt(this.loginId, 10)
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
                      onClick={() => this.props.history.goBack()}
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
                        <Grid item>
                          <Typography variant="body1">
                            <i>Model:</i>
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="body2">
                            {this.state.deviceModelName}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="body1">
                            <i>Quantity:</i>
                          </Typography>
                        </Grid>
                        <Grid item xs={1}>
                          <Typography variant="body2">
                            {this.state.deviceQuantity}
                          </Typography>
                        </Grid>
                        <Grid item xs={5}>
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
                            onChange={this.handleChange('deviceSerialNo')}
                            onBlur={this.handleDeviceValidate('device')}
                            className={classes.textField}
                            margin="normal"
                            helperText={this.state.duplicateDeviceList}
                            error={this.state.duplicateDeviceList}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={1}>
                          <Button
                            variant="raised"
                            color="secondary"
                            className={classes.button}
                            onClick={this.handleDeviceValidate('device')}
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
                            onClick={this.handleReset('device')}
                          >
                            Reset
                          </Button>
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        container
                        spacing={16}
                        direction="row"
                        alignItems="center"
                      >
                        <Grid item xs={12}>
                          <Typography variant="subheading">SIM :</Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="body1">
                            <i>SIM Provider:</i>
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
                        <Grid item xs={5}>
                          <TextField
                            fullWidth
                            id="outlined-multiline-flexible"
                            label="Enter Serial Number With Comma Seprate"
                            multiline
                            value={
                              /* eslint-disable */
                              this.state.simSerialNo
                              /* eslint-enable */
                            }
                            onChange={this.handleChange('simSerialNo')}
                            onBlur={this.handleSimValidate('sim')}
                            className={classes.textField}
                            margin="normal"
                            helperText={this.state.duplicateSimList}
                            error={this.state.duplicateSimList}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={1}>
                          <Button
                            variant="raised"
                            color="secondary"
                            className={classes.button}
                            onClick={this.handleSimValidate('sim')}
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
                            onClick={this.handleReset('sim')}
                          >
                            Reset
                          </Button>
                        </Grid>
                      </Grid>
                      {/* <Grid
                        item
                        container
                        spacing={16}
                        direction="row"
                        alignItems="center"
                      >
                        <Grid item xs={12}>
                          <Typography variant="subheading">
                            Acessory:
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="body1">
                            <i>Accessory Type:</i>
                          </Typography>
                        </Grid>
                        <Grid item xs={1}>
                          <Typography variant="body2">
                            {this.state.accessoryType}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="body1">
                            <i>Quantity:</i>
                          </Typography>
                        </Grid>
                        <Grid item xs={1}>
                          <Typography variant="body2">
                            {this.state.accessoryQuantity}
                          </Typography>
                        </Grid>
                        <Grid item xs={5}>
                          <TextField
                            fullWidth
                            id="outlined-multiline-flexible"
                            label="Enter Serial Number With Comma Seprate"
                            multiline
                            value={
                              this.state.accessorySerialNo
                            }
                            onChange={this.handleChange('accessorySerialNo')}
                            onBlur={this.handleAccessoryValidate('accessory')}
                            className={classes.textField}
                            margin="normal"
                            helperText={this.state.duplicateAccessoryList}
                            error={this.state.duplicateAccessoryList}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={1}>
                          <Button
                            variant="raised"
                            color="secondary"
                            className={classes.button}
                            onClick={this.handleAccessoryValidate('accessory')}
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
                            onClick={this.handleReset('accessory')}
                          >
                            Reset
                          </Button>
                        </Grid>
                      </Grid> */}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  {/* TODO: Replace this with a custom table going forward */}
                  <MUIDataTable
                    data={this.state.licenseStock}
                    columns={this.columns}
                    options={this.options}
                  />
                </Grid>
                <Grid item container spacing={16} justify="center">
                  <Grid item xs={2}>
                    <Button
                      color="primary"
                      variant="raised"
                      onClick={this.handleSaveAssignment}
                      disabled={
                        !(this.state.deviceStatus && this.state.simStatus)
                        // this.state.accessoryStatus
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

AssignDevices.propTypes = {
  classes: PropTypes.object.isRequired
}

const withApolloClient = Component => props => (
  <ApolloConsumer>
    {client => <Component client={client} {...props} />}
  </ApolloConsumer>
)

export default withStyles(styles)(withApolloClient(AssignDevices))
