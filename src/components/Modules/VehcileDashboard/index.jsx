import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import CardActions from '@material-ui/core/CardActions'
import PieChart from '../../Reusable/Charts/PieChart'
import ItemCard from '../../Reusable/ItemCard'
import getLoginId from '../../../utils/getLoginId'
import FileSaver from 'file-saver'
import axios from 'axios'
import Dialog from '@material-ui/core/Dialog'
import SendCommands from './SendCommands'

const GET_ALL_VEHICLE_STATUS = gql`
  query getVehicleCountByStatus($partnerLoginId: Int!) {
    allvehicle: getVehicleCountByStatus(partnerLoginId: $partnerLoginId) {
      totalRegisteredVehicle
      totalActiveVehicle
      totalInActiveVehicle
      totalServicedVehicle
      totalDeactiveVehicle
    }
  }
`
const GET_FILE_FORMAT = gql`
  query getPublicDownloadURL($bucketname: String!, $filename: String!) {
    getPublicDownloadURL(bucketName: $bucketname, filename: $filename)
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

const vechicleType = [
  'Active',
  'De-active',
  'Service',
  'Not Registered',
  'Inactive'
]

class VehcileDashboard extends Component {
  state = {
    open: false
  }
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

  mapToArr = (vechicleType, allvehicle) => {
    // console.log('vechicleType', vechicleType, allvehicle)
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

  showClientwise = vehType => async () => {
    // console.log('vehType', vehType)
    if (vehType === 'unregistred') {
      this.props.history.push({
        pathname: '/home/VehicleDashboard/ViewDevices/' + 2
      })
    } else {
      // console.log('hi', vehType)
      this.props.history.push({
        pathname: '/home/VehicleDashboard/ViewVehicles' + vehType
      })
    }
  }
  addVehicle = e => {
    this.props.history.push({
      pathname: '/home/customer/vehicle/register'
    })
  }
  bulkRegister = event => {
    this.props.history.push({
      pathname: '/home/customer/vehicle/register/bulk'
    })
  }
  downloadBulkUpload = client => async event => {
    const { data } = await this.props.client.query({
      query: GET_FILE_FORMAT,
      variables: {
        bucketname: 'excel-templates',
        filename: 'vehicleUpload.xlsx'
      },
      errorPolicy: 'all'
    })
    // console.log('file', data.getPublicDownloadURL)
    const res = await axios({
      url: data.getPublicDownloadURL,
      method: 'GET',
      headers: { Accept: 'application/vnd.ms-excel' },
      responseType: 'blob' // important
    })

    FileSaver.saveAs(new Blob([res.data]), 'vehicleUpload.xlsx')
    // FileSaver.saveAs(data.getPublicDownloadURL, 'sample.xlsx')
  }
  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
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
              <Grid item>
                <Button
                  color="secondary"
                  onClick={this.handleClickOpen}
                  variant="raised"
                  // className={this.classes.button}
                >
                  Send Commands
                </Button>{' '}
                <Button
                  color="secondary"
                  onClick={this.addVehicle}
                  variant="raised"
                  // className={this.classes.button}
                >
                  Register Vehicle
                </Button>{' '}
                <Button
                  color="secondary"
                  variant="contained"
                  size="medium"
                  margin="normal"
                  className="btn"
                  onClick={this.bulkRegister}
                >
                  Bulk Registration
                </Button>{' '}
                <Button
                  color="secondary"
                  variant="contained"
                  className={classes.button}
                  onClick={this.downloadBulkUpload(this.props.client)}
                >
                  Download Format
                </Button>
              </Grid>
              {/* <Button variant="outlined" className={classes.button}>
                <MenuIcon className={classes.iconSmall} />
              </Button> */}
            </Grid>
            <Grid item>
              <Typography variant="headline">Vehicle Dashboard</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={16} direction="row">
          <Query
            query={GET_ALL_VEHICLE_STATUS}
            variables={{
              partnerLoginId: getLoginId()
            }}
            fetchPolicy="network-only"
          >
            {({ loading, error, data: { allvehicle } }) => {
              if (loading) return 'Loading...'
              if (error) return `Error!: ${error}`
              const rowData =
                allvehicle && this.mapToArr(vechicleType, allvehicle)
              // console.log('rowdata', allvehicle)
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
                        <Grid item xs={4}>
                          <Card className={classes.card}>
                            <CardContent>
                              <Typography
                                gutterBottom
                                variant="headline"
                                component="h2"
                              >
                                Active
                              </Typography>
                              <Typography component="p">
                                {allvehicle.totalActiveVehicle}
                              </Typography>
                            </CardContent>
                            <CardActions>
                              <Button
                                color="primary"
                                variant="outlined"
                                onClick={this.showClientwise(1)}
                              >
                                View Vehicles
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                        <Grid item xs={4}>
                          <Card className={classes.card}>
                            <CardContent>
                              <Typography
                                gutterBottom
                                variant="headline"
                                component="h2"
                              >
                                Deactive
                              </Typography>
                              <Typography component="p">
                                {allvehicle.totalDeactiveVehicle}
                              </Typography>
                            </CardContent>
                            <CardActions>
                              <Button
                                color="primary"
                                variant="outlined"
                                onClick={this.showClientwise(0)}
                              >
                                View Vehicles
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                        <Grid item xs={4}>
                          <Card className={classes.card}>
                            <CardContent>
                              <Typography
                                gutterBottom
                                variant="headline"
                                component="h2"
                              >
                                Inactive
                              </Typography>
                              <Typography component="p">
                                {allvehicle.totalInActiveVehicle}
                              </Typography>
                            </CardContent>
                            <CardActions>
                              <Button
                                color="primary"
                                variant="outlined"
                                onClick={this.showClientwise(2)}
                              >
                                View Vehicles
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                        <Grid item xs={4}>
                          <Card className={classes.card}>
                            <CardContent>
                              <Typography
                                gutterBottom
                                variant="headline"
                                component="h2"
                              >
                                Service
                              </Typography>
                              <Typography component="p">
                                {allvehicle.totalServicedVehicle}
                              </Typography>
                            </CardContent>
                            <CardActions>
                              <Button
                                color="primary"
                                variant="outlined"
                                onClick={this.showClientwise(3)}
                              >
                                View Vehicles
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                        {/* <Grid item xs={4}>
                          <Card className={classes.card}>
                            <CardContent>
                              <Typography
                                gutterBottom
                                variant="headline"
                                component="h2"
                              >
                                Unregistered
                              </Typography>
                              <Typography component="p">{100}</Typography>
                            </CardContent>
                            <CardActions>
                              <Button
                                color="primary"
                                variant="outlined"
                                onClick={this.showClientwise('unregistered')}
                              >
                                View Vehicles
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid> */}
                      </Grid>
                    </Grid>
                    <Grid item xs={4}>
                      <ItemCard>
                        <Typography variant="body2">Vechicle Chart!</Typography>
                        <PieChart data={rowData} />
                      </ItemCard>
                    </Grid>
                    <Dialog
                      open={this.state.open}
                      onClose={this.handleClose}
                      aria-labelledby="form-dialog-title"
                    >
                      <SendCommands handleClose={this.handleClose} />
                    </Dialog>
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

export default withStyles(styles)(withApollo(VehcileDashboard))
