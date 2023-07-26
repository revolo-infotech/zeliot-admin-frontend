import React, { Component } from 'react'
import './AssignDevPartner.css'
import 'react-select/dist/react-select.css'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import Grid from '@material-ui/core/Grid'
import ItemCard from '../../Reusable/ItemCard'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Slide from '@material-ui/core/Slide'
import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import FormHelperText from '@material-ui/core/FormHelperText'
import gql from 'graphql-tag'
import { Query, ApolloConsumer } from 'react-apollo'

const GET_PARTNER_DETAILS = gql`
  query {
    allPartnerDetails(status: 1) {
      id
      businessName
      login {
        loginId
      }
    }
  }
`
const GET_PARTNER_DETAILS_BYID = gql`
  query partnerDetail($partnerId: Int!) {
    partnerDetail(loginId: $partnerId) {
      businessName
      contactPerson
      address
      id
      login {
        loginId
      }
    }
  }
`
const GET_DEVICE_DETAILS_BYID = gql`
  query deviceDetail($deviceId: String!) {
    deviceDetail(uniqueDeviceId: $deviceId) {
      serial_num
      imei_num
      uniqueDeviceId
      deviceModelId {
        model_name
      }
    }
  }
`

const ASS_DEVICE_TO_PARTNER = gql`
  mutation addDevicePartnerAssignDetail($deviceId: String!, $partnerId: Int!) {
    addDevicePartnerAssignDetail(
      uniqueDeviceId: $deviceId
      partnerLoginId: $partnerId
    )
  }
`

const GET_SIM_DETAILS = gql`
  query simDetail($phoneno: String, $status: Int) {
    simDetail(phoneNumber: $phoneno, status: $status) {
      id
      phoneNumber
      simNumber
      serviceProvider {
        name
      }
    }
  }
`
const ASS_SIM_TO_PARTNER = gql`
  mutation addSimPartnerAssignDetail($simId: Int!, $partnerId: Int!) {
    addSimPartnerAssignDetail(simId: $simId, partnerLoginId: $partnerId)
  }
`
function Transition(props) {
  return <Slide direction="up" {...props} />
}

// const ITEM_HEIGHT = 48

const styles = theme => ({
  appBar: {
    position: 'relative'
  },
  flex: {
    flex: 1
  },
  root: {
    flexGrow: 1
    // height: 250250
  },
  chip: {
    margin: theme.spacing.unit / 4
  }
})

