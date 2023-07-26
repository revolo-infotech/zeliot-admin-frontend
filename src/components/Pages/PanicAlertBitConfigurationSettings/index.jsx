import React, { Component } from 'react'

import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import getLoginId from '../../../utils/getLoginId'
import Select from 'react-select'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import Radio from '@material-ui/core/Radio'
import FormLabel from '@material-ui/core/FormLabel'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import classNames from 'classnames'
import {
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
import PropTypes from 'prop-types'

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
  query getAllVehicleDetails($clientLoginId: Int) {
    getAllVehicleDetails(clientLoginId: $clientLoginId) {
      entityId
      vehicleType
      vehicleModel
      vehicleNumber
      deviceDetail {
        uniqueDeviceId
      }
      panicType
    }
  }
`
const ADD_PANIC_BIT_CONFIGURATION = gql`
  mutation setMultiDeviceAlertConfigs(
    $clientLoginId: Int!
    $alertType: String!
    $alertConfigs: [AlertConfigInput!]
  ) {
    setMultiDeviceAlertConfigs(
      clientLoginId: $clientLoginId
      alertType: $alertType
      alertConfigs: $alertConfigs
    )
  }
`

const style = theme => ({
  root: {
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
    id: 'vlpn',
    numeric: false,
    disablePadding: true,
    label: 'VEHICLE NUMBER'
  },
  {
    id: 'bit',
    numeric: true,
    disablePadding: false,
    label: 'PANIC BIT'
  },
  {
    id: 'type',
    numeric: true,
    disablePadding: false,
    label: 'TYPE'
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
          {/* {console.log(rows, 'rows')} */}
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

class PanicAlertBitConfigurationSettings extends Component {
  state = {
    spacing: '16',
    name: [],
    fullData: [],
    clientNameInfo: [],
    clientNames: [],
    clientName: '',
    clientLoginId: '',
    clientNameLoginId: [],
    bitPosition: [],
    entityId: [],
    panicSettingsDetails: [],
    bits: [null, null],
    panic: 'none',
    ac: 'none',
    entityIdTemp: [],
    alertType: '',
    alertConfigs: {},
    uniqueDeviceId: [],
    vehicleNumber: [],
    selected: [],
    page: 0,
    rowsPerPage: 5,
    searchValue: '',
    vlpnArr: [],
    panicType: [],
    vehicleModel: []
  }

  columns = ['SELECT', 'VEHICLE NUMBER', 'PANIC BIT', 'TYPE']
  panicBitArr = {
    Panic: ['none', '1', '256', '2048', '222'],
    AC: ['none', '1', '256', '2048']
  }
  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 5,
    filter: false,
    download: false,
    print: false
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

  onBitChange = index => bit =>
    this.setState(({ bits }) => {
      const originalBits = [...bits]
      originalBits[index] = bit
      return {
        bits: originalBits
      }
    })

  getAllVehicleDetails = val => async () => {
    const { data } = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        clientLoginId: val
      },
      fetchPolicy: 'network-only'
    })

    // let rowDataLast = []
    let vehicleNumber = []
    let uniqueDeviceId = []
    let vehicleModel = []
    let panicType = []
    data.getAllVehicleDetails.forEach((element, index) => {
      // var rowData = []
      // rowData.push(
      //   <Checkbox
      //     onChange={() =>
      //       this.selectVehicle(element.deviceDetail.uniqueDeviceId)
      //     }
      //   />
      // )
      // rowData.push(element.vehicleNumber)
      // rowData.push(element.panicType)
      // rowData.push(element.vehicleModel)
      // rowDataLast.push(rowData)
      vehicleNumber.push(element.vehicleNumber)
      uniqueDeviceId.push(element.deviceDetail.uniqueDeviceId)
      vehicleModel.push(element.vehicleModel)
      panicType.push(element.panicType)
    })
    this.setState(
      {
        // fullData: rowDataLast,
        uniqueDeviceId: uniqueDeviceId,
        vehicleNumber: vehicleNumber,
        vehicleModel: vehicleModel,
        panicType: panicType
      },
      () => {
        this.convertArraytoObject()
      }
    )
  }

  panicSettingsArr = []

  onPanicChange = event => {
    this.setState({
      panic: event.target.value
    })
  }

  onAcChange = event => {
    this.setState({ ac: event.target.value })
  }
  vehicleIdArr = []
  selectVehicle = value => {
    let entityArr = []
    if (this.vehicleIdArr.length > 0) {
      let indexTemp = this.vehicleIdArr.indexOf(value)
      if (indexTemp < 0) {
        this.vehicleIdArr.push(value)
        this.vehicleIdArr.forEach(val => {
          entityArr.push(val)
        })
        this.setState({ entityId: entityArr })
      } else {
        this.vehicleIdArr.splice(indexTemp, 1)
        this.vehicleIdArr.forEach(val => {
          entityArr.push(val)
        })
        this.setState({ entityId: entityArr })
      }
    } else {
      this.vehicleIdArr.push(value)
      this.vehicleIdArr.forEach(val => {
        entityArr.push(val)
      })
      this.setState({ entityId: entityArr })
    }
  }
  alertConfigs = []
  handleSubmit = client => async event => {
    event.preventDefault()
    this.state.selected.forEach(val => {
      let entityArr = {}
      entityArr.panicType = parseInt(this.state.panic, 10)
      entityArr.uniqueDeviceId = val
      entityArr.fromTimestamp = Math.floor(Date.now() / 1000 + 19800).toString()
      entityArr.toTimestamp = Math.floor(Date.now() / 1000 + 19800).toString()
      entityArr.isAlertEnable = true
      this.alertConfigs.push(entityArr)
    })

    const { data } = await client.mutate({
      mutation: ADD_PANIC_BIT_CONFIGURATION,
      variables: {
        clientLoginId: parseInt(this.state.clientLoginId, 10),
        alertType: 'panic',
        alertConfigs: this.alertConfigs
      },
      refetchQueries: [`getAllVehicleDetails`]
    })
    this.alertConfigs = []
    this.setState({
      alertConfigs: []
    })

    if (data !== null) {
      this.setState({ response: data })
      this.props.openSnackbar('Panic Bit Configured Successfully')
      this.getAllVehicleDetails(this.state.clientLoginId)()
    } else {
      this.setState({ failure: true })
      this.props.openSnackbar('Failed to configure')
    }
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
      this.setState(
        state => ({
          selected: this.state.vlpnArr.map(n => n.uniqueDeviceId)
        }),
        () => {
          console.log(this.state.selected, 'selected')
        }
      )
    } else {
      this.setState({ selected: [] })
    }
  }
  convertArraytoObject = () => {
    // console.log('sdhbfjd')
    var vlpnObj = []
    for (var i = 0; i < this.state.vehicleNumber.length; i++) {
      if (this.state.vehicleNumber[i] !== '') {
        vlpnObj.push({
          vlpn: this.state.vehicleNumber[i],
          panicType: this.state.panicType[i],
          vehicleModel: this.state.vehicleModel[i],
          uniqueDeviceId: this.state.uniqueDeviceId[i]
        })
      }
    }

    this.setState({ vlpnArr: vlpnObj })
  }
  // new ends

  render() {
    const { classes } = this.props
    const { spacing, selected, rowsPerPage, page } = this.state
    const emptyRows =
      rowsPerPage -
      Math.min(
        rowsPerPage,
        (this.state.vehicleNumber.length - page) * rowsPerPage
      )

    return (
      <div className={classes.root}>
        <h3>Panic Configuration</h3>
        <Grid
          container
          spacing={16}
          direction="row"
          justify="center"
          alignItems="center"
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
              <Grid item />
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            container
            direction="column"
            justify="flex-start"
            alignItems="center"
          >
            <Grid
              container
              className={classes.demo}
              justify="center"
              spacing={Number(spacing)}
            >
              <FormLabel component="legend">Panic</FormLabel>
              {this.panicBitArr.Panic.map(val => (
                <Grid key={val} item>
                  <Grid item xs>
                    <FormControl
                      component="fieldset"
                      className={classes.formControl}
                    >
                      <RadioGroup
                        aria-label="Panic"
                        name="Panic"
                        value={this.state.panic}
                        onChange={this.onPanicChange}
                      >
                        <FormControlLabel
                          value={val}
                          control={<Radio />}
                          label={val}
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
          {this.state.clientName && (
            <Grid item xs={12}>
              <Grid item>
                <Input
                  value={this.state.searchValue}
                  onChange={this.handleSearchChange}
                  placeholder="Search Vehicle"
                />
              </Grid>
              <Table className={classes.table} aria-labelledby="tableTitle">
                <EnhancedTableHead
                  numSelected={selected.length}
                  onSelectAllClick={this.handleSelectAllClick}
                  rowCount={this.state.vehicleNumber.length}
                />
                <TableBody>
                  {this.state.vlpnArr
                    .filter(vlpn => vlpn.vlpn.includes(this.state.searchValue))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

                    .map(n => {
                      let isSelected = this.isSelected(n.uniqueDeviceId)

                      isSelected = this.findArrayElementByTitle(
                        selected,
                        n.uniqueDeviceId
                      )
                      // this.state.description.map(d => {
                      // console.log(n, 'pids')
                      return (
                        <TableRow
                          hover
                          onClick={event =>
                            this.handleClick(event, n.uniqueDeviceId)
                          }
                          role="checkbox"
                          aria-checked={isSelected}
                          tabIndex={-1}
                          key={n}
                          selected={isSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={isSelected} />
                          </TableCell>
                          <TableCell component="th" scope="row" padding="none">
                            {n.vlpn}
                          </TableCell>
                          <TableCell align="right">{n.panicType}</TableCell>

                          <TableCell align="right">{n.vehicleModel}</TableCell>
                        </TableRow>
                      )
                      // })
                    })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 'auto' }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={this.state.uniqueDeviceId.length}
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
            </Grid>
          )}
          <Button
            variant="contained"
            color="secondary"
            size="medium"
            margin="normal"
            className="btn"
            type="button"
            onClick={this.handleSubmit(this.props.client)}
            disabled={this.state.clientName === ''}
          >
            Submit
          </Button>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(
  withApollo(withSharedSnackbar(PanicAlertBitConfigurationSettings))
)
