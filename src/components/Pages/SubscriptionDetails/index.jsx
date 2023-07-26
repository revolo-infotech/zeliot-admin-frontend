import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import PropTypes from 'prop-types'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import getLoginId from '../../../utils/getLoginId'
import Loader from '../../../components/common/Loader'

const GET_DEVICE_STOCK = gql`
  query getPartnerDeviceStockByDeviceModel($partnerLoginId: Int!) {
    devices: getPartnerDeviceStockByDeviceModel(
      partnerLoginId: $partnerLoginId
    ) {
      modelName
      totalAssignedDevice
      availableStock
    }
  }
`
const style = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  card: {
    minWidth: 900
  }
})

class SubscriptionDetails extends Component {
  constructor(props) {
    super(props)
    this.classes = props
    // console.log('testttttt:', this.props.location.state.clientId)
  }
  clientId = []
  columns = ['Vehicle Number', 'Sim No', 'Status']
  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15
    // onCellClick: (colIndex, rowIndex) => {
    //   this.props.history.push({
    //     pathname: '/home/customers/view',
    //     state: { clientId: this.clientId[rowIndex] }
    //   })
    // }
  }
  mapToArr(devices) {
    var rowData = []
    var fullData = []
    // this.clientId = []
    devices.forEach(element => {
      rowData = []
      // this.clientId.push(element.id)
      rowData.push(element.modelName)
      rowData.push(element.totalAssignedDevice)
      rowData.push(element.availableStock)
      fullData.push(rowData)
    })
    return fullData
  }

  // ViewCustomer = loginId => e => {
  //   this.props.history.push({
  //     pathname: '/home/customers/view',
  //     state: {
  //       clientId: this.clientId,
  //       loginId: loginId
  //     }
  //   })
  // }

  render() {
    const { classes } = this.props
    // const { alignItems, direction, justify } = this.state

    return (
      <Query
        query={GET_DEVICE_STOCK}
        variables={{
          partnerLoginId: getLoginId()
        }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data: { devices } }) => {
          if (loading) return <Loader />
          if (error) return `Error!: ${error}`
          const data = this.mapToArr(devices)
          return (
            <div className={classes.root}>
              <Grid container spacing={24}>
                <Grid item container spacing={12} direction="row-reverse">
                  <Grid item>
                    <Button
                      variant="flat"
                      color="primary"
                      className={classes.button}
                      href="/home/customers/view"
                      // onClick={this.ViewCustomer(
                      //   this.props.location.state.loginId
                      // )}
                    >
                      Back
                    </Button>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Card className={classes.card}>
                    <Grid
                      item
                      container
                      spacing={12}
                      direction="row"
                      justify="flex-start"
                      alignItems="center"
                    >
                      <Grid item>
                        <CardContent>
                          <Typography
                            // className={classes.title}
                            color="textSecondary"
                            variant="caption"
                          >
                            Customer Name
                          </Typography>
                          <Typography variant="subheading" component="h4">
                            Ola Cabs
                          </Typography>
                        </CardContent>
                      </Grid>
                      <Grid item>
                        <CardContent>
                          <Typography
                            className={classes.title}
                            color="textSecondary"
                          >
                            Plan
                          </Typography>
                          <Typography variant="subheading" component="h4">
                            Basic Plan
                          </Typography>
                        </CardContent>
                      </Grid>
                      <Grid item>
                        <CardContent>
                          <Typography
                            className={classes.title}
                            color="textSecondary"
                          >
                            Subscription
                          </Typography>
                          <Typography variant="subheading" component="h4">
                            Bi-Monthly
                          </Typography>
                        </CardContent>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <MUIDataTable
                    title={'Subscription Details'}
                    data={data}
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
SubscriptionDetails.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(style)(SubscriptionDetails)
