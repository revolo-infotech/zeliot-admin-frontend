import React, { Component, Fragment } from 'react'
import gql from 'graphql-tag'
// import moment from 'moment'
import { Query } from 'react-apollo'
import { withRouter } from 'react-router-dom'
import {
  TableHead,
  TableRow,
  TableBody,
  Table,
  TableCell,
  Paper,
  Grid,
  TablePagination,
  Button,
  withStyles
} from '@material-ui/core'
import Loader from '../../../components/common/Loader'

const styles = {
  tableRow: {
    cursor: 'pointer',

    '&:hover': {
      background: 'rgb(245, 245, 245)'
    }
  }
}

class SubscriptionsTable extends Component {
  state = {
    page: 0,
    rowsPerPage: 5
  }

  handleChangePage = (event, newPage) => {
    this.setState({ page: newPage })
  }

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: +event.target.value })
  }

  handleEdit = subscription => {
    this.props.history.push(
      this.props.location.pathname + '/edit-subscription',
      {
        edit: true,
        subscriptionDetails: {
          id: subscription.subscriptionId,
          selectedBillingMode: subscription.billingMode.id,
          selectedBillingFrequency: subscription.billingFrequency.id,
          deviceQuantity: subscription.noOfDevices,
          deviceRate: subscription.mmtc,
          gst: subscription.gst
        }
      }
    )
  }

  render() {
    const { rows, classes } = this.props
    const { page, rowsPerPage } = this.state

    return (
      <Fragment>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Billing Mode</TableCell>
              <TableCell>Billing Frequency</TableCell>
              <TableCell>Device Quantity</TableCell>
              <TableCell>MMTC</TableCell>
              <TableCell>GST</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(subscription => (
                <TableRow
                  key={subscription.subscriptionId}
                  onClick={() => this.handleEdit(subscription)}
                  className={classes.tableRow}
                >
                  <TableCell>{subscription.billingMode.billingMode}</TableCell>
                  <TableCell>
                    {subscription.billingFrequency.frequency}
                  </TableCell>
                  <TableCell>{subscription.noOfDevices}</TableCell>
                  <TableCell>{subscription.mmtc}</TableCell>
                  <TableCell>{subscription.gst}</TableCell>
                  {/* <TableCell>
                    {moment
                      .unix(subscription.nextPaymentDate)
                      .format('MMM Do YYYY')}
                  </TableCell> */}
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page'
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page'
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Fragment>
    )
  }
}

const WrappedSubscriptionsTable = withStyles(styles)(SubscriptionsTable)

const GET_SUBSCRIPTIONS = gql`
  query($partnerLoginId: Int!) {
    subscriptions: getPartnerSubscriptions(partnerLoginId: $partnerLoginId) {
      subscriptionId
      billingMode {
        id
        billingMode
      }
      billingFrequency {
        id
        frequency
      }
      mmtc
      noOfDevices
      gst
      nextPaymentDate
    }
  }
`

const SubscriptionsQuery = props => {
  return (
    <Query
      query={GET_SUBSCRIPTIONS}
      variables={{
        partnerLoginId: props.partnerLoginId
      }}
      fetchPolicy="cache-and-network"
    >
      {({ loading, error, data }) => {
        if (loading) return <Loader />

        if (error) return 'Error'

        const rows = data.subscriptions

        return (
          <WrappedSubscriptionsTable
            rows={rows}
            location={props.location}
            history={props.history}
          />
        )
      }}
    </Query>
  )
}

function Subscriptions(props) {
  function handleNewSubscriptionClick() {
    props.history.push(props.location.pathname + '/add-subscription', {
      edit: false,
      subscriptionDetails: null
    })
  }

  return (
    <Grid container spacing={16}>
      <Grid item xs={12}>
        <Grid container justify="flex-end">
          <Grid item>
            <Button variant="outlined" onClick={handleNewSubscriptionClick}>
              Create Subscription
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Paper>
          <SubscriptionsQuery
            partnerLoginId={props.partnerLoginId}
            history={props.history}
            location={props.location}
          />
        </Paper>
      </Grid>
    </Grid>
  )
}

export default withRouter(Subscriptions)
