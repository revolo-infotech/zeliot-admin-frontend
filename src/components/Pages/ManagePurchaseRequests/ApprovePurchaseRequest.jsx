import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import gql from 'graphql-tag'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import TextField from '@material-ui/core/TextField'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import Select from 'react-select'
import Checkbox from '@material-ui/core/Checkbox'
import { withApollo } from 'react-apollo'

const GET_PURCHASE_REQUEST = gql`
  query getPurchaseRequestInfo($id: Int!) {
    prInfo: getPurchaseRequestInfo(id: $id) {
      reseller {
        resellerName
      }
      licenseTypeList {
        id
        licenseType
        maxPrice
        requestedQuantity
        finalPrice
        gst
        totalPrice
      }
      deviceModelList {
        id
        model_name
        maxPrice
        requestedQuantity
        finalPrice
        gst
        totalPrice
      }
    }
  }
`

const REVERT_WITH_PRICE = gql`
  mutation revertPurchaseRequestWithFinalPrice(
    $purchaseRequestId: Int!
    $licenseTypeList: [LicenseTypeRequest!]!
    $deviceModelList: [DeviceModelRequest!]!
    $isPreApproved: Boolean!
  ) {
    revertPurchaseRequestWithFinalPrice(
      purchaseRequestId: $purchaseRequestId
      licenseTypeList: $licenseTypeList
      deviceModelList: $deviceModelList
      isPreApproved: $isPreApproved
    )
  }
`
const style = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    flexGrow: 1
  }
})

class ApprovePurchaseRequest extends Component {
  state = {
    models: [],
    licenses: [],
    preApproved: false,
    purchaseRequestId: null
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

    data = data.prInfo
    let deviceDetails = []
    let licenseDetails = []

    data.deviceModelList.forEach(device => {
      let tempObject = {}
      tempObject.id = device.id
      tempObject.name = device.model_name
      tempObject.maxPrice = device.maxPrice
      tempObject.qty = device.requestedQuantity
      tempObject.finalPrice = device.finalPrice
      tempObject.gst = device.gst
      tempObject.totalPrice = device.totalPrice
      deviceDetails.push(tempObject)
    })

    data.licenseTypeList.forEach(license => {
      let tempObject = {}
      tempObject.id = license.id
      tempObject.name = license.licenseType
      tempObject.maxPrice = license.maxPrice
      tempObject.qty = license.requestedQuantity
      tempObject.finalPrice = license.finalPrice
      tempObject.gst = license.gst
      tempObject.totalPrice = license.totalPrice
      licenseDetails.push(tempObject)
    })

    this.setState({
      models: deviceDetails,
      licenses: licenseDetails,
      purchaseRequestId: purchaseRequestId
    })
  }

  calculateTotalPrice(type, index) {
    if (type === 'model') {
      let currModels = this.state.models
      let finalPrice = parseInt(currModels[index].finalPrice, 10)
      if (finalPrice > 0 && currModels[index].gst) {
        currModels[index].totalPrice =
          finalPrice * currModels[index].gst + finalPrice
      } else {
        currModels[index].totalPrice = null
      }
      this.setState({ models: currModels })
    } else if (type === 'license') {
      let currLicenses = this.state.licenses
      let finalPrice = parseInt(currLicenses[index].finalPrice, 10)
      if (finalPrice > 0 && currLicenses[index].gst) {
        currLicenses[index].totalPrice =
          finalPrice * currLicenses[index].gst + finalPrice
      } else {
        currLicenses[index].totalPrice = null
      }
      this.setState({ license: currLicenses })
    }
  }

  handleSelectChange = (type, index) => value => {
    if (type === 'model') {
      let currModels = this.state.models
      if (value) {
        currModels[index].gst = value.value
      } else {
        currModels[index].gst = null
      }
      this.setState({ models: currModels }, () => {
        this.calculateTotalPrice('model', index)
      })
    } else if (type === 'license') {
      let currLicenses = this.state.licenses
      if (value) {
        currLicenses[index].gst = value.value
      } else {
        currLicenses[index].gst = null
      }
      this.setState({ licenses: currLicenses }, () => {
        this.calculateTotalPrice('license', index)
      })
    }
  }

  handleChange = (type, index) => event => {
    let value = event.target.value
    if (type === 'model') {
      let currModels = this.state.models
      if (value >= 0) {
        currModels[index].finalPrice = value
      }
      this.setState({ models: currModels }, () => {
        this.calculateTotalPrice('model', index)
      })
    } else if (type === 'license') {
      let currLicenses = this.state.licenses
      if (value >= 0) {
        currLicenses[index].finalPrice = value
      }
      this.setState({ licenses: currLicenses }, () => {
        this.calculateTotalPrice('license', index)
      })
    }
  }

  handlePreApproval = event => {
    this.setState({ preApproved: event.target.checked })
  }

  handleBack = event => {
    this.props.history.goBack()
  }

