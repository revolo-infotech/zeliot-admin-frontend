import React, { Component, Fragment } from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import getLoginId from '../../../utils/getLoginId'
import Select from 'react-select'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import PropTypes from 'prop-types'
// import { lighten } from '@material-ui/core/styles/colorManipulator'
import classNames from 'classnames'
import {
  Typography,
  withStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Checkbox,
  Button,
  Grid,
  Input
} from '@material-ui/core'

const GET_CLIENTS = gql`
  query allClientDetails($partnerLoginId: Int) {
    clients: allClientDetails(partnerLoginId: $partnerLoginId) {
      id
      clientName
      loginId
    }
  }
`
const GET_ALL_VEHICLES = gql`
  query getAllVehicleDetails($clientLoginId: Int, $obdOnly: Boolean) {
    getAllVehicleDetails(clientLoginId: $clientLoginId, obdOnly: $obdOnly) {
      entityId
      vehicleNumber
      deviceDetail {
        uniqueDeviceId
      }
    }
  }
`
const PUSH_DEVICE_COMMAND = gql`
  mutation updateDevicePidCommandsTable(
    $uniqueId: String!
    $device_password: String!
  ) {
    updateDevicePidCommandsTable(
      device_uniqueId: $uniqueId
      device_command: $device_password
    ) {
      message
    }
  }
`
const GET_ALL_PIDS = gql`
  query getConfigureCommandStatus($uniqueId: String!, $responseId: Int!) {
    getConfigureCommandStatus(uniqueid: $uniqueId, id: $responseId) {
      status
      pids
      description
    }
  }
`
const PUSH_PIDS_DEVICE = gql`
  mutation updatePidsToDeviceCommandsTable(
    $uniqueId: String!
    $device_password: String!
    $pids: [String!]
  ) {
    updatePidsToDeviceCommandsTable(
      uniqueId: $uniqueId
      device_password: $device_password
      pids: $pids
    ) {
      message
    }
  }
`
const GET_PIDS_RESPONSE = gql`
  query getPidsConfigureStatus($uniqueId: String!, $pidResponseId: Int!) {
    getPidsConfigureStatus(uniqueid: $uniqueId, id: $pidResponseId) {
      status
    }
  }
`
const style = theme => ({
  root: {
    width: '100%',
    padding: theme.spacing.unit * 4,
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: 140,
    width: 100
  },
  iconSmall: {
    fontSize: 20
  },
  selstyle: {
    maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    width: 250
  },
  formControl: {
    margin: theme.spacing.unit * 3
  },
  group: {
    margin: `${theme.spacing.unit}px 0`
  }
})

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const rows = [
  {
    id: 'pid',
    numeric: false,
    disablePadding: true,
    label: 'PID'
  },
  {
    id: 'Description',
    numeric: true,
    disablePadding: false,
    label: 'DESCRIPTION'
  }
]
class EnhancedTableHead extends React.Component {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property)
  }

  render() {
    const { onSelectAllClick, numSelected, rowCount } = this.props

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
          {console.log(rows, 'rows')}
          {rows.map(
            row => (
              <TableCell
                key={row.id}
                align={row.numeric ? 'right' : 'inherit'}
                padding={row.disablePadding ? 'none' : 'default'}
              >
                {row.label}
              </TableCell>
            ),
            this
          )}
        </TableRow>
      </TableHead>
    )
  }
}
EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  rowCount: PropTypes.number.isRequired
}

// const toolbarStyles = theme => ({
//   root: {
//     paddingRight: theme.spacing.unit
//   },
//   highlight: {
//     color: theme.palette.secondary.main,
//     backgroundColor: lighten(theme.palette.secondary.light, 0.85)
//   },
//   spacer: {
//     flex: '1 1 100%'
//   },
//   actions: {
//     color: theme.palette.text.secondary
//   },
//   title: {
//     flex: '0 0 auto'
//   }
// })

const EnhancedTableToolbar = props => {
  const { numSelected, classes } = props

  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0
      })}
    />
  )
}

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired
}

// const WrappedEnhancedTableToolbar = withStyles(toolbarStyles)(
//   EnhancedTableToolbar
// )
class PidsConfiguration extends Component {
  state = {
    spacing: '16',
    name: [],
    fullData: [],
    clientNameInfo: [],
    clientNames: [],
    clientName: '',
    clientLoginId: '',
    vehiclenames: '',
    deviceUniqueId: '',
    responseId: '',
    clientNameLoginId: [],
    entityIdTemp: [],
    loading: false,
    pids: [],
    description: [],
    responseStatus: '',
    selPids: [],
    pidResponseId: '',
    responsePidStatus: '',
    loadingPid: false,
    selected: [],
    page: 0,
    rowsPerPage: 5,
    searchValue: '',
    pidsArr: []
  }

