import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import MenuIcon from '@material-ui/icons/Menu'

const GET_PARTNER = gql`
  query allPartnerDetails {
    clients: allPartnerDetails {
      businessName
      email
      contactNumber
      contactPerson
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

class Partner extends Component {
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
        pathname: '/home/partner/view/' + this.loginId[dataIndex.dataIndex]
      })
    }
  }

  mapToArr(clients) {
    var rowData = []
    this.fullData = []
    this.loginId = []

    clients.forEach(element => {
      rowData = []
      this.loginId.push(element.login.loginId)
      rowData.push(element.businessName)
      rowData.push(element.contactPerson)
      rowData.push(element.email)
      rowData.push(element.contactNumber)
      this.fullData.push(rowData)
    })
  }
  addCustomer = e => {
    this.props.history.push({
      pathname: '/home/add-partner'
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Query query={GET_PARTNER}>
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
                      Add Partner
                    </Button>
                    {'  '}
                    <Button variant="outlined" className={classes.button}>
                      <MenuIcon className={classes.iconSmall} />
                    </Button>
                  </Grid>
                  <Grid item>
                    <Typography variant="headline">Partner Details</Typography>
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
export default withStyles(style)(Partner)
