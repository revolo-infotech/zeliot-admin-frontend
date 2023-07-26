import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Business from '@material-ui/icons/Business'
import MailIcon from '@material-ui/icons/Mail'
import ContactPhone from '@material-ui/icons/ContactPhone'
import Person from '@material-ui/icons/Person'
import LocationOn from '@material-ui/icons/LocationOn'
import LocationCity from '@material-ui/icons/LocationCity'

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary
  }
})

class CustomerDetails extends Component {
  constructor(props) {
    super(props)
    this.clientDetail = props.clientDetail
  }
  render() {
    const { classes } = this.props
    return (
      <Paper className={classes.paper}>
        <Grid container spacing={16} alignItems="center">
          <Grid item>
            <Business color="primary" />
          </Grid>
          <Grid item>
            <Typography variant="headline">
              {this.clientDetail.clientName}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={16} alignItems="center">
          <Grid item>
            <Person color="primary" />
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              {this.clientDetail.contactPerson}
            </Typography>
          </Grid>
          <Grid item>
            <MailIcon color="primary" />
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">{this.clientDetail.email}</Typography>
          </Grid>
        </Grid>
        <Grid container spacing={16} alignItems="center">
          <Grid item>
            <LocationOn color="primary" />
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">{this.clientDetail.address}</Typography>
          </Grid>
          <Grid item>
            <ContactPhone color="primary" />
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              {this.clientDetail.contactNumber}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={16} alignItems="center">
          <Grid item>
            <LocationCity color="primary" />
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1">
              {this.clientDetail.city} {this.clientDetail.state.name}{' '}
              {this.clientDetail.country.name}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    )
  }
}

CustomerDetails.PropTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(CustomerDetails)