  getAllCustomers = async () => {
    const customers = await this.props.client.query({
      query: GET_CLIENTS,
      variables: {
        partnerLoginId: getLoginId()
      },
      fetchPolicy: 'network-only'
    })
    if (customers && customers.data) {
      var clientName = []
      var clientLoginId = []
      customers.data.clients.forEach(element => {
        clientName.push(element.clientName)
        clientLoginId.push(element.loginId)
      })
      this.setState({
        clientNameInfo: clientName,
        clientLoginIdInfo: clientLoginId
      })
      const allClients = customers.data.clients.map(client => ({
        value: client.loginId,
        label: client.clientName
      }))
      this.setState({ clientNames: allClients })
    }
  }

  componentDidMount() {
    this.getAllCustomers()
  }

  clientLoginIdTemp = ''

  handleChange = event => {
    // let key = this.state.clientNameInfo.indexOf(event.target.value)
    // console.log(event, 'event')
    this.setState(
      {
        clientName: event.label,
        clientLoginId: event.value
      },
      () => {
        this.getAllVehicleDetails(this.state.clientLoginId)() // iife
        // console.log(this.state.clientName, 'client')
      }
    )
  }
  handleChangeVehicle = event => {
    this.setState({
      deviceUniqueId: event.value,
      vehicleName: event.label
    })
  }

