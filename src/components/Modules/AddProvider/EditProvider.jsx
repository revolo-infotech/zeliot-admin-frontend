import React from 'react'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import FormControl from '@material-ui/core/FormControl'
import { Mutation, withApollo } from 'react-apollo'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'

const UPDATE_PROVIDER = gql`
  mutation updateServiceProvider($providerName: String!) {
    updateServiceProvider(providerName: $providerName)
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

class EditProvider extends React.Component {
  constructor(props) {
    super(props)
    this.providerInformation = this.props.providerInfo
    console.log('this.props.selectedId= ', this.props.providerInfo)
    this.state = {
      providerName: this.providerInformation.name,
      providerId: this.props.selectedId,
      open1: false,
      isProviderValid: true
    }
  }
  handleSubmit = EditModel => e => {
    // console.log('this.modelId=', this.state.modelId, this.state.modelname, this.state.version, this.state.devicetype, this.state.description, this.state.maxPrice)
    e.preventDefault()
    EditModel({
      variables: {
        id: parseInt(this.state.providerId, 10),
        providerName: this.state.providerName
      }
    })
    this.setState({
      providerName: '',
      providerId: ''
    })
    this.props.closeEditProviderFunction()
    this.props.openSnackbar('Provider Updated Successfully')
  }
  checkProviderValidity = () => {
    const regex = new RegExp(
      // eslint-disable-next-line
      /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{2,}$/
    )
    console.log('a', this.state.provider)
    console.log(regex.test(this.state.provider))
    this.setState({
      isProviderValid:
        regex.test(this.state.provider) || this.state.provider === ''
      // this.state.modelname === ''
    })
    console.log(this.state.isProviderValid)
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
            <Mutation mutation={UPDATE_PROVIDER} errorPolicy="all">
              {(EditProvider, { data, loading, error }) => (
                <form onSubmit={this.handleSubmit(EditProvider)}>
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
                        id="provider"
                        name="provider"
                        label="SIM Provider"
                        type="text"
                        required
                        value={this.state.providerName}
                        fullWidth
                        onChange={this.handleInputChange('providerName')}
                        error={!this.state.isProviderValid}
                        onBlur={this.checkProviderValidity}
                      />
                    </FormControl>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={this.props.closeEditProviderFunction}
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
                      // disabled={
                      //   !(
                      //     this.state.isVersionValid &&
                      //     this.state.isDeviceTypeValid &&
                      //     this.state.modelname !== '' &&
                      //     this.state.version !== '' &&
                      //     this.state.maxPrice !== '' &&
                      //     this.state.ismaxPriceValid
                      //   )
                      // }
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

EditProvider.propTypes = {
  classes: PropTypes.object.isRequired
}

// We need an intermediary variable for handling the recursive nesting.
export default withStyles(styles)(withSharedSnackbar(withApollo(EditProvider)))
