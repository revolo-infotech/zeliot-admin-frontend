import React, { Component, Fragment } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import { withStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import FormHelperText from '@material-ui/core/FormHelperText'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'

// calling server for updation
const ADD_MODEL = gql`
  mutation addDeviceModel(
    $model_name: String!
    $version: Float!
    $devicetype: String!
    $description: String
    $manufacturerId: Int!
    $maxPrice: Int
  ) {
    addDeviceModel(
      model_name: $model_name
      version: $version
      devicetype: $devicetype
      description: $description
      manufacturerId: $manufacturerId
      maxPrice: $maxPrice
    )
  }
`
const GET_MODELS = gql`
  query {
    models: allDeviceModels(status: 1) {
      id
      model_name
      version
      description
      maxPrice
      devicetype
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

const styles = theme => ({
  button: {
    display: 'block',
    marginTop: theme.spacing.unit * 2
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    top: `20%`,
    left: `20%`
  },
  typography: {
    padding: theme.spacing.unit * 2
  }
})

class AddModel extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      open1: false,
      open2: false,
      devicetype: '',
      modelname: '',
      version: '',
      description: '',
      isModelNameValid: true,
      isDeviceTypeValid: true,
      isVersionValid: true,
      response: '',
      isManufacturerNameValid: true,
      manufacturerName: '',
      open_man: false,
      manufacturerCode: '',
      manufacturerId: '',
      manufacturers: [],
      models: [],
      maxPrice: '',
      ismaxPriceValid: true,
      modelDetails: [],
      modelStatus: false,
      mId: ''
    }
  }
  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }
  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
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
  checkManufacturerNameValidity = () => {
    const code = this.state.manufacturerName.split('*')
    // console.log('man', code[0])
    this.setState({
      isManufacturerNameValid: this.state.manufacturerName !== '',
      manufacturerId: code[0]
    })
  }
  checkModelNameValidity = () => {
    const regex = new RegExp(
      // eslint-disable-next-line
      /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{2,}$/
    )
    // console.log('a', this.state.modelname)
    // console.log(regex.test(this.state.modelname))
    this.setState({
      isModelNameValid:
        regex.test(this.state.modelname) || this.state.modelname === ''
      // this.state.modelname === ''
    })
    // console.log(this.state.isModelNameValid)
  }
  checkmaxPriceValidity = () => {
    const regex = new RegExp(/^[0-9]{4,5}$/)
    // console.log('price', parseInt(this.state.maxPrice, 10))
    this.setState({
      ismaxPriceValid:
        regex.test(this.state.maxPrice) &&
        this.state.maxPrice !== '' &&
        // parseInt(this.state.maxPrice, 10) > 1000 ||
        parseInt(this.state.maxPrice, 10) !== 0
    })
  }
  checkVersionValidity = () => {
    const regex = new RegExp(
      // eslint-disable-next-line
      // 1-3 dot-separated components, each numeric except that the last one may be *
      /^(\d+\.)?(\d+\.)?(\*|\d+)$/
    )
    this.setState({
      isVersionValid:
        regex.test(this.state.version) || this.state.version === ''
    })
  }
  checkDeviceTypeValidity = () => {
    this.setState({
      isDeviceTypeValid: this.state.devicetype !== ''
    })
  }
  // handleSubmit = addModel => e => {
  handleSubmit = client => async event => {
    event.preventDefault()
    const { data } = await client.mutate({
      mutation: ADD_MODEL,
      variables: {
        model_name: this.state.modelname,
        version: parseFloat(this.state.version),
        devicetype: this.state.devicetype,
        description: this.state.description,
        manufacturerId: parseInt(this.state.manufacturerId, 10),
        maxPrice: parseInt(this.state.maxPrice, 10)
      }
    })
    // this.state.simprovider = ''
    this.setState({
      modelname: '',
      version: '',
      devicetype: '',
      description: '',
      manufacturerId: ''
    })
    console.log('ADD=', data)
    this.props.closeAddModelFunction()
    this.props.openSnackbar('Model Updated Successfully')
  }

  componentDidMount() {
    this.getAllManufacturer()
  }
  getAllManufacturer = async () => {
    // console.log('hi')
    const manufacturers = await this.props.client.query({
      query: GET_MANUFACTURER
    })

    if (manufacturers && manufacturers.data) {
      this.setState({ manufacturers: manufacturers.data.manufacturers })
    }
  }
  modelEditForm = mid => {
    alert(mid)
    this.setState({ open2: true })
  }
  getModalStyle() {
    const top = 30
    const left = 20
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`
    }
  }

  closeEditModel = () => {
    this.setState({ modelStatus: false })
  }

  // Table display ends
  render() {
    const { classes } = this.props
    // console.log(this.state.manufacturers)
    return (
      <Query query={GET_MODELS}>
        {({ loading, error, data: { models: modelsList } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error! ${error.message}`

          return (
            <Fragment>
              {/* <Mutation mutation={ADD_MODEL} errorPolicy="all">
                {(addModel, { data, loading, error }) => ( */}
              <div>
                <Dialog
                  open={this.props.openStatus}
                  onClose={this.closeAddModelFunction}
                  aria-labelledby="form-dialog-title"
                >
                  <DialogTitle id="form-dialog-title">
                    Add Model Details :
                  </DialogTitle>

                  <form onSubmit={this.handleSubmit(this.props.client)}>
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
                          {this.state.manufacturers.map(manufacturer => (
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
                        <FormHelperText
                          id="name-error-text"
                          className="Error_msg"
                        >
                          {!this.state.isManufacturerNameValid
                            ? 'Invalid Selection'
                            : ''}
                        </FormHelperText>
                      </FormControl>
                      <FormControl
                        className={classes.formControl}
                        style={{ minWidth: ' 60%' }}
                      >
                        <TextField
                          autoFocus
                          margin="dense"
                          id="modelname"
                          name="modelname"
                          label="Model Name"
                          type="text"
                          required
                          value={this.state.modelname}
                          // fullWidth
                          onChange={this.handleInputChange('modelname')}
                          error={!this.state.isModelNameValid}
                          onBlur={this.checkModelNameValidity}
                        />
                        <FormHelperText
                          id="name-error-text"
                          className="Error_msg"
                        >
                          {!this.state.isModelNameValid
                            ? 'Invalid ModelName'
                            : ''}
                        </FormHelperText>
                      </FormControl>
                      <FormControl
                        className={classes.formControl}
                        style={{ minWidth: ' 60%' }}
                      >
                        <TextField
                          autoFocus
                          margin="dense"
                          id="version"
                          label="Version"
                          type="text"
                          required
                          // fullWidth
                          value={this.state.version}
                          onChange={this.handleInputChange('version')}
                          error={!this.state.isVersionValid}
                          onBlur={this.checkVersionValidity}
                        />
                        <FormHelperText
                          id="name-error-text"
                          className="Error_msg"
                        >
                          {!this.state.isVersionValid ? 'Invalid Version' : ''}
                        </FormHelperText>
                      </FormControl>
                      <FormControl
                        // className={classes.formControl}
                        style={{ minWidth: ' 60%' }}
                      >
                        <InputLabel htmlFor="demo-controlled-open-select">
                          Device Type *
                        </InputLabel>
                        <Select
                          open={this.state.open1}
                          onClose={this.handleCloseSelect}
                          onOpen={this.handleOpenSelect}
                          value={this.state.devicetype}
                          onChange={this.handleChange}
                          onBlur={this.checkDeviceTypeValidity}
                          required
                          inputProps={{
                            name: 'devicetype',
                            id: 'devicetype'
                          }}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          <MenuItem value={'obd'}>OBD</MenuItem>
                          <MenuItem value={'nonobd'}>Non OBD</MenuItem>
                          <MenuItem value={'AS140'}>AS140</MenuItem>
                        </Select>
                        <FormHelperText
                          id="name-error-text"
                          className="Error_msg"
                        >
                          {!this.state.isDeviceTypeValid
                            ? 'Invalid Selection'
                            : ''}
                        </FormHelperText>
                      </FormControl>
                      <FormControl
                        className={classes.formControl}
                        style={{ minWidth: ' 60%' }}
                      >
                        <TextField
                          autoFocus
                          margin="dense"
                          id="description"
                          name="description"
                          label="Description"
                          type="text"
                          value={this.state.description}
                          onChange={this.handleInputChange('description')}
                        />
                      </FormControl>
                      <FormControl
                        className={classes.formControl}
                        style={{ minWidth: ' 60%' }}
                      >
                        <TextField
                          // autoFocus
                          margin="dense"
                          id="maxPrice"
                          label="Max Price"
                          type="text"
                          required
                          // fullWidth
                          value={this.state.maxPrice}
                          onChange={this.handleInputChange('maxPrice')}
                          error={!this.state.ismaxPriceValid}
                          onBlur={this.checkmaxPriceValidity}
                        />
                        <FormHelperText
                          id="name-error-text"
                          className="Error_msg"
                        >
                          {!this.state.ismaxPriceValid
                            ? 'Max price should be between 1000 and 10000'
                            : ''}
                        </FormHelperText>
                      </FormControl>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={this.props.closeAddModelFunction}
                        color="default"
                        variant="contained"
                      >
                        Cancel
                      </Button>
                      <Button
                        // onClick={this.handleClose}
                        color="primary"
                        variant="contained"
                        type="submit"
                        disabled={
                          !(
                            this.state.isVersionValid &&
                            this.state.isDeviceTypeValid &&
                            this.state.modelname !== '' &&
                            this.state.version !== '' &&
                            this.state.maxPrice !== '' &&
                            this.state.ismaxPriceValid &&
                            this.state.isManufacturerNameValid &&
                            this.state.manufacturerName !== ''
                          )
                        }
                      >
                        Submit
                      </Button>
                    </DialogActions>
                  </form>
                </Dialog>
              </div>
              {/* )}
              </Mutation> */}
            </Fragment>
          )
        }}
      </Query>
    )
  }
}
export default withStyles(styles)(withSharedSnackbar(withApollo(AddModel)))
