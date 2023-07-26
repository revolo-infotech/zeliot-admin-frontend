import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import gql from 'graphql-tag'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import TextField from '@material-ui/core/TextField'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import { withApollo } from 'react-apollo'

const GET_PURCHASE_REQUEST = gql`
  query getPurchaseRequestInfo($id: Int!) {
    prInfo: getPurchaseRequestInfo(id: $id) {
      reseller {
        resellerName
        licenseExpiryPeriod
        login {
          loginId
        }
      }
      licenseTypeList {
        id
        licenseType
        maxPrice
        requestedQuantity
        assignedQuantity
        finalPrice
        gst
        totalPrice
      }
      deviceModelList {
        id
        model_name
        maxPrice
        manufacturerId
        manufacturerCode
        requestedQuantity
        assignedQuantity
        finalPrice
        gst
        totalPrice
      }
    }
  }
`

const VALIDATE_DEVICES = gql`
  query checkDeviceAvailableForAssignment(
    $deviceModelId: Int!
    $deviceList: [DeviceListInput!]!
  ) {
    checkDeviceAvailableForAssignment(
      deviceModelId: $deviceModelId
      deviceList: $deviceList
    ) {
      serial_num
      uniqueDeviceId
    }
  }
`

const PROCESS_PURCHASE_REQUEST = gql`
  mutation processPurchaseRequest(
    $resellerLoginId: Int!
    $licenseExpiryPeriod: Int!
    $purchaseRequestId: Int!
    $processedDeviceList: [processedDeviceList!]!
    $processedLicenseTypeList: [processedLicenseTypeList!]!
    $licenseTypeList: [LicenseTypeRequest!]!
    $deviceModelList: [DeviceModelRequest!]!
    $isPartialProcessed: Boolean!
  ) {
    processPurchaseRequest(
      resellerLoginId: $resellerLoginId
      licenseExpiryPeriod: $licenseExpiryPeriod
      purchaseRequestId: $purchaseRequestId
      processedDeviceList: $processedDeviceList
      processedLicenseTypeList: $processedLicenseTypeList
      licenseTypeList: $licenseTypeList
      deviceModelList: $deviceModelList
      isPartialProcessed: $isPartialProcessed
    )
  }
`

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    flexGrow: 1
  }
})

function TypeHeader(props) {
  return (
    <Grid item xs={12}>
      <Typography variant="title">{props.header}</Typography>
    </Grid>
  )
}

function SubHeader(props) {
  return (
    <Grid item container xs={12} spacing={16} direction="row">
      {props.headers.map((header, index) => {
        return (
          <Grid item xs={2} key={index}>
            <Typography variant="subheading">{header}</Typography>
          </Grid>
        )
      })}
    </Grid>
  )
}

function DeviceDetails(props) {
  return (
    <Grid item container xs={12} spacing={16} direction="row">
      <Grid item xs={2}>
        <Typography variant="subheading">{props.details.name}</Typography>
      </Grid>
      <Grid item xs={2}>
        <Typography variant="subheading">{props.details.totalQty}</Typography>
      </Grid>
      <Grid item xs={2}>
        <Typography variant="subheading">
          {props.details.assignedQty}
        </Typography>
      </Grid>
      <Grid item xs={3}>
        <TextField
          placeholder={props.details.name + ' Serial Numbers'}
          multiline
          rowsMax="4"
          value={props.details.deviceSerialNos}
          onChange={props.handleSerialNumbers(props.index)}
        />
        <Typography variant="caption">{props.details.caption}</Typography>
      </Grid>
      <Grid item>
        <Button
          color="secondary"
          variant="raised"
          onClick={props.handleValidate(props.index)}
        >
          Validate
        </Button>
      </Grid>
      <Grid item>
        <Button
          color="primary"
          variant="raised"
          onClick={props.handleCancel(props.index)}
        >
          Clear
        </Button>
      </Grid>
    </Grid>
  )
}

function LicenseDetails(props) {
  return (
    <Grid item container xs={12} spacing={16} direction="row">
      <Grid item xs={2}>
        <Typography variant="subheading">{props.details.name}</Typography>
      </Grid>
      <Grid item xs={2}>
        <Typography variant="subheading">{props.details.totalQty}</Typography>
      </Grid>
      <Grid item xs={2}>
        <TextField
          value={props.details.assignedQty}
          onChange={props.handleLicenses(props.index)}
          type="number"
        />
      </Grid>
    </Grid>
  )
}

