import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import getLoginId from '../../../utils/getLoginId'
import FileSaver from 'file-saver'
import axios from 'axios'
import moment from 'moment'
import Loader from '../../../components/common/Loader'

const GET_CLIENTS = gql`
  query allClientDetails($partnerLoginId: Int) {
    clients: allClientDetails(partnerLoginId: $partnerLoginId) {
      id
      clientName
      contactPerson
      contactNumber
      email
      totalAssignedVehicle
      plan {
        id
        planName
      }
      loginId
      trackingDetails {
        trackingCount
        nonTrackingCount
      }
      createdAt
    }
  }
`

const GET_FILE_FORMAT = gql`
  query getPublicDownloadURL($bucketname: String!, $filename: String!) {
    getPublicDownloadURL(bucketName: $bucketname, filename: $filename)
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
    'TRACKING VEHICLES',
    'NONTRACKING VEHICLES',
    'PLAN',
    'CREATED DATE'
  ]

  options = {
    selectableRows: false,
    filter: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    onRowClick: (rowData, dataIndex, rowIndex) => {
      this.props.history.push({
        pathname: '/home/customers/view/' + this.loginId[dataIndex.dataIndex]
      })
    }
  }

  mapToArr(clients) {
    let rowData = []
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
      rowData.push(element.trackingDetails.trackingCount)
      rowData.push(element.trackingDetails.nonTrackingCount)
      if (element.plan) {
        rowData.push(element.plan.planName)
      } else {
        rowData.push('NA')
      }
      rowData.push(this.getFormattedDate(element.createdAt))

      this.fullData.push(rowData)
    })
  }

  addCustomer = e => {
    this.props.history.push({
      pathname: '/home/customers/add'
    })
  }

  addBulkCustomer = e => {
    this.props.history.push({
      pathname: '/home/customers/BulkRegister'
    })
  }

  downloadBulkUpload = client => async event => {
    const { data } = await this.props.client.query({
      query: GET_FILE_FORMAT,
      variables: {
        bucketname: 'excel-templates',
        filename: 'clientUpload.xlsx'
      },
      errorPolicy: 'all'
    })

    const res = await axios({
      url: data.getPublicDownloadURL,
      method: 'GET',
      headers: { Accept: 'application/vnd.ms-excel' },
      responseType: 'blob' // important
    })

    FileSaver.saveAs(new Blob([res.data]), 'sample.xlsx')
  }
  getFormattedDate = timestamp =>
    moment(timestamp * 1000).format('MMM Do YYYY, h:mm a')

  render() {
    const { classes } = this.props

    return (
      <Query
        query={GET_CLIENTS}
        variables={{
          partnerLoginId: getLoginId()
        }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data: { clients } }) => {
          if (loading) return <Loader />
          if (error) return `Error!: ${error}`

          this.mapToArr(clients)

          return (
            <div className={classes.root}>
              <Grid container spacing={16}>
                <Grid item xs={12}>
                  <Grid container justify="space-between" spacing={16}>
                    <Grid item>
                      <Typography variant="headline">Customers</Typography>
                    </Grid>

                    <Grid item>
                      <Grid container spacing={8} justify="flex-end">
                        <Grid item xs={12} sm={'auto'}>
                          <Button
                            fullWidth
                            color="secondary"
                            onClick={this.addCustomer}
                            variant="raised"
                            className={this.classes.button}
                          >
                            Add Customer
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={'auto'}>
                          <Button
                            fullWidth
                            color="secondary"
                            onClick={this.addBulkCustomer}
                            variant="raised"
                            className={this.classes.button}
                          >
                            Bulk Registration
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={'auto'}>
                          <Button
                            fullWidth
                            color="secondary"
                            variant="contained"
                            className={classes.button}
                            onClick={this.downloadBulkUpload(this.props.client)}
                          >
                            Download Format
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} style={{ width: '95%' }}>
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

export default withStyles(style)(withApollo(Customers))
