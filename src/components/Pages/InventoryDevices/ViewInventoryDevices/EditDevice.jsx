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
import { Query, Mutation, withApollo } from 'react-apollo'
import { Typography } from '@material-ui/core'
import getLoginId from '../../../../utils/getLoginId'
import FormHelperText from '@material-ui/core/FormHelperText'
import withSharedSnackbar from '../../../HOCs/withSharedSnackbar'
import DeleteForever from '@material-ui/icons/DeleteForever'
import Tooltip from '@material-ui/core/Tooltip'
import Grid from '@material-ui/core/Grid'

const GET_MODELS = gql`
  query {
    models: allDeviceModels(status: 1) {
      id
      model_name
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

const GET_MODEL_TYPE = gql`
  query deviceModel($modelId: Int) {
    deviceModel(id: $modelId) {
      devicetype
    }
  }
`
const GET_DEVICE_DETAIL = gql`
  query deviceDetail($uniqueDeviceId: String) {
    deviceDetail(uniqueDeviceId: $uniqueDeviceId) {
      serial_num
      imei_num
      uniqueDeviceId
      deviceModelId {
        id
        model_name
        version
      }
      manufacturer {
        id
        manufacturerName
        manufacturerCode
      }
    }
  }
`

// calling server for updation
const UPDATE_DEVICE = gql`
  mutation updateDeviceDetail(
    $serial_num: String!
    $imei_num: String!
    $device_model_id: Int!
    $uniqueSerialNumber: String!
    $manufacturerId: Int!
    $ownerLoginId: Int!
    $oldUniqueDeviceId: String!
    $status: Int!
  ) {
    updateDeviceDetail(
      serial_num: $serial_num
      imei_num: $imei_num
      deviceModelId: $device_model_id
      uniqueDeviceId: $uniqueSerialNumber
      manufacturerId: $manufacturerId
      ownerLoginId: $ownerLoginId
      oldUniqueDeviceId: $oldUniqueDeviceId
      status: $status
    )
  }
