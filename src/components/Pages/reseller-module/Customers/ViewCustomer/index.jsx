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
import { Query, withApollo } from 'react-apollo'
import IconButton from '@material-ui/core/IconButton'
import MailIcon from '@material-ui/icons/Mail'
import ContactPhone from '@material-ui/icons/ContactPhone'
import Person from '@material-ui/icons/Person'
import LocationOn from '@material-ui/icons/LocationOn'
import LocationCity from '@material-ui/icons/LocationCity'
import Business from '@material-ui/icons/Business'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import SubscriptionDetails from '../../Subscriptions/ViewSubscription/subscriptionDetails.jsx'
import getLoginId from '../../../../../utils/getLoginId'

const GET_CLIENTS = gql`
  query clientDetail($loginId: Int) {
    clientDetail(loginId: $loginId) {
      id
      clientName
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

      loginId

      totalAssignedVehicle
    }
  }
`
const GET_ALL_SUBCRIPTIONS = gql`
  query getAllSubscriptions($partnerLoginId: Int!, $clientLoginId: Int) {
    allSubscriptions: getAllSubscriptions(
      partnerLoginId: $partnerLoginId
      clientLoginId: $clientLoginId
    ) {
      id
      client {
        loginId
        clientName
      }
      billingMode {
        billingMode
      }
      billingFrequency {
        frequency
      }
      deviceQuantity
      plan
      amount
      createdAt
    }
  }
`
const GET_LOGIN_TOKEN = gql`
  query getClientLoginToken($clientid: Int!) {
    getClientLoginToken(id: $clientid) {
      token
    }
  }
`
const GET_CLIENT_DOMAIN = gql`
  query getPartnerDomainConfig($loginId: Int!) {
    domain: getPartnerDomainConfig(loginId: $loginId)
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

class ViewCustomer extends Component {
  constructor(props) {
    super(props)
    this.loginId = this.props.match.params.loginId
  }

  editCustomer = loginId => e => {
    this.props.history.push({
      pathname: '/home/reseller/customers/edit/' + this.loginId
    })
  }

  handleRegistration = e => {
    this.props.history.push({
      pathname: '/home/reseller/vehicles/register'
    })
  }
  loginCustomer = clientId => async () => {
    console.log('login')
    const { data } = await this.props.client.query({
      query: GET_LOGIN_TOKEN,
      variables: {
        clientid: clientId
      }
    })
    console.log(data, 'data.getClientLoginToken.token')
    if (data) {
      const { data: domain } = await this.props.client.query({
        query: GET_CLIENT_DOMAIN,
        variables: {
          loginId: getLoginId()
        }
      })
      console.log(domain, 'domain')
      let clienturl =
        'https://' + domain.domain + '/?token=' + data.getClientLoginToken.token
      console.log('clienturl', clienturl)
      var win = window.open(clienturl, '_blank')
      win.focus()
    }
  }
  showSubscription = subscriptionId => e => {
    this.props.history.push({
      pathname:
        '/home/reseller/subscriptions/view/' +
        this.loginId +
        '/' +
        subscriptionId
    })
  }
  allCustomer = e => {
    this.props.history.push({
      pathname: e,
      state: {
        from: this.props.location.pathname
      }
    })
  }
  createNewSubscription = e => {
    this.props.history.push({
      pathname: '/home/reseller/subscriptions/new/' + this.loginId
    })
  }
  render() {
    const classes = this.props
    return (
      <Query
        query={GET_CLIENTS}
        variables={{
          loginId: parseInt(this.loginId, 10)
        }}
      >
        {({ loading, error, data: { clientDetail } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`
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
                    Register Devices
                  </Button>
                  &nbsp;&nbsp;
                  <Button
                    variant="outlined"
                    color="primary"
                    className={classes.button}
                    onClick={this.editCustomer(clientDetail.loginId)}
                  >
                    Edit
                  </Button>
                  &nbsp;&nbsp;
                  <Button
                    variant="outlined"
                    color="primary"
                    className={classes.button}
                    onClick={this.loginCustomer(clientDetail.id)}
                  >
                    Login
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
                          {clientDetail.clientName}
                        </Typography>
                        <Typography component="p">
                          <IconButton>
                            <Person color="primary" />
                          </IconButton>
                          {clientDetail.contactPerson}
                        </Typography>
                        <Typography component="p">
                          <IconButton>
                            <LocationOn color="primary" />
                          </IconButton>
                          {clientDetail.address}
                        </Typography>
                        <Typography component="p">
                          <IconButton>
                            <LocationCity color="primary" />
                          </IconButton>
                          {clientDetail.city} {clientDetail.state.name}{' '}
                          {clientDetail.country.name}
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
                          {clientDetail.email}
                        </Typography>
                        <Typography component="p">
                          <IconButton>
                            <ContactPhone color="primary" />
                          </IconButton>
                          {clientDetail.contactNumber}
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
                        {clientDetail.totalAssignedVehicle}
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
                        {Math.floor(0.6 * clientDetail.totalAssignedVehicle)}{' '}
                      </span>
                      <br />
                      <span style={{ fontSize: '15px', color: 'black' }}>
                        Registered Devices <br />
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
                        {Math.floor(0.4 * clientDetail.totalAssignedVehicle)}{' '}
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
              <Query
                query={GET_ALL_SUBCRIPTIONS}
                variables={{
                  partnerLoginId: getLoginId(),
                  clientLoginId: parseInt(this.loginId, 10)
                }}
                errorPolicy="all"
              >
                {({ loading, error, data }) => {
                  if (loading) return 'Loading...'
                  if (error) {
                    return (
                      <Typography
                        variant="sub-heading"
                        color="error"
                        align="center"
                      >
                        No Subscriptions Created!
                      </Typography>
                    )
                  }
                  // console.log('error2', error)
                  let allSubscriptions = []
                  if (data) {
                    allSubscriptions = data.allSubscriptions
                    if (allSubscriptions.length === 0) {
                      return (
                        <Typography
                          variant="sub-heading"
                          color="error"
                          align="left"
                        >
                          No Subscriptions Created! &nbsp;&nbsp;
                          <Button
                            color="secondary"
                            onClick={this.createNewSubscription}
                            variant="contained"
                            className={classes.button}
                          >
                            Create New Subscription
                          </Button>
                        </Typography>
                      )
                    }
                  }
                  return allSubscriptions.map(subscription => (
                    <SubscriptionDetails
                      clientLoginId={this.loginId}
                      showSubscription={this.showSubscription}
                      subscriptionId={subscription.id}
                      viewVehicles={true}
                      isDisabled={false}
                      backUrl={this.backUrl}
                    />
                  ))
                }}
              </Query>
            </div>
          )
        }}
      </Query>
    )
  }
}

ViewCustomer.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(withApollo(ViewCustomer))
