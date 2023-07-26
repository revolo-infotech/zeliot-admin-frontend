import React, { Component } from 'react'
import gql from 'graphql-tag'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
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

function Details(props) {
  return (
    <Grid item container xs={12} spacing={16} direction="row">
      <Grid item xs={2}>
        <Typography variant="subheading">{props.details.name}</Typography>
      </Grid>
      <Grid item xs={2}>
        <Typography variant="subheading">{props.details.maxPrice}</Typography>
      </Grid>
      <Grid item xs={2}>
        <Typography variant="subheading">{props.details.qty}</Typography>
      </Grid>
      <Grid item xs={2}>
        <Typography variant="subheading">{props.details.finalPrice}</Typography>
      </Grid>

      <Grid item xs={2}>
        <Typography variant="subheading">{props.details.gst}</Typography>
      </Grid>
      <Grid item xs={2}>
        <Typography variant="subheading">{props.details.totalPrice}</Typography>
      </Grid>
    </Grid>
  )
}

class ViewPurchaseRequest extends Component {
  state = {
    reseller: '',
    models: [],
    licenses: [],
    purchaseRequestId: null
  }

  async componentDidMount() {
    let purchaseRequestId

    purchaseRequestId = this.props.match.params.purchaseRequestId

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
    let reseller

    reseller = data.reseller.resellerName

    data.deviceModelList.forEach(device => {
      let tempObject = {}
      tempObject.id = device.id
      tempObject.name = device.model_name
      tempObject.maxPrice = device.maxPrice
      tempObject.qty = device.requestedQuantity
      tempObject.finalPrice = device.finalPrice ? device.finalPrice : 'NA'
      tempObject.gst = device.gst ? (device.gst * 100).toString() : 'NA'
      tempObject.totalPrice = device.totalPrice ? device.totalPrice : 'NA'
      deviceDetails.push(tempObject)
    })

    data.licenseTypeList.forEach(license => {
      let tempObject = {}
      tempObject.id = license.id
      tempObject.name = license.licenseType
      tempObject.maxPrice = license.maxPrice
      tempObject.qty = license.requestedQuantity
      tempObject.finalPrice = license.finalPrice ? license.finalPrice : 'NA'
      tempObject.gst = license.gst ? (license.gst * 100).toString() : 'NA'
      tempObject.totalPrice = license.totalPrice ? license.totalPrice : 'NA'
      licenseDetails.push(tempObject)
    })

    this.setState({
      models: deviceDetails,
      licenses: licenseDetails,
      purchaseRequestId: purchaseRequestId,
      reseller: reseller
    })
  }

  handleBack = event => {
    this.props.history.goBack()
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <Grid container spacing={16} direction="row">
          {/* Back button implementation */}
          <Grid item xs={12}>
            <Button color="primary" variant="raised" onClick={this.handleBack}>
              Back
            </Button>
          </Grid>

          {/* Reseller Name */}
          <Grid item xs={12}>
            <Typography variant="display3">
              {this.state.reseller.charAt(0).toUpperCase() +
                this.state.reseller.slice(1)}
            </Typography>
            <Typography>
              Purchase Request Id: {this.state.purchaseRequestId}
            </Typography>
          </Grid>

          {/* Device Header */}
          <Grid item container xs={12} spacing={16} direction="row">
            <TypeHeader header="Device Model(s)" />
          </Grid>

          {/* Device Sub Header */}
          <Grid item container xs={12} spacing={16} direction="row">
            <SubHeader
              headers={[
                'Model',
                'Maximum Price',
                'Quantity',
                'Final Price',
                'GST',
                'Total Price'
              ]}
            />
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
                spacing={16}
                direction="row"
                key={index}
              >
                <Details details={model} />
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
              headers={[
                'License',
                'Maximum Price',
                'Quantity',
                'Final Price',
                'GST',
                'Total Price'
              ]}
            />
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
                <Details details={license} />
              </Grid>
            )
          })}
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(
  withApollo(withSharedSnackbar(ViewPurchaseRequest))
)
