import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import MenuIcon from '@material-ui/icons/Menu'

const GET_RESELLER = gql`
  query getAllResellerDetails {
    getAllResellerDetails {
      resellerName
      email
      contactNumber
      contactPerson
      licenseExpiryPeriod
      login {
        loginId
      }
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

class Reseller extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }
  loginId = []
  fullData = []

  columns = [
    'COMPANY NAME',
    'CONTACT PERSON',
    'EMAIL',
    'PHONE NUMBER',
    'OFFER PERIOD'
  ]

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    onRowClick: (rowData, dataIndex, rowIndex) => {
      this.props.history.push({
        pathname: '/home/reseller/view/' + this.loginId[dataIndex.dataIndex]
      })
    }
  }

  mapToArr(clients) {
    var rowData = []
    this.fullData = []
    this.loginId = []

    console.log('sss', clients.getAllResellerDetails.length, clients)
    if (clients.getAllResellerDetails.length > 0) {
      clients.getAllResellerDetails.forEach(element => {
        rowData = []
        this.loginId.push(element.login.loginId)
        rowData.push(element.resellerName)
        rowData.push(element.contactPerson)
        rowData.push(element.email)
        rowData.push(element.contactNumber)
        rowData.push(element.licenseExpiryPeriod)
        this.fullData.push(rowData)
      })
    }
  }
  addCustomer = e => {
    this.props.history.push({
      pathname: '/home/RegisterReseller'
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Query query={GET_RESELLER} errorPolicy="all">
        {({ loading, error, data }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`

          this.mapToArr(data)

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
                      Add Reseller
                    </Button>
                    {'  '}
                    <Button variant="outlined" className={classes.button}>
                      <MenuIcon className={classes.iconSmall} />
                    </Button>
                  </Grid>
                  <Grid item>
                    <Typography variant="headline">Reseller</Typography>
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
export default withStyles(style)(Reseller)
