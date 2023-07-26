import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import SubscriptionDetails from './subscriptionDetails.jsx'
import Typography from '@material-ui/core/Typography'
import MUIDataTable from 'mui-datatables'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import getAccountType from '../../../utils/getAccountType.js'
import Loader from '../../../components/common/Loader'

const GET_CLIENT = gql`
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
const GET_SUBSCRIPTION_INVENTORY = gql`
  query getSubscriptionInventoryAssign($subscriptionId: Int!) {
    subscription: getSubscriptionInventoryAssign(
      subscriptionId: $subscriptionId
    ) {
      id
      assignedDeviceDetails {
        serial_num
        imei_num
        uniqueDeviceId
        vehicleDetails {
          vehiclenumber
        }
      }
      asignedSimDetails {
        phoneNumber
        simNumber
        vehicleDetails {
          vehiclenumber
        }
      }
    }
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
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  input: {
    display: 'none'
  },
  breakWord: {
    wordBreak: 'break-all'
  }
})

class ViewSubscription extends Component {
  constructor(props) {
    super(props)
    this.loginId = parseInt(this.props.match.params.loginId, 10)
    this.subscriptionId = parseInt(this.props.match.params.subscriptionId, 10)
    this.state = {
      deviceList: '',
      simList: ''
    }
  }

  columns1 = [
    'SERIAL NUMBER',
    'IMEI NUMBER',
    'UNIQUE DEVICE ID',
    'VEHICLE NUMBER'
  ]
  columns2 = ['PHONE NUMBER', 'SIM NUMBER', 'VEHICLE NUMBER']

  options1 = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 5
  }

  editCustomer = loginId => e => {
    this.props.history.push({
      pathname: '/home/customers/edit/' + loginId
    })
  }

  editSubscription = e => {
    this.props.history.push({
      pathname:
        '/home/subscriptions/edit/' + this.loginId + '/' + this.subscriptionId
    })
  }

  showSubscription = value => e => {
    // this.props.history.push({
    //   pathname: '/home/subscriptions/view-detail/' + this.subscriptionId
    // })
  }

  mapToArr = data => {
    // console.log('meena', data, 'data1')
    let rowData = []
    let fullData = []
    this.entityId = []
    data.forEach(element => {
      rowData = []
      // this.entityId.push(element.entityId)
      rowData.push(element.serial_num)
      rowData.push(element.imei_num)
      rowData.push(element.uniqueDeviceId)
      if (element.vehicleDetails !== null) {
        rowData.push(element.vehicleDetails.vehiclenumber)
      } else {
        rowData.push('NA')
      }

      fullData.push(rowData)
    })
    this.setState({ deviceList: fullData })
    // console.log(fullData, 'fulldata')
    return fullData
  }
  mapToSimArr = data => {
    // console.log('meena', data, 'data1')
    let rowData = []
    let fullData = []
    data.forEach(element => {
      rowData = []
      // this.entityId.push(element.entityId)
      rowData.push(element.phoneNumber)
      rowData.push(element.simNumber)
      if (element.vehicleDetails !== null) {
        rowData.push(element.vehicleDetails.vehiclenumber)
      } else {
        rowData.push('NA')
      }

      fullData.push(rowData)
    })
    this.setState({ simList: fullData })
    // console.log(fullData, 'fulldata')
    return fullData
  }
  getSubscriptionInventory = async () => {
    const { data } = await this.props.client.query({
      query: GET_SUBSCRIPTION_INVENTORY,
      variables: {
        subscriptionId: parseInt(this.subscriptionId, 10)
      },
      fetchPolicy: 'network-only'
    })
    // console.log(data, 'data1')
    this.setDetails(data.subscription)
  }
  setDetails = inventoryDetails => {
    // console.log(inventoryDetails, 'llll')
    if (inventoryDetails) {
      if (inventoryDetails.assignedDeviceDetails.length > 0) {
        this.mapToArr(inventoryDetails.assignedDeviceDetails)
      }
      if (inventoryDetails.asignedSimDetails.length > 0) {
        this.mapToSimArr(inventoryDetails.asignedSimDetails)
      }
    }
  }
  componentDidMount() {
    this.getSubscriptionInventory()
  }
  render() {
    const { classes } = this.props
    return (
      <Fragment>
        <Query
          query={GET_CLIENT}
          variables={{
            loginId: parseInt(this.loginId, 10)
          }}
          fetchPolicy="network-only"
        >
          {({ loading, error, data: { clientDetail } }) => {
            if (loading) return <Loader />
            if (error) return `Error!: ${error}`

            return (
              <div className={classes.root}>
                <Grid container spacing={16} direction="row">
                  <Grid item xs={12}>
                    <Grid container justify="space-between">
                      <Grid item>
                        <Button
                          variant="outlined"
                          color="secondary"
                          className={classes.button}
                          onClick={() => this.props.history.goBack()}
                        >
                          <ArrowBackIcon className={classes.iconSmall} />
                        </Button>
                      </Grid>
                      <Grid item>
                        {!['INV', 'ACC'].includes(getAccountType()) && (
                          <Button
                            variant="raised"
                            color="secondary"
                            className={classes.button}
                            onClick={this.editSubscription}
                          >
                            Edit
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="display1" gutterBottom>
                      &nbsp;
                      {clientDetail.clientName}
                    </Typography>
                  </Grid>
                  {/* Place the corresponding subscription card */}
                  {/* <Grid item container spacing={16} direction="row"> */}
                  <Grid item xs={12}>
                    <SubscriptionDetails
                      clientDetail={clientDetail}
                      showSubscription={this.showSubscription}
                      subscriptionId={this.subscriptionId}
                      clientLoginId={this.loginId}
                      isDisabled={true}
                    />
                    {/* </Grid> */}
                    {/* </Grid> */}
                  </Grid>

                  {['SAL', 'PA'].includes(getAccountType()) && (
                    // <Grid container spacing={16} direction="row">
                    <Grid item xs={12}>
                      {/* TODO: Replace this with a custom table going forward */}
                      <MUIDataTable
                        title="Assigned Devices"
                        data={this.state.deviceList}
                        columns={this.columns1}
                        options={this.options1}
                      />
                    </Grid>
                    // </Grid>
                  )}
                  {['SAL', 'PA'].includes(getAccountType()) && (
                    // <Grid container spacing={16} direction="row">
                    <Grid item xs={12}>
                      {/* TODO: Replace this with a custom table going forward */}
                      <MUIDataTable
                        title="Assigned SIMs"
                        data={this.state.simList}
                        columns={this.columns2}
                        options={this.options1}
                      />
                    </Grid>
                    // </Grid>
                  )}
                </Grid>
              </div>
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

export default withStyles(styles)(withApollo(ViewSubscription))
