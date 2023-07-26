import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import getLoginId from '../../../../utils/getLoginId'

// TODO: Replace this query with the one to get all subscriptions associated with a loginId
const GET_ALL_SUBSCRIPTION = gql`
  query getAllResellerSubscriptions($resellerLoginId: Int!) {
    getAllResellerSubscriptions(resellerLoginId: $resellerLoginId) {
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
      licenseType {
        licenseType
      }
      licenseTypeId
      amount
    }
  }
`
const style = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
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
    'BILLING MODE',
    'BILLING FREQUENCY',
    'AMOUNT'
  ]

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    onRowClick: (rowData, dataIndex, rowIndex) => {
      this.props.history.push({
        pathname:
          '/home/reseller/subscriptions/view/' +
          this.clientId[dataIndex.dataIndex] +
          '/' +
          this.subcriptionId[dataIndex.dataIndex]
        // pathname: '/home/subscriptions/view/' + this.clientId[rowIndex]
      })
    }
  }

  createNewSubscription = e => {
    this.props.history.push({
      pathname: '/home/reseller/subscriptions/new'
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
      if (element.licenseType) {
        rowData.push(element.licenseType.licenseType)
      } else {
        rowData.push('NA')
      }
      rowData.push(element.deviceQuantity)
      rowData.push(element.billingMode.billingMode)
      rowData.push(element.billingFrequency.frequency)
      rowData.push(element.amount)
      this.fullData.push(rowData)
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Query
        query={GET_ALL_SUBSCRIPTION} // TODO: Change Query
        variables={{
          resellerLoginId: getLoginId()
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`
          console.log('allSubscriptions', data)
          this.mapToArr(data.getAllResellerSubscriptions)

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
                      color="secondary"
                      onClick={this.createNewSubscription}
                      variant="contained"
                      className={classes.button}
                    >
                      New Subscription
                    </Button>
                  </Grid>
                  <Grid item>
                    <Typography variant="headline">
                      All Subscriptions
                    </Typography>
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