class AssignDevicesForPR extends Component {
  state = {
    models: [],
    licenses: [],
    purchaseRequestId: null,
    reseller: '',
    licenseExpiry: null,
    resellerLoginId: ''
  }

  async componentDidMount() {
    let purchaseRequestId = this.props.match.params.purchaseRequestId

    // Query to get all relevant information of purchase request
    let { data } = await this.props.client.query({
      query: GET_PURCHASE_REQUEST,
      variables: {
        id: parseInt(purchaseRequestId, 10)
      }
    })

    console.log('model', data)
    data = data.prInfo
    let deviceDetails = []
    let licenseDetails = []
    let reseller
    let resellerLoginId
    let licenseExpiry

    reseller = data.reseller.resellerName
    licenseExpiry = data.reseller.licenseExpiryPeriod
    resellerLoginId = data.reseller.login.loginId

    data.deviceModelList.forEach(device => {
      let tempObject = {}
      tempObject.id = device.id
      tempObject.name = device.model_name
      tempObject.totalQty = device.requestedQuantity
      tempObject.assignedQty = device.assignedQuantity
      tempObject.initialQty = tempObject.assignedQty
      tempObject.deviceSerialNos = ''
      tempObject.validated = false
      tempObject.caption = 'Enter comma separated serial numbers'
      tempObject.manufacturerId = device.manufacturerId
      tempObject.manufacturerCode = device.manufacturerCode
      deviceDetails.push(tempObject)
    })

    data.licenseTypeList.forEach(license => {
      let tempObject = {}
      tempObject.id = license.id
      tempObject.name = license.licenseType
      tempObject.totalQty = license.requestedQuantity
      tempObject.assignedQty = license.assignedQuantity
      tempObject.initialQty = tempObject.assignedQty
      licenseDetails.push(tempObject)
    })

    this.setState({
      models: deviceDetails,
      licenses: licenseDetails,
      purchaseRequestId: purchaseRequestId,
      reseller: reseller,
      licenseExpiry: licenseExpiry,
      resellerLoginId: resellerLoginId
    })
  }

  handleSerialNumbers = index => event => {
    let currModels = this.state.models
    currModels[index].deviceSerialNos = event.target.value
    currModels[index].validated = false
    currModels[index].caption = 'Enter comma separated serial numbers'

    this.setState({
      models: currModels
    })
  }

  handleLicenses = index => event => {
    let currLicenses = this.state.licenses

    if (
      event.target.value >= currLicenses[index].initialQty &&
      event.target.value <= currLicenses[index].totalQty &&
      event.target.value >= 0
    ) {
      currLicenses[index].assignedQty = event.target.value

      this.setState({
        licenses: currLicenses
      })
    }
  }

