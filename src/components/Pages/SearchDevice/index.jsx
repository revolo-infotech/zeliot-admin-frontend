import React, { Component } from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import moment from 'moment'

const GET_LATEST_INFO = gql`
  query getLatestLocation($uniqueId: String!) {
    getLatestLocation(uniqueId: $uniqueId) {
      timestamp
      latitude
      longitude
      speed
    }
  }
`

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  iconSmall: {
    fontSize: 20
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  dense: {
    marginTop: 16
  }
})

class SearchDevice extends Component {
  state = {
    uniqueId: '',
    latestTrackInfo: []
  }

  columns = ['TIMESTAMP', 'LATITUDE', 'LONGITUDE', 'SPEED']

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15
  }

  handleChange = event => {
    this.setState({ uniqueId: event.target.value })
  }

  getLatestTackInfo = async () => {
    // console.log('hi')
    const latestInfo = await this.props.client.query({
      query: GET_LATEST_INFO,
      variables: {
        uniqueId: 'it_' + this.state.uniqueId
      }
    })

    if (latestInfo && latestInfo.data) {
      // this.mapToArr(latestInfo.data.getLatestLocation)
      console.log('allBills.data', latestInfo.data.getLatestLocation)
      this.setState({
        latestTrackInfo: latestInfo.data.getLatestLocation
      })
      // console.log('allBills.data', this.state.latestTrackInfo)
    }
  }

  getFormattedDate = timestamp =>
    moment(timestamp * 1000).format('MMM Do YYYY, h:mm a')

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <Typography variant="subtitle1" gutterBottom>
          <h2>Search Device</h2>
        </Typography>
        <Grid container spacing={16}>
          <Grid item xs={3}>
            <TextField
              id="outlined-dense"
              label="Enter Serial/IMEI No."
              margin="dense"
              variant="outlined"
              onChange={this.handleChange}
              value={this.state.uniqueId}
            />
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={this.getLatestTackInfo}
            >
              Search
            </Button>
          </Grid>
        </Grid>
        <br />
        <br />
        <Grid container spacing={24}>
          <Grid item xs={3}>
            <h3>Timestamp :</h3>
            {this.state.latestTrackInfo.timestamp
              ? this.getFormattedDate(this.state.latestTrackInfo.timestamp)
              : 'No Data'}
          </Grid>
          <Grid item xs={3}>
            <h3>Latitude :</h3> {this.state.latestTrackInfo.latitude}
          </Grid>
          <Grid item xs={3}>
            <h3>Longitude :</h3> {this.state.latestTrackInfo.longitude}
          </Grid>
          <Grid item xs={3}>
            <h3>Speed :</h3> {this.state.latestTrackInfo.speed}
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(withApollo(SearchDevice))
