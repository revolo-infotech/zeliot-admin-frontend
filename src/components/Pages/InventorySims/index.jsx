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
import getLoginId from '../../../utils/getLoginId'
import axios from 'axios'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import EditSim from './EditSim'
import Loader from '../../common/Loader'

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
    color: theme.palette.text.secondary
  },
  iconSmall: {
    fontSize: 20
  }
})

const GET_SIM_STOCK = gql`
  query getPartnerSimStockByServiceProvider($partnerLoginId: Int!) {
    sims: getPartnerSimStockByServiceProvider(partnerLoginId: $partnerLoginId) {
      serviceProviderName
      totalAssignedSim
      availableStock
      simProviderId
    }
  }
`

const GET_FILE_FORMAT = gql`
  query getPublicDownloadURL($bucketname: String!, $filename: String!) {
    getPublicDownloadURL(bucketName: $bucketname, filename: $filename)
  }
`

const ALL_SIM_DETAILS = gql`
  query allSimDetails($partnerLoginId: Int!) {
    simStock: allSimDetails(ownerLoginId: $partnerLoginId) {
      id
      phoneNumber
      simNumber
      monthlyCharges
      status
      clientName
      serviceProvider {
        name
        id
      }
    }
  }
`

const GET_SIM_LIST = gql`
  query allSimDetails($partnerLoginId: Int!, $providerId: Int) {
    simList: allSimDetails(
      ownerLoginId: $partnerLoginId
      serviceProviderId: $providerId
    ) {
      id
      phoneNumber
      simNumber
      monthlyCharges
      status
      clientName
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

  tableOptions2 = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 5,

    onRowClick: (rowData, dataIndex, rowIndex) => {
      console.log(this.status[dataIndex.dataIndex], 'di')
      if (this.status[dataIndex.dataIndex] === 2) {
        this.editSim(this.simId[dataIndex.dataIndex])
      } else {
        this.props.openSnackbar('Sim can not be edited')
      }
    }
  }

  state = {
    open: false,
    tableColumns: [],
    tableData: [],
    tableOptions: [],
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
    },
    simStock: [],
    sims: [],
    selSimId: '',
    openEdit: false
  }

  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false, editStatusOpen: false })
    // this.getAllSimDetails()
    // this.getSimStock()
  }

  editSim = simId => {
    // console.log(uniqueDeviceId, 'demo')
    this.setState({ selSimId: simId }, () => {
      // console.log(this.state.selSimId, 'uid')
    })
    this.handleClickOpenEdit()
  }

  handleClickOpenEdit = () => {
    this.setState({ openEdit: true })
  }

  handleCloseEdit = () => {
    this.setState({ openEdit: false })
  }

  addBulkUpload = e => {
    this.props.history.push({
      pathname: '/home/inventory/sims/bulk-upload'
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
    const res = await axios({
      url: data.getPublicDownloadURL,
      method: 'GET',
      headers: { Accept: 'application/vnd.ms-excel' },
      responseType: 'blob' // important
    })

    FileSaver.saveAs(new Blob([res.data]), 'sample.xlsx')
    // FileSaver.saveAs(data.getPublicDownloadURL, 'sample.xlsx')
  }

  componentDidMount() {
    this.handleClick(1)
    // this.getAllSimDetails()
    // this.getSimStock()
  }

  getAllSimDetails = async () => {
    const simStock = await this.props.client.query({
      query: ALL_SIM_DETAILS,
      variables: {
        partnerLoginId: getLoginId()
      }
      // fetchPolicy: 'cache-and-network'
    })
    // console.log('simStock', simStock)
    this.setState({ simStock: simStock.data.simStock })
  }

  getSimStock = async () => {
    const sims = await this.props.client.query({
      query: GET_SIM_STOCK,
      variables: {
        partnerLoginId: getLoginId()
      },
      fetchPolicy: 'network-only'
    })
    // console.log('sims', sims)
    this.setState({ sims: sims.data.sims })
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
        'INSTALLED',
        'CLIENT NAME'
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
          if (sim.clientName === null) {
            tempData.push('NA')
          } else {
            tempData.push(sim.clientName)
          }
          data.push(tempData)
        } else if (sim.status === 4) {
          simProviderIds.push(sim.serviceProvider.id)
          simIds.push(sim.id)
          tempData.push(sim.serviceProvider.name.toString())
          tempData.push(sim.simNumber.toString())
          tempData.push(sim.phoneNumber.toString())
          tempData.push(sim.monthlyCharges.toString())

          tempData.push('Yes')
          if (sim.clientName === null) {
            tempData.push('NA')
          } else {
            tempData.push(sim.clientName)
          }
          data.push(tempData)
        }
      })
    } else {
      columns = [
        'SERVICE PROVIDER',
        'SIM NUMBER',
        'PHONE NUMBER',
        'COST',
        'CLIENT NAME'
      ]

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
            if (sim.clientName === null) {
              tempData.push('NA')
            } else {
              tempData.push(sim.clientName)
            }
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
            if (sim.clientName === null) {
              tempData.push('NA')
            } else {
              tempData.push(sim.clientName)
            }
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
            if (sim.clientName === null) {
              tempData.push('NA')
            } else {
              tempData.push(sim.clientName)
            }
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
      clickStatus: clickStatus,
      tableOptions: this.tableOptions
    })
  }

  handleProviderClick = async providerId => {
    // console.log(providerId, 'providerId')
    const simList = await this.props.client.query({
      query: GET_SIM_LIST,
      variables: {
        partnerLoginId: getLoginId(),
        providerId: parseInt(providerId, 10)
      },
      fetchPolicy: 'network-only'
    })
    // console.log('sims', simList)
    let columns = []
    let data = []
    this.status = []
    this.simId = []
    // let category
    let simProviderIds = []
    let simIds = []
    columns = [
      'SERVICE PROVIDER',
      'SIM NUMBER',
      'PHONE NUMBER',
      'COST',
      'STATUS',
      'CLIENT NAME'
    ]

    simList.data.simList.forEach(sim => {
      let tempData = []

      simProviderIds.push(sim.serviceProvider.id)
      simIds.push(sim.id)
      this.status.push(sim.status)
      this.simId.push(sim.id)
      tempData.push(sim.serviceProvider.name.toString())
      tempData.push(sim.simNumber.toString())
      tempData.push(sim.phoneNumber.toString())
      tempData.push(sim.monthlyCharges.toString())
      tempData.push(this.getSimStatus(sim.status))
      if (sim.clientName === null) {
        tempData.push('NA')
      } else {
        tempData.push(sim.clientName)
      }

      data.push(tempData)
    })
    this.setState({
      tableData: data,
      tableColumns: columns,
      // selectedCategory: category,
      currentSimIds: simIds,
      currentServiceProviderIds: simProviderIds,
      tableOptions: this.tableOptions2
    })
    console.log(this.status, this.simId, 'asds')
  }

  getSimStatus = status => {
    if (status === 2) {
      return 'Instock'
    } else if (status === 3) {
      return 'Assigned to Client'
    } else if (status === 4) {
      return 'Registered to vehicle'
    } else if (status === 0) {
      return 'Deactivated'
    } else if (status === 99) {
      return 'safe Custody'
    } else if (status === 1) {
      return 'Added by super-admin'
    }
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
          partnerLoginId: getLoginId()
        }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data: { sims } }) => {
          if (loading) return <Loader />
          if (error) return `Error!: ${error}`

          return (
            <Query
              query={ALL_SIM_DETAILS}
              variables={{
                partnerLoginId: getLoginId()
              }}
              fetchPolicy="network-only"
            >
              {({ loading, error, data: { simStock } }) => {
                if (loading) return <Loader />
                if (error) return `Error!: ${error}`

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

                // console.log('rerender count', simStock)

                return (
                  <div className={classes.root}>
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
                        serviceProviderId={this.state.currentServiceProviderId}
                      />
                    </Dialog>
                    <Grid container spacing={16} direction="row">
                      {/* Upload and Bulk upload features  */}
                      <Grid item xs={12}>
                        <Grid container spacing={16} justify="space-between">
                          <Grid item>
                            <Typography variant="headline">
                              SIM Card Management
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Grid container spacing={8} justify="flex-end">
                              <Grid item xs={12} sm="auto">
                                <Button
                                  fullWidth
                                  color="secondary"
                                  // href="/home/customers/add"
                                  variant="contained"
                                  className={classes.button}
                                  onClick={this.handleClickOpen}
                                >
                                  Add SIM Card
                                </Button>
                              </Grid>
                              <Grid item xs={12} sm="auto">
                                <Button
                                  fullWidth
                                  color="secondary"
                                  variant="contained"
                                  className={classes.button}
                                  onClick={this.downloadBulkUpload(
                                    this.props.client
                                  )}
                                >
                                  Download Format
                                </Button>
                              </Grid>
                              <Grid item xs={12} sm="auto">
                                <Button
                                  fullWidth
                                  color="secondary"
                                  variant="contained"
                                  className={classes.button}
                                  onClick={this.addBulkUpload}
                                >
                                  Bulk SIM Upload
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>

                      {/* Sim Headers */}
                      <Grid item xs={12}>
                        <Grid container spacing={16}>
                          <Grid item xs={12} md={4}>
                            <Grid container spacing={8}>
                              <Grid item xs={12}>
                                <Typography
                                  variant="subheading"
                                  color="textSecondary"
                                >
                                  Details
                                </Typography>
                              </Grid>
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
                            </Grid>
                          </Grid>

                          <Grid item xs={12} md={8}>
                            <Grid container spacing={8}>
                              <Grid item xs={12}>
                                <Typography
                                  variant="subheading"
                                  color="textSecondary"
                                >
                                  Categories
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Grid
                                  container
                                  spacing={16}
                                  alignItems="stretch"
                                >
                                  {simCategories.map(category => {
                                    return (
                                      <Grid item xs={12} sm={3}>
                                        <DetailsCard
                                          title={category.category}
                                          status={category.status}
                                          handleClick={this.handleClick}
                                          count={category.count}
                                          installed={category.installed}
                                          uninstalled={category.uninstalled}
                                          isClicked={
                                            // eslint-disable-next-line standard/computed-property-even-spacing
                                            this.state.clickStatus[
                                              category.category
                                            ]
                                          }
                                        />
                                      </Grid>
                                    )
                                  })}
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid item xs={12}>
                        <Grid container spacing={8}>
                          <Grid item xs={12}>
                            <Typography
                              variant="subheading"
                              color="textSecondary"
                            >
                              SIM Provider(s)
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Grid container spacing={16}>
                              {sims.map(sim => {
                                return (
                                  <Grid item xs={12} sm={6} md={4}>
                                    <ProviderSims
                                      provider={sim.serviceProviderName}
                                      noOfSims={sim.totalAssignedSim}
                                      handleProviderClick={
                                        this.handleProviderClick
                                      }
                                      providerId={sim.simProviderId}
                                    />
                                    <Divider />
                                  </Grid>
                                )
                              })}
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid item xs={12}>
                        <Grid container spacing={8}>
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
                              options={this.state.tableOptions}
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
                      <Dialog
                        open={this.state.openEdit}
                        onClose={this.handleCloseEdit}
                        aria-labelledby="form-dialog-title"
                      >
                        {
                          <EditSim
                            handleClose={this.handleCloseEdit}
                            selSimId={this.state.selSimId}
                          />
                        }
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

export default withStyles(style)(
  withApollo(withSharedSnackbar(InventoryDevices))
)
