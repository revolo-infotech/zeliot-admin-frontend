import React, { Component } from 'react'
import gql from 'graphql-tag'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import withSharedSnackbar from '../../../HOCs/withSharedSnackbar'
import { Typography } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Select from 'react-select'
import getLoginId from '../../../../utils/getLoginId'
import { withApollo } from 'react-apollo'

const GET_ALL_MODELS = gql`
  query getAllDeviceModelResellerAssignDetails($resellerLoginId: Int!) {
    allModels: getAllDeviceModelResellerAssignDetails(
      resellerLoginId: $resellerLoginId
    ) {
      deviceModel {
        model_name
        maxPrice
      }
      deviceModelId
    }
  }
`

const GET_ALL_LICENSES = gql`
  query getAllLicenseTypeResellerAssignDetails($resellerLoginId: Int!) {
    allLicenses: getAllLicenseTypeResellerAssignDetails(
      resellerLoginId: $resellerLoginId
    ) {
      licenseTypeId
      licenseType {
        licenseType
        maxPrice
      }
    }
  }
`

const RAISE_PURCHASE_REQUEST = gql`
  mutation raisePurchaseRequest(
    $licenseTypeList: [LicenseTypeRequest!]!
    $deviceModelList: [DeviceModelRequest!]!
    $resellerLoginId: Int!
  ) {
    raisePurchaseRequest(
      licenseTypeList: $licenseTypeList
      deviceModelList: $deviceModelList
      resellerLoginId: $resellerLoginId
    )
  }
`

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    flexGrow: 1
  }
})

function AddRemoveButton(props) {
  return (
    <Grid item container spacing={16} direction="row">
      <Grid item>
        <Button
          color="secondary"
          variant="raised"
          onClick={props.handleAdd(props.name)}
          disabled={props.buttonStatus.add[props.name]}
        >
          Add
        </Button>
      </Grid>
      <Grid item>
        <Button
          color="primary"
          variant="raised"
          onClick={props.handleRemove(props.name)}
          disabled={props.buttonStatus.remove[props.name]}
        >
          Remove
        </Button>
      </Grid>
    </Grid>
  )
}

class PurchaseRequest extends Component {
  state = {
    models: [],
    licenses: [],
    modelDetails: [],
    licenseDetails: [],
    buttonStatus: {
      add: { model: false, license: false },
      remove: { model: false, license: false }
    }
  }

  async componentDidMount() {
    let modelDetails = []
    let licenseDetails = []

    // Query to get all device models
    let allModels = await this.props.client.query({
      query: GET_ALL_MODELS,
      variables: { resellerLoginId: getLoginId() }
    })

    allModels = allModels.data.allModels

    // Map models in the required format
    allModels.forEach(model => {
      let tempModel = {}
      tempModel.value = model.deviceModelId
      tempModel.label = model.deviceModel.model_name
      tempModel.maxPrice = model.deviceModel.maxPrice
      modelDetails.push(tempModel)
    })

    // Query to get all licenses
    let allLicenses = await this.props.client.query({
      query: GET_ALL_LICENSES,
      variables: { resellerLoginId: getLoginId() }
    })

    allLicenses = allLicenses.data.allLicenses

    // Map licenses in the required format
    allLicenses.forEach(license => {
      let tempLicense = {}
      tempLicense.value = license.licenseTypeId
      tempLicense.label = license.licenseType.licenseType
      tempLicense.maxPrice = license.licenseType.maxPrice
      licenseDetails.push(tempLicense)
    })

    // initialize one row each for devices & plans and init button status
    let tempModelType = [{ model: null, qty: 0, maxPrice: 'NA' }]
    let tempLicenseType = [{ license: null, qty: 0, maxPrice: 'NA' }]
    let buttonStatus = {
      add: { model: false, license: false },
      remove: { model: true, license: true }
    }

    // If only one license or model is available, disable add buttons
    if (modelDetails.length === 1) {
      buttonStatus.add.model = true
    }

    if (licenseDetails.length === 1) {
      buttonStatus.add.license = true
    }

    this.setState({
      modelDetails: modelDetails,
      licenseDetails: licenseDetails,
      buttonStatus: buttonStatus,
      models: tempModelType,
      licenses: tempLicenseType
    })
  }

