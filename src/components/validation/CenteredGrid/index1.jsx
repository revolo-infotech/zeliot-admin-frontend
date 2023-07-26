import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import SvgIcon from '@material-ui/core/SvgIcon'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import MailIcon from '@material-ui/icons/Mail'
import ContactPhone from '@material-ui/icons/ContactPhone'
import Person from '@material-ui/icons/Person'
import LocationOn from '@material-ui/icons/LocationOn'
import LocationCity from '@material-ui/icons/LocationCity'
import Business from '@material-ui/icons/Business'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  button: {
    margin: theme.spacing.unit
  },
  input: {
    display: 'none'
  }
})

function CenteredGrid(props) {
  const { classes } = props
  return (
    <div className={classes.root} style={{ padding: '15px 15px 15px 15px' }}>
      <div>
        <div style={{ float: 'left' }}>
          <Button variant="outlined" color="primary" className={classes.button}>
            Back
          </Button>
        </div>
        <div style={{ float: 'right' }}>
          <Button variant="outlined" color="primary" className={classes.button}>
            Edit
          </Button>
        </div>
      </div>
      <div style={{ color: 'red', fontSize: '10px', textAlign: 'left' }} />
      <Grid container spacing={24}>
        <Grid
          item
          xs={12}
          style={{ color: 'red', fontSize: '10px', float: 'left' }}
        >
          <Card
            className={classes.card}
            style={{ color: 'red', fontSize: '10px' }}
          >
            <Grid container>
              <CardContent>
                <Typography variant="headline" component="h2">
                  <IconButton>
                    <Business color="primary" />
                  </IconButton>
                  YSG Cabs...
                </Typography>
                <Typography component="p">
                  <IconButton>
                    <Person color="primary" />
                  </IconButton>
                  Sudheep Nayak
                </Typography>
                <Typography component="p">
                  <IconButton>
                    <LocationOn color="primary" />
                  </IconButton>
                  Address line 1 .............dsfsd fds fdsfsd fdsf sdfsd fsdsf
                  sdfsdf sdfsd fsdf
                </Typography>
                <Typography component="p">
                  <IconButton>
                    <LocationOn color="primary" />
                  </IconButton>
                  Address line 2 .............f sdfdsfdsf sdf sdfsdf sdfss
                  fsdfsdf sdfsd f
                </Typography>
                <Typography component="p">
                  <IconButton>
                    <LocationCity color="primary" />
                  </IconButton>
                  Bangalore
                </Typography>
              </CardContent>
              <CardContent style={{ padding: '45px 0 0 0 ' }}>
                <Typography component="p">
                  <IconButton>
                    <MailIcon color="primary" />
                  </IconButton>
                  mailid@mail.com
                </Typography>
                <Typography component="p">
                  <IconButton>
                    <ContactPhone color="primary" />
                  </IconButton>
                  9039979999
                </Typography>
              </CardContent>
            </Grid>
          </Card>
        </Grid>
        <Grid
          item
          xs={4}
          style={{ color: 'red', fontSize: '10px', float: 'left' }}
        >
          <Paper className={classes.paper}>
            <span style={{ color: 'red', fontSize: '20px' }}> 1500 </span>
            <br />
            <span style={{ fontSize: '13px' }}>Total Devices</span>
          </Paper>
        </Grid>
        <Grid
          item
          xs={4}
          style={{ color: 'red', fontSize: '10px', float: 'left' }}
        >
          <Paper className={classes.paper}>
            <span style={{ color: 'red', fontSize: '20px' }}> 890 </span>
            <br />
            <span style={{ fontSize: '13px' }}> Registered Devices </span>
          </Paper>
        </Grid>
        <Grid
          item
          xs={4}
          style={{ color: 'red', fontSize: '10px', float: 'left' }}
        >
          <Paper className={classes.paper}>
            <span style={{ color: 'red', fontSize: '20px' }}> 90 </span>
            <br />
            <span style={{ fontSize: '13px' }}> Unregistered Devices </span>
          </Paper>
        </Grid>
      </Grid>
      <div style={{ color: 'red', fontSize: '10px', textAlign: 'right' }}>
        <Button variant="outlined" color="primary" className={classes.button}>
          Register Devices
        </Button>
      </div>
    </div>
  )
}

CenteredGrid.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(CenteredGrid)
