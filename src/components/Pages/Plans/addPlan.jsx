import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import FormHelperText from '@material-ui/core/FormHelperText'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import './plans.css'
import Basic from './Basic'
import AllFeatures from './AllFeatures'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import getLoginId from '../../../utils/getLoginId'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import ConfirmationalDialog from '../../common/ConfirmationDialog'

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing.unit * 2
    },
    flexGrow: 1
  },
  italicizedText: {
    fontStyle: 'italic'
  },
  fullWidth: {
    width: '100%'
  }
})

const GET_ALL_FEATURES = gql`
  query {
    features: allFeatures(status: 1) {
      id
      featureName
      costPerAssetPerMonth
      featureDescription
    }
  }
`
const GET_FEATURE_BY_PLAN = gql`
  query getPlans($planid: Int!) {
    getPlans(id: $planid) {
      planName
      description
      featureList {
        id
        featureName
        costPerAssetPerMonth
        featureDescription
      }
    }
  }
`
const ADD_PLANS = gql`
  mutation addPlans(
    $planName: String!
    $description: String!
    $featureList: String!
    $costPerAsset: Int!
    $partnerLoginId: Int!
  ) {
    addPlans(
      planName: $planName
      description: $description
      featureList: $featureList
      costPerAsset: $costPerAsset
      partnerLoginId: $partnerLoginId
    )
  }
`
class AddPlan extends Component {
  constructor(props) {
    super(props)
    // console.log('out', featuresList)
    this.state = {
      isSpeedLimitValid: true,
      planName: '',
      description: '',
      tempState: {},
      plan: '',
      featuresList: '',
      tempPrice: {},
      terms: false,
      message: '',
      isPlanValid: true,

      // basic: '',
      partnerLoginId: getLoginId()
    }
  }

