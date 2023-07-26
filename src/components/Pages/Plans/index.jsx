import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Button from '@material-ui/core/Button'
// import MenuIcon from '@material-ui/icons/Menu'
// import PieChart from '../../Reusable/Charts/PieChart'
// import ItemCard from '../../Reusable/ItemCard'
// import PullApi from '../../Modules/PullApi'
import getLoginId from '../../../utils/getLoginId'
import Loader from '../../../components/common/Loader'

const GET_ALLPLANS = gql`
  query getAllPlans($partnerLoginId: Int!) {
    allplans: getAllPlans(partnerLoginId: $partnerLoginId) {
      id
      planName
      description
      costPerAsset
      numberOfAssociatedClient
      partnerLoginId
    }
  }
`

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing.unit * 2
    },
    flexGrow: 1
  },
  planCostPerAsset: {
    color: 'black'
  }
})

class Plans extends Component {
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
    onRowClick: (rowData, dataIndex, rowIndex) => {
      // console.log('planid=', this.planId[rowIndex])
      this.props.history.push({
        // pathname: '/home/plans/view',
        pathname: '/home/plans/view/' + this.planId[dataIndex.dataIndex]
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

  viewPlan = e => {
    // console.log('onlcick viewplan: ', e)
    this.props.history.push({
      pathname: '/home/plans/view/' + e
    })
  }
  addPlan = e => {
    this.props.history.push({
      pathname: '/home/Plans/addPlan'
    })
  }

  pullApi = e => {
    this.props.history.push({
      pathname: '/home/device/api'
    })
  }

  // mapToArr = allplans => {
  //   let pieChartArr = []
  //   let fullData = []
  //   allplans.forEach(element => {
  //     pieChartArr = []
  //     console.log(element.numberOfAssociatedClient)
  //     pieChartArr['value'] = element.numberOfAssociatedClient + Math.random() // To be removed random function
  //     pieChartArr['label'] = element.planName
  //     pieChartArr['id'] = element.id
  //     fullData.push(pieChartArr)
  //   })
  //   return fullData
  // }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <Grid container justify="space-between">
              <Grid item>
                <Typography variant="headline">Plans</Typography>
              </Grid>
              <Grid item>
                <Button
                  color="secondary"
                  variant="contained"
                  className={classes.button}
                  onClick={this.addPlan}
                >
                  Create Plan
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={16}>
              <Query
                query={GET_ALLPLANS}
                variables={{
                  partnerLoginId: getLoginId()
                }}
                fetchPolicy="cache-and-network"
              >
                {({ loading, error, data: { allplans } }) => {
                  if (loading) return <Loader />
                  if (error) return `Error!: ${error}`
                  return allplans.map(plan => (
                    <Grid item xs={12} sm={6} md={4}>
                      <Card className={classes.card}>
                        <CardHeader
                          title={plan.planName}
                          subheader={'$' + plan.costPerAsset}
                          subheaderTypographyProps={{
                            variant: 'subheading',
                            className: classes.planCostPerAsset
                          }}
                        />
                        <CardContent>
                          <Typography variant="body1">
                            {plan.description}
                          </Typography>
                          <Typography component="p" variant="body2">
                            Assicated Clients:&nbsp;
                            {plan.numberOfAssociatedClient}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            color="secondary"
                            onClick={() => this.viewPlan(plan.id)}
                          >
                            Plan Details
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                  // return <div />
                }}
              </Query>
            </Grid>
          </Grid>
        </Grid>

        {/* <Grid container spacing={16} direction="row">
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
              {/* <Button
                color="secondary"
                variant="contained"
                className={classes.button}
                onClick={this.pullApi}
              >
                API
              </Button>
               <Button variant="outlined" className={classes.button}>
                <MenuIcon className={classes.iconSmall} />
              </Button>
            </Grid>
            <Grid item>
              <Typography variant="headline">Plans</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={16} direction="row">
          <Query
            query={GET_ALLPLANS}
            variables={{
              partnerLoginId: getLoginId()
            }}
            fetchPolicy="cache-and-network"
          >
            {({ loading, error, data: { allplans } }) => {
              if (loading) return <Loader />
              if (error) return `Error!: ${error}`
              // const rowData = allplans && this.mapToArr(allplans)
              return (
                <div>
                  <Grid
                    item
                    container
                    spacing={16}
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                    className={classes.root}
                  >
                    <Grid item xs={4}>
                      <ItemCard>
                        <Typography variant="body2">Plans Chart!</Typography>
                        <PieChart data={rowData} />
                      </ItemCard>
                    </Grid>
                    <Grid item xs={8}>
                      <Grid
                        item
                        container
                        spacing={16}
                        direction="row"
                        justify="flex-start"
                        alignItems="flex-start"
                      >
                        <div className={classes.root}>
                        {allplans.map(plans => (
                          <Grid item xs={4}>
                            <Card className={classes.card}>
                              <CardContent>
                                <Typography
                                  gutterBottom
                                  variant="headline"
                                  component="h2"
                                >
                                  {plans.planName}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                  Rs.
                                  {plans.costPerAsset}
                                </Typography>
                                <Typography component="p">
                                  {plans.description}
                                </Typography>
                                <Typography component="p" variant="body2">
                                  Assicated Clients:&nbsp;
                                  {plans.numberOfAssociatedClient}
                                </Typography>
                              </CardContent>
                              <CardActions>
                                <Button
                                  size="small"
                                  color="primary"
                                  onClick={() => this.viewPlan(plans.id)}
                                >
                                  Plan Details
                                </Button>
                              </CardActions>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                </div>
              )
            }}
          </Query>
        </Grid>
        */}
      </div>
    )
  }
}
export default withStyles(styles)(Plans)
