import React, { Component } from 'react'
import gql from 'graphql-tag'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import FormHelperText from '@material-ui/core/FormHelperText'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { Checkbox } from '@material-ui/core'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { Mutation, Query, withApollo } from 'react-apollo'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import getLoginId from '../../../utils/getLoginId'
import './plans.css'
import Loader from '../../../components/common/Loader'

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

const ADD_LICENSE_TYPE = gql`
  mutation addLicenseType(
    $licenseType: String!
    $description: String!
    $featureList: String!
    $maxPrice: Int!
  ) {
    addLicenseType(
      licenseType: $licenseType
      description: $description
      featureList: $featureList
      maxPrice: $maxPrice
    )
  }
`

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 2
  },
  paper: {
    width: '100%'
  },
  control: {
    padding: theme.spacing.unit * 1
  }
})

class createPlan extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isSpeedLimitValid: true,
      planName: '',
      description: '',
      tempState: {},
      plan: '',
      terms: false,
      message: '',
      maxPrice: '',
      partnerLoginId: getLoginId(),
      licenseType: '',
      featuresList: [],
      selectedFeaturesList: [],
      temp: null,
      default: [],
      checkListArr: []
    }
  }

  handleSubmit = addLicenseType => e => {
    e.preventDefault()
    addLicenseType({
      variables: {
        licenseType: this.state.planName,
        description: this.state.description,
        featureList: JSON.stringify(this.state.selectedFeaturesList),
        maxPrice: parseInt(this.state.maxPrice, 10)
      }
    })
    this.setState({
      licenseType: '',
      description: '',
      featureList: '',
      maxPrice: ''
    })
    this.props.openSnackbar('License created Successfully')
    this.props.history.push({
      pathname: '/home/ViewLicense'
    })
  }

  handleInputChange = key => e => this.setState({ [key]: e.target.value })

  handleChange = event =>
    this.setState({ [event.target.name]: event.target.value })

  handleChangeChecked = name => event => {
    let check1 = {}
    let check2 = []
    let temState = this.state.selectedFeaturesList
    if (event.target.checked === true) {
      if (temState && temState.length) {
        temState.forEach(v => {
          if (temState.indexOf(v.feature) !== -1) {
            this.setState({
              temp: event.target.value
            })
          }
        })
        if (this.state.temp === null) {
          check1['featureid'] = parseInt(event.target.value, 10)
          temState.push(check1)
        }
      } else {
        check1['featureid'] = parseInt(event.target.value, 10)
        temState.push(check1)
      }
    } else {
      let tempObject = { featureid: parseInt(event.target.value, 10) }
      let keys = Object.keys(tempObject)
      temState.splice(
        // get the index of the element
        temState.findIndex(function(obj) {
          // check all property values are equal
          return keys.every(function(k) {
            return tempObject[k] === obj[k]
          })
        }),
        1
      )
    }
    temState.forEach(v => {
      check2[v.featureid] = true
    })
    this.setState({ checkListArr: check2 })
    this.setState({ selectedFeaturesList: temState })
  }

  getIndex(value, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]['feature'] === value) {
        return i
      }
    }
    return -1
  }

  handleChangelicenseType = tempState => async event => {
    let check = []
    let check1 = {}
    let check2 = []
    if (event.target.value !== '') {
      const { data } = await this.props.client.query({
        query: GET_FEATURE_BY_PLAN,
        variables: { planid: parseInt(event.target.value, 10) }
      })
      data.getPlans.featureList.forEach(allFeatures => {
        check1 = {}
        check2[allFeatures.id] = true
        check1['featureid'] = allFeatures.id
        check.push(check1)
      })
      this.setState({
        licenseType: event.target.value,
        defaultFeatures: data,
        tempState: check,
        selectedFeaturesList: check,
        checkListArr: check2
      })
    } else {
      tempState.forEach(v => {
        check2[v.featureid] = false
      })
      this.setState({
        licenseType: event.target.value,
        tempState: check,
        selectedFeaturesList: check,
        checkListArr: check2
      })
    }
  }

  render() {
    const { classes } = this.props

    return (
      <Mutation mutation={ADD_LICENSE_TYPE} errorPolicy="all">
        {(createPlan, { data, loading, error }) => (
          <div className={classes.root}>
            <h3 className="Formheader">New Plan</h3>
            <form onSubmit={this.handleSubmit(createPlan)}>
              <Grid
                container
                spacing={16}
                direction="row"
                justify="center"
                alignItems="flex-start"
              >
                <Grid item xs={6}>
                  <FormControl className="selectbox">
                    <FormGroup className="form-input">
                      <TextField
                        id="planName"
                        name="planName"
                        className="textfield"
                        margin="dense"
                        label="Plan Name"
                        type="text"
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
                  <FormControl className="selectbox">
                    <FormGroup className="form-input">
                      <InputLabel htmlFor="plan-native-simple">
                        Select from other plan
                      </InputLabel>
                      <Select
                        value={this.state.licenseType}
                        onChange={this.handleChangelicenseType(
                          this.state.tempState
                        )}
                        inputProps={{
                          name: 'licenseType',
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
                    </FormGroup>
                  </FormControl>
                  <FormControl className="selectbox">
                    <FormGroup className="form-input">
                      <TextField
                        id="maxPrice"
                        name="maxPrice"
                        label="Maximum Price"
                        type="number"
                        className={classes.textField}
                        value={this.state.maxPrice}
                        required
                        onChange={this.handleInputChange('maxPrice')}
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
                  <br />
                  <Button variant="contained" className={classes.button}>
                    Cancel
                  </Button>
                  &nbsp;&nbsp;
                  <Button
                    color="primary"
                    variant="contained"
                    type="submit"
                    className={classes.button}
                  >
                    Submit
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Query query={GET_ALL_FEATURES}>
                    {({ loading, error, data: { features } }) => {
                      if (loading) return <Loader />
                      if (error) return `Error!: ${error}`
                      return (
                        <div>
                          <Grid container spacing={16} direction="row">
                            <Grid
                              item
                              container
                              spacing={16}
                              direction="row"
                              justify="flex-start"
                              alignItems="flex-start"
                            >
                              <Grid item xs={12} sm={12}>
                                {features &&
                                  features.map(featuresList => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={
                                            /* eslint-disable */
                                            this.state.checkListArr[
                                              featuresList.id
                                            ] || false
                                            /* eslint-enable */
                                          }
                                          onChange={this.handleChangeChecked(
                                            featuresList.id
                                          )}
                                          value={featuresList.id}
                                        />
                                      }
                                      label={featuresList.featureName}
                                    />
                                  ))}
                              </Grid>
                            </Grid>
                          </Grid>
                        </div>
                      )
                    }}
                  </Query>
                  <FormGroup>
                    {this.state.featuresList.features &&
                      this.state.featuresList.features.map(featList => (
                        <FormControlLabel control={<Checkbox />} />
                      ))}
                  </FormGroup>
                </Grid>
              </Grid>
            </form>
          </div>
        )}
      </Mutation>
    )
  }
}

export default withStyles(styles)(withSharedSnackbar(withApollo(createPlan)))
