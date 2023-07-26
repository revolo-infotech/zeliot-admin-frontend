import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import PropTypes from 'prop-types'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import PlanDetails from '../PlanDetails/'
import { Typography } from '@material-ui/core'
import getLoginId from '../../../utils/getLoginId'
import Loader from '../../../components/common/Loader'

const GET_CLIENTS = gql`
  query allClientDetails($partnerLoginId: Int, $planId: Int) {
    clients: allClientDetails(
      partnerLoginId: $partnerLoginId
      planId: $planId
    ) {
      id
      clientName
      contactPerson
      contactNumber
      email
      totalAssignedVehicle
    }
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
  card: {
    minWidth: 900
  }
})

class ViewPlans extends Component {
  constructor(props) {
    super(props)
    this.classes = props
    this.planId = this.props.match.params.planId
    // console.log('ViewPlans=', this.planId)
  }

  clientId = []
  fullData = []

  columns = [
    'CLIENT NAME',
    'CONTACT PERSON',
    'EMAIL',
    'CONTACT NUMBER',
    'TOTAL VEHICLES'
  ]
  options = {
    selectableRows: false,
    filter: false,
    responsive: 'scroll',
    rowsPerPage: 15
  }

  mapToArr = data => {
    let rowData = []
    let fullData = []
    data.forEach(element => {
      rowData = []
      rowData.push(element.clientName)
      rowData.push(element.contactPerson)
      rowData.push(element.email)
      rowData.push(element.contactNumber)
      rowData.push(element.totalAssignedVehicle)
      fullData.push(rowData)
    })
    return fullData
  }

  viewPlansPage = e => {
    this.props.history.push({
      pathname: '/home/plans'
    })
  }

  render() {
    const { classes } = this.props
    // console.log('insideclass', this.planId)
    return (
      <Query
        query={GET_CLIENTS}
        variables={{
          partnerLoginId: getLoginId(),
          planId: parseInt(this.planId, 10)
        }}
        errorPolicy="all"
      >
        {({ loading, error, data }) => {
          if (loading) return <Loader />
          // if (error) return `Error!: ${error}`
          // console.log(data, 'data')
          let rowData
          let temp = []
          if (data) {
            rowData = this.mapToArr(data.clients)
          } else {
            rowData = this.mapToArr(temp)
          }
          // console.log(rowData)
          return (
            <div className={classes.root}>
              <Grid container spacing={16}>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    className={classes.button}
                    onClick={this.viewPlansPage}
                  >
                    <ArrowBackIcon className={classes.iconSmall} />
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <PlanDetails planId={this.planId} />
                </Grid>
                <Grid item xs={12}>
                  {data.clients.length > 0 ? (
                    <MUIDataTable
                      title={'Customers'}
                      data={rowData}
                      columns={this.columns}
                      options={this.options}
                    />
                  ) : (
                    <Typography
                      variant="subheading"
                      color="error"
                      align="center"
                    >
                      No Clients are assigned to this plan{' '}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              {/* <PlanDetails planId={this.planId} /> */}
            </div>
          )
        }}
      </Query>
    )
  }
}
ViewPlans.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(style)(ViewPlans)
