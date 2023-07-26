import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import getLoginId from '../../../utils/getLoginId'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import ListItemText from '@material-ui/core/ListItemText'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import BitSelectionSettings from './BitSelectionSettings.jsx'

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
    }
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
    color: theme.palette.text.secondary
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
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
}

class PanicAlertBitConfigurationSettings extends Component {
  constructor(props) {
    super(props)
  }
  state = {
    spacing: '16',
    name: [],
    fullData: [],
    clientNameInfo: [],
    clientName: [],
    clientLoginId: '',
    clientNameLoginId: [],
    bitPosition: [],
    entityId: [],
    panicSettingsDetails: [],
    bits: [null, null]
  }

  columns = ['VEHICLE NUMBER', 'PANIC BIT', 'TYPE']

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15
  }

  getAllCustomers = async () => {
    const customers = await this.props.client.query({
      query: GET_CLIENTS,
      variables: {
        partnerLoginId: getLoginId()
      }
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

      console.log('ccc=', this.state.clientNameInfo)
    }
  }

  componentDidMount() {
    this.getAllCustomers()
  }
  handleChange = event => {
    // console.log('event.target.value', event.target.value)
    let key = this.state.clientNameInfo.indexOf(event.target.value)
    this.setState({
      clientLoginId: this.state.clientLoginIdInfo[key]
    })
    console.log('logid', this.state.clientLoginId)
  }

  onBitChange = index => bit => {
    console.log(index, bit)
    this.setState(({ bits }) => {
      const originalBits = [...bits]
      originalBits[index] = bit
      console.log(originalBits, bit)
      return {
        bits: originalBits
      }
    })
  }

  getAllVehicleDetails = val => async () => {
    // console.log('client_login id')
    const { data } = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        clientLoginId: this.state.clientLoginId
      }
    })
    // console.log('dRr', data)
    var rowDataLast = []
    data.getAllVehicleDetails.forEach(element => {
      var rowData = []
      rowData.push(element.vehicleNumber)
      rowData.push(
        <div>
          <BitSelectionSettings
            onBitChange={this.onBitChange(0)}
            bitSettings={this.state.bits[0]}
            options={[
              {
                bit: 256,
                entity: element.entityId,
                type: 'panic'
              },
              {
                bit: 2048,
                entity: element.entityId,
                type: 'panic'
              }
            ]}
          />
        </div>
      )
      rowData.push(element.vehicleModel)
      rowDataLast.push(rowData)
    })
    this.setState({ fullData: rowDataLast })
  }

  panicSettingsArr = []

  getBitPosition = (bit, entity, alertType) => value => {
    var panicSettings = {}
    panicSettings.bit = bit
    panicSettings.entity = entity
    panicSettings.alertType = alertType

    if (this.panicSettingsArr.length > 0) {
      if (!this.findArrayElementByTitle(this.panicSettingsArr, entity)) {
        this.panicSettingsArr.push(panicSettings)
      }
    } else {
      this.panicSettingsArr.push(panicSettings)
    }

    this.setState({
      panicSettingsDetails: this.panicSettingsArr
    })
    console.log('panicSettingsDetails= ', this.state.panicSettingsDetails)
  }

  findArrayElementByTitle(array, entity) {
    console.log('element.entity', entity, 'array', array)
    return array.find(element => {
      console.log('element.entity', element.entity)
      if (element.entity === entity) {
        return true
      } else {
        return false
      }
    })
  }

  render() {
    const { classes } = this.props
    const { spacing } = this.state

    return (
      <div className={classes.root}>
        <h3>Sales Report</h3>
        <Grid
          container
          spacing={16}
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid item xs={12}>
            <Grid container justify="center" spacing={Number(spacing)}>
              <Grid item>
                <Select
                  value={this.state.clientName}
                  onChange={this.handleChange}
                  // renderValue={selected => selected.join(', ')}
                  MenuProps={MenuProps}
                  className={classes.selstyle}
                >
                  {this.state.clientNameInfo.map(clientName => (
                    <MenuItem
                      key={
                        /* eslint-disable standard/computed-property-even-spacing */
                        this.state.clientLoginIdInfo[
                          this.state.clientNameInfo.indexOf(clientName)
                        ]
                        /* eslint-enable standard/computed-property-even-spacing */
                      }
                      value={clientName}
                    >
                      <ListItemText primary={clientName} />
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item>
                <Button
                  color="secondary"
                  variant="contained"
                  className={classes.button}
                  onClick={this.getAllVehicleDetails('hai')}
                >
                  View
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <MUIDataTable
              data={this.state.fullData}
              columns={this.columns}
              options={this.options}
            />
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(withApollo(PanicAlertBitConfigurationSettings))
