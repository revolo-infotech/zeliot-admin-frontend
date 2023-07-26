import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import IconButton from '@material-ui/core/IconButton'
import MailIcon from '@material-ui/icons/Mail'
import ContactPhone from '@material-ui/icons/ContactPhone'
import Person from '@material-ui/icons/Person'
import LocationOn from '@material-ui/icons/LocationOn'
import LocationCity from '@material-ui/icons/LocationCity'
import Business from '@material-ui/icons/Business'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

const GET_RESELLER = gql`
  query getResellerDetails($loginId: Int) {
    getResellerDetails(loginId: $loginId) {
      id
      resellerName
      contactPerson
      address
      city
      state {
        name
      }
      country {
        name
      }
      email
      contactNumber
      login {
        loginId
      }
    }
  }
`

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

class ResellerView extends Component {
  constructor(props) {
    super(props)
    this.loginId = parseInt(this.props.match.params.loginId, 10)
  }

  editCustomer = loginId => e => {
    this.props.history.push({
      pathname: '/home/reseller/edit/' + this.loginId
    })
  }

  handleRegistration = e => {
    this.props.history.push({
      pathname: '/home/customer/vehicle/register'
    })
  }

  showSubscription = subscriptionId => e => {
    this.props.history.push({
      pathname:
        '/home/subscriptions/view/' + this.loginId + '/' + subscriptionId
    })
  }
  allCustomer = e => {
    console.log('er=', e)
    this.props.history.push({
      pathname: e,
      state: {
        from: this.props.location.pathname
      }
    })
  }
  createNewSubscription = e => {
    this.props.history.push({
      pathname: '/home/subscriptions/new/' + this.loginId
    })
  }
  render() {
    const classes = this.props
    return (
      <Query
        query={GET_RESELLER}
        variables={{
          loginId: this.loginId
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`
          console.log('Client Detail is ', data)
          return (
            <div
              className={classes.root}
              style={{ padding: '15px 15px 15px 15px' }}
            >
              <div>
                <div style={{ float: 'left' }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    className={classes.button}
                    // href="/home/customers"
                    // onClick={() => this.allCustomer(this.backUrl)}
                    onClick={() => this.props.history.goBack()}
                  >
                    <ArrowBackIcon className={classes.iconSmall} />
                  </Button>
                </div>
                <div style={{ float: 'right' }}>
                  <Button
                    color="secondary"
                    variant="raised"
                    className={classes.button}
                    onClick={this.handleRegistration}
                  >
                    Assign Devices
                  </Button>
                  &nbsp;&nbsp;
                  <Button
                    variant="outlined"
                    color="primary"
                    className={classes.button}
                    onClick={this.editCustomer(
                      data.getResellerDetails.login.loginId
                    )}
                  >
                    Edit
                  </Button>
                </div>
              </div>
              <div
                style={{ color: 'red', fontSize: '10px', textAlign: 'left' }}
              />
              <Grid container spacing={24}>
                <Grid
                  item
                  xs={9}
                  style={{ color: 'red', fontSize: '10px', float: 'left' }}
                >
                  <Card
                    className={classes.card}
                    style={{ color: 'red', fontSize: '10px' }}
                  >
                    <Grid container>
                      <CardContent>
                        <Typography
                          variant="headline"
                          component="h2"
                          color="primary"
                        >
                          <IconButton>
                            <Business color="primary" />
                          </IconButton>
                          {data.getResellerDetails.resellerName}
                        </Typography>
                        <Typography component="p">
                          <IconButton>
                            <Person color="primary" />
                          </IconButton>
                          {data.getResellerDetails.contactPerson}
                        </Typography>
                        <Typography component="p">
                          <IconButton>
                            <LocationOn color="primary" />
                          </IconButton>
                          {data.getResellerDetails.address}
                        </Typography>
                        <Typography component="p">
                          <IconButton>
                            <LocationCity color="primary" />
                          </IconButton>
                          {data.getResellerDetails.city}{' '}
                          {data.getResellerDetails.state.name}{' '}
                          {data.getResellerDetails.country.name}
                        </Typography>
                      </CardContent>
                      <CardContent>
                        <Typography
                          component="p"
                          style={{ padding: '45px 0 0 0 ' }}
                        >
                          <IconButton>
                            <MailIcon color="primary" />
                          </IconButton>
                          {data.getResellerDetails.email}
                        </Typography>
                        <Typography component="p">
                          <IconButton>
                            <ContactPhone color="primary" />
                          </IconButton>
                          {data.getResellerDetails.contactNumber}
                        </Typography>
                      </CardContent>
                    </Grid>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card
                    className={classes.card}
                    style={{
                      color: 'red',
                      fontSize: '10px',
                      textAlign: 'center'
                    }}
                  >
                    <Paper className={classes.paper} style={{ padding: '3px' }}>
                      <span style={{ color: 'red', fontSize: '20px' }}>
                        100
                      </span>
                      <br />
                      <span style={{ fontSize: '15px', color: 'black' }}>
                        Total Devices
                      </span>
                    </Paper>
                  </Card>
                  <br />
                  <Card
                    className={classes.card}
                    style={{
                      color: 'red',
                      fontSize: '10px',
                      textAlign: 'center'
                    }}
                  >
                    <Paper className={classes.paper} style={{ padding: '3px' }}>
                      <span
                        style={{
                          color: 'red',
                          fontSize: '20px',
                          textAlign: 'center'
                        }}
                      >
                        {/* {Math.floor(
                          0.6 * data.getResellerDetails.totalAssignedVehicle
                        )}{' '} */}
                        100
                      </span>
                      <br />
                      <span style={{ fontSize: '15px', color: 'black' }}>
                        Assign Devices <br />
                      </span>
                    </Paper>
                  </Card>
                  <br />
                  <Card
                    className={classes.card}
                    style={{
                      color: 'red',
                      fontSize: '10px',
                      textAlign: 'center'
                    }}
                  >
                    <Paper className={classes.paper} style={{ padding: '3px' }}>
                      <span
                        style={{
                          color: 'red',
                          fontSize: '20px',
                          textAlign: 'center'
                        }}
                      >
                        {/* {Math.floor(
                          0.4 * data.getResellerDetails.totalAssignedVehicle
                        )}{' '} */}
                        100
                      </span>
                      <br />
                      <span style={{ fontSize: '15px', color: 'black' }}>
                        {' '}
                        Unregistered Devices
                      </span>
                    </Paper>
                  </Card>
                </Grid>
              </Grid>
              <br />
            </div>
          )
        }}
      </Query>
    )
  }
}

ResellerView.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(ResellerView)
