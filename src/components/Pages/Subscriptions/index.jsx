import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import getLoginId from '../../../utils/getLoginId'
import getAccountType from '../../../utils/getAccountType'
import Loader from '../../../components/common/Loader'

const GET_ALL_SUBSCRIPTION = gql`
  query getAllSubscriptions($partnerLoginId: Int!, $status: Int) {
    allSubscriptions: getAllSubscriptions(
      partnerLoginId: $partnerLoginId
      status: $status
    ) {
      id
      client {
        loginId
        clientName
      }
      billingMode {
        id
        billingMode
      }
      billingFrequency {
        id
        frequency
      }
      deviceModel {
        model_name
      }
      deviceQuantity
      plan
      amount
      status
    }
  }
`

const style = theme => ({
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
  iconSmall: {
    fontSize: 20
  }
})

class Subscriptions extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }
  clientId = []
  fullData = []

  columns = [
    'CUSTOMER NAME',
    'PLAN',
    'DEVICE COUNT',
    'MODEL NAME',
    'BILLING MODE',
    'BILLING FREQUENCY',
    'AMOUNT',
    'STATUS'
  ]

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    onRowClick: (rowData, dataIndex, rowIndex) => {
      this.props.history.push({
        pathname:
          '/home/subscriptions/view/' +
          this.clientId[dataIndex.dataIndex] +
          '/' +
          this.subcriptionId[dataIndex.dataIndex]
      })
    }
  }

  createNewSubscription = e => {
    this.props.history.push({
      pathname: '/home/subscriptions/new'
    })
  }

  mapToArr(allSubscriptions) {
    var rowData = []
    this.fullData = []
    this.clientId = []
    this.subcriptionId = []
    allSubscriptions.forEach(element => {
      rowData = []
      this.clientId.push(element.client.loginId)
      this.subcriptionId.push(element.id)
      rowData.push(element.client.clientName)
      if (element.plan) {
        rowData.push(element.plan)
      } else {
        rowData.push('NA')
      }
      rowData.push(element.deviceQuantity)
      rowData.push(element.deviceModel.model_name)
      rowData.push(element.billingMode.billingMode)
      rowData.push(element.billingFrequency.frequency)
      rowData.push(element.amount)
      rowData.push(element.status === 2 ? 'Approved' : 'Pending')
      this.fullData.push(rowData)
    })
  }

  render() {
    const { classes } = this.props

    const queryVariables = {
      partnerLoginId: getLoginId()
    }

    if (['ACC'].includes(getAccountType())) {
      queryVariables['status'] = 1
    }

    if (['INV'].includes(getAccountType())) {
      queryVariables['status'] = 2
    }

    return (
      <Query
        query={GET_ALL_SUBSCRIPTION}
        variables={queryVariables}
        fetchPolicy="cache-and-network"
      >
        {({ loading, error, data: { allSubscriptions } }) => {
          if (loading) return <Loader />
          if (error) return `Error!: ${error}`
          console.log('df', allSubscriptions)
          this.mapToArr(allSubscriptions)

          return (
            <div className={classes.root}>
              <Grid container spacing={16} direction="row">
                <Grid item xs={12}>
                  <Grid container spacing={16} justify="space-between">
                    <Grid item>
                      <Typography variant="headline">
                        All Subscriptions
                      </Typography>
                    </Grid>

                    {!['INV', 'ACC'].includes(getAccountType()) && (
                      <Grid item xs={12} sm="auto">
                        <Button
                          fullWidth
                          color="secondary"
                          onClick={this.createNewSubscription}
                          variant="contained"
                          className={classes.button}
                        >
                          New Subscription
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  {/* TODO: Replace this with a custom table going forward */}
                  <MUIDataTable
                    data={this.fullData}
                    columns={this.columns}
                    options={this.options}
                  />
                </Grid>
              </Grid>
            </div>
          )
        }}
      </Query>
    )
  }
}

Subscriptions.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(style)(Subscriptions)
