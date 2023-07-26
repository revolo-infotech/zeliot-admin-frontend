import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import gql from 'graphql-tag'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import StatusCard from './StatusCard.jsx'
import MUIDataTable from 'mui-datatables'
import moment from 'moment'
import { withApollo } from 'react-apollo'

const ALL_PURCHASE_REQUESTS = gql`
  query getAllPurchaseRequestInfo {
    allPrs: getAllPurchaseRequestInfo {
      id
      status
      reseller {
        resellerName
      }
      licenseTypeList {
        id
        maxPrice
      }
      deviceModelList {
        id
        model_name
      }
      createdAt
    }
  }
`

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    flexGrow: 1
  }
})

class ManagePurchaseRequests extends Component {
  handleClick = title => {
    let clickStatus = {
      Pending: false,
      Processed: false,
      Approved: false,
      Cancelled: false,
      'Partially Executed': false,
      Completed: false
    }

    clickStatus[title] = true

    this.setState({
      clickStatus: clickStatus,
      currentlySelected: title
    })
  }

  columns = ['RESELLER', 'MODEL TYPES', 'LICENSE TYPES', 'RAISED ON']

  tableOptions = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 5,
    onRowClick: (rowData, dataIndex) => {
      const index = dataIndex.dataIndex
      if (this.state.currentlySelected === 'Pending') {
        this.props.history.push({
          pathname:
            '/home/manage/purchase-requests/pending/' +
            this.state.data[this.state.currentlySelected].ids[index]
        })
      } else if (
        this.state.currentlySelected === 'Approved' ||
        this.state.currentlySelected === 'Partially Executed'
      ) {
        this.props.history.push({
          pathname:
            '/home/manage/purchase-requests/approved/' +
            this.state.data[this.state.currentlySelected].ids[index]
        })
      } else {
        this.props.history.push({
          pathname:
            '/home/manage/purchase-requests/view/' +
            this.state.data[this.state.currentlySelected].ids[index]
        })
      }
    }
  }

  state = {
    clickStatus: {
      Pending: false,
      Processed: false,
      Approved: false,
      Cancelled: false,
      'Partially Executed': false,
      Completed: false
    },
    data: {
      Pending: { ids: [], data: [] },
      Processed: { ids: [], data: [] },
      Approved: { ids: [], data: [] },
      Cancelled: { ids: [], data: [] },
      'Partially Executed': { ids: [], data: [] },
      Completed: { ids: [], data: [] }
    },
    currentlySelected: 'Pending'
  }

  getTableData = purchaseReq => {
    let tempArr = []
    tempArr.push(purchaseReq.reseller.resellerName.toString())
    tempArr.push(purchaseReq.deviceModelList.length.toString())
    tempArr.push(purchaseReq.licenseTypeList.length.toString())
    tempArr.push(
      moment
        .unix(purchaseReq.createdAt)
        .format('DD/MM/YYYY')
        .toString()
    )
    return tempArr
  }

  async componentDidMount() {
    // Query to get all purchase requests data
    let { data } = await this.props.client.query({
      query: ALL_PURCHASE_REQUESTS
    })

    data = data.allPrs

    // init final data
    let prData = {
      Pending: {
        ids: [],
        data: []
      },
      Processed: {
        ids: [],
        data: []
      },
      Approved: {
        ids: [],
        data: []
      },
      Cancelled: {
        ids: [],
        data: []
      },
      'Partially Executed': {
        ids: [],
        data: []
      },
      Completed: {
        ids: [],
        data: []
      }
    }

    // prep data in the format required
    data.forEach(purchaseReq => {
      switch (purchaseReq.status) {
        case 1:
          prData['Pending'].ids.push(purchaseReq.id)
          prData['Pending'].data.push(this.getTableData(purchaseReq))
          break
        case 2:
          prData['Processed'].ids.push(purchaseReq.id)
          prData['Processed'].data.push(this.getTableData(purchaseReq))
          break
        case 3:
          prData['Approved'].ids.push(purchaseReq.id)
          prData['Approved'].data.push(this.getTableData(purchaseReq))
          break
        case -1:
          prData['Cancelled'].ids.push(purchaseReq.id)
          prData['Cancelled'].data.push(this.getTableData(purchaseReq))
          break
        case 4:
          prData['Partially Executed'].ids.push(purchaseReq.id)
          prData['Partially Executed'].data.push(this.getTableData(purchaseReq))
          break
        case 5:
          prData['Completed'].ids.push(purchaseReq.id)
          prData['Completed'].data.push(this.getTableData(purchaseReq))
          break
        default:
          break
      }
    })

    // initialize click status
    let clickStatus = {
      Pending: true,
      Processed: false,
      Approved: false,
      Cancelled: false,
      'Partially Executed': false,
      Completed: false
    }

    this.setState({
      clickStatus: clickStatus,
      data: prData,
      currentlySelected: 'Pending'
    })
  }

  render() {
    const { classes } = this.props

    let categories = [
      {
        title: 'Pending',
        description: 'Shows a list of purchase requests sent by the reseller'
      },
      {
        title: 'Processed',
        description:
          'Shows a list of purchase requests to be approved by the super admin'
      },
      {
        title: 'Approved',
        description:
          'Shows a list of purchase requests approved by the reseller'
      },
      {
        title: 'Cancelled',
        description:
          'Shows a list of all purchase requests which have been cancelled by the reseller'
      },
      {
        title: 'Partially Executed',
        description:
          'Shows a list of all purchase requests which have been partially serviced by the super admin'
      },
      {
        title: 'Completed',
        description:
          'Shows a list of all purchase requests which have been completely serviced by the super admin'
      }
    ]

    return (
      <div className={classes.root}>
        <Grid container spacing={16} direction="row">
          {/* Heading */}
          <Grid item xs={12}>
            <Typography variant="headline">Purchase Requests</Typography>
            <Typography variant="caption">
              Manage all purchase requests received from resellers
            </Typography>
          </Grid>

          {/* Category Headers */}
          <Grid item xs={12} container spacing={16} direction="row">
            {categories.map(category => {
              return (
                <Grid item xs={2}>
                  <StatusCard
                    title={category.title}
                    tooltip={category.description}
                    handleClick={this.handleClick}
                    isClicked={this.state.clickStatus[category.title]}
                    count={this.state.data[category.title].ids.length}
                  />
                </Grid>
              )
            })}
          </Grid>

          {/* List of Requests */}
          <Grid item xs={12}>
            {this.state.currentlySelected !== null ? (
              <MUIDataTable
                data={this.state.data[this.state.currentlySelected].data}
                columns={this.columns}
                options={this.tableOptions}
                title={this.state.currentlySelected}
              />
            ) : null}
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(
  withApollo(withSharedSnackbar(ManagePurchaseRequests))
)