  handleAdd = value => event => {
    if (value === 'model') {
      let tempObject = { model: null, qty: 0, maxPrice: 'NA' }
      let currentState = this.state.models

      // add new row
      currentState.push(tempObject)
      this.setState({ models: currentState }, () => {
        let buttonStatus = this.state.buttonStatus
        if (this.state.models.length === this.state.modelDetails.length) {
          buttonStatus.add.model = true
        }
        if (this.state.models.length > 1) {
          buttonStatus.remove.model = false
        }
        this.setState({ buttonStatus: buttonStatus })
      })
    } else if (value === 'license') {
      let tempObject = { license: null, qty: 0, maxPrice: 'NA' }
      let currentState = this.state.licenses

      // add new row
      currentState.push(tempObject)
      this.setState({ licenses: currentState }, () => {
        let buttonStatus = this.state.buttonStatus
        if (this.state.licenses.length === this.state.licenseDetails.length) {
          buttonStatus.add.license = true
        }
        if (this.state.licenses.length > 1) {
          buttonStatus.remove.license = false
        }
        this.setState({ buttonStatus: buttonStatus })
      })
    }
  }

  handleRemove = value => event => {
    if (value === 'model') {
      let currentState = this.state.models

      if (currentState.length > 1) {
        currentState.pop()
        this.setState({ models: currentState }, () => {
          let buttonStatus = this.state.buttonStatus
          if (this.state.models.length === 1) {
            buttonStatus.remove.model = true
          }
          if (this.state.models.length < this.state.modelDetails.length) {
            buttonStatus.add.model = false
          }
          this.setState({ buttonStatus: buttonStatus })
        })
      }
    } else if (value === 'license') {
      let currentState = this.state.licenses

      if (currentState.length > 1) {
        currentState.pop()
        this.setState({ licenses: currentState }, () => {
          let buttonStatus = this.state.buttonStatus
          if (this.state.licenses.length === 1) {
            buttonStatus.remove.license = true
          }
          if (this.state.licenses.length < this.state.licenseDetails.length) {
            buttonStatus.add.license = false
          }
          this.setState({ buttonStatus: buttonStatus })
        })
      }
    }
  }

  handleSelectChange = (type, index) => value => {
    var i = 0
    if (type === 'model') {
      let currModels = this.state.models
      if (value) {
        currModels[index].model = value.value

        for (i = 0; i < this.state.modelDetails.length; i++) {
          if (this.state.modelDetails[i].value === value.value) {
            currModels[index].maxPrice = this.state.modelDetails[i].maxPrice
          }
        }
      } else {
        currModels[index].model = null
        currModels[index].qty = 0
        currModels[index].maxPrice = 'NA'
      }

      this.setState({ models: currModels })
    } else if (type === 'license') {
      let currLicenses = this.state.licenses
      if (value) {
        currLicenses[index].license = value.value

        for (i = 0; i < this.state.licenseDetails.length; i++) {
          if (this.state.licenseDetails[i].value === value.value) {
            currLicenses[index].maxPrice = this.state.licenseDetails[i].maxPrice
          }
        }
      } else {
        currLicenses[index].license = null
        currLicenses[index].qty = 0
        currLicenses[index].maxPrice = 'NA'
      }

      this.setState({ licenses: currLicenses })
    }
  }

  handleChange = (type, index) => event => {
    let value = event.target.value
    if (type === 'model') {
      let currModels = this.state.models
      if (value >= 0) {
        currModels[index].qty = value
      }
      this.setState({ models: currModels })
    } else if (type === 'license') {
      let currLicenses = this.state.licenses
      if (value >= 0) {
        currLicenses[index].qty = value
      }
      this.setState({ licenses: currLicenses })
    }
  }

