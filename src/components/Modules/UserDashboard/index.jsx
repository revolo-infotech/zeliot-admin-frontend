import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import CardActions from '@material-ui/core/CardActions'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 2
  },
  paper: {
    height: 140,
    width: 100
  },
  control: {
    padding: theme.spacing.unit * 2
  }
})

class UserDashboard extends Component {
  viewDetails = usertype => {
    let path = ''
    console.log('usertype', usertype)
    if (usertype === 'reseller') {
      path = '/home/users/reseller'
    } else if (usertype === 'partner') {
      path = '/home/users/partner'
    } else if (usertype === 'manufacturer') {
      path = '/home/users/manufacturer'
    }
    this.props.history.push({
      pathname: path
    })
  }
  addPlan = e => {
    this.props.history.push({
      pathname: '/home/Plans/addPlan'
    })
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <Grid container spacing={16} direction="row">
          <Grid
            item
            container
            spacing={16}
            direction="row-reverse"
            justify="space-between"
            alignItems="flex-end"
          >
            <Grid item />
            <Grid item>
              <Typography variant="headline">User's Dashboard</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={16} direction="row">
          <div>
            <Grid
              item
              container
              spacing={16}
              direction="row"
              justify="flex-start"
              alignItems="flex-start"
              className={classes.root}
            >
              <Grid item xs={12}>
                <Grid
                  item
                  container
                  spacing={16}
                  direction="row"
                  justify="flex-start"
                  alignItems="flex-start"
                >
                  <Grid item xs={16}>
                    <Card className={classes.card}>
                      <CardContent>
                        <Typography
                          gutterBottom
                          variant="headline"
                          component="h2"
                        >
                          Reseller
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          2012
                        </Typography>
                        <Typography component="p">Reseller</Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          color="primary"
                          variant="outlined"
                          onClick={() => this.viewDetails('reseller')}
                        >
                          View
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                  <Grid item xs={16}>
                    <Card className={classes.card}>
                      <CardContent>
                        <Typography
                          gutterBottom
                          variant="headline"
                          component="h2"
                        >
                          Business Admin
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          2012
                        </Typography>
                        <Typography component="p">Reseller</Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          color="primary"
                          variant="outlined"
                          onClick={() => this.viewDetails('partner')}
                          type="button"
                        >
                          View
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                  <Grid item xs={16}>
                    <Card className={classes.card}>
                      <CardContent>
                        <Typography
                          gutterBottom
                          variant="headline"
                          component="h2"
                        >
                          Manufacturer
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          2012
                        </Typography>
                        <Typography component="p">Reseller</Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          color="primary"
                          variant="outlined"
                          onClick={() => this.viewDetails('manufacturer')}
                        >
                          View
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(UserDashboard)
