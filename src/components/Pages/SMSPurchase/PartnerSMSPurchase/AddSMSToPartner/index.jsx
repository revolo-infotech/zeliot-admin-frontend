import React, { Component } from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
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
import getLoginId from '../../../../../utils/getLoginId'
import withSharedSnackbar from '../../../../HOCs/withSharedSnackbar'

const GET_RESELLER_LIST = gql`
  query {
    reseller: getAllResellerDetails(status: 1) {
      login {
        loginId
      }
      resellerName
    }
  }
`

const GET_PARTNER_LIST = gql`
  query {
    parter: allPartnerDetails(status: 1) {
      businessName
      login {
        loginId
      }
    }
  }
`

const GET_SMS_STOCK = gql`
  query getSMSBalanceDetails($partnerLoginId: Int!) {
    getSMSBalanceDetails(toLoginId: $partnerLoginId) {
      smsBalance
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
  mutation addsmsPurchaseHistorySuperAdmin(
    $fromLoginId: Int!
    $fromAccountType: String!
    $toLoginId: Int!
    $toAccountType: String!
    $transactionType: String!
    $status: Int
    $smsCount: Int!
    $key: String
    $clientId: String
    $smsType: smsGateways!
    $username: String
    $password: String
  ) {
    addsmsPurchaseHistorySuperAdmin(
      fromLoginId: $fromLoginId
      fromAccountType: $fromAccountType
      toLoginId: $toLoginId
      toAccountType: $toAccountType
      transactionType: $transactionType
      status: $status
      smsCount: $smsCount
      key: $key
      clientId: $clientId
      sms_gateway: $smsType
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

class AddSMSToPartner extends Component {
  state = {
    open1: false,
    partnername: '',
    partnerNames: [],
    accountType: '',
    key: '',
    clientid: '',
    credit: '',
    isPartnerNameValid: true,
    iskeyValid: true,
    isClientidValid: true,
    isAccountTypeValid: true,
    isCreditValid: true,
    open_man: false,
    availableBalance: 0,
    smsType: '',
    username: '',
    password: '',
    isusernameValid: true,
    isPasswordValid: true
  }

  handleInputChange = key => e => this.setState({ [key]: e.target.value })

  handleChange = client => async event => {
    this.setState({ [event.target.name]: event.target.value })

    if (event.target.value === 'RES') {
      const { data } = await client.query({
        query: GET_RESELLER_LIST,
        variables: { businessname: this.state.name },
        refetchQueries: ['getAllSMSBalanceDetails']
      })

      this.setState({
        partnerNames: data.reseller
      })
    } else {
      const { data } = await client.query({
        query: GET_PARTNER_LIST,
        variables: { businessname: this.state.name }
      })

      this.setState({
        partnerNames: data.parter
      })
    }
  }

  handleChangePartner = async event => {
    this.setState({ [event.target.name]: event.target.value })

    const { data } = await this.props.client.query({
      query: GET_SMS_STOCK,
      variables: { partnerLoginId: parseInt(event.target.value, 10) },
      errorPolicy: 'all'
    })

    if (data.getSMSBalanceDetails) {
      this.setState({
        key: data.getSMSBalanceDetails.key,
        clientid: data.getSMSBalanceDetails.clientId,
        availableBalance: data.getSMSBalanceDetails.smsBalance,
        username: data.getSMSBalanceDetails.username,
        password: data.getSMSBalanceDetails.password,
        smsType: data.getSMSBalanceDetails.sms_gateway
      })
    } else {
      this.setState({
        key: '',
        clientid: '',
        availableBalance: 0
      })
    }
  }

  handleOpen = () => this.setState({ open: true })

  handleOpenSelect = () => this.setState({ open1: true })

  handleCloseSelect = () => this.setState({ open1: false })

  handleOpenSelectMan = () => this.setState({ open_man: true })

  handleCloseSelectMan = () => this.setState({ open_man: false })

  handleOpenSelectType = () => this.setState({ open_type: true })

  handleCloseSelectType = () => this.setState({ open_type: false })

  handleChangeType = async event =>
    this.setState({ [event.target.name]: event.target.value })

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
          toLoginId: parseInt(this.state.partnername, 10),
          toAccountType: this.state.accountType,
          transactionType: type,
          status: 1,
          smsCount: parseInt(this.state.credit, 10),
          key: this.state.key,
          clientId: this.state.clientid,
          username: this.state.username,
          password: this.state.password,
          smsType: this.state.smsType
        }
      })

      this.setState({
        serial_num: '',
        imei_num: '',
        device_model_id: '',
        uniqueSerialNumber: '',
        manufacturerId: ''
      })

      if (data) {
        this.props.openSnackbar('SMS Updated Successfully')
      } else {
        this.props.openSnackbar('Updation Failed')
      }
    } else {
      this.props.openSnackbar('Insufficient Balance')
    }
  }

  render() {
    const { classes } = this.props

    return (
      <div>
        <DialogTitle id="form-dialog-title">Add SMS Credits :</DialogTitle>

        <Divider light />

        <form>
          <DialogContent>
            <DialogContentText>* Marked fields are mandatory</DialogContentText>
            <FormControl
              className={classes.formControl}
              style={{ minWidth: '60%' }}
            >
              <InputLabel htmlFor="demo-controlled-open-select">
                Select AccountType *
              </InputLabel>

              <Select
                open={this.state.open_man}
                fullWidth
                onClose={this.handleCloseSelectMan}
                onOpen={this.handleOpenSelectMan}
                value={this.state.accountType}
                onChange={this.handleChange(this.props.client)}
                inputProps={{
                  name: 'accountType',
                  id: 'accountType'
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>

                <MenuItem value="RES">
                  <em>Reseller</em>
                </MenuItem>

                <MenuItem value="PA">
                  <em>Business Admin</em>
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl
              className={classes.formControl}
              style={{ minWidth: '60%' }}
            >
              <InputLabel htmlFor="demo-controlled-open-select">
                Select Partner *
              </InputLabel>

              <Select
                open={this.state.open1}
                fullWidth
                onClose={this.handleCloseSelect}
                onOpen={this.handleOpenSelect}
                value={this.state.partnername}
                onChange={this.handleChangePartner}
                inputProps={{
                  name: 'partnername',
                  id: 'partnername'
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>

                {this.state.partnerNames.map(allPartners => (
                  <MenuItem
                    value={allPartners.login.loginId}
                    key={allPartners.login.loginId}
                  >
                    {this.state.accountType === 'RES'
                      ? allPartners.resellerName
                      : allPartners.businessName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              className={classes.formControl}
              style={{ minWidth: '60%' }}
            >
              <InputLabel htmlFor="demo-controlled-open-select">
                Select SMS Type *
              </InputLabel>

              <Select
                open={this.state.open_type}
                fullWidth
                onClose={this.handleCloseSelectType}
                onOpen={this.handleOpenSelectType}
                value={this.state.smsType}
                onChange={this.handleChangeType}
                inputProps={{
                  name: 'smsType',
                  id: 'smsType'
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>

                <MenuItem value="GUPSHUP">
                  <em>GUPSHUP</em>
                </MenuItem>

                <MenuItem value="SMSINFINY">
                  <em>SMSINFINY</em>
                </MenuItem>

                <MenuItem value="ETECH_KEYS">
                  <em>ETECH_KEYS</em>
                </MenuItem>
              </Select>
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
                autoFocus
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
                  this.state.isPartnerNameValid &&
                  this.state.iskeyValid &&
                  this.state.isClientidValid &&
                  (this.state.key !== '' || this.state.username !== '') &&
                  (this.state.clientid !== '' || this.state.password !== '') &&
                  this.state.partnername !== '' &&
                  this.state.credit !== '' &&
                  this.state.isCreditValid &&
                  this.state.accountType !== '' &&
                  this.state.smsType !== '' &&
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
                  this.state.isPartnerNameValid &&
                  this.state.iskeyValid &&
                  this.state.isClientidValid &&
                  this.state.key !== '' &&
                  this.state.clientid !== '' &&
                  this.state.partnername !== '' &&
                  this.state.credit !== '' &&
                  this.state.isCreditValid &&
                  this.state.accountType !== ''
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
  withApollo(withSharedSnackbar(AddSMSToPartner))
)
