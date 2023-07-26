import React, { Component } from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import getLoginId from '../../../../utils/getLoginId'
import { Input } from '@material-ui/core'
import moment from 'moment'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import InputLabel from '@material-ui/core/InputLabel'
import NativeSelect from '@material-ui/core/NativeSelect'
import TextField from '@material-ui/core/TextField'
import PaymentMethod from '../MakePayment/PaymentMethod.jsx'
import FormControl from '@material-ui/core/FormControl'
import withSharedSnackbar from '../../../HOCs/withSharedSnackbar'

const GET_CLIENTS = gql`
  query allClientDetails($partnerLoginId: Int) {
    clients: allClientDetails(partnerLoginId: $partnerLoginId) {
      id
      clientName
      loginId
    }
  }
`
const ADD_UPDATE_CREDIT = gql`
  mutation addUpdateClientCredits(
    $clientLoginId: Int!
    $updatedCredit: Int!
    $paidMoney: Int!
    $paymentMode: String!
    $bankName: String
    $referenceNumber: Int
  ) {
    addUpdateClientCredits(
      clientLoginId: $clientLoginId
      updatedCredit: $updatedCredit
      paidMoney: $paidMoney
      paymentMode: $paymentMode
      bankName: $bankName
      referenceNumber: $referenceNumber
    )
  }
`

const GET_CLIENT_CREDIT = gql`
  query getClientCredit($clientLoginId: Int!) {
    getClientCredit(clientLoginId: $clientLoginId) {
      credit
    }
  }
`

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  iconSmall: {
    fontSize: 20
  },
  selstyle: {
    maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    width: 250
  },
  selectStyle: {
    maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    width: 250
  }
})
const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

const paymentOption = ['CASH', 'ONLINE', 'CHEQUE', 'DD']

class MakeAdvanceAmount extends Component {
  constructor(props) {
    super(props)
    this.class = props
  }
  state = {
    spacing: '16',
    name: [],
    fullData: [],
    clientNameInfo: [],
    clientName: '',
    clientLoginId: [],
    clientNameLoginId: [],
    reportView: false,
    vehicleNumber: [],
    clientID: '',
    vehicleDetails: [],
    paymentType: '',
    piInfo: '',
    paymentStatus: '',
    referenceNumber: '',
    bankName: '',
    paidMoney: '',
    clientCredit: 0,
    validation: false
  }

