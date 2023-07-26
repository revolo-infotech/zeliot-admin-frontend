import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import MenuIcon from '@material-ui/icons/Menu'
import CardActions from '@material-ui/core/CardActions'
import PieChart from '../../Reusable/Charts/PieChart'
import ItemCard from '../../Reusable/ItemCard'
import getLoginId from '../../../utils/getLoginId'
import EditModel from '../AddModel/EditModel.jsx'
import AddModel from '../AddModel'

const GET_MODELS_STOCK = gql`
  query getDeviceCountByDeviceModel($superAdminLoginId: Int!) {
    devices: getDeviceCountByDeviceModel(
      superAdminLoginId: $superAdminLoginId
    ) {
      id
      model_name
      version
      devicetype
      deviceCount
    }
  }
`
const GET_MODEL_DETAILS = gql`
  query deviceModel($id: Int) {
    deviceModel(id: $id) {
      model_name
      devicetype
      description
      version
      maxPrice
      status
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

class DeviceDashboard extends Component {
  state = {
    modelStatus: false,
    mId: '',
    addModelStatus: false
  }
  viewdevices = modelId => e => {
    e.preventDefault()
    console.log('hi')
    this.props.history.push({
      pathname: '/home/inventory/deviceview/' + modelId
    })
  }
  addModel = e => {
    this.setState({ addModelStatus: true }, () => {
      console.log('model details2222', this.state.addModelStatus)
    })
  }

  mapToArr = vechicleType => {
    let pieChartArr = []
    let fullData = []
    let sum = 0
    vechicleType.forEach(e => {
      sum = sum + e.deviceCount
      // console.log('ff', sum, e.deviceCount)
    })
    // console.log(sum, 'sum')
    vechicleType.forEach(element => {
      pieChartArr = []
      pieChartArr['value'] = (element.deviceCount / sum) * 100 // To be removed random function
      pieChartArr['label'] = element.model_name
      pieChartArr['id'] = element.id
      fullData.push(pieChartArr)
    })
    return fullData
  }
  getModelDetails = modelId => async () => {
    console.log('modelId', modelId)
    const { data } = await this.props.client.query({
      query: GET_MODEL_DETAILS,
      variables: {
        id: parseInt(modelId, 10)
      }
    })
    this.setState(
      { modelDetails: data, modelStatus: true, mId: modelId },
      () => {
        console.log(this.state.modelDetails, this.state.modelStatus)
        console.log('model details2222', this.state.modelDetails)
      }
    )
  }
  closeEditModel = () => {
    this.setState({ modelStatus: false })
  }
  closeAddModel = () => {
    this.setState({ addModelStatus: false })
  }
  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        {this.state.modelStatus === true && (
          <EditModel
            modelInfo={this.state.modelDetails.deviceModel}
            openStatus={this.state.modelStatus}
            closeEditModelFunction={this.closeEditModel}
            selectedId={this.state.mId}
          />
        )}
        {this.state.addModelStatus === true && (
          <AddModel
            openStatus={this.state.addModelStatus}
            closeAddModelFunction={this.closeAddModel}
          />
        )}
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
                onClick={this.addModel}
              >
                Add Model
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
              superAdminLoginId: getLoginId()
            }}
          >
            {({ loading, error, data: { devices } }) => {
              if (loading) return 'Loading...'
              if (error) return `Error!: ${error}`
              console.log('devices', devices)
              const rowData = devices && this.mapToArr(devices)
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
                        {devices.map(devices => (
                          <Grid item xs={4}>
                            <Card className={classes.card}>
                              <CardContent>
                                <Typography
                                  gutterBottom
                                  variant="subheading"
                                  component="h2"
                                >
                                  {devices.model_name + ' ' + devices.version}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                  {devices.devicetype.toUpperCase()}
                                </Typography>
                                <Typography component="p" variant="title">
                                  {devices.deviceCount}
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
                                  onClick={this.viewdevices(devices.id)}
                                >
                                  View
                                </Button>
                                <Button
                                  color="primary"
                                  variant="outlined"
                                  onClick={this.getModelDetails(devices.id)}
                                >
                                  Edit
                                </Button>
                              </CardActions>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                    <Grid item xs={4}>
                      <ItemCard>
                        <Typography variant="body2">
                          Inventory Details
                        </Typography>
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

export default withStyles(styles)(withApollo(DeviceDashboard))