  handleValidate = index => async event => {
    let currModels = this.state.models

    if (currModels[index].deviceSerialNos !== '') {
      // Mutation to validate serial numbers here

      // Prep data in the required format
      let serialNumberArray = currModels[index].deviceSerialNos
        .trim()
        .replace(/[^A-Za-z0-9,]/g, '')
        .replace(/\s/g, '')
        .replace(/,{1,}$/, '')
        .replace(/^,{1,}/, '')
        .replace(/,+/g, ',')
        .split(',')

      let finalDeviceArray = []
      let verifiedSerialNumbers = ''

      serialNumberArray = [...new Set(serialNumberArray)]

      serialNumberArray.forEach(serialNo => {
        verifiedSerialNumbers = verifiedSerialNumbers + serialNo + ', '
        let tempObject = {}
        tempObject.serial_num = serialNo
        tempObject.uniqueDeviceId =
          currModels[index].manufacturerCode + '_' + serialNo
        finalDeviceArray.push(tempObject)
      })

      verifiedSerialNumbers = verifiedSerialNumbers.slice(
        0,
        verifiedSerialNumbers.length - 2
      )

      currModels[index].deviceSerialNos = verifiedSerialNumbers

      const { data } = await this.props.client.query({
        query: VALIDATE_DEVICES,
        variables: {
          deviceModelId: parseInt(currModels[index].id, 10),
          deviceList: finalDeviceArray
        }
      })

      if (data.checkDeviceAvailableForAssignment.length === 0) {
        // Make sure number of devices are not greater than those applicable for this purchase request
        if (
          finalDeviceArray.length >
          currModels[index].totalQty - currModels[index].assignedQty
        ) {
          currModels[index].validated = false
          currModels[index].caption =
            'Cannot assign more than ' +
            (currModels[index].totalQty - currModels[index].assignedQty) +
            ' devices in this purchase request'
        } else {
          currModels[index].validated = true
          if (finalDeviceArray.length === 1) {
            currModels[index].caption =
              finalDeviceArray.length + ' device is valid'
          } else {
            currModels[index].caption =
              finalDeviceArray.length + ' devices are valid'
          }
        }
      } else {
        currModels[index].validated = false
        let caption = ''
        if (data.checkDeviceAvailableForAssignment.length > 1) {
          caption = 'Serial numbers '
        } else {
          caption = 'Serial number '
        }

        data.checkDeviceAvailableForAssignment.forEach(device => {
          caption = caption + device.serial_num + ' '
        })

        if (data.checkDeviceAvailableForAssignment.length > 1) {
          caption = caption + 'are invalid'
        } else {
          caption = caption + 'is invalid'
        }
        currModels[index].caption = caption
      }
    } else {
      currModels[index].validated = true
      currModels[index].caption = 'No devices assigned'
    }

    this.setState({
      models: currModels
    })
  }

  handleCancel = index => event => {
    let currModels = this.state.models
    currModels[index].deviceSerialNos = ''
    currModels[index].validated = false
    currModels[index].caption = 'Enter comma separated serial numbers'

    this.setState({
      models: currModels
    })
  }

  handleBack = event => {
    this.props.history.goBack()
  }

  handleSubmit = async event => {
    let allValidated = true

    // Check if all fields are validated
    this.state.models.forEach(model => {
      if (model.validated === false) {
        allValidated = false
        return -1
      }
    })

    if (allValidated === true) {
      // Mutation to complete the assignment
      let finalDevices = []
      let finalLicenses = []
      let finalDeviceType = []
      let finalLicenseType = []

      let totalNewDevices = 0
      let totalNewLicenses = 0

      // Prep data first
      let tempObject = {}
      let tempType = {}
      let isPartial = false

      console.log('models', this.state.models)
      this.state.models.forEach(model => {
        let serialNoArr = model.deviceSerialNos
          .trim()
          .replace(/\s/g, '')
          .split(',')

        if (isPartial === false) {
          if (serialNoArr.length + model.assignedQty !== model.totalQty) {
            isPartial = true
          }
        }

        // Form final device type list
        tempType = {}
        tempType.deviceModelId = parseInt(model.id, 10)
        tempType.quantity = parseInt(model.totalQty, 10)
        tempType.assignedQuantity = parseInt(
          model.initialQty + serialNoArr.length,
          10
        )
        finalDeviceType.push(tempType)

        totalNewDevices += serialNoArr.length

        serialNoArr.forEach(serialNo => {
          tempObject = {}
          tempObject.deviceModelId = parseInt(model.id, 10)
          tempObject.uniqueDeviceId = model.manufacturerCode + '_' + serialNo
          finalDevices.push(tempObject)
        })
      })
      console.log('finalDevices', finalDevices)

      this.state.licenses.forEach(license => {
        // Form final license type list
        tempType = {}
        tempType.licenseTypeId = parseInt(license.id, 10)
        tempType.quantity = parseInt(license.totalQty, 10)
        tempType.assignedQuantity = parseInt(license.assignedQty, 10)
        finalLicenseType.push(tempType)

        totalNewLicenses += license.assignedQty - license.initialQty
        tempObject = {}
        tempObject.licenseTypeId = parseInt(license.id, 10)
        tempObject.approvedQuantity = parseInt(
          license.assignedQty - license.initialQty,
          10
        )
        finalLicenses.push(tempObject)
      })

      if (totalNewDevices === totalNewLicenses) {
        const { data } = await this.props.client.mutate({
          mutation: PROCESS_PURCHASE_REQUEST,
          variables: {
            resellerLoginId: parseInt(this.state.resellerLoginId, 10),
            licenseExpiryPeriod: parseInt(this.state.licenseExpiry, 10),
            purchaseRequestId: parseInt(this.state.purchaseRequestId, 10),
            processedDeviceList: finalDevices,
            processedLicenseTypeList: finalLicenses,
            licenseTypeList: finalLicenseType,
            deviceModelList: finalDeviceType,
            isPartialProcessed: isPartial
          }
        })

        if (data.processPurchaseRequest === true) {
          this.props.openSnackbar('Device and License Assignment Successful')
          this.props.history.goBack()
        } else {
          this.props.openSnackbar('Assignment Failed. Try Again!')
        }
      } else {
        this.props.openSnackbar(
          'Assigned Device and License Quantity must match'
        )
      }
    } else {
      this.props.openSnackbar('Ensure all fields are validated')
    }
  }