class AssignDevPartner extends Component {
  state = {
    single: null,
    multi: null,
    multiLabel: null,
    open: false,
    showDetails: false,
    isModelNameValid: true,
    serialno: '',
    isSerialnoValid: true,
    modelName: '',
    open1: false,
    isPartnerNameValid: '',
    partnerName1: '',
    comapnyName: '',
    address: '',
    showDeviceDetails: '',
    showErrorDetails: '',
    serialNumber: '',
    imeiNumber: '',
    uniqueID: '',
    deviceId: '',
    partnerId: '',
    openSim: false,
    phoneno: '',
    isPhonenoValid: true,
    phoneNumber: '',
    simNumber: '',
    providerName: '',
    simId: '',
    showSimDetails: false,
    searchError: ''
  }
  handleChange = name => value => {
    this.setState({
      [name]: value
    })
  }
  handleChangeSelect = event => {
    this.setState({ [event.target.name]: event.target.value })
  }
  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }
  handleChangemodel = event => {
    this.setState({ modelName: event.target.value })
  }
  checkModelNameValidity = () => {
    this.setState({
      isModelNameValid: this.state.modelName !== ''
    })
  }
  handleOpenSelect = () => {
    this.setState({ open1: true })
  }
  handleCloseSelect = () => {
    this.setState({ open1: false })
  }
  handleOpenSelectSim = () => {
    this.setState({ openSim: true })
    // console.log('dpenstatus', this.state.openSim)
  }
  handleCloseSelectSim = () => {
    this.setState({ openSim: false })
  }
  checkSerialnoValidity = () => {
    // const regex = new RegExp(
    //   // /^[1-9][0-9]{9}$/
    //   /^[0-9]+$/
    // )
    // console.log('meena')
    // console.log(regex.test(this.state.serialno) || this.state.serialno === '')
    this.setState({
      isSerialnoValid:
        // regex.test(this.state.serialno) && this.state.serialno !== ''
        this.state.serialno !== ''
    })
  }
  checkPhonenoValidity = () => {
    const regex = new RegExp(
      // /^[1-9][0-9]{9}$/
      /^[0-9]+$/
    )
    this.setState({
      isPhonenoValid:
        regex.test(this.state.phoneno) && this.state.phoneno !== ''
    })
  }
  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }
  checkPartnerNameValidity = () => {
    this.setState({
      isPartnerNameValid: this.state.partnername !== ''
    })
  }
  showPartnerDetails = client => async event => {
    console.log('ploginid=', this.state.partnername)
    const { data } = await client.query({
      query: GET_PARTNER_DETAILS_BYID,
      variables: { partnerId: this.state.partnername }
    })
    console.log('data=', data)
    this.setState({
      partnerName1: data.partnerDetail.contactPerson,
      comapnyName: data.partnerDetail.businessName,
      address: data.partnerDetail.address,
      partnerId: data.partnerDetail.login.loginId,
      showDetails: true
    })
    // await this.onCountryFetched(data.allStatesByCountryId)
  }
  displayDeviceDetails = client => async event => {
    console.log('HELLO')
    const response = await client.query({
      query: GET_DEVICE_DETAILS_BYID,
      errorPolicy: 'all',
      variables: { deviceId: this.state.serialno }
    })
    console.log('data=', response.data)
    console.log('error', response.error)
    if (response.data.deviceDetail) {
      this.setState({
        serialNumber: response.data.deviceDetail.serial_num,
        imeiNumber: response.data.deviceDetail.imei_num,
        uniqueID: response.data.deviceDetail.uniqueDeviceId,
        modelName: response.data.deviceDetail.deviceModelId.model_name,
        // deviceId: data.deviceDetail.id,
        showDeviceDetails: true
      })
    } else {
      console.log('error', response.error)
      this.setState({
        showErrorDetails: true,
        searchError: 'Unique Id does not exist'
      })
    }

    // await this.onCountryFetched(data.allStatesByCountryId)
  }
  handleFormSubmit = client => async event => {
    const { data } = await client.mutate({
      mutation: ASS_DEVICE_TO_PARTNER,
      variables: {
        deviceId: this.state.uniqueID,
        partnerId: this.state.partnerId
      }
    })
    console.log('ADD=', data)
  }
  // Sim details
  displaySimDetails = client => async event => {
    console.log('Hi', this.state.phoneno)
    const { data } = await client.query({
      query: GET_SIM_DETAILS,
      variables: { phoneno: this.state.phoneno, status: 1 }
    })
    console.log('Simdata=', data)
    this.setState({
      phoneNumber: data.simDetail.phoneNumber,
      simNumber: data.simDetail.simNumber,
      providerName: data.simDetail.serviceProvider.name,
      simId: data.simDetail.id,
      showSimDetails: true
    })
    // await this.onCountryFetched(data.allStatesByCountryId)
  }
  handleSimFormSubmit = client => async event => {
    const { data } = await client.mutate({
      mutation: ASS_SIM_TO_PARTNER,
      variables: {
        simId: this.state.simId,
        partnerId: this.state.partnerId
      }
    })
    console.log('ADDSIM=', data)
  }
  render() {
    const { classes } = this.props
    return (
      <ApolloConsumer>
        {client => (
          <Query query={GET_PARTNER_DETAILS}>
            {({ loading, error, data }) => {
              const queriedData = data
              if (loading) return 'Loading...'
              if (error) return `Error!: ${error}`
              console.log('Data=', queriedData.allPartnerDetails)
              return (
                <div className="Landing">
                  <Grid
                    container
                    justify="center"
                    //   alignments="flex-end"
                    className="full-screen"
                  >
                    <Grid item xs={10}>
                      <ItemCard className="form_layout">
                        <Typography variant="title" color="primary">
                          Assign Devices To Partner
                        </Typography>
                        <div className={classes.root}>
                          <Grid container style={{ margin: '10px' }}>
                            <div className="searchrow">
                              <FormControl
                                className={classes.formControl}
                                style={{ minWidth: '100%' }}
                              >
                                <Select
                                  open={this.state.open1}
                                  onClose={this.handleCloseSelect}
                                  onOpen={this.handleOpenSelect}
                                  fullWidth
                                  placeholder="a"
                                  name="Select Partner"
                                  value={this.state.partnername}
                                  onChange={this.handleChangeSelect}
                                  error={!this.state.isPartnerNameValid}
                                  onBlur={this.checkPartnerNameValidity}
                                  inputProps={{
                                    name: 'partnername',
                                    id: 'partnername'
                                  }}
                                >
                                  <MenuItem value="">
                                    <em>None</em>
                                  </MenuItem>
                                  {queriedData.allPartnerDetails.map(
                                    allPartnerDetailsByStatus => (
                                      <MenuItem
                                        value={
                                          allPartnerDetailsByStatus.login
                                            .loginId
                                        }
                                        key={
                                          allPartnerDetailsByStatus.login
                                            .loginId
                                        }
                                      >
                                        {allPartnerDetailsByStatus.businessName}
                                      </MenuItem>
                                    )
                                  )}
                                  {/* <MenuItem value={10}>Ten</MenuItem>
                              <MenuItem value={20}>Twenty</MenuItem>
                              <MenuItem value={30}>Thirty</MenuItem> */}
                                </Select>
                              </FormControl>
                            </div>
                            <div className="searchrow">
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                margin="normal"
                                className="btn"
                                // onClick={() => {
                                //   this.setState({ showDetails: true })
                                // }}
                                onClick={this.showPartnerDetails(client)}
                                disabled={!this.state.isPartnerNameValid}
                              >
                                Go
                              </Button>
                            </div>
                          </Grid>
                          {this.state.showDetails && (
                            <Grid container>
                              <div className="clientDetails">
                                <Typography
                                  variant="headline"
                                  color="secondary"
                                >
                                  Partner Details:
                                </Typography>
                                <Typography variant="body2">
                                  Partner Name:
                                </Typography>
                                <Typography variant="body1">
                                  {this.state.partnerName1}
                                </Typography>
                                <Typography variant="body2">
                                  Company Name :
                                </Typography>
                                <Typography variant="body1">
                                  {this.state.comapnyName}
                                </Typography>
                                <Typography variant="body2">
                                  Address:
                                </Typography>
                                <Typography variant="body1">
                                  {this.state.address}
                                </Typography>
                                <Button
                                  color="secondary"
                                  size="small"
                                  variant="contained"
                                  margin="normal"
                                  onClick={this.handleClickOpen}
                                >
                                  Add Device
                                </Button>
                                <Button
                                  color="secondary"
                                  size="small"
                                  variant="contained"
                                  margin="normal"
                                  onClick={this.handleOpenSelectSim}
                                >
                                  Add SIM
                                </Button>
                              </div>
                            </Grid>
                          )}
                        </div>
                      </ItemCard>
                    </Grid>
                  </Grid>
                  <div>
                    <Dialog
                      fullScreen
                      open={this.state.open}
                      onClose={this.handleClose}
                      TransitionComponent={Transition}
                    >
                      <AppBar className={classes.appBar}>
                        <Toolbar>
                          <IconButton
                            color="inherit"
                            onClick={this.handleClose}
                            aria-label="Close"
                          >
                            <CloseIcon />
                          </IconButton>
                          <Typography
                            variant="title"
                            color="inherit"
                            className={classes.flex}
                          >
                            Add Device
                          </Typography>
                          <Button color="inherit" onClick={this.handleClose}>
                            save
                          </Button>
                        </Toolbar>
                      </AppBar>
                      <Grid container spacing={8}>
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
                        <Grid item xs={2}>
                          <FormControl style={{ minWidth: '60%' }}>
                            <FormGroup className="form-input">
                              <TextField
                                id="serialno"
                                name="serialno"
                                className="textfield"
                                margin="dense"
                                label="Unique Id"
                                type="text"
                                value={this.state.serialno}
                                required
                                onChange={this.handleInputChange('serialno')}
                                error={!this.state.isSerialnoValid}
                                onBlur={this.checkSerialnoValidity}
                              />
                              <FormHelperText
                                id="name-error-text"
                                className="Error_msg"
                              >
                                {!this.state.isSerialnoValid
                                  ? 'Invalid Serial No'
                                  : ''}
                              </FormHelperText>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                          <FormControl
                            style={{ minWidth: '60%', margin: '20px' }}
                          >
                            <Button
                              variant="contained"
                              color="primary"
                              size="medium"
                              margin="normal"
                              className="btn"
                              onClick={this.displayDeviceDetails(client)}
                              disabled={
                                // console.log(this.state.isSerialnoValid)
                                !this.state.isSerialnoValid
                              }
                            >
                              Process
                            </Button>
                          </FormControl>
                        </Grid>
                      </Grid>
                      {this.state.showErrorDetails && (
                        <Typography variant="headline" color="secondary">
                          Unique Id does not exist!
                        </Typography>
                      )}
                      {this.state.showDeviceDetails && (
                        <Grid container>
                          <div className="clientDetails">
                            <Typography variant="headline" color="secondary">
                              Device Details:
                            </Typography>
                            <Typography variant="body2">Serial No:</Typography>
                            <Typography variant="body1">
                              {this.state.serialNumber}
                            </Typography>
                            <Typography variant="body2">
                              Model Name :
                            </Typography>
                            <Typography variant="body1">
                              {this.state.modelName}
                            </Typography>
                            <Typography variant="body2">Imei No:</Typography>
                            <Typography variant="body1">
                              {this.state.imeiNumber}
                            </Typography>
                            <Typography variant="body2">Unique No:</Typography>
                            <Typography variant="body1">
                              {this.state.uniqueID}
                            </Typography>
                            <Button
                              color="secondary"
                              size="small"
                              variant="contained"
                              margin="normal"
                              onClick={this.handleFormSubmit(client)}
                            >
                              Assign
                            </Button>
                            <Button
                              color="default"
                              size="small"
                              variant="contained"
                              margin="normal"
                              onClick={this.handleClickOpen}
                            >
                              Cancel
                            </Button>
                          </div>
                        </Grid>
                      )}
                    </Dialog>
                  </div>

                  <div>
                    <Dialog
                      fullScreen
                      open={this.state.openSim}
                      onClose={this.handleCloseSelectSim}
                      TransitionComponent={Transition}
                    >
                      <AppBar className={classes.appBar}>
                        <Toolbar>
                          <IconButton
                            color="inherit"
                            onClick={this.handleCloseSelectSim}
                            aria-label="Close"
                          >
                            <CloseIcon />
                          </IconButton>
                          <Typography
                            variant="title"
                            color="inherit"
                            className={classes.flex}
                          >
                            Add SIM
                          </Typography>
                          <Button
                            color="inherit"
                            onClick={this.handleCloseSelectSim}
                          >
                            save
                          </Button>
                        </Toolbar>
                      </AppBar>
                      <Grid container spacing={8}>
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
                        <Grid item xs={2}>
                          <FormControl style={{ minWidth: '60%' }}>
                            <FormGroup className="form-input">
                              <TextField
                                id="phoneno"
                                name="phoneno"
                                className="textfield"
                                margin="dense"
                                label="Phone No"
                                type="text"
                                value={this.state.phoneno}
                                required
                                onChange={this.handleInputChange('phoneno')}
                                error={!this.state.isPhonenoValid}
                                onBlur={this.checkPhonenoValidity}
                              />
                              <FormHelperText
                                id="name-error-text"
                                className="Error_msg"
                              >
                                {!this.state.isSerialnoValid
                                  ? 'Invalid Phone No'
                                  : ''}
                              </FormHelperText>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                          <FormControl
                            style={{ minWidth: '60%', margin: '20px' }}
                          >
                            <Button
                              variant="contained"
                              color="primary"
                              size="medium"
                              margin="normal"
                              className="btn"
                              onClick={this.displaySimDetails(client)}
                              disabled={
                                // console.log(this.state.isSerialnoValid)
                                !this.state.isPhonenoValid
                              }
                            >
                              Process
                            </Button>
                          </FormControl>
                        </Grid>
                      </Grid>
                      {this.state.showSimDetails && (
                        <Grid container>
                          <div className="clientDetails">
                            <Typography variant="headline" color="secondary">
                              SIM Details:
                            </Typography>
                            <Typography variant="body2">Phone No:</Typography>
                            <Typography variant="body1">
                              {this.state.phoneNumber}
                            </Typography>
                            <Typography variant="body2">
                              Provider Name :
                            </Typography>
                            <Typography variant="body1">
                              {this.state.providerName}
                            </Typography>
                            <Typography variant="body2">SIM No:</Typography>
                            <Typography variant="body1">
                              {this.state.simNumber}
                            </Typography>

                            <Button
                              color="secondary"
                              size="small"
                              variant="contained"
                              margin="normal"
                              onClick={this.handleSimFormSubmit(client)}
                            >
                              Assign
                            </Button>
                            <Button
                              color="default"
                              size="small"
                              variant="contained"
                              margin="normal"
                              onClick={this.handleClickOpen}
                            >
                              Cancel
                            </Button>
                          </div>
                        </Grid>
                      )}
                    </Dialog>
                  </div>
                </div>
              )
            }}
          </Query>
        )}
      </ApolloConsumer>
    )
  }
}

export default withStyles(styles)(AssignDevPartner)
