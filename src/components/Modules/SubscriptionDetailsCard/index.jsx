import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import Grid from '@material-ui/core/Grid'
import ButtonBase from '@material-ui/core/ButtonBase'
import Typography from '@material-ui/core/Typography'
import CardHeader from '@material-ui/core/CardHeader'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import CardContent from '@material-ui/core/CardContent'

const styles = theme => ({
  card: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary,
    width: '100%'
  },
  buttonBase: {
    width: '100%',
    textAlign: 'left'
  }
})

class SubscriptionDetails extends Component {
  constructor(props) {
    super(props)
    this.clientDetail = props.clientDetail
  }

  render() {
    const { classes } = this.props
    return (
      <ButtonBase
        className={classes.buttonBase}
        onClick={this.props.showSubscription}
      >
        <Card className={classes.card}>
          <CardHeader
            action={
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            }
            title="Yearly Subscription"
            subheader="Created on: August 16, 2018"
          />
          <CardContent>
            <Grid container spacing={16} alignItems="center">
              <Grid item>
                <Typography variant="body2">Quantity:</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body1">16</Typography>
              </Grid>
              <Grid item>
                <Typography variant="body2">Amount:</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body1">4000/-</Typography>
              </Grid>
            </Grid>
            <Grid container spacing={16} alignItems="center">
              <Grid item>
                <Typography variant="body2">Bill Date:</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body1">16th August, 2018</Typography>
              </Grid>
              <Grid item>
                <Typography variant="body2">Bill Mode:</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body1">Prepaid</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </ButtonBase>
    )
  }
}

SubscriptionDetails.PropTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(SubscriptionDetails)
