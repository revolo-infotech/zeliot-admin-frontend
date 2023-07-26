import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import Button from '@material-ui/core/Button'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import SubscriptionDetails from '../ViewSubscription/subscriptionDetails.jsx'
import getLoginId from '../../../utils/getLoginId'
import getAccountType from '../../../utils/getAccountType'
import Dialog from '@material-ui/core/Dialog'
import ChangeClientPassword from './ChangeClientPassword'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import Loader from '../../../components/common/Loader'
import CustomerDetailsCard from '../../Modules/CustomerDetailsCard/index.jsx'

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
      plan {
        id
        planName
      }
      loginId
      login {
        status
      }
      totalRegisteredDevices
      totalUnregisteredDevices
      totalDevices
      expiryDate
      type
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

// const GENRATE_DEMO_LINK = gql`
//   query createTimeLimitedLogin(
//     $username: String!
//     $password: String!
//     $portalURL: String!
//     $hours: Int!
//   ) {
//     createTimeLimitedLogin(
//       username: $username
//       password: $password
//       portalURL: $portalURL
//       hours: $hours
//     ) {
//       token
//     }
//   }
// `

// calling server for updation
const UPDATE_STATUS = gql`
  mutation clientDeactivationAndActivation(
    $clientLoginId: Int!
    $activate: Boolean!
    $accountType: String!
  ) {
    clientDeactivationAndActivation(
      clientLoginId: $clientLoginId
      activate: $activate
      accountType: $accountType
    )
  }
`

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing.unit * 2
    },
    flexGrow: 1
  },
  statusCard: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center'
  },
  statusCardRoot: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusCardCount: {
    color: 'red',
    fontSize: '20px',
    marginBottom: '5px'
  },
  statusCardText: {
    fontSize: '15px',
    color: 'black'
  },
  statusCardContainer: {
    [theme.breakpoints.up('sm')]: {
      height: '100%'
    }
  },
  layoutChange: {
    [theme.breakpoints.down('xs')]: {
      flexWrap: 'wrap-reverse'
    }
  }
})

class ViewCustomer extends Component {
  constructor(props) {
    super(props)
    this.loginId = this.props.match.params.loginId
  }

  state = {
    open: false,
    demoURL: '',
    openDemo: false
  }

  editCustomer = loginId => e => {
    this.props.history.push({
      pathname: '/home/customers/edit/' + this.loginId
    })
  }

  loginCustomer = clientId => async () => {
    const { data } = await this.props.client.query({
      query: GET_LOGIN_TOKEN,
      variables: {
        clientid: clientId
      }
    })

    if (data) {
      const { data: domain } = await this.props.client.query({
        query: GET_CLIENT_DOMAIN,
        variables: {
          loginId: getLoginId()
        }
      })

      let clienturl =
        'https://' + domain.domain + '/?token=' + data.getClientLoginToken.token
      let win = window.open(clienturl, '_blank')
      win.focus()
    }
  }

  // demoLink = async event => {
  //   const { data } = await this.props.client.query({
  //     query: GENRATE_DEMO_LINK,
  //     variables: {
  //       username: 'democlient',
  //       password: 'democlient',
  //       portalURL: 'web.aquilatrack.com',
  //       hours: 168
  //     }
  //   })

  //   let clienturl =
  //     'https://web.aquilatrack.com' +
  //     // domain.domain +
  //     '/?token=' +
  //     data.createTimeLimitedLogin.token
  //   // console.log('clienturl', clienturl)
  //   this.setState({ demoURL: clienturl, openDemo: true })
  //   // var win = window.open(clienturl, '_blank')
  //   // win.focus()
  // }

  handleRegistration = e => {
    this.props.history.push({
      pathname:
        '/home/customer/vehicle/registervehicle/' +
        this.props.match.params.loginId
    })
  }

  showSubscription = subscriptionId => e => {
    this.props.history.push({
      pathname:
        '/home/subscriptions/view/' + this.loginId + '/' + subscriptionId
    })
  }

