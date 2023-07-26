import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import Divider from '@material-ui/core/Divider'
import Paper from '@material-ui/core/Paper'
import RegisterSIM from './RegisterSIM'
import FileSaver from 'file-saver'
import DetailsCard from './DetailsCard'
import ProviderSims from './ProviderSims'
import EditStatus from './EditStatus'
import getLoginId from '../../../../utils/getLoginId'

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary
  },
  iconSmall: {
    fontSize: 20
  }
})

const GET_SIM_STOCK = gql`
  query getResellerSimStockByServiceProvider($resellerLoginId: Int!) {
    sims: getResellerSimStockByServiceProvider(
      resellerLoginId: $resellerLoginId
    ) {
      serviceProviderName
      totalAssignedSim
      availableStock
    }
  }
`

const GET_FILE_FORMAT = gql`
  query getPublicDownloadURL($bucketname: String!, $filename: String!) {
    getPublicDownloadURL(bucketName: $bucketname, filename: $filename)
  }
`

const ALL_SIM_DETAILS = gql`
  query allSimDetails($resellerLoginId: Int!) {
    simStock: allSimDetails(ownerLoginId: $resellerLoginId) {
      id
      phoneNumber
      simNumber
      monthlyCharges
      status
      serviceProvider {
        name
        id
      }
    }
  }
`

class InventoryDevices extends Component {
  constructor(props) {
    super(props)
    this.classes = props
    this.simData = []
  }

