import React, { Component, Fragment } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'
import gql from 'graphql-tag'
import { Mutation, Query, withApollo } from 'react-apollo'
import { Typography } from '@material-ui/core'
import MUIDataTable from 'mui-datatables'
import EditProvider from './EditProvider.jsx'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'

// calling server for updation
const ADD_PROVIDER = gql`
  mutation addServiceProvider($name: String!) {
    addServiceProvider(name: $name)
  }
`
const GET_PROVIDER = gql`
  query {
    provider: allServiceProviders(status: 1) {
      id
      name
    }
  }
`
const GET_PROVIDER_DETAILS = gql`
  query serviceProvider($id: Int) {
    serviceProvider(id: $id) {
      name
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
  }
})

class AddProvider extends Component {
  state = {
    open: false,
    open1: false,
    open2: false,
    provider: '',
    isProviderValid: true,
    providerDetails: [],
    providerStatus: false,
    pId: ''
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
  handleSubmit = addProvider => e => {
    // console.log('click fun', addProvider)
    // console.log(this.state.simprovider)
    e.preventDefault()
    addProvider({ variables: { name: this.state.provider } })
    // this.state.simprovider = ''
    // this.setState({
    //   simprovider: ''
    // })
  }
  clientId = []
  fullData = []

  columns = ['Sl.No', 'Provider Name', 'Edit']

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15
  }

  getProviderDetails = providerId => async () => {
    console.log('providerId', providerId)
    const { data } = await this.props.client.query({
      query: GET_PROVIDER_DETAILS,
      variables: {
        id: parseInt(providerId, 10)
      }
    })

    this.setState({
      providerDetails: data,
      providerStatus: true,
      pId: parseInt(providerId, 10)
    })
    console.log('data', data, this.state.providerDetails)
  }

  mapToArr(provider) {
    var rowData = []
    this.fullData = []
    this.simId = []
    let i = 1
    console.log('mee=', provider)
    provider.forEach(element => {
      rowData = []
      rowData.push(i)
      rowData.push(element.name)
      rowData.push(
        <Button onClick={this.getProviderDetails(element.id)}>Edit</Button>
      )
      this.fullData.push(rowData)
      i++
    })
    // console.log('rowDta=', rowData)
  }

  closeEditProvider = () => {
    this.setState({ providerStatus: false })
  }
  providerEditForm = pid => {
    alert(pid)
    this.setState({ open2: true })
  }

  render() {
    // const { classes } = this.props
    console.log('render=', this.state.providerDetails)
    return (
      <Query query={GET_PROVIDER}>
        {({ loading, error, data: { provider: allServiceProviders } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error! ${error.message}`
          console.log('allServiceProviders', allServiceProviders)
          const columnData = allServiceProviders
          this.mapToArr(columnData)
          return (
            <Fragment>
              {this.state.providerStatus === true && (
                <EditProvider
                  providerInfo={this.state.providerDetails.serviceProvider}
                  openStatus={this.state.providerStatus}
                  closeEditProviderFunction={this.closeEditProvider}
                  selectedId={this.state.pId}
                />
              )}
              <Mutation mutation={ADD_PROVIDER}>
                {(addProvider, { data, error }) => (
                  <div>
                    {/* <Button onClick={this.handleClickOpen}>
                    Add Service Provider
                  </Button> */}
                    <Grid item>
                      <div className="list_items">
                        <Button
                          color="primary"
                          onClick={this.handleClickOpen}
                          variant="contained"
                          className={this.props.classes.button}
                        >
                          Add Service Provider
                        </Button>

                        <br />

                        <MUIDataTable
                          title={'SIM Provider Details'}
                          data={this.fullData}
                          columns={this.columns}
                          options={this.options}
                        />
                      </div>
                    </Grid>
                    <Dialog
                      open={this.state.open}
                      onClose={this.handleClose}
                      aria-labelledby="form-dialog-title"
                    >
                      <DialogTitle id="form-dialog-title">
                        Add Service Provider :
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
                      <form onSubmit={this.handleSubmit(addProvider)}>
                        <DialogContent>
                          {/* <DialogContentText>* Marked fields are mandatory</DialogContentText> */}

                          <FormControl>
                            <TextField
                              autoFocus
                              margin="dense"
                              id="provider"
                              name="provider"
                              label="SIM Provider"
                              type="text"
                              required
                              value={this.state.provider}
                              // fullWidth
                              onChange={this.handleInputChange('provider')}
                              error={!this.state.isProviderValid}
                              onBlur={this.checkProviderValidity}
                            />
                          </FormControl>
                          {/* <AddSimProvider /> */}
                        </DialogContent>
                        <DialogActions>
                          <Button
                            onClick={this.handleClose}
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
                                this.state.isProviderValid &&
                                this.state.provider !== ''
                              )
                            }
                          >
                            Submit
                          </Button>
                        </DialogActions>
                      </form>
                    </Dialog>
                  </div>
                )}
              </Mutation>
            </Fragment>
          )
        }}
      </Query>
    )
  }
}
export default withStyles(styles)(withApollo(AddProvider))