  allCustomer = e => {
    // console.log('er=', e)
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

  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  handleDemoClose = () => {
    this.setState({ openDemo: false, demoURL: '' })
  }

  handleActivateDeactivate = clientStatus => async () => {
    let status = ''
    if (clientStatus === 1) {
      status = false
    } else {
      status = true
    }
    const { data, errors } = await this.props.client.mutate({
      mutation: UPDATE_STATUS,
      variables: {
        clientLoginId: parseInt(this.loginId, 10),
        activate: status,
        accountType: 'CLT'
      },
      refetchQueries: ['clientDetail']
    })
    console.log(data, 'data', errors)
    if (data === null) {
      this.props.openSnackbar(errors[0].message)
    } else {
      this.props.openSnackbar(data.clientDeactivationAndActivation)
    }
  }

  render() {
    const { classes } = this.props

    return (
      <Query
        query={GET_CLIENTS}
        variables={{
          loginId: parseInt(this.loginId, 10)
        }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data: { clientDetail } }) => {
          if (loading) return <Loader />
          if (error) return `Error!: ${error}`
          // console.log('Client Detail is ', clientDetail)
          return (
            <div
              className={classes.root}
              style={{ padding: '15px 15px 15px 15px' }}
            >
              {/*
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
                  {!['SAL'].includes(getAccountType()) && (
                    <Button
                      color="secondary"
                      variant="raised"
                      className={classes.button}
                      onClick={this.handleRegistration}
                    >
                      Register Vehicle
                    </Button>
                  )}
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
                  {!['SAL'].includes(getAccountType()) && (
                    <Button
                      variant="outlined"
                      color="primary"
                      className={classes.button}
                      onClick={this.loginCustomer(clientDetail.id)}
                    >
                      Login Preview
                    </Button>
                  )}
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
                            <AccountCircle color="primary" />
                          </IconButton>
                          Account Type: {clientDetail.type}
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
                        {'   '}
                        <Typography component="p">
                          <Button
                            variant="outlined"
                            color="primary"
                            className={classes.button}
                            onClick={this.handleClickOpen}
                          >
                            Change Password
                          </Button>
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

                        <Typography component="p">
                          <IconButton>
                            <Timelapse color="primary" />
                          </IconButton>
                          Deactivates on:{' '}
                          {clientDetail.expiryDate
                            ? moment
                                .unix(clientDetail.expiryDate)
                                .format(
                                  'MMM Do YYYY, hh:mm A'
                                )
                            : 'N/A'}
                        </Typography>

                        <Typography component="p">
                          <Button
                            variant="outlined"
                            color="primary"
                            className={classes.button}
                            onClick={this.handleActivateDeactivate(
                              clientDetail.login.status
                            )}
                          >
                            {clientDetail.login.status === 1
                              ? 'Deactivate'
                              : 'Activate'}
                          </Button>
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
                        {clientDetail.totalDevices}
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
                        {clientDetail.totalRegisteredDevices}{' '}
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
                        {clientDetail.totalUnregisteredDevices}{' '}
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
              <Dialog
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby="form-dialog-title"
              >
                <ChangeClientPassword
                  handleClose={this.handleClose}
                  clientLoginId={this.loginId}
                />
              </Dialog>
              <Dialog
                open={this.state.openDemo}
                onClose={this.handleDemoClose}
                aria-labelledby="form-dialog-title"
              >
                <DialogTitle
                  id="form-dialog-title"
                  onClose={this.handleDemoClose}
                >
                  Copy the demo link
                </DialogTitle>
                <Divider light />{' '}
                <DialogContent> {this.state.demoURL}</DialogContent>
                <DialogActions>
                  <Button
                    onClick={this.handleDemoClose}
                    color="default"
                    variant="contained"
                  >
                    Close
                  </Button>
                </DialogActions>
              </Dialog>
*/}

              <Grid container spacing={16}>
                <Grid item xs={12}>
                  <Grid container spacing={16} justify="space-between">
                    <Grid item xs={12} sm="auto">
                      <Button
                        variant="outlined"
                        color="secondary"
                        className={classes.button}
                        onClick={() => this.props.history.goBack()}
                      >
                        <ArrowBackIcon className={classes.iconSmall} />
                      </Button>
                    </Grid>

                    <Grid item xs={12} sm="auto">
                      <Grid container justify="flex-end">
                        <Grid
                          container
                          justify="space-between"
                          alignItems="stretch"
                          spacing={16}
                        >
                          <Grid item xs={12} sm="auto">
                            {!['SAL'].includes(getAccountType()) && (
                              <Button
                                fullWidth
                                color="secondary"
                                variant="raised"
                                className={classes.button}
                                onClick={this.handleRegistration}
                              >
                                Register Devices
                              </Button>
                            )}
                          </Grid>
                          <Grid item xs={12} sm="auto">
                            <Button
                              fullWidth
                              variant="outlined"
                              color="primary"
                              className={classes.button}
                              onClick={this.editCustomer(clientDetail.loginId)}
                            >
                              Edit
                            </Button>
                          </Grid>
                          <Grid item xs={12} sm="auto">
                            {!['SAL'].includes(getAccountType()) && (
                              <Button
                                fullWidth
                                variant="outlined"
                                color="primary"
                                className={classes.button}
                                onClick={this.loginCustomer(clientDetail.id)}
                              >
                                Login Preview
                              </Button>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid container spacing={16} className={classes.layoutChange}>
                    <Grid item xs={12} sm={9}>
                      <CustomerDetailsCard
                        clientDetail={clientDetail}
                        actions={() => (
                          <Fragment>
                            <Button
                              color="secondary"
                              className={classes.button}
                              onClick={this.handleActivateDeactivate(
                                clientDetail.login.status
                              )}
                            >
                              {clientDetail.login.status === 1
                                ? 'Deactivate'
                                : 'Activate'}
                            </Button>
                            <Button
                              color="secondary"
                              className={classes.button}
                              onClick={this.handleClickOpen}
                            >
                              Change Password
                            </Button>
                          </Fragment>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <Grid
                        container
                        justify="space-between"
                        spacing={8}
                        className={classes.statusCardContainer}
                      >
                        <Grid item xs={12}>
                          <Card className={classes.statusCardRoot}>
                            <div className={classes.statusCard}>
                              <div className={classes.statusCardCount}>
                                {clientDetail.totalDevices}
                              </div>
                              <div className={classes.statusCardText}>
                                Total Devices
                              </div>
                            </div>
                          </Card>
                        </Grid>

                        <Grid item xs={12}>
                          <Card className={classes.statusCardRoot}>
                            <div className={classes.statusCard}>
                              <div className={classes.statusCardCount}>
                                {clientDetail.totalRegisteredDevices}
                              </div>
                              <div className={classes.statusCardText}>
                                Registered Devices
                              </div>
                            </div>
                          </Card>
                        </Grid>

                        <Grid item xs={12}>
                          <Card className={classes.statusCardRoot}>
                            <div className={classes.statusCard}>
                              <div className={classes.statusCardCount}>
                                {clientDetail.totalUnregisteredDevices}
                              </div>
                              <div className={classes.statusCardText}>
                                Unregistered Devices
                              </div>
                            </div>
                          </Card>
                        </Grid>
                      </Grid>
                      <Dialog
                        open={this.state.open}
                        onClose={this.handleClose}
                        aria-labelledby="form-dialog-title"
                      >
                        <ChangeClientPassword
                          handleClose={this.handleClose}
                          clientLoginId={this.loginId}
                        />
                      </Dialog>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Query
                    query={GET_ALL_SUBCRIPTIONS}
                    variables={{
                      partnerLoginId: getLoginId(),
                      clientLoginId: parseInt(this.loginId, 10)
                    }}
                    errorPolicy="all"
                  >
                    {({ loading, error, data }) => {
                      if (loading) return <Loader />
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

                      return (
                        <Grid container spacing={16}>
                          {allSubscriptions.map((subscription, index) => (
                            <Grid item xs={12} key={index}>
                              <SubscriptionDetails
                                clientLoginId={this.loginId}
                                showSubscription={this.showSubscription}
                                subscriptionId={subscription.id}
                                viewVehicles={true}
                                isDisabled={false}
                                backUrl={this.backUrl}
                                disableLoader={true}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      )
                      // return allSubscriptions.map(subscription => (
                      //   <SubscriptionDetails
                      //     clientLoginId={this.loginId}
                      //     showSubscription={this.showSubscription}
                      //     subscriptionId={subscription.id}
                      //     viewVehicles={true}
                      //     isDisabled={false}
                      //     backUrl={this.backUrl}
                      //     disableLoader={true}
                      //   />
                      // ))
                    }}
                  </Query>
                </Grid>
              </Grid>
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

export default withStyles(styles)(withApollo(withSharedSnackbar(ViewCustomer)))
