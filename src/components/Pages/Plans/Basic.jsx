import React, { Component } from 'react'
import Checkbox from '@material-ui/core/Checkbox'
import SimpleSnackbar from './simpleSnackbar'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

// import Value from './Value'
export default class Basic extends Component {
  // state = {
  //   terms: false
  // }

  render() {
    let cost = 0
    // console.log('price', this.props.tempPrice)

    if (this.props.allFeaturesList) {
      this.props.allFeaturesList.features.map(
        featuresList => (cost = cost + this.props.tempPrice[featuresList.id])
      )
    }
    // console.log('totprice', cost)
    return (
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <Typography variant="title">Total Plan Cost = {cost}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Checkbox
            checked={this.terms}
            onChange={this.props.handleTermsChangeChecked('terms')}
            value="terms"
          />
          <Typography style={{ display: 'inline-block' }}>
            Terms and Conditions
          </Typography>
        </Grid>

        {/* {this.state.terms === true && <SimpleSnackbar message="Got it" />}
          {this.state.terms === false && (
            <SimpleSnackbar message="Accept Terms" />
          )} */}
        <Grid item xs={12}>
          <SimpleSnackbar
            terms={this.props.terms}
            cost={cost}
            message={this.props.message}
            planName={this.props.planName}
            plan={this.props.plan}
            description={this.props.description}
            handleSubmit={this.props.handleSubmit}
            handleCancel={this.props.handleCancel}
          />
          {/* <Value message={this.props.message} /> */}
        </Grid>
      </Grid>
    )
  }
}
