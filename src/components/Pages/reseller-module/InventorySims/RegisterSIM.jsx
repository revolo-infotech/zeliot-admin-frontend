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
import gql from 'graphql-tag'
import { withStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import { Query, Mutation } from 'react-apollo'
import { Typography } from '@material-ui/core'
import getLoginId from '../../../../utils/getLoginId'

// graph ql querries

const GET_PROVIDER = gql`
  query {
    allServiceProviders(status: 1) {
      id
      name
    }
  }
`
// calling server for updation
const ADD_SIM = gql`
  mutation addSimDetailsFromResellerAdmin(
    $phoneNumber: String!
    $simNumber: String!
    $service_provider_id: Int!
    $ownerLoginId: Int!
    $monthlyCharges: Int!
  ) {
    addSimDetailsFromResellerAdmin(
      phoneNumber: $phoneNumber
      simNumber: $simNumber
      service_provider_id: $service_provider_id
      ownerLoginId: $ownerLoginId
      monthlyCharges: $monthlyCharges
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

class AddSim extends Component {
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

  handleOpenSelect = () => {
    this.setState({ open1: true })
  }

  handleCloseSelect = () => {
    this.setState({ open1: false })
  }

  checkSimnoValidity = () => {
    const regex = new RegExp(
      // eslint-disable-next-line
      /^[0-9]{15}$/
    )
    // console.log('a', this.state.imeino)
    // console.log(regex.test(this.state.imeino))
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
  }

  checkSimProviderValidity = () => {
    this.setState({
      isSimProviderValid: this.state.simprovider !== ''
    })
  }

  handleSubmit = addProvider => e => {
    e.preventDefault()
    addProvider({ variables: { type: this.state.simprovider } })
    // this.state.simprovider = ''
    this.setState({
      simprovider: ''
    })
  }

  handleSubmit = addSim => e => {
    console.log('click fun')
    e.preventDefault()
    addSim({
      variables: {
        phoneNumber: this.state.phoneno,
        simNumber: this.state.simno,
        service_provider_id: this.state.simprovider,
        ownerLoginId: getLoginId(),
        monthlyCharges: parseInt(this.state.simPrice, 10)
      }
    })
    this.setState({
      phoneNumber: '',
      simNumber: '',
      service_provider_id: '',
      simPrice: ''
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Query query={GET_PROVIDER}>
        {({ loading, error, data }) => {
          const queriedData = data
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`
          return (
            <Mutation mutation={ADD_SIM}>
              {(addSim, { data, error }) => (
                <div>
                  <DialogTitle id="form-dialog-title">
                    Add SIM Details :{' '}
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
                  <form onSubmit={this.handleSubmit(addSim)}>
                    <DialogContent>
                      <DialogContentText>
                        * Marked fields are mandatory
                      </DialogContentText>
                      {/* <form onSubmit={this.handleSubmit(addProvider)}> */}
                      <FormControl
                        className={classes.formControl}
                        style={{ minWidth: ' 60%' }}
                      >
                        <InputLabel htmlFor="demo-controlled-open-select">
                          Sim Provider
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
                        style={{ minWidth: ' 60%' }}
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
                        />
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
                      </FormControl>
                    </DialogContent>
                    {/* </form> */}
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
                        color="primary"
                        type="submit"
                        variant="contained"
                        disabled={
                          !(
                            this.state.isSimProviderValid &&
                            this.state.isSimnoValid &&
                            this.state.isphonenoValid &&
                            this.state.phoneno !== '' &&
                            this.state.simno !== '' &&
                            this.state.isSimPriceValid
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
    )
  }
}
export default withStyles(styles)(AddSim)
