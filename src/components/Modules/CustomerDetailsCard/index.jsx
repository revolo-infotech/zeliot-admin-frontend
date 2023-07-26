import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import MailIcon from '@material-ui/icons/Mail'
import ContactPhone from '@material-ui/icons/ContactPhone'
import Person from '@material-ui/icons/Person'
import LocationOn from '@material-ui/icons/LocationOn'
import LocationCity from '@material-ui/icons/LocationCity'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import AccountCircle from '@material-ui/icons/AccountCircle'
import Timelapse from '@material-ui/icons/Timelapse'
import moment from 'moment'

const styles = theme => ({
  card: {
    wordBreak: 'break-all'
  },
  cardItemIcon: {
    paddingRight: '10px'
  }
})

class CustomerDetailsCard extends Component {
  render() {
    const { classes, clientDetail, actions } = this.props
    return (
      <Card className={classes.card}>
        <CardHeader
          title={clientDetail.clientName}
          subheader="Customer Details"
        />
        <CardContent>
          {/* TODO: Needs more layout fixing */}
          <Grid container alignItems="baseline" spacing={16}>
            <Grid item xs={6} sm={4}>
              <Grid container alignItems="flex-start">
                <Grid item xs={12} md={'auto'} className={classes.cardItemIcon}>
                  <Person color="primary" />
                </Grid>
                <Grid item>
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography variant="body2">Contact Person:</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        {clientDetail.contactPerson || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Grid container alignItems="flex-start">
                <Grid item xs={12} md={'auto'} className={classes.cardItemIcon}>
                  <AccountCircle color="primary" />
                </Grid>
                <Grid item>
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography variant="body2">Account Type:</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        {clientDetail.type || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Grid container alignItems="flex-start">
                <Grid item xs={12} md={'auto'} className={classes.cardItemIcon}>
                  <LocationOn color="primary" />
                </Grid>
                <Grid item>
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography variant="body2">Address:</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        {clientDetail.address || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Grid container alignItems="flex-start">
                <Grid item xs={12} md={'auto'} className={classes.cardItemIcon}>
                  <LocationCity color="primary" />
                </Grid>
                <Grid item>
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography variant="body2">Location:</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        {(clientDetail.city || 'N/A') +
                          ' ' +
                          (clientDetail.state.name || '') +
                          ' ' +
                          (clientDetail.country.name || '')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Grid container alignItems="flex-start">
                <Grid item xs={12} md={'auto'} className={classes.cardItemIcon}>
                  <MailIcon color="primary" />
                </Grid>
                <Grid item>
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography variant="body2">E-Mail:</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        {clientDetail.email || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Grid container alignItems="flex-start">
                <Grid item xs={12} md={'auto'} className={classes.cardItemIcon}>
                  <ContactPhone color="primary" />
                </Grid>
                <Grid item>
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography variant="body2">Contact Number:</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        {clientDetail.contactNumber || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Grid container alignItems="flex-start">
                <Grid item xs={12} md={'auto'} className={classes.cardItemIcon}>
                  <Timelapse color="primary" />
                </Grid>
                <Grid item>
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography variant="body2">Deactivates On:</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        {clientDetail.expiryDate
                          ? moment
                            .unix(clientDetail.expiryDate)
                            .format('MMM Do YYYY, hh:mm A')
                          : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
        {actions && <CardActions>{actions()}</CardActions>}
      </Card>
    )
  }
}

CustomerDetailsCard.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(CustomerDetailsCard)
