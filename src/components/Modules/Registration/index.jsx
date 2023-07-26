import React, { Component } from 'react'
import './Register.css'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import FormLabel from '@material-ui/core/FormLabel'
import DatePicker from 'material-ui-pickers/DatePicker'

export default class RegistrationForm extends Component {
  state = {
    serialno: '',
    isEmailValid: true,
    selectedDate: new Date()
  }

  handleDateChange = (date) => {
    this.setState({ selectedDate: date })
  }

  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }

  checkSerialnoValidity = () => {
    const regex = new RegExp(
      // eslint-disable-next-line
      ///^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      /^[0-9]+$/
    )
    this.setState({
      isSerianoValid: regex.test(this.state.serialno) || this.state.serialno === ''
    })
  }
  render() {
    return (
      // <h1>Register Vehicle</h1>
      <div className="Landing">
        <Grid
          container
          justify="center"
          className="full-screen"
        >
          <Grid item xs={12}>
            <h3 className="Formheader">Register Vehicle</h3>
            <form>
              <div className="formouter">
                <Grid container>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullwidth>
                      <FormLabel component="legend">Device Info:</FormLabel>
                      <FormGroup className="form-input">
                        <TextField
                          id="serialno"
                          name="serialno"
                          className="textfield"
                          margin="dense"
                          autoComplete ="Serial No"
                          value={this.state.serialno}
                          required
                          onChange={this.handleInputChange('serialno')}
                          error={!this.state.isSerianoValid}
                          onBlur={this.checkSerialnoValidity}
                          label={!this.state.isSerianoValid ? 'Invalid Serialno' : ''}
                        />
                        <TextField
                          id="imeino"
                          name="imeino"
                          className="textfield"
                          margin="dense"
                          label="IMEI No"
                          value="1234567891478965"
                        />
                      </FormGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullwidth>
                      <FormLabel component="legend">Sim Info:</FormLabel>
                      <FormGroup className="form-input">
                        <TextField
                          id="phone"
                          name="phone"
                          className="textfield"
                          margin="dense"
                          label="Phone No"
                          value="9901795464"
                        />
                        <TextField
                          id="simimei"
                          name="simimei"
                          className="textfield"
                          margin="dense"
                          label="SIM No"
                          value="9901795464"
                        />
                      </FormGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullwidth>
                      <FormLabel component="legend">Vehicle Info:</FormLabel>
                      <FormGroup className="form-input">
                        <TextField
                          id="vlpn"
                          name="vlpn"
                          className="textfield"
                          margin="dense"
                          label="Vehicle No"
                          value="KA01EJ9743"
                        />
                        <TextField
                          id="modelname"
                          name="modelname"
                          className="textfield"
                          margin="dense"
                          label="Vehicle Model"
                          value="Nano"
                        />
                      </FormGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl>
                      {/* <FormLabel component="legend">Vehicle Info:</FormLabel> */}
                      <FormGroup className="form-input">
                        <DatePicker
                          value={this.state.selectedDate}
                          onChange={this.handleDateChange}
                        />

                      </FormGroup>
                    </FormControl>
                  </Grid>
                </Grid>
                <FormGroup className="form-input">
                  <Grid justify="center" container>
                    <Button
                      color="default"
                      variant="outlined"
                      size="medium"
                      margin="normal"
                      className="btn"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      size="medium"
                      margin="normal"
                      className="btn"
                    >
                      Submit
                    </Button>
                  </Grid>
                </FormGroup>
              </div>
            </form>
          </Grid>
        </Grid>
      </div>
    )
  }
}
