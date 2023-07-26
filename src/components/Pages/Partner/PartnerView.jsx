import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { Switch } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import { CardContent, Divider } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import MailIcon from '@material-ui/icons/Mail'
import ContactPhone from '@material-ui/icons/ContactPhone'
import Person from '@material-ui/icons/Person'
import LocationOn from '@material-ui/icons/LocationOn'
import LocationCity from '@material-ui/icons/LocationCity'
import Business from '@material-ui/icons/Business'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

import Subscriptions from './Subscriptions'
import { PrivateRoute } from '../../Router'
import SubscriptionForm from './SubscriptionForm'

const GET_PARTNER = gql`
  query partnerDetail($loginId: Int) {
    partnerDetail(loginId: $loginId) {
      id
      businessName
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
  gridItem: {
    padding: theme.spacing.unit * 2
  },
  containerPadding: {
    padding: theme.spacing.unit
  },
  gridItemHorizontal: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,

    '&:first-child': {
      paddingLeft: 0
    },
    '&:last-child': {
      paddingRight: 0
    }
  },
  gridItemVertical: {
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,

    '&:first-child': {
      paddingTop: 0
    },
    '&:last-child': {
      paddingBottom: 0
    }
  },
  cardItemIcon: {
    margin: theme.spacing.unit
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
  },
  alignCenter: {
    display: 'flex',
    alignItems: 'center'
  },
  valueNumber: {
    color: 'red',
    fontSize: '1.2rem'
  }
})

class PartnerView extends Component {
  constructor(props) {
    super(props)
    this.loginId = parseInt(this.props.match.params.loginId, 10)
  }

  editCustomer = loginId => e => {
    this.props.history.push({
      pathname: '/home/partner/edit/' + this.loginId
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
    const { classes } = this.props

    return (
      <Query
        query={GET_PARTNER}
        variables={{
          loginId: this.loginId
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`

          return (
            <Grid container>
              <Grid item xs={12}>
                <Grid container justify="space-between">
                  <Grid item className={classes.gridItemHorizontal}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      className={classes.button}
                      onClick={() => this.props.history.goBack()}
                    >
                      <ArrowBackIcon className={classes.iconSmall} />
                    </Button>
                  </Grid>

                  <Grid item className={classes.gridItemHorizontal}>
                    <Button
                      color="secondary"
                      variant="raised"
                      className={classes.button}
                      onClick={this.handleRegistration}
                    >
                      Assign Devices
                    </Button>

                    <Button
                      variant="outlined"
                      color="primary"
                      className={classes.button}
                      onClick={this.editCustomer(
                        data.partnerDetail.login.loginId
                      )}
                    >
                      Edit
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid container className={classes.containerPadding}>
                  <Grid
                    item
                    xs={12}
                    md={9}
                    className={classes.gridItemHorizontal}
                  >
                    <Card className={classes.card}>
                      <CardContent>
                        <Grid container>
                          <Grid item xs={12}>
                            <Grid container alignItems="center">
                              <Grid item className={classes.alignCenter}>
                                <Business
                                  color="primary"
                                  className={classes.cardItemIcon}
                                />
                              </Grid>

                              <Grid item>
                                <Typography variant="headline" color="primary">
                                  {data.partnerDetail.businessName}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Grid container alignItems="center">
                              <Grid item className={classes.alignCenter}>
                                <Person
                                  color="primary"
                                  className={classes.cardItemIcon}
                                />
                              </Grid>

                              <Grid item>
                                <Typography color="primary">
                                  {data.partnerDetail.contactPerson}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Grid container alignItems="center">
                              <Grid item className={classes.alignCenter}>
                                <LocationOn
                                  color="primary"
                                  className={classes.cardItemIcon}
                                />
                              </Grid>

                              <Grid item>
                                <Typography color="primary">
                                  {data.partnerDetail.address}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Grid container alignItems="center">
                              <Grid item className={classes.alignCenter}>
                                <LocationCity
                                  color="primary"
                                  className={classes.cardItemIcon}
                                />
                              </Grid>

                              <Grid item>
                                <Typography color="primary">
                                  {`${data.partnerDetail.city} ${
                                    data.partnerDetail.state.name
                                  } ${data.partnerDetail.country.name}`}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Grid container alignItems="center">
                              <Grid item className={classes.alignCenter}>
                                <MailIcon
                                  color="primary"
                                  className={classes.cardItemIcon}
                                />
                              </Grid>

                              <Grid item>
                                <Typography color="primary">
                                  {data.partnerDetail.email}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Grid container alignItems="center">
                              <Grid item className={classes.alignCenter}>
                                <ContactPhone
                                  color="primary"
                                  className={classes.cardItemIcon}
                                />
                              </Grid>

                              <Grid item>
                                <Typography color="primary">
                                  {data.partnerDetail.contactNumber}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    md={3}
                    className={classes.gridItemHorizontal}
                  >
                    <Grid container>
                      <Grid item xs={12} className={classes.gridItemVertical}>
                        <Paper className={classes.paper}>
                          <span className={classes.valueNumber}>100</span>
                          <br />
                          <span>Total Devices</span>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} className={classes.gridItemVertical}>
                        <Paper className={classes.paper}>
                          <span className={classes.valueNumber}>100</span>
                          <br />
                          <span>
                            Assign Devices <br />
                          </span>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} className={classes.gridItemVertical}>
                        <Paper className={classes.paper}>
                          <span className={classes.valueNumber}>100</span>
                          <br />
                          <span>Unregistered Devices</span>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid container className={classes.containerPadding}>
                    <Grid item xs={12}>
                      <Typography variant="title">Subscriptions</Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider />
                    </Grid>

                    <Grid item xs={12} className={classes.gridItemVertical}>
                      <Subscriptions
                        partnerLoginId={parseInt(
                          this.props.match.params.loginId,
                          10
                        )}
                      />
                      <Grid container className={classes.containerPadding} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )
        }}
      </Query>
    )
  }
}

PartnerView.propTypes = {
  classes: PropTypes.object.isRequired
}

const WrappedPartnerView = withStyles(styles)(PartnerView)

export default props => (
  <Switch>
    <PrivateRoute
      exact
      path="/home/partner/view/:loginId/add-subscription"
      render={() => <SubscriptionForm {...props} />}
    />

    <PrivateRoute
      exact
      path="/home/partner/view/:loginId/edit-subscription"
      render={() => <SubscriptionForm {...props} />}
    />

    <PrivateRoute
      path="/home/partner/view/:loginId"
      render={() => <WrappedPartnerView {...props} />}
    />
  </Switch>
)
