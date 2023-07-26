import React, { Component } from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import Select from 'react-select'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'
import { withStyles } from '@material-ui/core/styles'
import Divider from '@material-ui/core/Divider'
import getLoginId from '../../../../../utils/getLoginId'
import withSharedSnackbar from '../../../../HOCs/withSharedSnackbar'

const GET_PARTNER_CLIENT_LIST = gql`
  query allClientDetails($partnerLoginId: Int) {
    clients: allClientDetails(partnerLoginId: $partnerLoginId) {
      loginId
      clientName
    }
  }
`

const GET_RESELLER_CLIENT_LIST = gql`
  query allClientDetails($resellerLoginId: Int) {
    clients: allClientDetails(resellerLoginId: $resellerLoginId) {
      loginId
      clientName
    }
  }
`

const GET_SMS_STOCK = gql`
  query getSMSBalanceDetails($partnerLoginId: Int!) {
    getSMSBalanceDetails(toLoginId: $partnerLoginId) {
      smsBalance
      totalSMS
      key
      clientId
      sms_gateway
      username
      password
    }
  }
`

// calling server for updation
const ADD_SMS = gql`
  mutation addsmsPurchaseHistoryRESAndPRT(
    $fromLoginId: Int!
    $fromAccountType: String!
    $toLoginId: Int!
    $toAccountType: String!
    $key: String!
    $clientId: String!
    $transactionType: String!
    $status: Int!
    $smsCount: Int!
    $sms_gateway: smsGateways!
    $username: String
    $password: String
  ) {
    addsmsPurchaseHistoryRESAndPRT(
      fromLoginId: $fromLoginId
      fromAccountType: $fromAccountType
      toLoginId: $toLoginId
      toAccountType: $toAccountType
      key: $key
      clientId: $clientId
      transactionType: $transactionType
      status: $status
      smsCount: $smsCount
      sms_gateway: $sms_gateway
      username: $username
      password: $password
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

class AddSMSToClient extends Component {
  state = {
    open1: false,
    clientname: '',
    clientNames: [],
    smsTypes: [],
    credit: '',
    isClientNameValid: true,
    isCreditValid: true,
    open_man: false,
    smsBalance: 0,
    clientid: '',
    key: '',
    smsType: '',
    username: '',
    password: '',
    availableBalance: 0,
    isusernameValid: true,
    isPasswordValid: true,
    iskeyValid: true,
    isClientidValid: true,
    partnerClientId: '',
    partnerkey: '',
    partnerGateWay: '',
    partnerUsername: '',
    PartnerPassword: ''
  }

  handleInputChange = key => e => this.setState({ [key]: e.target.value })

  handleChange = async event => {
    this.setState({ clientname: event.value })

    const { data } = await this.props.client.query({
      query: GET_SMS_STOCK,
      variables: { partnerLoginId: event.value },
      errorPolicy: 'all',
      fetchPolicy: 'network-only'
    })
    // console.log('prt', data.getSMSBalanceDetails)
    if (data.getSMSBalanceDetails) {
      this.setState({
        availableBalance: data.getSMSBalanceDetails.smsBalance,
        key: data.getSMSBalanceDetails.key,
        clientid: data.getSMSBalanceDetails.clientId,
        username: data.getSMSBalanceDetails.username,
        password: data.getSMSBalanceDetails.password,
        smsType: data.getSMSBalanceDetails.sms_gateway
      })
    } else {
      this.setState({
        key: this.state.partnerkey,
        clientid: this.state.partnerClientId,
        smsType: this.state.partnerGateWay,
        username: this.state.partnerUsername,
        password: this.state.PartnerPassword,
        availableBalance: 0
      })
    }
  }

  handleOpen = () => this.setState({ open: true })

  checkImeinoValidity = () => {
    this.setState({
      isImeinoValid: this.state.imeino !== ''
    })
  }

  checkSerialnoValidity = () =>
    this.setState({
      isSerialnoValid: this.state.serialno !== ''
    })

  checkModelNameValidity = () =>
    this.setState({
      isModelNameValid: this.state.modelname !== ''
    })

  checkCreditValidity = () => {
    const regex = new RegExp(/^[0-9]*[1-9][0-9]*$/)
    this.setState({
      isCreditValid: regex.test(this.state.credit) && this.state.credit !== ''
    })
  }

  handleSubmit = type => async e => {
    e.preventDefault()
    if (
      (this.state.availableBalance >= this.state.credit && type === 'Debit') ||
      type === 'Credit'
    ) {
      const { data } = await this.props.client.mutate({
        mutation: ADD_SMS,
        variables: {
          fromLoginId: getLoginId(),
          fromAccountType: localStorage.getItem('Account_type'),
          toLoginId: parseInt(this.state.clientname, 10),
          toAccountType: 'CLT',
          key: this.state.key,
          clientId: this.state.clientid,
          transactionType: type,
          status: 1,
          smsCount: parseInt(this.state.credit, 10),
          username: this.state.username,
          password: this.state.password,
          sms_gateway: this.state.smsType
        },
        refetchQueries: [`getAllSMSBalanceDetails`, `getSMSBalanceDetails`]
      })

      this.setState({
        credit: '',
        clientid: '',
        availableBalance: '',
        smsBalance: ''
      })

      if (data) {
        this.props.openSnackbar('SMS Updated Successfully')
        this.props.handleClose()
      } else {
        this.props.openSnackbar('Updation Failed')
      }
    } else {
      this.props.openSnackbar('Insufficient Balance')
    }
  }

  getClients = async () => {
    if (localStorage.getItem('Account_type') === 'RES') {
      const { data } = await this.props.client.query({
        query: GET_RESELLER_CLIENT_LIST,
        variables: {
          resellerLoginId: parseInt(localStorage.getItem('Login_id'), 10)
        },
        fetchPolicy: 'network-only'
      })

      const allClients = data.clients.map(client => ({
        value: client.loginId,
        label: client.clientName
      }))
      this.setState({ clientNames: allClients })
    } else {
      const { data } = await this.props.client.query({
        query: GET_PARTNER_CLIENT_LIST,
        variables: {
          partnerLoginId: parseInt(localStorage.getItem('Login_id'), 10)
        }
      })

      const allClients = data.clients.map(client => ({
        value: client.loginId,
        label: client.clientName
      }))

      this.setState({ clientNames: allClients })
    }
  }

  getSmsDetails = async () => {
    const { data: sms } = await this.props.client.query({
      query: GET_SMS_STOCK,
      variables: {
        partnerLoginId: parseInt(localStorage.getItem('Login_id'), 10)
      },
      fetchPolicy: 'network-only'
    })

    this.setState({
      smsBalance: sms.getSMSBalanceDetails.smsBalance,
      partnerkey: sms.getSMSBalanceDetails.key,
      partnerClientId: sms.getSMSBalanceDetails.clientId,
      partnerGateWay: sms.getSMSBalanceDetails.sms_gateway,
      partnerUsername: sms.getSMSBalanceDetails.username,
      PartnerPassword: sms.getSMSBalanceDetails.password
    })
  }

  handleChangeType = async event => {
    if (event) {
      this.setState({ smsType: event.value })
    }
  }

  componentDidMount() {
    this.getClients(this.props.client)
    this.getSmsDetails(this.props.client)
  }

  render() {
    const { classes } = this.props
    const smsGateways = ['GUPSHUP', 'SMSINFINY', 'ETECH_KEYS']
    const smsTypes = smsGateways.map(smsGateway => ({
      value: smsGateway,
      label: smsGateway
    }))

    return (
      <div>
        <DialogTitle id="form-dialog-title">Add SMS Credits :</DialogTitle>

        <Divider light />

        <form>
          <DialogContent>
            <DialogContentText>* Marked fields are mandatory</DialogContentText>

            <FormControl
              className={classes.formControl}
              style={{ minWidth: ' 60%' }}
            >
              <TextField
                autoFocus
                margin="dense"
                id="smsBalance"
                name="smsBalance"
                label="Total Credit"
                type="text"
                required
                value={this.state.smsBalance}
                fullWidth
                disabled
              />
            </FormControl>

            <FormControl
              className={classes.formControl}
              style={{ minWidth: '60%' }}
            >
              <Select
                classes={classes}
                options={this.state.clientNames}
                value={this.state.clientname}
                onChange={this.handleChange}
                placeholder="Select Customer"
              />
            </FormControl>

            <FormControl
              className={classes.formControl}
              style={{ minWidth: '60%' }}
            >
              <Select
                classes={classes}
                options={smsTypes}
                value={this.state.smsType}
                onChange={this.handleChangeType}
                placeholder="Select SMS Gateway"
              />
            </FormControl>

            <FormControl
              className={classes.formControl}
              style={{ minWidth: ' 60%' }}
            >
              <TextField
                autoFocus
                margin="dense"
                id="availableBalance"
                name="availableBalance"
                label="availableBalance"
                type="text"
                required
                value={this.state.availableBalance}
                fullWidth
                disabled
              />
            </FormControl>

            {this.state.smsType === 'SMSINFINY' && (
              <FormControl
                className={classes.formControl}
                style={{ minWidth: ' 60%' }}
              >
                <TextField
                  autoFocus
                  margin="dense"
                  id="key"
                  name="key"
                  label="Key"
                  type="text"
                  required
                  value={this.state.key}
                  fullWidth
                  onChange={this.handleInputChange('key')}
                  error={!this.state.iskeyValid}
                  onBlur={this.checkkeyValidity}
                />
              </FormControl>
            )}

            {(this.state.smsType === 'SMSINFINY' ||
              this.state.smsType === 'ETECH_KEYS') && (
              <FormControl
                className={classes.formControl}
                style={{ minWidth: ' 60%' }}
              >
                <TextField
                  autoFocus
                  margin="dense"
                  id="clientid"
                  name="clientid"
                  label={
                    this.state.smsType === 'ETECH_KEYS'
                      ? 'Sender Id'
                      : 'Client Id'
                  }
                  type="text"
                  required
                  fullWidth
                  value={this.state.clientid}
                  onChange={this.handleInputChange('clientid')}
                  error={!this.state.isClientidValid}
                  onBlur={this.checkClientidValidity}
                />
              </FormControl>
            )}

            {(this.state.smsType === 'GUPSHUP' ||
              this.state.smsType === 'ETECH_KEYS') && (
              <React.Fragment>
                <FormControl
                  className={classes.formControl}
                  style={{ minWidth: ' 60%' }}
                >
                  <TextField
                    autoFocus
                    margin="dense"
                    id="username"
                    name="username"
                    label="Username"
                    type="text"
                    required
                    value={this.state.username}
                    fullWidth
                    onChange={this.handleInputChange('username')}
                    error={!this.state.isusernameValid}
                    onBlur={this.checkUsernameValidity}
                  />
                </FormControl>

                <FormControl
                  className={classes.formControl}
                  style={{ minWidth: ' 60%' }}
                >
                  <TextField
                    autoFocus
                    margin="dense"
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    required
                    fullWidth
                    value={this.state.password}
                    onChange={this.handleInputChange('password')}
                    error={!this.state.isPasswordValid}
                    onBlur={this.checkPasswordValidity}
                  />
                </FormControl>
              </React.Fragment>
            )}

            <FormControl
              className={classes.formControl}
              style={{ minWidth: ' 60%' }}
            >
              <TextField
                margin="dense"
                id="credit"
                name="credit"
                label="Credit"
                type="text"
                required
                fullWidth
                value={this.state.credit}
                onChange={this.handleInputChange('credit')}
                error={!this.state.isCreditValid}
                onBlur={this.checkCreditValidity}
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
              onClick={this.handleSubmit('Debit')}
              type="submit"
              color="primary"
              variant="contained"
              disabled={
                !(
                  this.state.clientname !== '' &&
                  this.state.credit !== '' &&
                  this.state.isCreditValid &&
                  this.state.availableBalance > 0
                )
              }
            >
              Debit
            </Button>

            <Button
              onClick={this.handleSubmit('Credit')}
              type="submit"
              color="primary"
              variant="contained"
              disabled={
                !(
                  this.state.clientname !== '' &&
                  this.state.credit !== '' &&
                  this.state.isCreditValid
                )
              }
            >
              Credit
            </Button>
          </DialogActions>
        </form>
      </div>
    )
  }
}

export default withStyles(styles)(
  withApollo(withSharedSnackbar(AddSMSToClient))
)
