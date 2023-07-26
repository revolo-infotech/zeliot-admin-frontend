import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import getLoginId from '../../../../utils/getLoginId'

const GET_CLIENTS = gql`
  query allClientDetails($resellerLoginId: Int) {
    clients: allClientDetails(resellerLoginId: $resellerLoginId) {
      id
      clientName
      contactPerson
      contactNumber
      email
      totalAssignedVehicle
      licenseType{
        licenseType
      }
      loginId
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

class Customers extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }
  loginId = []
  fullData = []

  columns = [
    'CLIENT NAME',
    'CONTACT PERSON',
    'EMAIL',
    'PHONE NUMBER',
    'TOTAL VEHICLES',
    'PLAN'
  ]

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    onRowClick: (rowData, dataIndex, rowIndex) => {
      this.props.history.push({
        pathname:
          '/home/reseller/customers/view/' + this.loginId[dataIndex.dataIndex]
      })
    }
  }

  mapToArr(clients) {
    var rowData = []
    this.fullData = []
    this.loginId = []
    clients.forEach(element => {
      rowData = []
      this.loginId.push(element.loginId)
      rowData.push(element.clientName)
      rowData.push(element.contactPerson)
      rowData.push(element.email)
      rowData.push(element.contactNumber)
      rowData.push(element.totalAssignedVehicle)
      if (element.licenseType) {
        rowData.push(element.licenseType.licenseType)
      } else {
        rowData.push('NA')
      }

      this.fullData.push(rowData)
    })
  }
  addCustomer = e => {
    this.props.history.push({
      pathname: '/home/reseller/customers/add'
    })
  }

  render() {
    const { classes } = this.props
    console.log('getLoginId()', getLoginId())
    return (
      <Query
        query={GET_CLIENTS}
        variables={{
          resellerLoginId: getLoginId()
        }}
      >
        {({ loading, error, data: { clients } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`

          this.mapToArr(clients)

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
                      onClick={this.addCustomer}
                      variant="raised"
                      className={this.classes.button}
                    >
                      Add Customer
                    </Button>
                  </Grid>

                  <Grid item>
                    <Typography variant="headline">Customers</Typography>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
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
export default withStyles(style)(Customers)
