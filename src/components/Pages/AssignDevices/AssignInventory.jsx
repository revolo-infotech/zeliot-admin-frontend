import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query, ApolloConsumer } from 'react-apollo'
import { Button, Typography } from '@material-ui/core'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import TextField from '@material-ui/core/TextField'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
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

class AssignDevices extends Component {
  constructor(props) {
    super(props)
    this.loginId = this.props.match.params.loginId
    this.subscriptionId = this.props.match.params.subscriptionId
    this.state = {
      deviceSerialNo: '',
      deviceUniqueNo: '',
      deviceModelId: null,
      deviceModelName: '',
      deviceQuantity: '',
      manufacturerCode: '',
      duplicateDeviceList: '',
      simSerialNo: '',
      simProviderName: '',
      simProviderId: null,
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
      duplicateDeviceError: '',
      duplicateSimError: ''
    }
  }
  getSubscriptions = async () => {
    const { data } = await this.props.client.query({
      query: GET_SUBSCRIPTION,
      variables: {
        subscriptionId: parseInt(this.subscriptionId, 10),
        loginId: parseInt(this.loginId, 10),
        partnerLoginId: getLoginId()
      },
      fetchPolicy: 'network-only'
    })

    // console.log('sub call')

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
        simProviderId: data.getSubscriptions.serviceProviderId,
        simQuantity: data.getSubscriptions.unAssignedSimQuantity
      })
    }
  }

  componentDidMount() {
    this.getSubscriptions()
  }
  handleDeviceDuplicate = type => async () => {
    let deviceArr = this.state.deviceSerialNo
    console.log('1st', deviceArr)

    deviceArr = deviceArr.split(',').map(Number)
    console.log('2nd', deviceArr)
    let duplicateDeviceList = this.state.duplicateDeviceList
    // console.log('3rd', this.state.duplicateDeviceList)
    duplicateDeviceList = duplicateDeviceList.split(' ').map(Number)

    let deviceArrl = deviceArr.filter(el => !duplicateDeviceList.includes(el))
    console.log('4deviceArr', deviceArrl.toString())
    this.setState({
      duplicateDeviceList: '',
      deviceSerialNo: deviceArrl.toString(),
      duplicateDeviceError: ''
    })
  }
  handleSimDuplicate = type => async () => {
    let simArr = this.state.simSerialNo
    // console.log('1st', simArr)

    simArr = simArr.split(',').map(e => e.trim())
    // console.log('2nd', simArr)
    let duplicateSimList = this.state.duplicateSimList

    duplicateSimList = duplicateSimList.split(' ').map(e => e.trim())
    // console.log('3rd', duplicateSimList)
    let simArrl = simArr.filter(el => {
      // console.log(el, duplicateSimList)
      return !duplicateSimList.includes(el)
    })
    // console.log('4deviceArr', simArrl)
    this.setState({
      duplicateSimList: '',
      duplicateSimError: '',
      simSerialNo: simArrl.toString()
    })
  }

  handleDeviceValidate = type => async () => {
    this.setState({ duplicateDeviceError: '' })
    let deviceArr = this.state.deviceSerialNo
      .trim()
      .replace(/[^A-Za-z0-9,]/g, '')
      .replace(/\s/g, '')
      .replace(/,{1,}$/, '')
      .replace(/^,{1,}/, '')
      .replace(/,+/g, ',')
      .split(',')

    // Remove Duplicates
    deviceArr = [...new Set(deviceArr)]

    let tempArr = []
    let verifiedSerialNumbers = ''

    deviceArr.forEach(serialno => {
      verifiedSerialNumbers = verifiedSerialNumbers + serialno + ', '
      let temp = {}
      temp.serial_num = serialno
      temp.uniqueDeviceId = this.state.manufacturerCode + '_' + serialno
      tempArr.push(temp)
    })

    verifiedSerialNumbers = verifiedSerialNumbers.slice(
      0,
      verifiedSerialNumbers.length - 2
    )

    this.setState({
      deviceSerialNo: verifiedSerialNumbers
    })

    const { data } = await this.props.client.query({
      query: VERIFY_DEVICE,
      variables: {
        serial_num: tempArr,
        deviceModelId: parseInt(this.state.deviceModelId, 10),
        partnerLoginId: parseInt(localStorage.getItem('Login_id'), 10)
      },
      fetchPolicy: ['network-only']
    })

    let response = ''
    Object.values(data.validation).map(
      res => (response = response + res['serial_num'] + ' ')
    )

    if (deviceArr.length > this.state.deviceQuantity) {
      this.setState({
        duplicateDeviceList:
          'You can not assign devices more than requested quantity'
      })
    } else {
      this.setState({
        duplicateDeviceList: response
      })
      if (response !== '') {
        this.setState({
          duplicateDeviceError: 'Remove Invalid Serial nos:'
        })
      }
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
    this.setState({ duplicateSimError: '' })
    let simArr = this.state.simSerialNo
      .trim()
      .replace(/[^A-Za-z0-9,]/g, '')
      .replace(/\s/g, '')
      .replace(/,{1,}$/, '')
      .replace(/^,{1,}/, '')
      .replace(/,+/g, ',')
      .split(',')

    // Remove Duplicates
    simArr = [...new Set(simArr)]

    let tempArr = []
    let verifiedSerialNumbers = ''

    if (simArr.length > 0) {
      simArr.forEach(serialno => {
        verifiedSerialNumbers = verifiedSerialNumbers + serialno + ', '
        let temp = {}
        temp.simNumber = serialno
        tempArr.push(temp)
      })

      verifiedSerialNumbers = verifiedSerialNumbers.slice(
        0,
        verifiedSerialNumbers.length - 2
      )

      this.setState({
        simSerialNo: verifiedSerialNumbers
      })

      const { data } = await this.props.client.query({
        query: VERIFY_SIM,
        variables: {
          simNumber: tempArr,
          serviceProviderId: parseInt(this.state.simProviderId, 10),
          partnerLoginId: parseInt(localStorage.getItem('Login_id'), 10)
        },
        fetchPolicy: ['network-only']
      })

      let response = ''
      Object.values(data.validation).map(
        res => (response = response + res['simNumber'] + ' ')
      )
      if (simArr.length > this.state.simQuantity) {
        this.setState({
          duplicateSimList:
            'You can not assign sim more than requested quantity'
        })
      } else {
        this.setState({ duplicateSimList: response })
        if (response !== '') {
          this.setState({
            duplicateSimError: 'Remove Invalid Sim nos:'
          })
        }
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
    let accArr = this.state.accessorySerialNo
      .trim()
      .replace(/[^A-Za-z0-9,]/g, '')
      .replace(/\s/g, '')
      .replace(/,{1,}$/, '')
      .replace(/^,{1,}/, '')
      .replace(/,+/g, ',')
      .split(',')

    // Remove Duplicates
    accArr = [...new Set(accArr)]

    let tempArr = []
    let verifiedSerialNumbers = ''

    if (accArr.length > 0) {
      accArr.forEach(serialno => {
        verifiedSerialNumbers = verifiedSerialNumbers + serialno + ', '
        let temp = {}
        temp.serialNumber = parseInt(serialno, 10)
        temp.uniqueAccessoryId = this.state.accManufacturerCode + '_' + serialno
        tempArr.push(temp)
      })

      verifiedSerialNumbers = verifiedSerialNumbers.slice(
        0,
        verifiedSerialNumbers.length - 2
      )

      this.setState({
        accessorySerialNo: verifiedSerialNumbers
      })

      const { data } = await this.props.client.query({
        query: VERIFY_ACCESSORY,
        variables: {
          serialNumber: tempArr,
          accessoryTypeId: parseInt(this.state.accessoryTypeId, 10),
          partnerLoginId: parseInt(localStorage.getItem('Login_id'), 10)
        }
      })

      let response = ''
      Object.values(data.validation).map(
        res => (response = response + res['serialNumber'] + ' ')
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
      deviceArr = this.state.deviceSerialNo.replace(/\s/g, '').split(',')
      deviceArr.forEach(serialno => {
        let temp = {}
        temp.uniqueDeviceId = this.state.manufacturerCode + '_' + serialno
        devices.push(temp)
      })
    }

    if (this.state.simSerialNo !== '') {
      simArr = this.state.simSerialNo.replace(/\s/g, '').split(',')
      simArr.forEach(serialno => {
        let temp = {}
        temp.simNumber = serialno
        sims.push(temp)
      })
    }

    if (this.state.accessorySerialNo !== '') {
      accArr = this.state.accessorySerialNo.replace(/\s/g, '').split(',')
      accArr.forEach(serialno => {
        let temp = {}
        temp.uniqueAccessoryId = this.state.accManufacturerCode + '_' + serialno
        accessories.push(temp)
      })
    }

    if (deviceArr.length > this.state.deviceQuantity) {
      this.props.openSnackbar('Device list exceeds Device Quantity')
    } else if (simArr.length > this.state.simQuantity) {
      this.props.openSnackbar('Sim list exceeds Sim Quantity')
    } else if (accArr.length > this.state.accessoryQuantity) {
      this.props.openSnackbar('Accessory list exceeds Accessory Quantity')
    } else if (this.state.duplicateDeviceError !== '') {
      this.props.openSnackbar('Invalid Device list')
    } else if (this.state.duplicateSimError !== '') {
      this.props.openSnackbar('Invalid Sim list')
    } else {
      const { data } = await this.props.client.mutate({
        mutation: SAVE_SUBSCRIPTION,
        variables: {
          uniqueDeviceIdList: devices,
          uniqueAccessoryIdList: accessories,
          simIdList: sims,
          deviceModelId: this.state.deviceModelId,
          accessoryTypeId: this.state.accessoryTypeId,
          serviceProviderId: this.state.simProviderId,
          unAssignedDeviceQuantity:
            this.state.deviceQuantity - deviceArr.length,
          unAssignedAccessoryQuantity:
            this.state.accessoryQuantity - accArr.length,
          unAssignedSimQuantity: this.state.simQuantity - simArr.length,
          partnerLoginId: parseInt(localStorage.getItem('Login_id'), 10),
          clientLoginId: parseInt(this.loginId, 10),
          subscriptionId: parseInt(this.subscriptionId, 10)
        },
        refetchQueries: [
          {
            query: GET_SUBSCRIPTION,
            variables: {
              subscriptionId: parseInt(this.subscriptionId, 10),
              loginId: parseInt(this.loginId, 10),
              partnerLoginId: getLoginId()
            }
          }
        ]
      })

      if (data.setSubscriptionInventoryAssignment === true) {
        this.props.openSnackbar('Inventory Assignment Successful')
        this.setState({
          deviceSerialNo: '',
          deviceUniqueNo: '',
          deviceStatus: false,
          duplicateDeviceList: '',
          simSerialNo: '',
          simStatus: false,
          duplicateSimList: '',
          accessorySerialNo: '',
          accessoryUniqueNo: '',
          accessoryStatus: false,
          duplicateAccessoryList: ''
        })
        this.props.history.goBack()
      } else {
        this.props.openSnackbar('Inventory Assignment Failed')
      }
    }
  }

  render() {
    const { classes } = this.props
    return (
      <Query
        query={GET_CLIENT}
        variables={{
          loginId: parseInt(this.loginId, 10)
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

                {/* Customer Name */}
                <Grid item xs={12}>
                  <Typography variant="display3">
                    {clientDetail.clientName.charAt(0).toUpperCase() +
                      clientDetail.clientName.slice(1)}
                  </Typography>
                  <Typography>
                    Subscription Id: {this.subscriptionId}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subheading">
                    Assign Inventory{' '}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      {/* Device Model Assignment */}
                      {this.state.deviceModelId ? (
                        <Grid
                          item
                          container
                          spacing={16}
                          direction="row"
                          alignItems="center"
                        >
                          <Grid item xs={12}>
                            <Typography variant="title">Device(s)</Typography>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography variant="body1">
                              <i>Model:</i>
                            </Typography>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography variant="body2">
                              {this.state.deviceModelName}
                            </Typography>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography variant="body1">
                              <i>Quantity:</i>
                            </Typography>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography variant="body2">
                              {this.state.deviceQuantity}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              id="outlined-multiline-flexible"
                              label="Enter Comma Separated Serial Numbers"
                              rowsMax="4"
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
                              helperText={
                                this.state.duplicateDeviceError +
                                this.state.duplicateDeviceList
                              }
                              error={this.state.duplicateDeviceList}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item>
                            <Button
                              variant="raised"
                              color="secondary"
                              className={classes.button}
                              onClick={this.handleDeviceValidate('device')}
                            >
                              Validate
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button
                              variant="raised"
                              color="secondary"
                              className={classes.button}
                              onClick={this.handleDeviceDuplicate('device')}
                            >
                              Remove
                            </Button>
                          </Grid>
                          <Grid item>
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
                      ) : null}

                      {/* SIM Assignment */}
                      {this.state.simProviderId ? (
                        <Grid
                          item
                          container
                          spacing={16}
                          direction="row"
                          alignItems="center"
                        >
                          <Grid item xs={12}>
                            <Typography variant="title">SIM(s)</Typography>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography variant="body1">
                              <i>SIM Provider:</i>
                            </Typography>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography variant="body2">
                              {this.state.simProviderName}
                            </Typography>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography variant="body1">
                              <i>Quantity:</i>
                            </Typography>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography variant="body2">
                              {this.state.simQuantity}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              id="outlined-multiline-flexible"
                              label="Enter Comma Separated SIM Numbers"
                              multiline
                              rowsMax="4"
                              value={
                                /* eslint-disable */
                                this.state.simSerialNo
                                /* eslint-enable */
                              }
                              onChange={this.handleChange('simSerialNo')}
                              onBlur={this.handleSimValidate('sim')}
                              className={classes.textField}
                              margin="normal"
                              helperText={
                                this.state.duplicateSimError +
                                this.state.duplicateSimList
                              }
                              error={this.state.duplicateSimList}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item>
                            <Button
                              variant="raised"
                              color="secondary"
                              className={classes.button}
                              onClick={this.handleSimValidate('sim')}
                            >
                              Validate
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button
                              variant="raised"
                              color="secondary"
                              className={classes.button}
                              onClick={this.handleSimDuplicate('sim')}
                            >
                              Remove
                            </Button>
                          </Grid>
                          <Grid item>
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
                      ) : null}

                      {/* Accessory Assignment */}
                      {this.state.accessoryTypeId ? (
                        <Grid
                          item
                          container
                          spacing={16}
                          direction="row"
                          alignItems="center"
                        >
                          <Grid item xs={12}>
                            <Typography variant="title">Accessory</Typography>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography variant="body1">
                              <i>Accessory Type:</i>
                            </Typography>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography variant="body2">
                              {this.state.accessoryType}
                            </Typography>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography variant="body1">
                              <i>Quantity:</i>
                            </Typography>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography variant="body2">
                              {this.state.accessoryQuantity}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              id="outlined-multiline-flexible"
                              label="Enter Comma Separated Serial Numbers"
                              multiline
                              rowsMax="4"
                              value={
                                /* eslint-disable */
                                this.state.accessorySerialNo
                                /* eslint-enable */
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
                          <Grid item>
                            <Button
                              variant="raised"
                              color="secondary"
                              className={classes.button}
                              onClick={this.handleAccessoryValidate(
                                'accessory'
                              )}
                            >
                              Validate
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button
                              variant="raised"
                              color="primary"
                              className={classes.button}
                              onClick={this.handleReset('accessory')}
                            >
                              Reset
                            </Button>
                          </Grid>
                        </Grid>
                      ) : null}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item container spacing={16} justify="center">
                  <Grid item>
                    <Button
                      color="secondary"
                      variant="raised"
                      onClick={this.handleSaveAssignment}
                      disabled={
                        (this.state.deviceSerialNo === '' ||
                          this.state.duplicateDeviceError !== '') &&
                        (this.state.simSerialNo === '' ||
                          this.state.duplicateSimError !== '') &&
                        this.state.accessorySerialNo === ''
                      }
                    >
                      Save
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button color="primary" variant="raised" href="../../">
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

export default withStyles(styles)(
  withApolloClient(withSharedSnackbar(AssignDevices))
)