  handleSubmit = name => async event => {
    // check if all fields are filled
    let errorModel = false
    let errorLicense = false

    for (var i = 0; i < this.state.models.length; i++) {
      if (!(this.state.models[i].gst && this.state.models[i].finalPrice)) {
        errorModel = true
      }
    }

    for (var j = 0; j < this.state.licenses.length; j++) {
      if (!(this.state.licenses[j].gst && this.state.licenses[j].finalPrice)) {
        errorLicense = true
      }
    }

    if (errorLicense || errorModel) {
      this.props.openSnackbar('All details should be filled')
    } else {
      // Prep data in the necessary format
      let finalModels = []
      let finalLicenses = []

      this.state.models.forEach(model => {
        let tempModel = {}
        tempModel.deviceModelId = parseInt(model.id, 10)
        tempModel.quantity = parseInt(model.qty, 10)
        tempModel.assignedQuantity = 0
        tempModel.finalPrice = parseInt(model.finalPrice, 10)
        tempModel.gst = model.gst
        tempModel.totalPrice = parseInt(model.totalPrice, 10)
        finalModels.push(tempModel)
      })

      this.state.licenses.forEach(license => {
        let tempLicense = {}
        tempLicense.licenseTypeId = license.id
        tempLicense.quantity = parseInt(license.qty, 10)
        tempLicense.assignedQuantity = 0
        tempLicense.finalPrice = parseInt(license.finalPrice, 10)
        tempLicense.gst = license.gst
        tempLicense.totalPrice = parseInt(license.totalPrice, 10)
        finalLicenses.push(tempLicense)
      })

      // Mutation here
      const { data } = await this.props.client.mutate({
        mutation: REVERT_WITH_PRICE,
        variables: {
          purchaseRequestId: parseInt(this.state.purchaseRequestId, 10),
          licenseTypeList: finalLicenses,
          deviceModelList: finalModels,
          isPreApproved: this.state.preApproved
        }
      })

      if (data.revertPurchaseRequestWithFinalPrice === true) {
        if (this.state.preApproved === true) {
          this.props.openSnackbar('Purchase Request Pre Approval Successful')
          this.props.history.push({
            pathname:
              '/home/manage/purchase-requests/approved/' +
              this.state.purchaseRequestId
          })
        } else {
          this.props.openSnackbar('Purchase Request Submission Successful')
          this.props.history.push({
            pathname: '/home/manage/purchase-requests'
          })
        }
      } else {
        this.props.openSnackbar('Purchase Request Submission Failed. Try Again')
      }
    }
  }

  render() {
    const { classes } = this.props
    const gstRates = [
      { value: 0.05, label: '5%' },
      { value: 0.1, label: '10%' },
      { value: 0.15, label: '15%' },
      { value: 0.18, label: '18%' }
    ]
    return (
      <div className={classes.root}>
        <Grid container spacing={16} direction="row">
          <Grid item xs={12}>
            <Button color="primary" variant="raised" onClick={this.handleBack}>
              Back
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="headline">Purchase Request</Typography>
          </Grid>

          {/* Device Models */}
          <Grid item xs={12}>
            <Typography variant="title">Device Model(s)</Typography>
          </Grid>
          <Grid item container xs={12} spacing={16} direction="row">
            <Grid item xs={2}>
              <Typography variant="subheading">Model</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subheading">Maximum Price</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subheading">Quantity</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subheading">Final Price</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subheading">GST</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subheading">Total Price</Typography>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Device Details */}
          {this.state.models.map((model, index) => {
            return (
              <Grid
                item
                container
                xs={12}
                spacing={24}
                direction="row"
                key={index}
              >
                <Grid item xs={2}>
                  <Typography variant="subheading">{model.name}</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="subheading">{model.maxPrice}</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="subheading">{model.qty}</Typography>
                </Grid>
                <Grid item xs={1}>
                  <TextField
                    placeholder="Final Price"
                    value={model.finalPrice}
                    onChange={this.handleChange('model', index)}
                    type="number"
                  />
                </Grid>
                <Grid item xs={1} />
                <Grid item xs={2}>
                  <Select
                    placeholder="Select GST %"
                    classes={classes}
                    options={gstRates}
                    value={model.gst}
                    onChange={this.handleSelectChange('model', index)}
                  />
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subheading">
                    {model.totalPrice}
                  </Typography>
                </Grid>
              </Grid>
            )
          })}

          {/* Licenses */}
          <Grid item xs={12}>
            <Typography variant="title">License(s)</Typography>
          </Grid>
          <Grid item container xs={12} spacing={16} direction="row">
            <Grid item xs={2}>
              <Typography variant="subheading">License</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subheading">Maximum Price</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subheading">Quantity</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subheading">Final Price</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subheading">GST</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subheading">Total Price</Typography>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* License Details */}
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
                <Grid item xs={2}>
                  <Typography variant="subheading">{license.name}</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="subheading">
                    {license.maxPrice}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="subheading">{license.qty}</Typography>
                </Grid>
                <Grid item xs={1}>
                  <TextField
                    placeholder="Final Price"
                    value={license.finalPrice}
                    onChange={this.handleChange('license', index)}
                    type="number"
                  />
                </Grid>
                <Grid item xs={1} />
                <Grid item xs={2}>
                  <Select
                    placeholder="Select GST %"
                    classes={classes}
                    options={gstRates}
                    value={license.gst}
                    onChange={this.handleSelectChange('license', index)}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="subheading">
                    {license.totalPrice}
                  </Typography>
                </Grid>
              </Grid>
            )
          })}

          {/* Checkbox to pre approve */}
          <Grid
            item
            xs={12}
            container
            spacing={16}
            direction="row"
            alignItems="center"
          >
            <Grid item>
              <Checkbox
                checked={this.state.preApproved}
                onChange={this.handlePreApproval}
                value="pre-approved"
              />
            </Grid>

            <Grid item>
              <Typography variant="subheading">
                Pre approve this purchase request
              </Typography>
            </Grid>
          </Grid>

          {/* Button to raise PI */}
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
                onClick={this.handleSubmit('Submit')}
                disabled={this.state.preApproved}
              >
                Submit for Approval
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
            <Grid item>
              <Button
                color="secondary"
                variant="raised"
                onClick={this.handleSubmit('Assign')}
                disabled={!this.state.preApproved}
              >
                Proceed to device assignment
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(
  withApollo(withSharedSnackbar(ApprovePurchaseRequest))
)