  getAllVehicleDetails = val => async () => {
    const { data } = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        clientLoginId: val,
        obdOnly: true
      },
      fetchPolicy: 'network-only'
    })

    if (data && data.getAllVehicleDetails) {
      var vehicleName = []
      var uniqueDeviceId = []
      data.getAllVehicleDetails.forEach(element => {
        vehicleName.push(element.vehicleNumber)
        uniqueDeviceId.push(element.deviceDetail.uniqueDeviceId)
      })

      const allVehicles = data.getAllVehicleDetails.map(vlpn => ({
        value: vlpn.deviceDetail.uniqueDeviceId,
        label: vlpn.vehicleNumber
      }))
      // console.log(allVehicles, 'allvehi')
      this.setState({ vehiclenames: allVehicles })
    }
  }

  handleSubmit = client => async event => {
    event.preventDefault()
    const { data } = await client.mutate({
      mutation: PUSH_DEVICE_COMMAND,
      variables: {
        uniqueId: this.state.deviceUniqueId,
        device_password: 'aquila123'
      }
      // refetchQueries: [`getAllVehicleDetails`]
    })
    // console.log(data, 'data')
    if (data !== null) {
      this.setState({ responseId: data.updateDevicePidCommandsTable.message })
      this.setupPolling()
      this.startPolling()
    } else {
      this.setState({ failure: true })
      this.props.openSnackbar('Failed to push the command')
    }
  }

  handleConfigure = client => async event => {
    event.preventDefault()
    const { data } = await client.mutate({
      mutation: PUSH_PIDS_DEVICE,
      variables: {
        uniqueId: this.state.deviceUniqueId,
        device_password: 'aquila123',
        pids: this.state.selected
      }
      // refetchQueries: [`getAllVehicleDetails`]
    })
    // console.log(data, 'data')
    if (data !== null) {
      this.setState({
        pidResponseId: data.updatePidsToDeviceCommandsTable.message
      })
      this.setupPidsPolling()
      this.startPidsPolling()
    } else {
      this.setState({ failure: true })
      this.props.openSnackbar('Failed to push Pids')
    }
  }
  setupPolling = () => {
    this.allpids = this.props.client.watchQuery({
      query: GET_ALL_PIDS,
      variables: {
        responseId: parseInt(this.state.responseId, 10),
        uniqueId: this.state.deviceUniqueId
      },
      pollInterval: 30000,
      fetchPolicy: 'network-only'
    })
  }

  startPolling = () => {
    this.allpids.subscribe({
      next: ({ data, loading }) => {
        if (loading) {
          this.setState({ loading: true })
        } else {
          this.setState(
            { responseStatus: data.getConfigureCommandStatus[0].status },
            () => {
              // this.mapToArr()
              // console.log(data.getConfigureCommandStatus[0].pids, 'pidssdata')
              if (data.getConfigureCommandStatus[0].status === 'Success') {
                this.stopPolling()
                this.setState(
                  {
                    pids: data.getConfigureCommandStatus[0].pids,
                    description: data.getConfigureCommandStatus[0].description,
                    loading: false
                  },
                  () => {
                    // console.log(this.state.description, 'kat')
                    // this.mapToArr()
                    this.convertArraytoObject()
                  }
                )
              } else {
                this.setState({ loading: true })
                if (this.state.responseStatus === 'Active') {
                  this.setState({
                    responseStatus: 'Command inserted into DB'
                  })
                } else if (this.state.responseStatus === 'Inprogress') {
                  this.setState({
                    responseStatus: 'Command pushed to device'
                  })
                } else if (
                  this.state.responseStatus === 'Timed Out' ||
                  this.state.responseStatus === 'Failure'
                ) {
                  this.stopPolling()
                  this.props.openSnackbar(
                    'Failed to push command, please try again'
                  )
                }
              }
            }
          )
        }
      }
    })
  }
  stopPolling = () => this.allpids.stopPolling()

  // pushing pids to db and device
  setupPidsPolling = () => {
    this.pushPids = this.props.client.watchQuery({
      query: GET_PIDS_RESPONSE,
      variables: {
        pidResponseId: parseInt(this.state.pidResponseId, 10),
        uniqueId: this.state.deviceUniqueId
      },
      pollInterval: 30000,
      fetchPolicy: 'network-only'
    })
  }

  startPidsPolling = () => {
    this.pushPids.subscribe({
      next: ({ data, loading }) => {
        if (loading) {
          this.setState({ loadingPid: true })
        } else {
          this.setState(
            { responsePidStatus: data.getPidsConfigureStatus[0].status },
            () => {
              // this.mapToArr()
              // console.log(this.state.pidsData, 'pidssdata')
              if (data.getPidsConfigureStatus[0].status === 'Success') {
                this.setState({ loadingPid: false })
                this.stopPidsPolling()
                this.props.openSnackbar('Pids configured Successfuly')
              } else {
                this.setState({
                  loadingPid: true
                })
                if (this.state.responsePidStatus === 'Active') {
                  this.setState({
                    responsePidStatus: 'Command inserted into DB'
                  })
                } else if (this.state.responsePidStatus === 'Inprogress') {
                  this.setState({
                    responsePidStatus: 'Command pushed to device'
                  })
                } else if (
                  this.state.responsePidStatus === 'Timed Out' ||
                  this.state.responsePidStatus === 'Failure'
                ) {
                  this.stopPidsPolling()
                  this.props.openSnackbar(
                    'Failed configure pids, please try again'
                  )
                }
              }
            }
          )
        }
      }
    })
  }
  stopPidsPolling = () => this.pushPids.stopPolling()

  componentWillUnmount = () => {
    if (this.allpids !== undefined) {
      this.stopPolling()
    }
    if (this.pushPids !== undefined) {
      this.stopPidsPolling()
    }
  }

  mapToArr = () => {
    let rowDataLast = []
    // this.state.pids.forEach((element, index) => {
    // console.log('table', this.state.pids, this.state.description)

    for (var i = 0; i <= this.state.pids.length; i++) {
      if (this.state.pids[i] !== '' && this.state.pids[i] !== undefined) {
        // console.log('table', this.state.pids[i], this.state.description[i])
        var rowData = []
        let pid = this.state.pids[i]
        rowData.push(
          <Checkbox
            onClick={() => {
              this.selectVehicle(pid)
            }}
          />
        )
        rowData.push(this.state.pids[i])
        rowData.push(this.state.description[i].toString())
        rowDataLast.push(rowData)
      }
    }
    this.setState({ fullData: rowDataLast })
  }

  pidsArr = []
  selectVehicle = value => {
    // console.log(value, 'value')
    let selPidArr = []
    if (this.pidsArr.length > 0) {
      let indexTemp = this.pidsArr.indexOf(value)
      if (indexTemp < 0) {
        this.pidsArr.push(value)
        this.pidsArr.forEach(val => {
          selPidArr.push(val)
        })
        this.setState({ selPids: selPidArr }, () => {
          // console.log('selPids', this.state.selPids)
        })
      } else {
        this.pidsArr.splice(indexTemp, 1)
        this.pidsArr.forEach(val => {
          selPidArr.push(val)
        })
        this.setState({ selPids: selPidArr }, () => {
          // console.log('selPids', this.state.selPids)
        })
      }
    } else {
      this.pidsArr.push(value)
      this.pidsArr.forEach(val => {
        selPidArr.push(val)
      })
      this.setState({ selPids: selPidArr }, () => {
        console.log('selPids', this.state.selPids)
      })
    }

    // console.log('selPids', this.state.selPids)
  }

  convertArraytoObject = () => {
    // console.log('sdhbfjd')
    var pidObj = []
    for (var i = 0; i < this.state.pids.length; i++) {
      if (this.state.pids[i] !== '') {
        pidObj.push({
          pid: this.state.pids[i],
          desc: this.state.description[i]
        })
      }
    }
    // console.log('mee', pidObj)
    this.setState({ pidsArr: pidObj })
  }

  // new
  handleClick = (event, id) => {
    const { selected } = this.state
    const selectedIndex = selected.indexOf(id)
    let newSelected = []
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }
    this.setState({ selected: newSelected }, () => {
      console.log(this.state.selected, 'selected')
    })
  }

  handleChangePage = (event, page) => {
    this.setState({ page })
  }

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value })
  }

  isSelected = id => this.state.selected.indexOf(id) !== -1

  handleSearchChange = e => this.setState({ searchValue: e.target.value })
  findArrayElementByTitle = (array, title) => {
    let assignedArr = []
    array.forEach(n => {
      assignedArr.push(n)
    })

    let status = assignedArr.includes(title)
    return status
  }
  handleSelectAllClick = event => {
    if (event.target.checked) {
      this.setState(state => ({
        selected: this.state.pidsArr.map(n => n.pid)
      }))
    } else {
      this.setState({ selected: [] })
    }
  }
  // new ends
  render() {
    const { classes } = this.props
    const { spacing, selected, rowsPerPage, page } = this.state
    const emptyRows =
      rowsPerPage -
      Math.min(rowsPerPage, this.state.pids.length - page * rowsPerPage)

    return (
      <Fragment>
        {/* <WrappedEnhancedTableToolbar
          numSelected={selected.length}
          onReset={() => this.setState({ selected: [] })}
        /> */}

        <div className={classes.root}>
          <h3>Pid's Configuration</h3>
          <Grid
            container
            spacing={16}
            direction="row"
            justify="center"
            alignItems="center"
            style={{ width: '100%' }}
          >
            <Grid item xs={12}>
              <Grid container justify="center" spacing={Number(spacing)}>
                <Grid item style={{ minWidth: '30%' }}>
                  <Select
                    classes={classes}
                    options={this.state.clientNames}
                    // components={components}
                    value={this.state.clientLoginId}
                    onChange={this.handleChange}
                    placeholder="Select Customer"
                  />
                </Grid>
                <Grid item style={{ minWidth: '30%' }}>
                  <Select
                    classes={classes}
                    options={this.state.vehiclenames}
                    // components={components}
                    value={this.state.deviceUniqueId}
                    onChange={this.handleChangeVehicle}
                    placeholder="Select Vehicle"
                  />
                </Grid>
                <Grid item />
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="secondary"
              size="medium"
              margin="normal"
              className="btn"
              type="button"
              onClick={this.handleSubmit(this.props.client)}
              disabled={
                this.state.deviceUniqueId === '' ||
                this.state.clientLoginId === ''
              }
            >
              Submit
            </Button>
            {this.state.loading && (
              <Typography color="error" variant="subtitle1">
                {this.state.responseStatus}
              </Typography>
            )}

            {this.state.responseStatus === 'Success' && (
              <Grid item xs={12}>
                <Grid item>
                  <Input
                    value={this.state.searchValue}
                    onChange={this.handleSearchChange}
                    placeholder="Search Pids"
                  />
                </Grid>
                <Table className={classes.table} aria-labelledby="tableTitle">
                  <EnhancedTableHead
                    numSelected={selected.length}
                    onSelectAllClick={this.handleSelectAllClick}
                    rowCount={this.state.pidsArr.length}
                  />
                  <TableBody>
                    {this.state.pidsArr
                      .filter(pid => pid.pid.includes(this.state.searchValue))
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )

                      .map(n => {
                        let isSelected = this.isSelected(n.pid)

                        isSelected = this.findArrayElementByTitle(
                          selected,
                          n.pid
                        )
                        // this.state.description.map(d => {
                        // console.log(n, 'pids')
                        return (
                          <TableRow
                            hover
                            onClick={event => this.handleClick(event, n.pid)}
                            role="checkbox"
                            aria-checked={isSelected}
                            tabIndex={-1}
                            key={n.pid}
                            selected={isSelected}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox checked={isSelected} />
                            </TableCell>
                            <TableCell
                              component="th"
                              scope="row"
                              padding="none"
                            >
                              {n.pid}
                            </TableCell>

                            <TableCell align="right">{n.desc}</TableCell>
                          </TableRow>
                        )
                        // })
                      })}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 49 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={this.state.pidsArr.length}
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
                <br />
                <Button
                  variant="contained"
                  color="secondary"
                  size="medium"
                  margin="normal"
                  className="btn"
                  type="button"
                  onClick={this.handleConfigure(this.props.client)}
                  disabled={
                    this.state.selected.length === 0 ||
                    this.state.clientLoginId === '' ||
                    this.state.deviceUniqueId === ''
                  }
                >
                  Configure
                </Button>
                {this.state.loadingPid && (
                  <Typography color="error" variant="subtitle1">
                    {this.state.responsePidStatus}
                  </Typography>
                )}
              </Grid>
            )}
          </Grid>
        </div>
      </Fragment>
    )
  }
}
PidsConfiguration.propTypes = {
  classes: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired
}

export default withStyles(style)(
  withApollo(withSharedSnackbar(PidsConfiguration))
)