  handleCancelAssignment = event => {
    this.props.openSnackbar('Device and License Assignment Cancelled')
    this.props.history.goBack()
  }

  render() {
    const { classes } = this.props
    const { reseller, models, licenses, purchaseRequestId } = this.state
    let allValidated = true

    // Check if all fields are validated
    models.forEach(model => {
      if (model.validated === false) {
        allValidated = false
        return -1
      }
    })

    return (
      <div className={classes.root}>
        <Grid container spacing={16} direction="row">
          {/* Back Button */}
          <Grid item xs={12}>
            <Button color="primary" variant="raised" onClick={this.handleBack}>
              Back
            </Button>
          </Grid>

          {/* Reseller Name */}
          <Grid item xs={12}>
            <Typography variant="display3">
              {reseller.charAt(0).toUpperCase() + reseller.slice(1)}
            </Typography>
            <Typography>Purchase Request Id: {purchaseRequestId}</Typography>
          </Grid>

          {/* Device Header */}
          <Grid item container xs={12} spacing={16} direction="row">
            <TypeHeader header="Device Model(s)" />
          </Grid>

          {/* Information to user */}
          <Grid item xs={12}>
            <Typography>
              <i>* All fields have to be validated before assignment</i>
            </Typography>
          </Grid>

          {/* Device Sub Header */}
          <Grid item container xs={12} spacing={16} direction="row">
            <SubHeader
              headers={[
                'Model',
                'Total Quantity',
                'Assigned Quantity',
                'Device Serial Numbers'
              ]}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Device Assignment Details */}
          {models.map((model, index) => {
            return (
              <Grid
                item
                container
                xs={12}
                spacing={16}
                direction="row"
                key={index}
              >
                <DeviceDetails
                  details={model}
                  handleSerialNumbers={this.handleSerialNumbers}
                  handleValidate={this.handleValidate}
                  handleCancel={this.handleCancel}
                  index={index}
                />
              </Grid>
            )
          })}

          {/* License Header */}
          <Grid item container xs={12} spacing={16} direction="row">
            <TypeHeader header="License(s)" />
          </Grid>

          {/* License Sub Header */}
          <Grid item container xs={12} spacing={16} direction="row">
            <SubHeader
              headers={['License', 'Total Quantity', 'Assigned Quantity']}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* License Assignment Details */}
          {licenses.map((license, index) => {
            return (
              <Grid
                item
                container
                xs={12}
                spacing={16}
                direction="row"
                key={index}
              >
                <LicenseDetails
                  details={license}
                  handleLicenses={this.handleLicenses}
                  index={index}
                />
              </Grid>
            )
          })}

          {/* Submit and Cancel Button */}
          <Grid
            item
            container
            xs={12}
            spacing={16}
            direction="row"
            justify="center"
          >
            <Grid item>
              <Button
                color="secondary"
                variant="raised"
                onClick={this.handleSubmit}
                disabled={!allValidated}
              >
                Assign
              </Button>
            </Grid>
            <Grid item>
              <Button
                color="primary"
                variant="raised"
                onClick={this.handleCancelAssignment}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(
  withApollo(withSharedSnackbar(AssignDevicesForPR))
)