  handleChangeChecked = (name, price) => event => {
    // console.log(name, event.target.value, event.target.checked)
    let tempState = this.state.tempState
    let a = { ...tempState }
    let p = { ...this.state.tempPrice }
    // console.log('mee', a)
    if (event.target.checked === true) {
      this.setState({
        [name]: event.target.checked
        // message: 'Got it'
      })
      a[name] = true
      p[name] = price
    }

    if (event.target.checked === false) {
      this.setState({
        [name]: event.target.checked
        // message: 'Accept Terms'
      })
      a[name] = false
      p[name] = 0
    }
    this.setState({
      tempState: a,
      tempPrice: p
    })
    // console.log('lastS', this.state.tempState)
    // console.log('lastP', this.state.tempPrice)
    let tempcost = 0
    // console.log('ll', this.state.tempPrice[1])
    Object.values(this.state.tempPrice).map(
      price => (tempcost = tempcost + price)
    )
    this.setState({ cost: tempcost })
    // console.log('last=', a)
    // console.log('2p', this.state.cost)
  }
  handleTermsChangeChecked = name => event => {
    // console.log('terms1', this.state.terms)
    // console.log('tt', event.target.checked)
    let val
    if (event.target.checked) {
      val = true
    } else {
      val = false
    }
    this.setState({ [name]: event.target.checked, terms: val })
    // console.log('terms2', this.state.terms)
  }

  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
    // if (e.target.value != '') {
    // }
  }

  handleChangePlan = event => {
    this.setState({ clientPlan: event.target.value })
  }

  handleChange = tempState => async event => {
    // console.log('Plan is ', event.target.value)
    const { data } = await this.props.client.query({
      query: GET_FEATURE_BY_PLAN,
      variables: { planid: parseInt(event.target.value, 10) }
    })
    // console.log('res=', data)
    // console.log('tempState=', tempState)
    let a = { ...tempState }
    let p = { ...this.state.tempPrice }
    // console.log('all=', this.state.featuresList.features)
    this.state.featuresList.features.forEach(allFeatures => {
      a[allFeatures.id] = false
      p[allFeatures.id] = 0
    })
    data.getPlans.featureList.forEach(defaultFeature => {
      a[defaultFeature.id] = true
      p[defaultFeature.id] = defaultFeature.costPerAssetPerMonth
      // console.log('uuuu', this.state.tempState[[defaultFeature.id]])
    })
    this.setState({
      plan: event.target.value,
      defaultFeatures: data,
      tempState: a,
      tempPrice: p
    })
    let tempcost = 0
    // console.log('ll', this.state.tempPrice[1])
    Object.values(this.state.tempPrice).map(
      price => (tempcost = tempcost + price)
    )
    this.setState({ cost: tempcost })
    // console.log('last=', a)
    // console.log('2p', this.state.cost)
  }

  handleCancelClick = e => {
    this.setState({ isCancelConfDialogOpen: true })
  }

  handleSubmitClick = e => {
    this.setState({ isSubmitConfDialogOpen: true })
  }

  handleCancelNegativeResponse = e => {
    this.setState({ isCancelConfDialogOpen: false })
  }

  handleSaveNegativeResponse = e => {
    this.setState({ isSubmitConfDialogOpen: false })
  }

  cancelNewPlan = e => {
    this.props.history.goBack()
  }

  handleSubmit = async event => {
    let checkedlist = []

    Object.keys(this.state.tempState).forEach(price => {
      if (this.state.tempState[price]) {
        const temp = {}
        temp['featureId'] = price
        checkedlist.push(temp)
      }
    })

    let selCost = 0
    if (this.state.featuresList) {
      this.state.featuresList.features.map(
        featuresList =>
          (selCost = selCost + this.state.tempPrice[featuresList.id])
      )
    }

    if (this.state.tempState[8] && this.state.tempState[18]) {
      this.props.openSnackbar('Select Any one map')
    } else if (
      this.state.terms === true &&
      this.state.planName !== '' &&
      this.state.description !== '' &&
      checkedlist.length !== 0
    ) {
      // all set okay

      const { data, errors } = await this.props.client.mutate({
        mutation: ADD_PLANS,
        variables: {
          partnerLoginId: getLoginId(),
          planName: this.state.planName,
          description: this.state.description,
          featureList: JSON.stringify(checkedlist),
          costPerAsset: parseInt(selCost, 10)
        },
        errorPolicy: 'all'
      })
      console.log(errors, data, 'result')
      if (data) {
        this.setState({
          planName: '',
          description: '',
          featureList: '',
          costPerAsset: ''
        })

        this.props.openSnackbar('Plan Created Sucessfully')
        this.props.history.goBack()
      } else if (errors) {
        this.props.openSnackbar(errors[0].message)
      }
    } else if (
      this.state.terms === false &&
      this.state.planName !== '' &&
      this.state.description !== ''
    ) {
      this.props.openSnackbar('Accept terms and conditions')
    } else if (this.state.isPlanValid === false) {
      this.props.openSnackbar('Invalid Plan Name')
    } else {
      this.props.openSnackbar('Fill details')
    }
  }

  getAllFeatures = async () => {
    const response = await this.props.client.query({
      query: GET_ALL_FEATURES
    })
    if (response.data && response.data.features) {
      const tempState = {}
      const tempPrice = {}
      response.data.features.forEach(feature => {
        tempState[feature.id] = false
        tempPrice[feature.id] = 0
      })
      this.setState({
        tempState: tempState,
        featuresList: response.data,
        tempPrice: tempPrice
      })
      let tempcost = 0
      response.data.features.map(
        featuresList =>
          (tempcost = tempcost + this.state.tempPrice[featuresList.id])
      )
      this.setState({ cost: tempcost })
    }
  }

  checkPlanValidity = async () => {
    const regex = new RegExp(/^[a-zA-Z0-9\s-_"]{4,20}$/)
    this.setState({
      isPlanValid: regex.test(this.state.planName) && this.state.planName !== ''
    })
  }
  componentDidMount() {
    this.getAllFeatures()
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <ConfirmationalDialog
          isDialogOpen={this.state.isSubmitConfDialogOpen}
          dialogMessage={'Are you sure you want to Save this new plan?'}
          negativeResponseHandler={this.handleSaveNegativeResponse}
          positiveResponseHandler={this.handleSubmit}
        />
        <ConfirmationalDialog
          isDialogOpen={this.state.isCancelConfDialogOpen}
          dialogMessage={'Are you sure you want to Cancel new plan creation?'}
          negativeResponseHandler={this.handleCancelNegativeResponse}
          positiveResponseHandler={this.cancelNewPlan}
        />
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="secondary"
              className={classes.button}
              onClick={this.handleCancelClick}
            >
              <ArrowBackIcon />
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="New Plan"
                subheader="All fields marked with a (*) are mandatory"
                subheaderTypographyProps={{
                  className: classes.italicizedText
                }}
              />
              <CardContent>
                <Grid container spacing={16}>
                  <Grid item xs={12}>
                    <Grid container spacing={8}>
                      <Grid item xs={12}>
                        <FormControl className={classes.fullWidth}>
                          <FormGroup>
                            <TextField
                              fullWidth
                              id="planName"
                              name="planName"
                              margin="none"
                              label="Plan Name"
                              type="text"
                              // type="Multi-line"
                              value={this.state.planName}
                              required
                              onChange={this.handleInputChange('planName')}
                              error={!this.state.isSpeedLimitValid}
                              onBlur={this.checkSpeedLimitValidity}
                            />
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {!this.state.isSpeedLimitValid
                                ? 'Invalid Speed Limit'
                                : ''}
                            </FormHelperText>
                          </FormGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl className={classes.fullWidth}>
                          <FormGroup>
                            <TextField
                              fullWidth
                              id="description"
                              name="description"
                              margin="none"
                              label="Description"
                              type="text"
                              value={this.state.description}
                              required
                              onChange={this.handleInputChange('description')}
                              error={!this.state.isSpeedLimitValid}
                              onBlur={this.checkSpeedLimitValidity}
                            />
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {!this.state.isSpeedLimitValid
                                ? 'Invalid Speed Limit'
                                : ''}
                            </FormHelperText>
                          </FormGroup>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container spacing={8}>
                      <Grid item xs={12}>
                        <FormControl className={classes.fullWidth}>
                          <InputLabel htmlFor="plan-native-simple">
                            Select from other plan
                          </InputLabel>
                          <Select
                            fullWidth
                            value={this.state.plan}
                            onChange={this.handleChange(this.state.tempState)}
                            inputProps={{
                              name: 'plan',
                              id: 'plan-native-simple'
                            }}
                          >
                            <MenuItem value="">
                              <em>None</em>
                            </MenuItem>
                            <MenuItem value="1">
                              <em>Basic</em>
                            </MenuItem>
                            <MenuItem value="2">
                              <em>Value</em>
                            </MenuItem>
                            <MenuItem value="3">
                              <em>Enterprise</em>
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <AllFeatures
                          allFeaturesList={this.state.featuresList}
                          tempState={this.state.tempState}
                          handleChangeChecked={this.handleChangeChecked}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container spacing={8}>
                      <Grid item xs={12}>
                        <Basic
                          allFeaturesList={this.state.featuresList}
                          tempPrice={this.state.tempPrice}
                          terms={this.state.terms}
                          message={this.state.message}
                          plan={this.state.plan}
                          description={this.state.description}
                          handleSubmit={this.handleSubmitClick}
                          handleCancel={this.handleCancelClick}
                          handleTermsChangeChecked={
                            this.handleTermsChangeChecked
                          }
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* <Grid
          container
          justify="center"
          className="full-screen"
          alignItems="flex-end"
        >
          <Grid item xs={12}>
            <ItemCard className="form_layout">
              <h3 className="Formheader">New Plan</h3>
              <form>
                <div className="formouter">
                  <Grid container>
                    <Grid item xs={12} sm={12}>
                      <FormControl className="selectbox">
                        <FormGroup className="form-input">
                          <TextField
                            id="planName"
                            name="planName"
                            className="textfield"
                            margin="dense"
                            label="Plan Name"
                            type="text"
                            // type="Multi-line"
                            value={this.state.planName}
                            required
                            onChange={this.handleInputChange('planName')}
                            error={!this.state.isPlanValid}
                            onBlur={this.checkPlanValidity}
                          />
                          <FormHelperText
                            id="name-error-text"
                            className="Error_msg"
                          >
                            {!this.state.isPlanValid
                              ? 'Plan Name should be between 4-20 characters'
                              : ''}
                          </FormHelperText>
                        </FormGroup>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      <FormControl className="selectbox">
                        <FormGroup className="form-input">
                          <TextField
                            id="description"
                            name="description"
                            className="textfield"
                            margin="dense"
                            label="Description"
                            type="text"
                            // type="Multi-line"
                            value={this.state.description}
                            required
                            onChange={this.handleInputChange('description')}
                            error={!this.state.isSpeedLimitValid}
                            onBlur={this.checkSpeedLimitValidity}
                          />
                          <FormHelperText
                            id="name-error-text"
                            className="Error_msg"
                          >
                            {!this.state.isSpeedLimitValid
                              ? 'Invalid Speed Limit'
                              : ''}
                          </FormHelperText>
                        </FormGroup>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      <FormControl className="selectbox">
                        <InputLabel htmlFor="plan-native-simple">
                          Select from other plan
                        </InputLabel>
                        <Select
                          value={this.state.plan}
                          onChange={this.handleChange(this.state.tempState)}
                          inputProps={{
                            name: 'plan',
                            id: 'plan-native-simple'
                          }}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          <MenuItem value="1">
                            <em>Basic</em>
                          </MenuItem>
                          <MenuItem value="2">
                            <em>Value</em>
                          </MenuItem>
                          <MenuItem value="3">
                            <em>Enterprise</em>
                          </MenuItem>
                        </Select>
                      </FormControl>

                    </Grid>
                  </Grid>
                  <br />
                  <AllFeatures
                    allFeaturesList={this.state.featuresList}
                    tempState={this.state.tempState}
                    handleChangeChecked={this.handleChangeChecked}
                  />
                  <br />
                  <Basic
                    allFeaturesList={this.state.featuresList}
                    tempPrice={this.state.tempPrice}
                    terms={this.state.terms}
                    message={this.state.message}
                    plan={this.state.plan}
                    description={this.state.description}
                    handleSubmit={this.handleSubmit}
                    handleTermsChangeChecked={this.handleTermsChangeChecked}
                  />
                </div>
              </form>
            </ItemCard>
          </Grid>
        </Grid> */}
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(withApollo(withSharedSnackbar(AddPlan)))
