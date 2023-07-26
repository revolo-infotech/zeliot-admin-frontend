import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import gql from 'graphql-tag'
import { Mutation, withApollo } from 'react-apollo'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import FormHelperText from '@material-ui/core/FormHelperText'

const UPDATE_MODEL = gql`
  mutation updateDeviceModel(
    $id: Int!
    $model_name: String!
    $version: Float!
    $devicetype: String!
    $description: String
    $maxPrice: Int!
    $status: Int!
  ) {
    updateDeviceModel(
      id: $id
      model_name: $model_name
      version: $version
      devicetype: $devicetype
      description: $description
      maxPrice: $maxPrice
      status: $status
    )
  }
`
function getModalStyle() {
  const top = 50
  const left = 50
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`
  }
}

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4
  }
})

class EditModel extends React.Component {
  constructor(props) {
    super(props)
    this.modelInformation = this.props.modelInfo
    console.log('this.props.selectedId= ', this.props.selectedId)
    this.state = {
      devicetype: this.modelInformation.devicetype,
      modelname: this.modelInformation.model_name,
      version: this.modelInformation.version,
      description: this.modelInformation.description,
      modelId: this.props.selectedId,
      maxPrice: this.modelInformation.maxPrice,
      status: this.modelInformation.status,
      open1: false,
      isModelNameValid: true,
      isDeviceTypeValid: true,
      isVersionValid: true,
      ismaxPriceValid: true
    }
  }
  handleSubmit = EditModel => e => {
    // console.log('this.modelId=', this.state.modelId, this.state.modelname, this.state.version, this.state.devicetype, this.state.description, this.state.maxPrice)
    e.preventDefault()
    EditModel({
      variables: {
        id: this.state.modelId,
        model_name: this.state.modelname,
        version: this.state.version,
        devicetype: this.state.devicetype,
        description: this.state.description,
        maxPrice: parseInt(this.state.maxPrice, 10),
        status: parseInt(this.state.status, 10)
      }
    })
    this.setState({
      modelname: '',
      version: '',
      devicetype: '',
      description: '',
      manufacturerId: '',
      maxPrice: '',
      status: '',
      modelId: ''
    })
    this.props.closeEditModelFunction()
    this.props.openSnackbar('Model Updated Successfully')
  }
  checkModelNameValidity = () => {
    const regex = new RegExp(
      // eslint-disable-next-line
      /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{2,}$/
    )
    this.setState({
      isModelNameValid:
        regex.test(this.state.modelname) || this.state.modelname !== ''
    })
  }
  checkmaxPriceValidity = () => {
    const regex = new RegExp(/^[0-9]{4,5}$/)

    this.setState({
      ismaxPriceValid:
        regex.test(this.state.maxPrice) &&
        this.state.maxPrice !== '' &&
        // parseInt(this.state.maxPrice, 10) > 1000 ||
        parseInt(this.state.maxPrice, 10) !== 0
    })
    // console.log('pp', this.state.ismaxPriceValid)
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
  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }
  handleOpenSelect = () => {
    this.setState({ open1: true })
  }
  handleCloseSelect = () => {
    this.setState({ open1: false })
  }
  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }
  render() {
    const { classes } = this.props
    return (
      <div>
        <Button>Edit</Button>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.props.openStatus}
          // onClose={this.handleClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Mutation mutation={UPDATE_MODEL} errorPolicy="all">
              {(EditModel, { data, loading, error }) => (
                <form onSubmit={this.handleSubmit(EditModel)}>
                  <DialogContent>
                    <DialogContentText>
                      * Marked fields are mandatory
                    </DialogContentText>
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
                        fullWidth
                        onChange={this.handleInputChange('modelname')}
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
                        inputProps={{
                          name: 'devicetype',
                          id: 'devicetype'
                        }}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value={'nonobd'}>Non OBD</MenuItem>
                        <MenuItem value={'obd'}>OBD</MenuItem>
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
                        autoFocus
                        margin="dense"
                        id="maxPrice"
                        label="Max Price"
                        type="text"
                        required
                        // fullWidth
                        value={this.state.maxPrice}
                        onChange={this.handleInputChange('maxPrice')}
                        error={!this.state.maxPrice}
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
                      onClick={this.props.closeEditModelFunction}
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
                          this.state.ismaxPriceValid
                        )
                      }
                    >
                      Submit
                    </Button>
                  </DialogActions>
                </form>
              )}
            </Mutation>
          </div>
        </Modal>
      </div>
    )
  }
}

EditModel.propTypes = {
  classes: PropTypes.object.isRequired
}

// We need an intermediary variable for handling the recursive nesting.
export default withStyles(styles)(withSharedSnackbar(withApollo(EditModel)))
