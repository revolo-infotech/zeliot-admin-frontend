import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import MenuIcon from '@material-ui/icons/Menu'
import getLoginId from '../../../utils/getLoginId'
import Loader from '../../../components/common/Loader'

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

// const GET_CLIENTS = gql`
//   query allClientDetails($partnerLoginId: Int) {
//     clients: allClientDetails(partnerLoginId: $partnerLoginId) {
//       id
//       clientName
//       contactPerson
//       contactNumber
//       email
//       totalAssignedVehicle
//     }
//   }
// `

const GET_ALLPLANS = gql`
  query getAllPlans($partnerLoginId: Int!) {
    allplans: getAllPlans(partnerLoginId: $partnerLoginId) {
      id
      planName
      description
      costPerAsset
      numberOfAssociatedClient
    }
  }
`
class Plans extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }
  clientId = []
  fullData = []

  columns = [
    'PLAN NAME',
    'COST PER UNIT',
    'DESCRIPTION',
    'ACTIVE CUSTOMER'
    // 'FEATURE LIST'
  ]

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    onCellClick: (colIndex, rowIndex) => {
      console.log('planid=', this.planId[rowIndex])
      this.props.history.push({
        // pathname: '/home/plans/view',
        pathname: '/home/plans/view/' + this.planId[rowIndex]
        // state: {
        //   clientId: this.clientId[rowIndex],
        //   clientName: this.fullData[rowIndex][0],
        //   planId: this.planId[rowIndex]
        // }
      })
    }
    // sort: false,
    // filter: false,
    // search: false,
    // print: false,
    // download: false,
    // viewColumns: false,
    // pagination: false
  }

  mapToArr = allplans => {
    // console.log(allplans)
    var rowData = []
    this.fullData = []
    this.clientId = []
    this.planId = []
    allplans.forEach(element => {
      rowData = []
      this.clientId.push(element.id)
      this.planId.push(element.id)
      rowData.push(element.planName)
      rowData.push(element.costPerAsset)
      rowData.push(element.description)
      rowData.push(element.numberOfAssociatedClient)
      this.fullData.push(rowData)
    })
  }

  addPlan = e => {
    this.props.history.push({
      pathname: '/home/Plans/addPlan'
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Query
        query={GET_ALLPLANS}
        variables={{
          partnerLoginId: getLoginId()
        }}
      >
        {({ loading, error, data: { allplans } }) => {
          if (loading) return <Loader />
          if (error) return `Error!: ${error}`
          this.mapToArr(allplans)
          // console.log('allplans=', allplans)
          return (
            <div className={classes.root}>
              <Grid container spacing={16} direction="row">
                <Grid
                  item
                  container
                  spacing={16}
                  direction="row-reverse"
                  justify="space-between"
                  alignItems="flex-end"
                >
                  <Grid item>
                    <Button
                      color="secondary"
                      variant="contained"
                      className={classes.button}
                      onClick={this.addPlan}
                    >
                      Create Plan
                    </Button>
                    {'  '}
                    <Button variant="outlined" className={classes.button}>
                      <MenuIcon className={classes.iconSmall} />
                    </Button>
                  </Grid>
                  <Grid item>
                    <Typography variant="headline">Plans</Typography>
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
export default withStyles(style)(Plans)
