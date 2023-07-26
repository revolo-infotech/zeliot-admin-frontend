import React, { Component } from 'react'
import './vehicle.css'
import Grid from '@material-ui/core/Grid'
import ItemCard from '../../../Reusable/ItemCard'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import LocationOn from '@material-ui/icons/LocationOn'
import LocationCity from '@material-ui/icons/LocationCity'

export default class VehicleRegistration extends Component {
  render() {
    return (
      <Grid
        item
        xs={12}
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        <Grid item xs={12}>
          <ItemCard
            className="details"
            style={{
              width: '100%',
              margin: '0 auto'
            }}
          >
            <Grid container className="content1">
              <Grid item xs={12} sm={12}>
                <Typography component="p">
                  <IconButton>
                    <LocationOn color="primary" />
                  </IconButton>
                  {this.props.address}
                </Typography>
                <Typography component="p">
                  <IconButton>
                    <LocationCity color="primary" />
                  </IconButton>
                  {this.props.city}
                </Typography>
              </Grid>
            </Grid>
          </ItemCard>
        </Grid>
        {/* <Grid item xs={4}>
          <ItemCard
            className="details"
            style={{
              width: '50%',
              margin: '0 auto'
            }}
          >
            <Grid container spacing={16} alignItems="center">
              <Grid item>
                <Typography variant="body2">Amount:</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body1">4000/-</Typography>
              </Grid>
              <Grid item>
                <Typography variant="body2">No of Devices Assigned:</Typography>
              </Grid>

              <Grid item xs={3}>
                <Typography variant="body1">40</Typography>
              </Grid>
              <Grid item>
                <Typography variant="body2">
                  No of Devices Registered:
                </Typography>
              </Grid>

              <Grid item xs={3}>
                <Typography variant="body1">40</Typography>
              </Grid>
            </Grid>
          </ItemCard>
        </Grid> */}
      </Grid>
    )
  }
}
