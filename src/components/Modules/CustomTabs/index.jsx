import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { withApollo } from 'react-apollo'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Countries from '../Countries'
import States from '../States'
import FormHelperText from '@material-ui/core/FormHelperText'

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  )
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
}

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
    // padding: theme.spacing.unit * 2
  }
})

class CustomTabs extends React.Component {
  state = {
    value: 0
  }

  handleChange = (event, value) => {
    this.setState({ value })
  }

  handleStateRender() {
    if (this.props.country) {
      return (
        <Grid item xs={12}>
          <FormGroup className="form-input">
            <States
              countryId={this.props.country}
              zoneId={this.props.state}
              handleStateChange={this.props.handleStateChange}
            />
          </FormGroup>
        </Grid>
      )
    }
  }

  render() {
    const { classes } = this.props
    const { value } = this.state

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Tabs value={value} onChange={this.handleChange}>
            <Tab label="Address" />
            <Tab label="Tax Information" />
          </Tabs>
        </AppBar>
        {value === 0 && (
          <Grid container spacing={16}>
            <Grid item xs={12}>
              <FormGroup className="form-input">
                <TextField
                  // autoComplete="username"
                  name="address1"
                  value={this.props.address1}
                  type="text"
                  onChange={this.props.handleInputChange}
                  label="Address Line 1"
                  required
                  // error={!isUsernameValid}
                  // onBlur={this.checkUsernameValidity}
                  // label={!isUsernameValid ? 'Invalid Username' : ''}
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <FormGroup className="form-input">
                <TextField
                  // autoComplete="username"
                  name="address2"
                  value={this.props.address2}
                  type="text"
                  onChange={this.props.handleInputChange}
                  label="Address Line 2"
                  // error={!isUsernameValid}
                  // onBlur={this.checkUsernameValidity}
                  // label={!isUsernameValid ? 'Invalid Username' : ''}
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <FormGroup className="form-input">
                {/* <TextField
                    // autoComplete="username"
                    name="country"
                    value={this.props.country}
                    type="text"
                    onChange={this.props.handleInputChange}
                    placeholder="Country"
                    required
                    // error={!isUsernameValid}
                    // onBlur={this.checkUsernameValidity}
                    // label={!isUsernameValid ? 'Invalid Username' : ''}
                  /> */}
                <Countries
                  countryId={this.props.country}
                  handleCountryChange={this.props.handleCountryChange}
                />
              </FormGroup>
            </Grid>

            {/* <Row>
              <Col md="12">
                <FormGroup className="form-input"> */}
            {/* <TextField
                    // autoComplete="username"
                    name="state"
                    value={this.props.state}
                    type="text"
                    onChange={this.props.handleInputChange}
                    placeholder="State"
                    required
                    // error={!isUsernameValid}
                    // onBlur={this.checkUsernameValidity}
                    // label={!isUsernameValid ? 'Invalid Username' : ''}
                  /> */}
            {this.handleStateRender()}
            {/* <States
                    countryId={this.props.country}
                    zoneId={this.props.state}
                    handleStateChange={this.props.handleStateChange}
                  /> */}
            {/* </FormGroup>
              </Col>
            </Row> */}
            <Grid item xs={12}>
              <FormGroup className="form-input">
                <TextField
                  // autoComplete="username"
                  name="city"
                  value={this.props.city}
                  type="text"
                  onChange={this.props.handleInputChange}
                  label="City"
                  required
                  // error={!isUsernameValid}
                  onBlur={this.props.checkCityValidity}
                  // label={!isUsernameValid ? 'Invalid Username' : ''}
                />
                <FormHelperText id="name-error-text" className="Error_msg">
                  {this.props.isCityValid ? '' : 'Invalid City Name'}
                </FormHelperText>
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <FormGroup className="form-input">
                <TextField
                  // autoComplete="username"
                  name="pincode"
                  value={this.props.pincode}
                  type="text"
                  onChange={this.props.handleInputChange}
                  label="PIN Code"
                  // error={!isUsernameValid}
                  onBlur={this.props.checkPinValidity}
                  // label={!isUsernameValid ? 'Invalid Username' : ''}
                />
                <FormHelperText id="name-error-text" className="Error_msg">
                  {this.props.isPinValid ? '' : 'Invalid Pin Number'}
                </FormHelperText>
              </FormGroup>
            </Grid>
          </Grid>
        )}
        {value === 1 && (
          <Grid container spacing={16}>
            <Grid item xs={12}>
              <FormGroup className="form-input">
                <TextField
                  // autoComplete="username"
                  name="pan"
                  value={this.props.pan}
                  type="text"
                  onChange={this.props.handleInputChange}
                  label="PAN"
                  // error={!isUsernameValid}
                  onBlur={this.props.checkPanValidity}
                  // label={!isUsernameValid ? 'Invalid Username' : ''}
                />
                <FormHelperText id="name-error-text" className="Error_msg">
                  {this.props.isPanValid ? '' : this.props.panNoRes}
                </FormHelperText>
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <FormGroup className="form-input">
                <TextField
                  // autoComplete="username"
                  name="gst"
                  value={this.props.gst}
                  type="text"
                  onChange={this.props.handleInputChange}
                  label="GST"
                  // error={!isUsernameValid}
                  onBlur={this.props.checkGSTValidity}
                  // label={!isUsernameValid ? 'Invalid Username' : ''}
                />
                <FormHelperText id="name-error-text" className="Error_msg">
                  {this.props.isGSTValid ? '' : this.props.gstNoRes}
                </FormHelperText>
              </FormGroup>
            </Grid>
          </Grid>
        )}
      </div>
    )
  }
}

CustomTabs.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(withApollo(CustomTabs))
