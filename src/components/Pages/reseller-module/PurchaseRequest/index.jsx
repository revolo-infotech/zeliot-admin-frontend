import React, { Component } from 'react'
import gql from 'graphql-tag'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import withSharedSnackbar from '../../../HOCs/withSharedSnackbar'
import StatusCard from './StatusCard.jsx'
import MUIDataTable from 'mui-datatables'
import Button from '@material-ui/core/Button'
import moment from 'moment'
import getLoginId from '../../../../utils/getLoginId'
import { withApollo } from 'react-apollo'

const ALL_PURCHASE_REQUESTS = gql`
  query getAllPurchaseRequestInfo($resellerLoginId: Int!) {
    allPrs: getAllPurchaseRequestInfo(resellerLoginId: $resellerLoginId) {
      id
      status
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

class PurchaseRequest extends Component {
  handleClick = title => {
    let clickStatus = {
      'Sent Requests': false,
      'Approval Pending': false,
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

  columns = ['MODEL TYPES', 'LICENSE TYPES', 'RAISED ON']

  tableOptions = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 5,

    onRowClick: (rowData, dataIndex) => {
      const index = dataIndex.dataIndex
      if (this.state.currentlySelected === 'Approval Pending') {
        this.props.history.push({
          pathname:
            '/home/reseller/purchase-request/pending/' +
            this.state.data[this.state.currentlySelected].ids[index]
        })
      } else {
        this.props.history.push({
          pathname:
            '/home/reseller/purchase-request/view/' +
            this.state.data[this.state.currentlySelected].ids[index],
          state: this.state.currentlySelected
        })
      }
    }
  }

  state = {
    clickStatus: {
      'Sent Requests': false,
      'Approval Pending': false,
      Approved: false,
      Cancelled: false,
      'Partially Executed': false,
      Completed: false
    },
    data: {
      'Sent Requests': { ids: [], data: [] },
      'Approval Pending': { ids: [], data: [] },
      Approved: { ids: [], data: [] },
      Cancelled: { ids: [], data: [] },
      'Partially Executed': { ids: [], data: [] },
      Completed: { ids: [], data: [] }
    },
    currentlySelected: 'Sent Requests'
  }

  getTableData = purchaseReq => {
    let tempArr = []
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
    // Query to get all purchase request data using login id of reseller
    let { data } = await this.props.client.query({
      query: ALL_PURCHASE_REQUESTS,
      variables: {
        resellerLoginId: getLoginId()
      }
    })

    data = data.allPrs

    // init final data
    let prData = {
      'Sent Requests': {
        ids: [],
        data: []
      },
      'Approval Pending': {
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
          prData['Sent Requests'].ids.push(purchaseReq.id)
          prData['Sent Requests'].data.push(this.getTableData(purchaseReq))
          break
        case 2:
          prData['Approval Pending'].ids.push(purchaseReq.id)
          prData['Approval Pending'].data.push(this.getTableData(purchaseReq))
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
      'Sent Requests': true,
      'Approval Pending': false,
      Approved: false,
      Cancelled: false,
      'Partially Executed': false,
      Completed: false
    }

    // init currently selected
    let currentlySelected = 'Sent Requests'

    this.setState({
      clickStatus: clickStatus,
      data: prData,
      currentlySelected: currentlySelected
    })
  }

  handleNew = event => {
    this.props.history.push({
      pathname: '/home/reseller/purchase-request/new'
    })
  }

  render() {
    const { classes } = this.props

    let categories = [
      {
        title: 'Sent Requests',
        description: 'Shows a list of purchase requests sent by the reseller'
      },
      {
        title: 'Approval Pending',
        description:
          'Shows a list of purchase requests to be approved by the reseller'
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
          <Grid
            item
            container
            spacing={16}
            direction="row"
            justify="space-between"
          >
            <Grid item>
              <Typography variant="headline">Purchase Requests</Typography>
              <Typography variant="caption">
                Manage Purchase Requests
              </Typography>
            </Grid>
            <Grid item>
              <Button
                color="secondary"
                variant="raised"
                onClick={this.handleNew}
              >
                New Purchase Request
              </Button>
            </Grid>
          </Grid>

          {/* Category Headers */}
          <Grid item xs={12} container spacing={16} direction="row">
            {categories.map((category, index) => {
              return (
                <Grid item xs={2} key={index}>
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
  withApollo(withSharedSnackbar(PurchaseRequest))
)