`
const DELETE_DEVICE = gql`
  mutation deleteDeviceInStock($uniqueDeviceid: String!) {
    deleteDeviceInStock(deviceUniqueId: $uniqueDeviceid)
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

class EditDevice extends Component {
  constructor(props) {
    super(props)
    this.classes = props
    this.existingUniqueId = this.props.selUniqueDecviceId
  }
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
    manufacturerId: '',
    errorMessage: '',
    models: []
  }
  handleInputChange = key => e => {
    if (this.state.manufacturerName === '' || this.state.modelname === '') {
      this.props.openSnackbar(
        'Please select Manufacturer and Model before entering serial or IMEI no'
      )
      this.setState({
        errorMessage:
          'Please select Manufacturer and Model before entering serial or IMEI no'
      })
    } else {
      this.setState({ [key]: e.target.value })
    }
  }

  handleChange = async event => {
    this.setState({ [event.target.name]: event.target.value })
    console.log('mfna', event.target.value)
    const { data: models } = await this.props.client.query({
      query: GET_MODELS,
      variables: { manufacturerId: event.target.value }
    })

    this.setState({ models: models.models })
  }
  handleModelChange = async event => {
    console.log('mname', event.target.value)
    this.setState({ [event.target.name]: event.target.value })
    const { data } = await this.props.client.query({
      query: GET_MODEL_TYPE,
      variables: { modelId: event.target.value },
      fetchPolicy: 'network-only'
    })
    // console.log(data, 'modelType')
    this.setState({ deviceType: data.deviceModel.devicetype })
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
    // const regex = new RegExp(/^[0-9]{15}$/)
    const regex = new RegExp(/^[a-zA-Z0-9]{4,20}$/)
    this.setState({
      errorMessage: ''
    })
    var code = []
    code = this.state.manufacturerName.split('*')
    if (code[0] === '') {
      this.setState({
        isImeinoValid: this.state.imeino !== '' && regex.test(this.state.imeino)
      })
    } else {
      this.setState({
        isImeinoValid: this.state.imeino !== '' && regex.test(this.state.imeino)
      })
      if (this.state.deviceType === 'AS140') {
        this.setState({
          uniqueSerialNumber: code[1] + '_' + this.state.imeino
        })
      }
    }
  }
  checkSerialnoValidity = () => {
    this.setState({
      errorMessage: ''
    })
    // const regex = new RegExp(/^[0-9]{5,15}$/)
    const regex = new RegExp(/^[a-zA-Z0-9]{4,20}$/)
    var code = []
    code = this.state.manufacturerName.split('*')

    if (code[0] === '') {
      this.setState({
        isSerialnoValid:
          this.state.serialno !== '' && regex.test(this.state.serialno)
      })
    } else {
      this.setState({
        isSerialnoValid:
          this.state.serialno !== '' && regex.test(this.state.serialno)
        // uniqueSerialNumber: code[1] + '_' + this.state.serialno
      })
      if (this.state.deviceType !== 'AS140') {
        // var code = this.state.manufacturerName.split('*')
        this.setState({
          uniqueSerialNumber: code[1] + '_' + this.state.serialno
        })
      }
    }
  }
  checkModelNameValidity = () => {
    this.setState({
      isModelNameValid: this.state.modelname !== ''
    })
  }
  checkManufacturerNameValidity = () => {
    let code = []
    code = this.state.manufacturerName.split('*')

    if (code[0] === '') {
      this.setState({
        isManufacturerNameValid: this.state.manufacturerName !== '',
        // manufacturerCode:this
        uniqueSerialNumber: code[1] + '_' + this.state.serialno,
        manufacturerId: code[0]
      })
    } else {
      this.setState({
        isManufacturerNameValid: this.state.manufacturerName !== '',
        // manufacturerCode:this
        uniqueSerialNumber: '',
        manufacturerId: code[0]
      })
    }
  }
  handleSubmit = updateDevice => e => {
    e.preventDefault()
    updateDevice({
      variables: {
        serial_num: this.state.serialno,
        imei_num: this.state.imeino,
        device_model_id: parseInt(this.state.modelname, 10),
        uniqueSerialNumber: this.state.uniqueSerialNumber,
        manufacturerId: parseInt(this.state.manufacturerId, 10),
        status: 2,
        ownerLoginId: getLoginId(),
        oldUniqueDeviceId: this.existingUniqueId
      },
      refetchQueries: [`getPartnerDeviceStockByDeviceModel`]
    })
    // console.log(this.data, 'addDevice')
    // this.state.simprovider = ''
    this.setState({
      serialno: '',
      imeino: '',
      // device_model_id: '',
      uniqueSerialNumber: '',
      manufacturerId: ''
    })
  }
  deleteDevice = async event => {
    event.preventDefault()
    const { data } = await this.props.client.mutate({
      mutation: DELETE_DEVICE,
      variables: {
        uniqueDeviceid: this.existingUniqueId
      },
      refetchQueries: ['getAllDeviceDetailsByLoginId'],
      errorPolicy: 'all'
    })
    // console.log('submit', data.deleteDeviceInStock)

    if (data.deleteDeviceInStock === true) {
      this.props.handleClose()
      this.props.openSnackbar('Device Deleted Successfully')
    } else {
      this.props.openSnackbar('Error in deleting device')
    }
  }
  getDeviceDetails = async () => {
    // console.log(this.existingUniqueId, 'dd')
    const { data } = await this.props.client.query({
      query: GET_DEVICE_DETAIL,
      variables: {
        uniqueDeviceId: this.existingUniqueId
      },
      fetchPolicy: 'network-only'
    })
    const { data: models } = await this.props.client.query({
      query: GET_MODELS,
      variables: { manufacturerId: data.deviceDetail.manufacturer.id }
    })

    this.setState({ models: models.models })

    this.setDetails(data.deviceDetail)
  }
  setDetails = DeviceDetail => {
    // console.log('details', clientDetail.state.zone_id)
    let mafName =
      DeviceDetail.manufacturer.id +
      '*' +
      DeviceDetail.manufacturer.manufacturerCode

    this.setState({
      modelname: DeviceDetail.deviceModelId.id,
      serialno: DeviceDetail.serial_num,
      imeino: DeviceDetail.imei_num,
      uniqueSerialNumber: DeviceDetail.uniqueDeviceId,
      manufacturerName: mafName,
      manufacturerId: DeviceDetail.manufacturer.id
      // manufacturerId: DeviceDetail.manufacturer.id
    })
    console.log('this.state', this.state.modelname, this.state.manufacturerName)
  }
  componentDidMount() {
    this.getDeviceDetails()
  }

  render() {
    const { classes } = this.props

    return (
      // <Query query={GET_MODELS} fetchPolicy="network-only">
      //   {({ loading: isModelsLoading, error, data: { models } }) => (
      <Query query={GET_MANUFACTURER} fetchPolicy="network-only">
        {({
          loading: isManufacturersLoading,
          error,
          data: { manufacturers }
        }) => {
          if (isManufacturersLoading) return null
          if (error) return `Error!: ${error}`
          return (
            <Mutation mutation={UPDATE_DEVICE}>
              {(updateDevice, { data, error }) => (
                <div>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      className={classes.button}
                      style={{ float: 'right' }}
                      onClick={this.deleteDevice}
                    >
                      <Tooltip title="Delete Vehicle">
                        <DeleteForever className={classes.icon} />
                      </Tooltip>
                    </Button>{' '}
                  </Grid>
                  <DialogTitle id="form-dialog-title">
                    Add Device Details :
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
                    {this.state.errorMessage && (
                      <p>{this.state.errorMessage}</p>
                    )}
                  </Typography>
                  <Typography
                    variant="subheading"
                    gutterBottom
                    style={{ color: 'green', marginLeft: '25px' }}
                  >
                    {data && <p>Sucessfully Updated</p>}
                  </Typography>
                  <Divider light />
                  <form onSubmit={this.handleSubmit(updateDevice)}>
                    <DialogContent>
                      <DialogContentText>
                        * Marked fields are mandatory
                      </DialogContentText>
                      <FormControl
                        className={classes.formControl}
                        style={{ minWidth: '60%' }}
                      >
                        <InputLabel htmlFor="demo-controlled-open-select">
                          Select Manufacturer *
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
                          Select Model *
                        </InputLabel>
                        <Select
                          open={this.state.open1}
                          fullWidth
                          onClose={this.handleCloseSelect}
                          onOpen={this.handleOpenSelect}
                          value={this.state.modelname}
                          onChange={this.handleModelChange}
                          onBlur={this.checkModelNameValidity}
                          inputProps={{
                            name: 'modelname',
                            id: 'modelname'
                          }}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {this.state.models.map(allDeviceModelsByStatus => (
                            <MenuItem
                              value={allDeviceModelsByStatus.id}
                              key={allDeviceModelsByStatus.id}
                            >
                              {allDeviceModelsByStatus.model_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl
                        className={classes.formControl}
                        style={{ minWidth: ' 60%' }}
                      >
                        <TextField
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
                        <FormHelperText
                          id="name-error-text"
                          className="Error_msg"
                        >
                          {this.state.isSerialnoValid
                            ? ''
                            : 'Serial Number should be between 4-20 characters'}
                        </FormHelperText>
                      </FormControl>
                      <FormControl
                        className={classes.formControl}
                        style={{ minWidth: ' 60%' }}
                      >
                        <TextField
                          margin="dense"
                          id="imeino"
                          name="imeino"
                          label="IMEI No"
                          type="text"
                          required
                          fullWidth
                          value={this.state.imeino}
                          onChange={this.handleInputChange('imeino')}
                          error={!this.state.isImeinoValid}
                          onBlur={this.checkImeinoValidity}
                        />
                        <FormHelperText
                          id="name-error-text"
                          className="Error_msg"
                        >
                          {this.state.isImeinoValid
                            ? ''
                            : 'IMEI Number should be between 4-20 characters'}
                        </FormHelperText>
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
                          label="Unique Id"
                          type="text"
                          disabled
                          required
                          fullWidth
                          value={this.state.uniqueSerialNumber}
                          onChange={this.handleInputChange(
                            'uniqueSerialNumber'
                          )}
                          // error={!this.state.isImeinoValid}
                          // onBlur={this.checkImeinoValidity}
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
                            this.state.serialno !== '' &&
                            this.state.imeino !== '' &&
                            this.state.manufacturerName !== '' &&
                            this.state.uniqueSerialNumber !== '' &&
                            this.state.modelname !== ''
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
      //   )}
      // </Query>
    )
  }
}

export default withStyles(styles)(withApollo(withSharedSnackbar(EditDevice)))
