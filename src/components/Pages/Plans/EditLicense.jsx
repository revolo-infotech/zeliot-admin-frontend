import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import FormControl from '@material-ui/core/FormControl'
import gql from 'graphql-tag'
import { Mutation, withApollo } from 'react-apollo'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'

const UPDATE_LICENSE_TYPE = gql`
  mutation updateLicenseType(
    $id: Int!
    $licenseType: String!
    $description: String!
    $featureList: String!
    $maxPrice: Int!
    $status: Int!
  ) {
    updateLicenseType(
      id: $id
      licenseType: $licenseType
      description: $description
      featureList: $featureList
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

class EditLicense extends React.Component {
  constructor(props) {
    super(props)
    this.licenseInformation = this.props.licenseInfo.getLicenseType
    this.state = {
      licenseType: this.licenseInformation.licenseType,
      description: this.licenseInformation.description,
      maxPrice: this.licenseInformation.maxPrice,
      licenseId: this.props.selectedId,
      open1: false,
      isLicenseNameValid: true,
      featureList: this.licenseInformation.featureList,
      returnFeatureList: ''
    }
  }

  checkedlist = []

  mapToArr(feature) {
    // let checkedlist = []
    feature.forEach(element => {
      // console.log('s=function', element)
      const temp = {}
      temp['featureId'] = element.id
      this.checkedlist.push(temp)
    })
  }

  componentDidMount() {
    this.mapToArr(this.state.featureList)
  }

  handleSubmit = EditModel => e => {
    e.preventDefault()
    EditModel({
      variables: {
        id: parseInt(this.state.licenseId, 10),
        licenseType: this.state.licenseType,
        description: this.state.description,
        featureList: JSON.stringify(this.checkedlist),
        maxPrice: parseInt(this.state.maxPrice, 10),
        status: 1
      }
    })
    this.setState({
      id: '',
      licenseType: '',
      description: '',
      featureList: '',
      maxPrice: ''
    })
    this.props.closeEditModelFunction()
    this.props.openSnackbar('License Updated Successfully')
  }

  checkModelNameValidity = () => {
    const regex = new RegExp(
      // eslint-disable-next-line
      /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{2,}$/
    )
    this.setState({
      isModelNameValid:
        regex.test(this.state.modelname) || this.state.modelname === ''
    })
  }

  checkmaxPriceValidity = () => {
    const regex = new RegExp(/^[0-9]{2,4}$/)
    this.setState({
      ismaxPriceValid:
        regex.test(this.state.maxPrice) || this.state.maxPrice === ''
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

  checkDeviceTypeValidity = () =>
    this.setState({
      isDeviceTypeValid: this.state.devicetype !== ''
    })

  handleInputChange = key => e => this.setState({ [key]: e.target.value })

  handleOpenSelect = () => this.setState({ open1: true })

  handleCloseSelect = () => this.setState({ open1: false })

  handleChange = event =>
    this.setState({ [event.target.name]: event.target.value })

  render() {
    const { classes } = this.props

    return (
      <div>
        <Button>Edit</Button>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.props.openStatus}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Mutation mutation={UPDATE_LICENSE_TYPE} errorPolicy="all">
              {(EditLicense, { data, loading, error }) => (
                <form onSubmit={this.handleSubmit(EditLicense)}>
                  <DialogContent>
                    <DialogContentText>
                      * Marked fields are mandatory
                    </DialogContentText>
                    <FormControl
                      className={classes.formControl}
                      style={{ minWidth: '100%' }}
                    >
                      <TextField
                        autoFocus
                        margin="dense"
                        id="licenseType"
                        name="licenseType"
                        label="License Name"
                        type="text"
                        required
                        value={this.state.licenseType}
                        fullWidth
                        onChange={this.handleInputChange('licenseType')}
                      />
                    </FormControl>
                    <FormControl
                      className={classes.formControl}
                      style={{ minWidth: '100%' }}
                    >
                      <TextField
                        autoFocus
                        margin="dense"
                        id="description"
                        label="Description"
                        type="text"
                        required
                        value={this.state.description}
                        onChange={this.handleInputChange('description')}
                      />
                    </FormControl>
                    <FormControl
                      className={classes.formControl}
                      style={{ minWidth: '100%' }}
                    >
                      <TextField
                        autoFocus
                        margin="dense"
                        id="maxPrice"
                        label="Max Price"
                        type="text"
                        required
                        value={this.state.maxPrice}
                        onChange={this.handleInputChange('maxPrice')}
                        error={!this.state.maxPrice}
                        onBlur={this.checkmaxPriceValidity}
                      />
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
                    <Button color="primary" variant="contained" type="submit">
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

EditLicense.propTypes = {
  classes: PropTypes.object.isRequired
}

// We need an intermediary variable for handling the recursive nesting.
export default withStyles(styles)(withSharedSnackbar(withApollo(EditLicense)))