  columns = ['VEHICLE NUMBER', 'NUMBER OF DAYS BILLED']
  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    filter: false
  }

  handleChangeMonth = event => {
    console.log('handleChangeMonth', event.target.value)
    this.setState({
      month: event.target.value
    })
  }

  handleChangeYear = event => {
    console.log('handleChangeYear', event.target.value)
    this.setState({
      year: event.target.value
    })
  }

  getFormattedDate = timestamp =>
    moment(timestamp * 1000).format('MMM Do YYYY, h:mm a')

  getAllCustomers = async () => {
    const customers = await this.props.client.query({
      query: GET_CLIENTS,
      variables: {
        partnerLoginId: getLoginId()
      }
    })
    if (customers && customers.data) {
      console.log('customers.data', customers.data)
      this.setState({
        clientNameLoginId: customers.data.clients
      })
    }
  }

  handleChange = event => {
    console.log('event', event.target.value)
    this.setState(
      {
        clientName: event.target.value,
        clientID: event.target.value,
        vehicleNumber: []
      },
      () => this.getClientCredit()
    )
  }

  getClientCredit = async () => {
    const credits = await this.props.client.query({
      query: GET_CLIENT_CREDIT,
      variables: {
        clientLoginId: parseInt(this.state.clientID, 10)
      }
    })
    if (credits && credits.data) {
      console.log('credits.data', credits.data.getClientCredit)
      this.setState({
        clientCredit: credits.data.getClientCredit.credit
      })
    }
  }

  handleChangePayment = event => {
    this.setState({ paymentType: event.target.value })
  }

  handleChangereferenceNumber = event => {
    this.setState({ referenceNumber: event.target.value }, () =>
      this.validateFields()
    )
  }
  handleChangePaidMoney = event => {
    this.setState({ paidMoney: event.target.value }, () =>
      this.validateFields()
    )
  }
  handleChangeBankName = event => {
    this.setState({ bankName: event.target.value }, () => this.validateFields())
  }

  handleSubmit = (client, pType) => async event => {
    event.preventDefault()
    await client.mutate({
      mutation: ADD_UPDATE_CREDIT,
      variables: {
        clientLoginId: parseInt(this.state.clientID, 10),
        updatedCredit:
          parseInt(this.state.clientCredit, 10) +
          parseInt(this.state.paidMoney, 10),
        paidMoney: parseInt(this.state.paidMoney, 10),
        paymentMode: this.state.paymentType,
        bankName: this.state.bankName,
        referenceNumber: parseInt(this.state.referenceNumber, 10)
      },
      errorPolicy: 'all'
    })
    // this.state.simprovider = ''
    this.setState({
      paymentMode: '',
      bankName: '',
      referenceNumber: ''
    })
    this.props.openSnackbar('Updated Successfuly...')

    // this.props.history.push({
    //   pathname: '/home/manage/makeAdvanceAmount'
    // })
  }
  validateFields = () => {
    console.log('this.state.paymentTypeff', this.state.paymentType)
    if (this.state.paymentType === 'ONLINE') {
      if (this.state.referenceNumber === '') {
        this.props.openSnackbar('Reference Number Should not blank')
        this.setState({ validation: false })
      } else {
        this.setState({ validation: true })
      }
    } else if (
      this.state.paymentType === 'DD' ||
      this.state.paymentType === 'CHEQUE'
    ) {
      if (this.state.referenceNumber === '') {
        this.props.openSnackbar('Reference Number Should not blank!')
        this.setState({ validation: false })
      } else if (this.state.bankName === '') {
        this.props.openSnackbar('Bank Name Should not blank!')
        this.setState({ validation: false })
      } else {
        this.setState({ validation: true })
      }
    } else {
      this.setState({ validation: true })
    }
  }

  cancelRaise = loginId => {
    this.props.history.push({
      pathname: '/home/manage/admin/InvoiceDetails'
    })
  }

  componentDidMount() {
    this.getAllCustomers()
  }

  render() {
    const { classes } = this.props
    const { spacing } = this.state

    console.log(
      'referenceNumber',
      this.state.referenceNumber,
      'paidMoney',
      this.state.paidMoney,
      'bankName',
      this.state.bankName
    )
    return (
      <form>
        <div className={classes.root}>
          <Button
            variant="outlined"
            color="secondary"
            className={classes.button}
            onClick={() => this.props.history.goBack()}
          >
            <ArrowBackIcon className={classes.iconSmall} />
          </Button>
          <h3>Enter Advance Amount</h3>
          <Grid
            container
            spacing={16}
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Grid item xs={12}>
              <Grid container justify="center" spacing={Number(spacing)}>
                <Grid item>
                  {/* <InputLabel shrink htmlFor="age-native-label-placeholder">
                  Age
                </InputLabel> */}
                  <NativeSelect
                    value={this.state.clientName}
                    onChange={this.handleChange}
                    input={
                      <Input
                        name="clientID"
                        id="clientID-native-label-placeholder"
                      />
                    }
                    className={classes.selstyle}
                  >
                    <option value="">Select Client</option>
                    {this.state.clientNameLoginId.map(client => (
                      <option value={client.loginId}>
                        {client.clientName}
                      </option>
                    ))}
                  </NativeSelect>{' '}
                  Credit Amount:{' '}
                  <TextField
                    id="outlined-uncontrolled"
                    // label="Credit Amount"
                    className={classes.textField}
                    margin="normal"
                    variant="outlined"
                    value={this.state.clientCredit + ' Rs'}
                    disabled
                  />
                </Grid>
              </Grid>
              <Grid container spacing={16}>
                <Grid
                  container
                  spacing={16}
                  direction="row"
                  justify="flex-start"
                  alignItems="flex-start"
                >
                  <Grid item xs={3}>
                    <br />
                    <FormControl className={classes.formControl}>
                      <InputLabel htmlFor="age-helper">Payment Type</InputLabel>
                      <Select
                        value={this.state.paymentType}
                        onChange={this.handleChangePayment}
                        input={
                          <Input name="paymentType" id="paymentType-helper" />
                        }
                        className={classes.selectStyle}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value={'CASH'}>Cash</MenuItem>
                        <MenuItem value={'ONLINE'}>Online</MenuItem>
                        <MenuItem value={'CHEQUE'}>Cheque</MenuItem>
                        <MenuItem value={'DD'}>DD</MenuItem>
                      </Select>
                      {/* <FormHelperText>Some important helper text</FormHelperText> */}
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container spacing={16}>
                  {paymentOption.includes(this.state.paymentType) && (
                    <PaymentMethod
                      paymentThrough={this.state.paymentType}
                      handleChangereferenceNumber={
                        this.handleChangereferenceNumber
                      }
                      handleChangeBankName={this.handleChangeBankName}
                      handleChangePaidMoney={this.handleChangePaidMoney}
                      paidMoney={this.state.paidMoney}
                      referenceNumber={this.state.referenceNumber}
                      bankName={this.state.bankName}
                    />
                  )}
                </Grid>
                <br />
                <br />
                <br />
                <br />
                <Grid item xs={12}>
                  <Grid
                    container
                    spacing={16}
                    direction="row"
                    justify="center"
                    alignItems="center"
                  >
                    <Grid item xs={0}>
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={this.cancelRaise}
                      >
                        Cancel
                      </Button>
                    </Grid>
                    <Grid item xs={0}>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        className={classes.button}
                        onClick={this.handleSubmit(this.props.client)}
                        disabled={this.state.validation === false}
                      >
                        Add Amount
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </form>
    )
  }
}

export default withStyles(style)(
  withSharedSnackbar(withApollo(MakeAdvanceAmount))
)
