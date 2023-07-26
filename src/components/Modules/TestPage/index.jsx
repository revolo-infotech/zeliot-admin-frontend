import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import AllCountries from '../../Modules/AllCountries'
import AllStates from '../../Modules/AllStates'

export default class Landing extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="Landing">
        <Grid
          container
          alignItems="center"
          justify="center"
          className="full-screen"
        >
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <AllCountries placeholder="Select Country" />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <AllStates placeholder="Select State" countryId="99" />
          </Grid>
        </Grid>
      </div>
    )
  }
}
