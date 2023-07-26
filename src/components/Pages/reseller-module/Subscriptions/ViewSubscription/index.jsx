import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import SubscriptionDetails from './subscriptionDetails.jsx'
import Typography from '@material-ui/core/Typography'
import MUIDataTable from 'mui-datatables'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

const GET_CLIENT = gql`
  query clientDetail($loginId: Int) {
    clientDetail: clientDetail(loginId: $loginId) {
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
const GET_VEHICLES = gql`
  query getAllVehicleDetails($clientLoginId: Int) {
    vehicles: getAllVehicleDetails(clientLoginId: $clientLoginId) {
      vehicleNumber
      entityId
      speedSensorType
      speedLimit
      vehicleType
      vehicleModel
    }
  }
`

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  input: {
    display: 'none'
  }
})

class ViewSubscription extends Component {
  constructor(props) {
    super(props)
    this.loginId = this.props.match.params.loginId
    this.subscriptionId = this.props.match.params.subscriptionId
  }
  columns1 = [
    'VEHICLE NUMBER',
    'SPEED SENSOR',
    'SPEED LIMIT',
    'VEHICLE TYPE',
    'VEHICLE MODEL'
  ]
  options1 = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 5,
    onRowClick: (rowData, dataIndex, rowIndex) => {
      this.props.history.push({
        pathname:
          '/home/reseller/vehicles/edit/' + this.entityId[dataIndex.dataIndex]
      })
    }
  }

  editCustomer = loginId => e => {
    this.props.history.push({
      pathname: '/home/reseller/customers/edit/' + loginId
    })
  }

  editSubscription = e => {
    this.props.history.push({
      pathname:
        '/home/reseller/subscriptions/edit/' +
        this.loginId +
        '/' +
        this.subscriptionId
    })
  }

  showSubscription = value => e => {
    // this.props.history.push({
    //   pathname: '/home/subscriptions/view-detail/' + this.subscriptionId
    // })
  }
  mapToArr = data => {
    let rowData = []
    let fullData = []
    this.entityId = []
    data.forEach(element => {
      rowData = []
      this.entityId.push(element.entityId)
      rowData.push(element.vehicleNumber)
      rowData.push(element.speedSensorType)
      rowData.push(element.speedLimit)
      rowData.push(element.vehicleType)
      rowData.push(element.vehicleModel)
      fullData.push(rowData)
    })
    return fullData
  }

  render() {
    const { classes } = this.props
    console.log('cl', this.loginId)
    return (
      <Fragment>
        <Query
          query={GET_CLIENT}
          variables={{
            loginId: parseInt(this.loginId, 10)
          }}
        >
          {({ loading, error, data: { clientDetail } }) => {
            if (loading) return 'Loading...'
            if (error) return `Error!: ${error}`
            return (
              <Query
                query={GET_VEHICLES} // TODO: Change Query
                variables={{
                  clientLoginId: parseInt(this.loginId, 10)
                }}
              >
                {({ loading, error, data: { vehicles } }) => {
                  if (loading) return 'Loading...'
                  if (error) return `Error!: ${error}`

                  const VehData = this.mapToArr(vehicles)

                  return (
                    <div className={classes.root}>
                      <Grid container spacing={16} direction="row">
                        <Grid
                          item
                          container
                          spacing={16}
                          direction="row-reverse"
                          justify="space-between"
                        >
                          <Grid item>
                            <Button
                              variant="raised"
                              color="primary"
                              className={classes.button}
                              onClick={this.editSubscription}
                            >
                              Edit
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button
                              variant="outlined"
                              color="secondary"
                              className={classes.button}
                              // onClick={this.viewAllSubscription}
                              onClick={() => this.props.history.goBack()}
                            >
                              <ArrowBackIcon className={classes.iconSmall} />
                            </Button>
                          </Grid>
                        </Grid>
                        {/* Place the customer details card */}
                        {/* <Grid item container spacing={16} direction="row">
                  <Grid item xs={12}>
                    <CustomerDetails clientDetail={clientDetail} />
                  </Grid>
                </Grid> */}
                        <Typography variant="display1" gutterBottom>
                          &nbsp;
                          {clientDetail.clientName}
                        </Typography>
                        {/* Place the corresponding subscription card */}
                        <Grid item container spacing={16} direction="row">
                          <Grid item xs={12}>
                            <SubscriptionDetails
                              clientDetail={clientDetail}
                              showSubscription={this.showSubscription}
                              subscriptionId={this.subscriptionId}
                              clientLoginId={this.loginId}
                              isDisabled={true}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid container spacing={16} direction="row">
                        <Grid item xs={12}>
                          {/* TODO: Replace this with a custom table going forward */}
                          <MUIDataTable
                            title={'Assigned Vehicles'}
                            data={VehData}
                            columns={this.columns1}
                            options={this.options1}
                          />
                        </Grid>
                      </Grid>
                    </div>
                  )
                }}
              </Query>
            )
          }}
        </Query>
      </Fragment>
    )
  }
}

ViewSubscription.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(ViewSubscription)
