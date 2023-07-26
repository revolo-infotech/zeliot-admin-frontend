import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
// import ListItemIcon from '@material-ui/core/ListItemIcon'
// import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import Paper from '@material-ui/core/Paper'
import { Typography } from '@material-ui/core'

const styles = theme => ({
  avatar: {
    margin: 10,
    width: 60,
    height: 60
  },
  root: {
    backgroundColor: theme.palette.background.paper
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary,
    wordBreak: 'break-all'
  },
  listItem: {
    width: '100%',
    textAlign: 'left'
  },
  inlineItem: {
    display: 'inline-block',
    paddingRight: '10px'
  }
})

function ProviderSims(props) {
  const { classes } = props
  return (
    <div className={classes.root}>
      <Paper
        className={classes.paper}
        // onClick={this.props.handleProviderClick(this.props.providerId)}
        onClick={() => props.handleProviderClick(props.providerId)}
      >
        <Grid container spacing={8}>
          <Grid item xs={4}>
            <Avatar className={classes.avatar}>
              {props.provider.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
          <Grid item xs={8}>
            <Grid container spacing={8}>
              <Grid item xs={12}>
                <Typography variant="display1">
                  {props.provider.charAt(0).toUpperCase() +
                    props.provider.substr(1)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography className={classes.inlineItem} variant="body2">
                  Total SIMs:
                </Typography>
                <Typography className={classes.inlineItem} variant="body1">
                  {props.noOfSims}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* <Grid item container spacing={16} direction="row">
          <Grid item xs={4}>
            <Avatar className={classes.avatar}>
              {props.provider.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>

          <Grid item container spacing={16} xs={8} direction="row">
            <Grid item xs={12}>
              <Typography variant="display1">
                {props.provider.charAt(0).toUpperCase() +
                  props.provider.substr(1)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">Total SIMs</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">{props.noOfSims}</Typography>
            </Grid>
          </Grid>
        </Grid> */}
      </Paper>
    </div>
  )
}

export default withStyles(styles)(ProviderSims)
