import React, { Component } from 'react'
import ViewPendingRequest from './ViewPendingRequest.jsx'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

export default class ViewRequest extends Component {
  render() {
    const { state } = this.props.location
    let details

    if (state === 'Sent Requests') {
      details = (
        <Grid item xs={12}>
          <Typography variant="headline">Sent Purchase Requests</Typography>
        </Grid>
      )
    } else if (state === 'Approved') {
      details = (
        <Grid item xs={12}>
          <Typography variant="headline">Approved Purchase Request</Typography>
        </Grid>
      )
    } else if (state === 'Cancelled') {
      details = (
        <Grid item xs={12}>
          <Typography variant="headline">Cancelled Purchase Request</Typography>
        </Grid>
      )
    } else if (state === 'Partially Executed') {
      details = (
        <Grid item xs={12}>
          <Typography variant="headline">
            Partially Executed Purchase Request
          </Typography>
        </Grid>
      )
    } else if (state === 'Completed') {
      details = (
        <Grid item xs={12}>
          <Typography variant="headline">Completed Purchase Request</Typography>
        </Grid>
      )
    }
    return (
      <ViewPendingRequest
        externallyRendered={true}
        goBack={this.props.history.goBack}
        details={details}
        purchaseRequestId={this.props.match.params.purchaseRequestId}
      />
    )
  }
}
