import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import { withStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import Divider from '@material-ui/core/Divider'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { Typography } from '@material-ui/core'
import getLoginId from '../../../../utils/getLoginId'

const GET_ACCESSORY = gql`
  query {
    accessory: getAllAccessoryTypes(status: 1) {
      id
      accessoryName
      version
    }
  }
`
const GET_MANUFACTURER = gql`
  query {
    manufacturers: getAllManufacturer(status: 1) {
      id
      manufacturerName
      manufacturerCode
    }
  }
`
// calling server for updation
const ADD_ACCESSORY = gql`
  mutation addAccessoryDetailsFromPartnerAdmin(
    $serial_num: Int!
    $device_model_id: Int!
    $uniqueSerialNumber: String!
    $manufacturerId: Int!
    $ownerLoginId: Int!
  ) {
    addAccessoryDetailsFromPartnerAdmin(
      serialNumber: $serial_num
      accessoryTypeId: $device_model_id
      uniqueAccessoryId: $uniqueSerialNumber
      manufacturerId: $manufacturerId
      ownerLoginId: $ownerLoginId
    )
  }
`

const styles = theme => ({
  button: {
    display: 'block',
    marginTop: theme.spacing.unit * 2
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  }
})

class RegisterAccessory extends Component {
  state = {
    open1: false,
    modelname: '',
    serialno: '',
    imeino: '',
    uniqueSerialNumber: '',
    isModelNameValid: true,
    isSerialnoValid: true,
    isImeinoValid: true,
    isManufacturerNameValid: true,
    manufacturerName: '',
    open_man: false,
    manufacturerCode: '',
    manufacturerId: ''
  }
  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleOpen = () => {
    this.setState({ open: true })
  }

  handleOpenSelect = () => {
    this.setState({ open1: true })
  }
  handleCloseSelect = () => {
    this.setState({ open1: false })
  }
  handleOpenSelectMan = () => {
    this.setState({ open_man: true })
  }
  handleCloseSelectMan = () => {
    this.setState({ open_man: false })
  }
  checkImeinoValidity = () => {
    const regex = new RegExp(
      // eslint-disable-next-line
      /^[0-9]{15}$/
    )
    this.setState({
      isImeinoValid: regex.test(this.state.imeino) || this.state.imeino === ''
    })
  }
  checkSerialnoValidity = () => {
    const regex = new RegExp(/^[0-9]{9}$/)
    var code = this.state.manufacturerName.split('*')
    this.setState({
      isSerialnoValid:
        regex.test(this.state.serialno) || this.state.serialno === '',
      uniqueSerialNumber: code[1] + '_' + this.state.serialno
    })
  }
  checkModelNameValidity = () => {
    this.setState({
      isModelNameValid: this.state.modelname !== ''
    })
  }
  checkManufacturerNameValidity = () => {
    const code = this.state.manufacturerName.split('*')
    this.setState({
      isManufacturerNameValid: this.state.manufacturerName !== '',
      // manufacturerCode:this
      uniqueSerialNumber: code[1] + '_' + this.state.serialno,
      manufacturerId: code[0]
    })
  }
  handleSubmit = addDevice => e => {
    e.preventDefault()
    addDevice({
      variables: {
        serial_num: parseInt(this.state.serialno, 10),
        device_model_id: parseInt(this.state.modelname, 10),
        uniqueSerialNumber: this.state.uniqueSerialNumber,
        manufacturerId: parseInt(this.state.manufacturerId, 10),
        ownerLoginId: getLoginId()
      }
    })
    // this.state.simprovider = ''
    this.setState({
      serial_num: '',
      imei_num: '',
      device_model_id: '',
      uniqueSerialNumber: '',
      manufacturerId: ''
    })
  }
  render() {
    const { classes } = this.props
    return (
      <Query query={GET_ACCESSORY}>
        {({ loading: isModelsLoading, error, data: { accessory } }) => (
          <Query query={GET_MANUFACTURER}>
            {({
              loading: isManufacturersLoading,
              error,
              data: { manufacturers }
            }) => {
              if (isModelsLoading || isManufacturersLoading) return null
              if (error) return `Error!: ${error}`
              return (
                <Mutation mutation={ADD_ACCESSORY}>
                  {(addDevice, { data, error }) => (
                    <div>
                      <DialogTitle id="form-dialog-title">
                        Add Accessory Details :
                      </DialogTitle>
                      <Typography
                        variant="subheading"
                        gutterBottom
                        style={{ color: 'red', marginLeft: '25px' }}
                      >
                        {error &&
                          error.graphQLErrors.map(({ message }, i) => (
                            <span key={i}>{message}</span>
                          ))}
                      </Typography>
                      <Typography
                        variant="subheading"
                        gutterBottom
                        style={{ color: 'green', marginLeft: '25px' }}
                      >
                        {data && <p>Sucessfully Added</p>}
                      </Typography>
                      <Divider light />
                      <form onSubmit={this.handleSubmit(addDevice)}>
                        <DialogContent>
                          <DialogContentText>
                            * Marked fields are mandatory
                          </DialogContentText>
                          <FormControl
                            className={classes.formControl}
                            style={{ minWidth: '60%' }}
                          >
                            <InputLabel htmlFor="demo-controlled-open-select">
                              Select Manufacturer
                            </InputLabel>
                            <Select
                              open={this.state.open_man}
                              fullWidth
                              onClose={this.handleCloseSelectMan}
                              onOpen={this.handleOpenSelectMan}
                              value={this.state.manufacturerName}
                              onChange={this.handleChange}
                              onBlur={this.checkManufacturerNameValidity}
                              inputProps={{
                                name: 'manufacturerName',
                                id: 'manufacturerName'
                              }}
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              {manufacturers.map(manufacturer => (
                                <MenuItem
                                  value={
                                    manufacturer.id +
                                    '*' +
                                    manufacturer.manufacturerCode
                                  }
                                  key={manufacturer.id}
                                >
                                  {manufacturer.manufacturerName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl
                            className={classes.formControl}
                            style={{ minWidth: '60%' }}
                          >
                            <InputLabel htmlFor="demo-controlled-open-select">
                              Select Accessory Type
                            </InputLabel>
                            <Select
                              open={this.state.open1}
                              fullWidth
                              onClose={this.handleCloseSelect}
                              onOpen={this.handleOpenSelect}
                              value={this.state.modelname}
                              onChange={this.handleChange}
                              onBlur={this.checkModelNameValidity}
                              inputProps={{
                                name: 'modelname',
                                id: 'modelname'
                              }}
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              {accessory.map(allDeviceModelsByStatus => (
                                <MenuItem
                                  value={allDeviceModelsByStatus.id}
                                  key={allDeviceModelsByStatus.id}
                                >
                                  {allDeviceModelsByStatus.accessoryName +
                                    ' ' +
                                    allDeviceModelsByStatus.version}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl
                            className={classes.formControl}
                            style={{ minWidth: ' 60%' }}
                          >
                            <TextField
                              autoFocus
                              margin="dense"
                              id="serialno"
                              name="serialno"
                              label="Serial No"
                              type="text"
                              required
                              value={this.state.serialno}
                              fullWidth
                              onChange={this.handleInputChange('serialno')}
                              error={!this.state.isSerialnoValid}
                              onBlur={this.checkSerialnoValidity}
                            />
                          </FormControl>

                          <FormControl
                            className={classes.formControl}
                            style={{ minWidth: ' 60%' }}
                          >
                            <TextField
                              autoFocus
                              margin="dense"
                              id="uniqueSerialNumber"
                              name="uniqueSerialNumber"
                              label="Unique Accessory Id"
                              type="text"
                              disabled
                              required
                              fullWidth
                              value={this.state.uniqueSerialNumber}
                              onChange={this.handleInputChange(
                                'uniqueSerialNumber'
                              )}
                            />
                          </FormControl>
                        </DialogContent>
                        <DialogActions>
                          <Button
                            onClick={this.props.handleClose}
                            color="default"
                            variant="contained"
                          >
                            Cancel
                          </Button>
                          <Button
                            // onClick={this.handleClose}
                            type="submit"
                            color="primary"
                            variant="contained"
                            disabled={
                              !(
                                this.state.isModelNameValid &&
                                this.state.isSerialnoValid &&
                                this.state.isImeinoValid &&
                                this.state.serialno !== ''
                              )
                            }
                          >
                            Submit
                          </Button>
                        </DialogActions>
                      </form>
                    </div>
                  )}
                </Mutation>
              )
            }}
          </Query>
        )}
      </Query>
    )
  }
}
export default withStyles(styles)(RegisterAccessory)
