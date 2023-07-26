import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import withStyles from '@material-ui/core/styles/withStyles'

const errorPageStyle = theme => ({
  containerGrid: {
    background: 'rgba(229, 255, 252, 0.4)',
    width: '100%',
    height: '100vh'
  },
  errorTitleBottomMargin: {
    marginBottom: theme.spacing.unit * 5
  }
})

const DomainFetchError = ({ classes }) => (
  <Grid
    container
    justify="center"
    alignItems="center"
    className={classes.containerGrid}
  >
    <Grid item xs={12}>
      <Grid container justify="center">
        <Grid item xs={12} className={classes.errorTitleBottomMargin}>
          <Typography align="center" gutterBottom variant="h4">
            Oops, Something went wrong!
          </Typography>
        </Grid>
        <Grid item xs={12} sm={8} md={6} lg={4} xl={3}>
          <Typography align="center" gutterBottom variant="h6">
            Please try again later
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  </Grid>
)

export default withStyles(errorPageStyle)(DomainFetchError)
