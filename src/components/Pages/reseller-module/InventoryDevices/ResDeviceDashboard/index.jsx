import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Button from '@material-ui/core/Button'
import MenuIcon from '@material-ui/icons/Menu'
import CardActions from '@material-ui/core/CardActions'
import PieChart from '../../../../Reusable/Charts/PieChart'
import ItemCard from '../../../../Reusable/ItemCard'
import getLoginId from '../../../../../utils/getLoginId.js'

const GET_MODELS_STOCK = gql`
  query getResellerDeviceStockByDeviceModel($resellerLoginId: Int!) {
    devices: getResellerDeviceStockByDeviceModel(
      resellerLoginId: $resellerLoginId
    ) {
      modelName
      totalAssignedDevice
      totalAssignedDeviceToClient
      totalRegisteredDevice
      availableStock
    }
  }
`

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 2
  },
  paper: {
    height: 140,
    width: 100
  },
  control: {
    padding: theme.spacing.unit * 2
  }
})

const vechicleType = ['B101 V1', 'S101 1', 'Bharat 101 ', 'OBD II']

class ResDeviceDashboard extends Component {
  viewPlan = e => {
    this.props.history.push({
      pathname: '/home/plans/view/' + e
    })
  }
  addPlan = e => {
    this.props.history.push({
      pathname: '/home/Plans/addPlan'
    })
  }

  mapToArr = vechicleType => {
    let pieChartArr = []
    let fullData = []
    vechicleType.forEach(element => {
      pieChartArr = []
      pieChartArr['value'] = Math.random() // To be removed random function
      pieChartArr['label'] = element
      pieChartArr['id'] = element
      fullData.push(pieChartArr)
    })
    return fullData
  }
  render() {
    const { classes } = this.props
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
                Upload Device
              </Button>
              {'  '}
              <Button variant="outlined" className={classes.button}>
                <MenuIcon className={classes.iconSmall} />
              </Button>
            </Grid>
            <Grid item>
              <Typography variant="headline">Device Dashboard</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={16} direction="row">
          <Query
            query={GET_MODELS_STOCK}
            variables={{
              resellerLoginId: getLoginId()
            }}
          >
            {({ loading, error, data: { devices } }) => {
              if (loading) return 'Loading...'
              if (error) return `Error!: ${error}`
              console.log('allstock', devices)
              const rowData = devices && this.mapToArr(vechicleType)
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
                    <Grid item xs={8}>
                      <Grid
                        item
                        container
                        spacing={16}
                        direction="row"
                        justify="flex-start"
                        alignItems="flex-start"
                      >
                        {vechicleType.map(vehType => (
                          <Grid item xs={4}>
                            <Card className={classes.card}>
                              <CardContent>
                                <Typography
                                  gutterBottom
                                  variant="headline"
                                  component="h2"
                                >
                                  {vehType}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                  2012
                                </Typography>
                                <Typography component="p">
                                  {vehType}
                                  {vehType}
                                  {vehType}
                                </Typography>
                              </CardContent>
                              <CardActions>
                                {/* <Button
                                  size="small"
                                  color="primary"
                                >
                                  View Vehicles
                                </Button> */}
                                <Button
                                  color="primary"
                                  variant="outlined"
                                  // onClick={this.showSubscription}
                                >
                                  View Vehicles
                                </Button>
                              </CardActions>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                    <Grid item xs={4}>
                      <ItemCard>
                        <Typography variant="body2">Vechicle Chart!</Typography>
                        <PieChart data={rowData} />
                      </ItemCard>
                    </Grid>
                  </Grid>
                </div>
              )
            }}
          </Query>
        </Grid>
      </div>
    )
  }
}
export default withStyles(styles)(ResDeviceDashboard)
