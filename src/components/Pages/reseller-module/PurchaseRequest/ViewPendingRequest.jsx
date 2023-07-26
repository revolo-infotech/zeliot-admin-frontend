import React, { Component } from 'react'
import gql from 'graphql-tag'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import withSharedSnackbar from '../../../HOCs/withSharedSnackbar'
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

const APPROVE_CANCEL_REQUEST = gql`
  mutation resellerApprovalForFinalPrice(
    $purchaseRequestId: Int!
    $isApproved: Boolean!
  ) {
    resellerApprovalForFinalPrice(
      purchaseRequestId: $purchaseRequestId
      isApproved: $isApproved
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

class ViewPendingRequest extends Component {
  state = {
    models: [],
    licenses: [],
    purchaseRequestId: null
  }

  async componentDidMount() {
    let purchaseRequestId

    if (this.props.externallyRendered === true) {
      purchaseRequestId = this.props.purchaseRequestId
    } else {
      purchaseRequestId = this.props.match.params.purchaseRequestId
    }

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
      purchaseRequestId: purchaseRequestId
    })
  }

  handleBack = event => {
    if (this.props.externallyRendered === true) {
      this.props.goBack()
    } else {
      this.props.history.goBack()
    }
  }

  handleApprove = async event => {
    // Approve PR Mutation here
    const { data } = await this.props.client.mutate({
      mutation: APPROVE_CANCEL_REQUEST,
      variables: {
        purchaseRequestId: parseInt(this.state.purchaseRequestId, 10),
        isApproved: true
      }
    })

    if (data.resellerApprovalForFinalPrice === true) {
      this.props.openSnackbar('Purchase Request Approved')
      this.props.history.push({
        pathname: '/home/reseller/purchase-request'
      })
    } else {
      this.props.openSnackbar('Approval of Purchase Request Failed')
    }
  }

  handleCancel = async event => {
    // Cancel PR Mutation here
    const { data } = await this.props.client.mutate({
      mutation: APPROVE_CANCEL_REQUEST,
      variables: {
        purchaseRequestId: parseInt(this.state.purchaseRequestId, 10),
        isApproved: false
      }
    })

    if (data.resellerApprovalForFinalPrice === true) {
      this.props.openSnackbar('Purchase Request Cancelled')
      this.props.history.push({
        pathname: '/home/purchase-request'
      })
    } else {
      this.props.openSnackbar('Cancellation of Purchase Request Failed')
    }
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

          {/* Heading */}
          <Grid item xs={12}>
            {this.props.externallyRendered === false ? (
              <Grid item xs={12}>
                <Typography variant="headline">
                  Pending Purchase Request
                </Typography>
              </Grid>
            ) : (
              this.props.details
            )}
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

          {/* Update and Cancel Buttons */}
          {this.props.externallyRendered === false ? (
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
                  onClick={this.handleApprove}
                >
                  Approve
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
          ) : null}
        </Grid>
      </div>
    )
  }
}

ViewPendingRequest.defaultProps = {
  externallyRendered: false
}

export default withStyles(style)(
  withApollo(withSharedSnackbar(ViewPendingRequest))
)