  tableOptions = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 5,
    onRowClick: (rowData, dataIndex, rowIndex) => {
      if (rowData.length === 5) {
        let installationStatus
        if (rowData[4] === 'Yes') {
          installationStatus = 'Installed'
        } else {
          installationStatus = 'Not Installed'
        }
        this.setState({
          editStatusOpen: true,
          serviceProvider: rowData[0],
          simNumber: rowData[1],
          phoneNumber: rowData[2],
          monthlyCharges: parseInt(rowData[3], 10),
          isInstalled: installationStatus,
          currentSimId: this.state.currentSimIds[dataIndex.dataIndex],
          // prettier-ignore
          currentServiceProviderId: this.state.currentServiceProviderIds[dataIndex.dataIndex]
        })
      } else if (rowData.length === 4) {
        this.setState({
          editStatusOpen: true,
          serviceProvider: rowData[0],
          simNumber: rowData[1],
          phoneNumber: rowData[2],
          monthlyCharges: parseInt(rowData[3], 10),
          isInstalled: 'NA',
          currentSimId: this.state.currentSimIds[dataIndex.dataIndex],
          // prettier-ignore
          currentServiceProviderId: this.state.currentServiceProviderIds[dataIndex.dataIndex]
        })
      }
    }
  }

  state = {
    open: false,
    tableColumns: [],
    tableData: [],
    enableButton: false,
    editStatusOpen: false,
    serviceProvider: '',
    simNumber: '',
    phoneNumber: '',
    monthlyCharges: '',
    selectedCategory: '',
    isInstalled: '',
    currentSimIds: [],
    currentServiceProviderIds: [],
    currentSimId: '',
    currentServiceProviderId: '',
    clickStatus: {
      Activated: false,
      Deactivated: false,
      'Safe Custody': false,
      Unknown: false
    }
  }

  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false, editStatusOpen: false })
  }

  addBulkUpload = e => {
    this.props.history.push({
      pathname: '/home/reseller/sims/bulk-register'
    })
  }

  downloadBulkUpload = client => async event => {
    const { data } = await this.props.client.query({
      query: GET_FILE_FORMAT,
      variables: {
        bucketname: 'excel-templates',
        filename: 'simUpload.xlsx'
      },
      errorPolicy: 'all'
    })
    FileSaver.saveAs(data.getPublicDownloadURL, 'sample.xlsx')
  }

  componentDidMount() {
    this.handleClick(1)
  }

  handleClick = status => {
    let columns = []
    let data = []
    let category
    let simProviderIds = []
    let simIds = []
    let clickStatus = {
      Activated: false,
      Deactivated: false,
      'Safe Custody': false,
      Unknown: false
    }

    if (status === 1) {
      columns = [
        'SERVICE PROVIDER',
        'SIM NUMBER',
        'PHONE NUMBER',
        'COST',
        'INSTALLED'
      ]
      category = 'Activated'
      clickStatus = {
        Activated: true,
        Deactivated: false,
        'Safe Custody': false,
        Unknown: false
      }

      this.simData.forEach(sim => {
        let tempData = []

        // make a check for statuses
        if (sim.status === 1 || sim.status === 2 || sim.status === 3) {
          simProviderIds.push(sim.serviceProvider.id)
          simIds.push(sim.id)
          tempData.push(sim.serviceProvider.name.toString())
          tempData.push(sim.simNumber.toString())
          tempData.push(sim.phoneNumber.toString())
          tempData.push(sim.monthlyCharges.toString())
          tempData.push('No')
          data.push(tempData)
        } else if (sim.status === 4) {
          simProviderIds.push(sim.serviceProvider.id)
          simIds.push(sim.id)
          tempData.push(sim.serviceProvider.name.toString())
          tempData.push(sim.simNumber.toString())
          tempData.push(sim.phoneNumber.toString())
          tempData.push(sim.monthlyCharges.toString())
          tempData.push('Yes')
          data.push(tempData)
        }
      })
    } else {
      columns = ['SERVICE PROVIDER', 'SIM NUMBER', 'PHONE NUMBER', 'COST']

      if (status === 0) {
        category = 'Deactivated'
        clickStatus = {
          Activated: false,
          Deactivated: true,
          'Safe Custody': false,
          Unknown: false
        }
        this.simData.forEach(sim => {
          let tempData = []

          // make a check for statuses
          if (sim.status === 0) {
            simProviderIds.push(sim.serviceProvider.id)
            simIds.push(sim.id)
            tempData.push(sim.serviceProvider.name.toString())
            tempData.push(sim.simNumber.toString())
            tempData.push(sim.phoneNumber.toString())
            tempData.push(sim.monthlyCharges.toString())
            data.push(tempData)
          }
        })
      } else if (status === 99) {
        category = 'Safe Custody'
        clickStatus = {
          Activated: false,
          Deactivated: false,
          'Safe Custody': true,
          Unknown: false
        }
        this.simData.forEach(sim => {
          let tempData = []

          // make a check for statuses
          if (sim.status === 99) {
            simProviderIds.push(sim.serviceProvider.id)
            simIds.push(sim.id)
            tempData.push(sim.serviceProvider.name.toString())
            tempData.push(sim.simNumber.toString())
            tempData.push(sim.phoneNumber.toString())
            tempData.push(sim.monthlyCharges.toString())
            data.push(tempData)
          }
        })
      } else if (status === -1) {
        category = 'Unknown'
        clickStatus = {
          Activated: false,
          Deactivated: false,
          'Safe Custody': false,
          Unknown: true
        }
        this.simData.forEach(sim => {
          let tempData = []

          // make a check for statuses
          if (sim.status === -1) {
            simProviderIds.push(sim.serviceProvider.id)
            simIds.push(sim.id)
            tempData.push(sim.serviceProvider.name.toString())
            tempData.push(sim.simNumber.toString())
            tempData.push(sim.phoneNumber.toString())
            tempData.push(sim.monthlyCharges.toString())
            data.push(tempData)
          }
        })
      }
    }

    this.setState({
      tableData: data,
      tableColumns: columns,
      selectedCategory: category,
      currentSimIds: simIds,
      currentServiceProviderIds: simProviderIds,
      clickStatus: clickStatus
    })
  }

  render() {
    const { classes } = this.props

    // SIM Card categories
    let simCategories = [
      {
        category: 'Activated',
        status: 1,
        count: 0,
        installed: 0,
        uninstalled: 0
      },
      {
        category: 'Deactivated',
        status: 0,
        count: 0,
        installed: 0,
        uninstalled: 0
      },
      {
        category: 'Safe Custody',
        status: 99,
        count: 0,
        installed: 0,
        uninstalled: 0
      },
      {
        category: 'Unknown',
        status: -1,
        count: 0,
        installed: 0,
        uninstalled: 0
      }
    ]

    // set currently selected
    let currentlySelected
    if (this.state.clickStatus['Activated'] === true) {
      currentlySelected = 'Activated SIMs'
    } else if (this.state.clickStatus['Deactivated'] === true) {
      currentlySelected = 'Deactivated SIMs'
    } else if (this.state.clickStatus['Safe Custody'] === true) {
      currentlySelected = 'Safe Custody SIMs'
    } else if (this.state.clickStatus['Unknown'] === true) {
      currentlySelected = 'Unknown SIMs'
    }

    return (
      <Query
        query={GET_SIM_STOCK}
        variables={{
          resellerLoginId: getLoginId()
        }}
      >
        {({ loading, error, data: { sims } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`

          return (
            <Query
              query={ALL_SIM_DETAILS}
              variables={{
                resellerLoginId: getLoginId()
              }}
            >
              {({ loading, error, data: { simStock } }) => {
                if (loading) return 'Loading...'
                if (error) return `Error!: ${error}`
                console.log('simStock', simStock)
                this.simData = simStock
                let totalSims = 0
                let totalCost = 0
                let totalExtraSpend = 0

                // get count of each category
                simStock.forEach(sim => {
                  totalSims += 1
                  // get activated count
                  if (
                    sim.status === 1 ||
                    sim.status === 2 ||
                    sim.status === 3 ||
                    sim.status === 4
                  ) {
                    totalCost += sim.monthlyCharges
                    simCategories[0].count += 1
                    if (sim.status === 3) {
                      totalExtraSpend += sim.monthlyCharges
                      simCategories[0].uninstalled += 1
                    } else if (sim.status === 4) {
                      simCategories[0].installed += 1
                    }
                  } else if (sim.status === 0) {
                    simCategories[1].count += 1
                  } else if (sim.status === 99) {
                    simCategories[2].count += 1
                  } else if (sim.status === -1) {
                    simCategories[3].count += 1
                  }
                })

                return (
                  <div className={classes.root}>
                    <Grid container spacing={16} direction="row">
                      {/* Upload and Bulk upload features  */}
                      <Grid
                        item
                        container
                        spacing={16}
                        direction="row-reverse"
                        justify="space-between"
                      >
                        <Grid item>
                          <Button
                            color="secondary"
                            // href="/home/customers/add"
                            variant="contained"
                            className={classes.button}
                            onClick={this.handleClickOpen}
                          >
                            Add SIM Card
                          </Button>{' '}
                          <Button
                            color="secondary"
                            variant="contained"
                            className={classes.button}
                            onClick={this.downloadBulkUpload(this.props.client)}
                          >
                            Download Format
                          </Button>{' '}
                          <Button
                            color="secondary"
                            variant="contained"
                            className={classes.button}
                            onClick={this.addBulkUpload}
                          >
                            Bulk SIM Upload
                          </Button>
                        </Grid>
                        <Grid item>
                          <Typography variant="headline">
                            SIM Card Management
                          </Typography>
                        </Grid>
                      </Grid>

                      {/* Sim Headers */}
                      <Grid item container spacing={16} direction="row">
                        <Grid item xs={4}>
                          <Typography
                            variant="subheading"
                            color="textSecondary"
                          >
                            Details
                          </Typography>
                        </Grid>
                        <Grid item xs={8}>
                          <Typography
                            variant="subheading"
                            color="textSecondary"
                          >
                            Categories
                          </Typography>
                        </Grid>
                      </Grid>

                      {/* Providers */}
                      <Grid item container spacing={16} direction="row">
                        <Grid item xs={4}>
                          <Grid item container spacing={16} direction="row">
                            <Grid item xs={12}>
                              <Paper className={classes.paper}>
                                <Grid container direction="row">
                                  <Grid item xs={8}>
                                    <Typography variant="body1">
                                      SIMs
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Typography variant="body2">
                                      {totalSims}
                                    </Typography>
                                  </Grid>
                                </Grid>
                                <Grid container direction="row">
                                  <Grid item xs={8}>
                                    <Typography variant="body1">
                                      Cost (pm)
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Typography variant="body2">
                                      {totalCost}
                                      /-
                                    </Typography>
                                  </Grid>
                                </Grid>
                                <Grid container direction="row">
                                  <Grid item xs={8}>
                                    <Typography variant="body1">
                                      Extra Spend (pm)
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Typography variant="body2" color="error">
                                      {totalExtraSpend}
                                      /-
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Paper>
                            </Grid>

                            {/* Provider Details */}
                            <Grid item xs={12}>
                              <Typography
                                variant="subheading"
                                color="textSecondary"
                              >
                                SIM Provider(s)
                              </Typography>
                            </Grid>
                            {sims.map(sim => {
                              return (
                                <Grid item xs={12}>
                                  <ProviderSims
                                    provider={sim.serviceProviderName}
                                    noOfSims={sim.totalAssignedSim}
                                  />
                                  <Divider />
                                </Grid>
                              )
                            })}
                          </Grid>
                        </Grid>

                        {/* Statuses */}
                        <Grid
                          item
                          xs={8}
                          container
                          spacing={16}
                          direction="row"
                        >
                          {simCategories.map(category => {
                            return (
                              <Grid item xs={3}>
                                <DetailsCard
                                  title={category.category}
                                  status={category.status}
                                  handleClick={this.handleClick}
                                  count={category.count}
                                  installed={category.installed}
                                  uninstalled={category.uninstalled}
                                  isClicked={
                                    this.state.clickStatus[category.category]
                                  }
                                />
                              </Grid>
                            )
                          })}
                          <Grid item xs={12}>
                            <Typography
                              variant="subheading"
                              color="textSecondary"
                            >
                              {currentlySelected}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <MUIDataTable
                              data={this.state.tableData}
                              columns={this.state.tableColumns}
                              options={this.tableOptions}
                            />
                          </Grid>
                        </Grid>
                      </Grid>

                      <Dialog
                        open={this.state.open}
                        aria-labelledby="form-dialog-title"
                      >
                        <RegisterSIM handleClose={this.handleClose} />
                      </Dialog>

                      <Dialog
                        open={this.state.editStatusOpen}
                        aria-labelledby="edit-status-dialog"
                      >
                        <EditStatus
                          handleClose={this.handleClose}
                          category={this.state.selectedCategory}
                          serviceProvider={this.state.serviceProvider}
                          simNumber={this.state.simNumber}
                          phoneNumber={this.state.phoneNumber}
                          monthlyCharges={this.state.monthlyCharges}
                          isInstalled={this.state.isInstalled}
                          simId={this.state.currentSimId}
                          serviceProviderId={
                            this.state.currentServiceProviderId
                          }
                        />
                      </Dialog>
                    </Grid>
                  </div>
                )
              }}
            </Query>
          )
        }}
      </Query>
    )
  }
}

export default withStyles(style)(withApollo(InventoryDevices))
