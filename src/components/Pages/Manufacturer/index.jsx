import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import MenuIcon from '@material-ui/icons/Menu'

const GET_MANUFACTURER = gql`
  query getAllManufacturer {
    clients: getAllManufacturer {
      manufacturerName
      email
      contactNumber
      contactPerson
      id
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

class Manufacturer extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }
  loginId = []
  fullData = []

  columns = ['COMPANY NAME', 'CONTACT PERSON', 'EMAIL', 'PHONE NUMBER']

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

    clients.forEach(element => {
      rowData = []
      this.loginId.push(element.id)
      rowData.push(element.manufacturerName)
      rowData.push(element.contactPerson)
      rowData.push(element.email)
      rowData.push(element.contactNumber)
      this.fullData.push(rowData)
    })
  }
  addCustomer = e => {
    this.props.history.push({
      pathname: '/home/add-manufacturer'
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Query query={GET_MANUFACTURER}>
        {({ loading, error, data: { clients } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`
          console.log('man', clients)
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
                      Add Manufacturer
                    </Button>
                    {'  '}
                    <Button variant="outlined" className={classes.button}>
                      <MenuIcon className={classes.iconSmall} />
                    </Button>
                  </Grid>
                  <Grid item>
                    <Typography variant="headline">
                      Manufacturer Details
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
export default withStyles(style)(Manufacturer)
