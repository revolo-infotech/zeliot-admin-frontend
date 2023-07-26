import React from 'react'
import { Grid, withStyles, Typography, Divider } from '@material-ui/core'
import DemoLoginForm from './DemoLoginForm'

const styles = theme => ({
  fullHeight: {
    height: '100%'
  },
  softPadding: {
    padding: theme.spacing.unit
  }
})

function CreateDemoLink({ classes }) {
  return (
    <Grid container className={classes.fullHeight} alignContent="flex-start">
      <Grid item xs={12} className={classes.softPadding}>
        <Typography variant="headline">Create Demo Login Link</Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12} className={classes.softPadding}>
        <DemoLoginForm />
      </Grid>
    </Grid>
  )
}

export default withStyles(styles)(CreateDemoLink)