  handleSubmit = async event => {
    // check if devices and licenses are unique and number of licenses match devices
    let devicesUnique = true
    let licensesUnique = true
    let deviceCount = 0
    let licenseCount = 0
    let countMatch = true

    // Device uniqueness check
    for (var j = 0; j < this.state.models.length; j++) {
      deviceCount += parseInt(this.state.models[j].qty, 10)
      for (var i = j + 1; i < this.state.models.length; i++) {
        if (this.state.models[i].model === this.state.models[j].model) {
          devicesUnique = false
        }
      }
    }

    // License uniqueness check
    for (j = 0; j < this.state.licenses.length; j++) {
      licenseCount += parseInt(this.state.licenses[j].qty, 10)
      for (i = j + 1; i < this.state.licenses.length; i++) {
        if (this.state.licenses[i].license === this.state.licenses[j].license) {
          licensesUnique = false
        }
      }
    }

    // check for count match
    if (deviceCount !== licenseCount) {
      countMatch = false
    }

    if (devicesUnique === false || licensesUnique === false) {
      this.props.openSnackbar('Devices / Licenses should be unique')
    } else if (countMatch === false) {
      this.props.openSnackbar('Total Devices and Licenses should match')
    } else if (deviceCount === 0 || licenseCount === 0) {
      this.props.openSnackbar(
        'Devices and Licenses should have a valid quantity'
      )
    } else {
      // Prep data in the necessary format
      let finalModels = []
      let finalLicenses = []

      this.state.models.forEach(model => {
        let tempModel = {}
        tempModel.deviceModelId = parseInt(model.model, 10)
        tempModel.quantity = parseInt(model.qty, 10)
        tempModel.assignedQuantity = 0
        finalModels.push(tempModel)
      })

      this.state.licenses.forEach(license => {
        let tempLicense = {}
        tempLicense.licenseTypeId = parseInt(license.license, 10)
        tempLicense.quantity = parseInt(license.qty, 10)
        tempLicense.assignedQuantity = 0
        finalLicenses.push(tempLicense)
      })

      const { data } = await this.props.client.mutate({
        mutation: RAISE_PURCHASE_REQUEST,
        variables: {
          licenseTypeList: finalLicenses,
          deviceModelList: finalModels,
          resellerLoginId: getLoginId()
        }
      })

      if (data.raisePurchaseRequest === true) {
        this.props.openSnackbar('Purchase Request Raised Successfully')
        this.props.history.push({
          pathname: '/home/reseller/purchase-request'
        })
      } else {
        this.props.openSnackbar('Purchase Request Failed. Retry')
      }
    }
  }

  handleCancel = event => {
    this.props.openSnackbar('Purchase Request Cancelled')
    this.props.history.goBack()
  }

  handleBack = event => {
    this.props.history.goBack()
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <Grid container spacing={16} direction="row">
          <Grid item container spacing={16}>
            <Grid item>
              <Button
                color="primary"
                variant="raised"
                onClick={this.handleBack}
              >
                Back
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="headline">Purchase Request</Typography>
          </Grid>

          {/* Device Models */}
          <Grid item xs={12}>
            <Typography variant="title">Device Model(s)</Typography>
          </Grid>
          <Grid item container xs={12} spacing={16} direction="row">
            <Grid item xs={3}>
              <Typography variant="subheading">Select Model</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subheading">Maximum Price</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subheading">Order Quantity</Typography>
            </Grid>
          </Grid>

          {/* dynamic number of rows for device models */}
          {this.state.models.map((model, index) => {
            return (
              <Grid
                item
                container
                xs={12}
                spacing={16}
                direction="row"
                key={index}
              >
                <Grid item xs={3}>
                  <Select
                    placeholder="Select Device Model"
                    classes={classes}
                    options={this.state.modelDetails}
                    value={model.model}
                    onChange={this.handleSelectChange('model', index)}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="subheading">{model.maxPrice}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    placeholder="Quantity"
                    value={model.qty}
                    onChange={this.handleChange('model', index)}
                    type="number"
                  />
                </Grid>
              </Grid>
            )
          })}

          <AddRemoveButton
            name="model"
            handleAdd={this.handleAdd}
            handleRemove={this.handleRemove}
            buttonStatus={this.state.buttonStatus}
          />

          {/* License Types */}
          <Grid item xs={12}>
            <Typography variant="title">License(s)</Typography>
          </Grid>
          <Grid item container xs={12} spacing={16} direction="row">
            <Grid item xs={3}>
              <Typography variant="subheading">License Type</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subheading">Maximum Price</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subheading">Order Quantity</Typography>
            </Grid>
          </Grid>

          {/* dynamic number of rows for device models */}
          {this.state.licenses.map((license, index) => {
            return (
              <Grid
                item
                container
                xs={12}
                spacing={16}
                direction="row"
                key={index}
              >
                <Grid item xs={3}>
                  <Select
                    placeholder="Select License Type"
                    classes={classes}
                    options={this.state.licenseDetails}
                    value={license.license}
                    onChange={this.handleSelectChange('license', index)}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="subheading">
                    {license.maxPrice}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    placeholder="Quantity"
                    value={license.qty}
                    onChange={this.handleChange('license', index)}
                    type="number"
                  />
                </Grid>
              </Grid>
            )
          })}

          <AddRemoveButton
            name="license"
            handleAdd={this.handleAdd}
            handleRemove={this.handleRemove}
            buttonStatus={this.state.buttonStatus}
          />
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
              >
                Submit
              </Button>
            </Grid>
            <Grid item>
              <Button
                color="primary"
                variant="raised"
                onClick={this.handleCancel}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(
  withApollo(withSharedSnackbar(PurchaseRequest))
)
