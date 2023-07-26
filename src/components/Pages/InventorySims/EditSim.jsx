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
import getLoginId from '../../../utils/getLoginId'
import FormHelperText from '@material-ui/core/FormHelperText'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import DeleteForever from '@material-ui/icons/DeleteForever'
import Tooltip from '@material-ui/core/Tooltip'
import Grid from '@material-ui/core/Grid'

const GET_PROVIDER = gql`
  query {
    allServiceProviders(status: 1) {
      id
      name
    }
  }
`

const GET_SIM_DETAIL = gql`
  query simDetail($simId: Int) {
    simDetail(id: $simId) {
      phoneNumber
      simNumber
      monthlyCharges
      serviceProvider {
        id
        name
      }
    }
  }
`

// calling server for updation
const UPDATE_SIM = gql`
  mutation updateSimDetail(
    $id: Int!
    $phoneNumber: String!
    $simNumber: String!
    $ownerLoginId: Int!
    $monthlyCharges: Int!
    $status: Int!
    $service_provider_id: Int!
  ) {
    updateSimDetail(
      id: $id
      phoneNumber: $phoneNumber
      simNumber: $simNumber
      ownerLoginId: $ownerLoginId
      monthlyCharges: $monthlyCharges
      status: $status
      service_provider_id: $service_provider_id
    )
  }
`
const DELETE_SIM = gql`
  mutation deleteSim(
    $phoneNumber: String!
    $simNumber: String!
    $ownerLoginId: Int!
  ) {
    deleteSim(
      phoneNumber: $phoneNumber
      simNumber: $simNumber
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

class EditSim extends Component {
  constructor(props) {
    super(props)
    this.classes = props
    this.existingSimId = this.props.selSimId
  }
  state = {
    open1: false,
    simprovider: '',
    phoneno: '',
    simno: '',
    simPrice: '',
    isSimProviderValid: true,
    isphonenoValid: true,
    isSimnoValid: true,
    isSimPriceValid: true
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

  checkSimnoValidity = () => {
    const regex = new RegExp(
      // eslint-disable-next-line
      /^[0-9]{10,25}$/
    )
    // console.log('a', this.state.imeino)
    console.log(regex.test(this.state.simno))
    this.setState({
      isSimnoValid: regex.test(this.state.simno) || this.state.simno === ''
      // this.state.modelname === ''
    })
    // console.log(this.state.isModelNameValid)
  }

  checkPhonenoValidity = () => {
    const regex = new RegExp(/^[0-9]{9,14}$/)
    this.setState({
      isPhonenoValid:
        regex.test(this.state.phoneno) || this.state.phoneno === ''
    })
  }

  checkSimPriceValidity = () => {
    const regex = new RegExp(/^[0-9]+$/)
    this.setState({
      isSimPriceValid:
        regex.test(this.state.simPrice) || this.state.simPrice === ''
    })
    if (
      parseInt(this.state.simPrice, 10) < 1 ||
      parseInt(this.state.simPrice, 10) > 500
    ) {
      this.setState({ isSimPriceValid: false })
    }
  }

  checkSimProviderValidity = () => {
    this.setState({
      isSimProviderValid: this.state.simprovider !== ''
    })
  }
  handleSubmit = updateDevice => e => {
    e.preventDefault()
    updateDevice({
      variables: {
        phoneNumber: this.state.phoneno,
        simNumber: this.state.simno,
        monthlyCharges: parseInt(this.state.simPrice, 10),
        service_provider_id: this.state.simprovider,
        status: 2,
        id: parseInt(this.props.selSimId, 10),
        ownerLoginId: getLoginId()
      },
      refetchQueries: [`getPartnerSimStockByServiceProvider`]
    })
    // console.log(this.data, 'addDevice')
    // this.state.simprovider = ''
    this.setState({
      phoneno: '',
      simno: '',
      // device_model_id: '',
      simPrice: '',
      simprovider: ''
    })
  }
  deleteSim = async event => {
    event.preventDefault()
    const { data } = await this.props.client.mutate({
      mutation: DELETE_SIM,
      variables: {
        phoneNumber: this.state.phoneno,
        simNumber: this.state.simno,
        ownerLoginId: getLoginId()
      },
      refetchQueries: ['getPartnerSimStockByServiceProvider', 'allSimDetails'],
      errorPolicy: 'all'
    })
    // console.log('submit', data.deleteDeviceInStock)

    if (data.deleteSim === true) {
      this.props.handleClose()
      this.props.openSnackbar('Sim Deleted Successfully')
    } else {
      this.props.openSnackbar('Error in deleting Sim')
    }
  }
  getSimDetails = async () => {
    // console.log(this.existingUniqueId, 'dd')
    const { data } = await this.props.client.query({
      query: GET_SIM_DETAIL,
      variables: {
        simId: this.existingSimId
      },
      fetchPolicy: 'network-only'
    })

    this.setDetails(data.simDetail)
  }
  setDetails = simDetail => {
    this.setState({
      phoneno: simDetail.phoneNumber,
      simno: simDetail.simNumber,
      simPrice: simDetail.monthlyCharges,
      simprovider: simDetail.serviceProvider.id
    })
  }
  componentDidMount() {
    this.getSimDetails()
  }

  render() {
    const { classes } = this.props

    return (
      // <Query query={GET_MODELS} fetchPolicy="network-only">
      //   {({ loading: isModelsLoading, error, data: { models } }) => (
      <Query query={GET_PROVIDER} fetchPolicy="network-only">
        {({ loading, error, data }) => {
          const queriedData = data
          if (loading) return null
          if (error) return `Error!: ${error}`
          return (
            <Mutation mutation={UPDATE_SIM}>
              {(updateSim, { data, error }) => (
                <div>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      className={classes.button}
                      style={{ float: 'right' }}
                      onClick={this.deleteSim}
                    >
                      <Tooltip title="Delete SIM">
                        <DeleteForever className={classes.icon} />
                      </Tooltip>
                    </Button>{' '}
                  </Grid>
                  <DialogTitle id="form-dialog-title">
                    Edit SIM Details :
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
                  <form onSubmit={this.handleSubmit(updateSim)}>
                    <DialogContent>
                      <DialogContentText>
                        * Marked fields are mandatory
                      </DialogContentText>
                      <FormControl
                        className={classes.formControl}
                        style={{ minWidth: '60%' }}
                      >
                        <InputLabel htmlFor="demo-controlled-open-select">
                          Select SIm Provider *
                        </InputLabel>
                        <Select
                          open={this.state.open1}
                          fullWidth
                          onClose={this.handleCloseSelect}
                          onOpen={this.handleOpenSelect}
                          value={this.state.simprovider}
                          onChange={this.handleChange}
                          onBlur={this.checkSimProviderValidity}
                          inputProps={{
                            name: 'simprovider',
                            id: 'simprovider'
                          }}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {/* <MenuItem value={'1'}>Idea</MenuItem>
                      <MenuItem value={'2'}>Airtel</MenuItem> */}
                          {queriedData.allServiceProviders.map(
                            allServiceProvidersByStatus => (
                              <MenuItem
                                value={allServiceProvidersByStatus.id}
                                key={allServiceProvidersByStatus.id}
                              >
                                {allServiceProvidersByStatus.name}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </FormControl>
                      <FormControl
                        className={classes.formControl}
                        style={{ minWidth: '60%' }}
                      >
                        <TextField
                          autoFocus
                          margin="dense"
                          id="phoneno"
                          name="phoneno"
                          label="Phone No"
                          type="text"
                          required
                          value={this.state.phoneno}
                          fullWidth
                          onChange={this.handleInputChange('phoneno')}
                          error={!this.state.isPhonenoValid}
                          onBlur={this.checkPhonenoValidity}
                        />
                        <FormHelperText
                          id="name-error-text"
                          className="Error_msg"
                        >
                          {this.state.isPhonenoValid
                            ? ''
                            : 'Phone Number should be between 9-15 digits'}
                        </FormHelperText>
                      </FormControl>
                      <FormControl
                        className={classes.formControl}
                        style={{ minWidth: ' 60%' }}
                      >
                        <TextField
                          autoFocus
                          margin="dense"
                          id="simno"
                          name="simno"
                          label="SIM No"
                          type="text"
                          required
                          fullWidth
                          value={this.state.simno}
                          onChange={this.handleInputChange('simno')}
                          error={!this.state.isSimnoValid}
                          onBlur={this.checkSimnoValidity}
                        />
                        <FormHelperText
                          id="name-error-text"
                          className="Error_msg"
                        >
                          {this.state.isSimnoValid
                            ? ''
                            : 'Sim Number should be between 10-25 digits'}
                        </FormHelperText>
                      </FormControl>
                      <FormControl
                        className={classes.formControl}
                        style={{ minWidth: ' 60%' }}
                      >
                        <TextField
                          autoFocus
                          margin="dense"
                          id="simPrice"
                          name="simPrice"
                          label="SIM Price per Month"
                          type="text"
                          required
                          fullWidth
                          value={this.state.simPrice}
                          onChange={this.handleInputChange('simPrice')}
                          error={!this.state.isSimPriceValid}
                          onBlur={this.checkSimPriceValidity}
                        />
                        <FormHelperText
                          id="name-error-text"
                          className="Error_msg"
                        >
                          {this.state.isSimPriceValid
                            ? ''
                            : 'Sim Price should be between 1-500'}
                        </FormHelperText>
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
                            this.state.isSimProviderValid &&
                            this.state.isSimnoValid &&
                            this.state.isPhonenoValid &&
                            this.state.phoneno !== '' &&
                            this.state.simno !== '' &&
                            this.state.isSimPriceValid &&
                            this.state.simPrice !== '' &&
                            this.state.simprovider !== ''
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

export default withStyles(styles)(withApollo(withSharedSnackbar(EditSim)))
