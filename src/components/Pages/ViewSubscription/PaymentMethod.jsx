import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'

const style = theme => ({
  // root: {
  //   padding: theme.spacing.unit * 4,
  //   flexGrow: 1,
  //   backgroundColor: theme.palette.background.paper
  // },
  // paper: {
  //   padding: theme.spacing.unit * 2,
  //   textAlign: 'center',
  //   color: theme.palette.text.secondary
  // },
  // iconSmall: {
  //   fontSize: 20
  // },
  // selectStyle: {
  //   margin: theme.spacing.unit,
  //   minWidth: 250
  // },
  textField: {
    // marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    minWidth: 250
  }
  // pad: {
  //   padding: theme.spacing.unit * 2
  // }
})

class PaymentMethod extends Component {
  render() {
    const { classes } = this.props
    return (
      <div>
        {(this.props.paymentThrough === 'ONLINE' && (
          <Grid item xs={12}>
            <Grid
              container
              spacing={16}
              direction="row"
              justify="flex-start"
              alignItems="flex-start"
            >
              <Grid item>
                <TextField
                  id="outlined-uncontrolled"
                  label="Trasaction ID"
                  className={classes.textField}
                  margin="none"
                  variant="outlined"
                  value={this.props.referenceNumber}
                  onChange={this.props.handleChangereferenceNumber}
                />
              </Grid>
              <Grid item>
                <TextField
                  id="outlined-uncontrolled"
                  label="Amount"
                  className={classes.textField}
                  margin="none"
                  variant="outlined"
                  value={this.props.paidMoney}
                  onChange={this.props.handleChangePaidMoney}
                />
              </Grid>
            </Grid>
          </Grid>
        )) ||
          (this.props.paymentThrough === 'CASH' && (
            <Grid item xs={12}>
              <Grid
                container
                spacing={16}
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
              >
                <Grid item>
                  <TextField
                    id="outlined-uncontrolled"
                    label="Amount"
                    className={classes.textField}
                    margin="none"
                    variant="outlined"
                    value={this.props.paidMoney}
                    onChange={this.props.handleChangePaidMoney}
                  />
                </Grid>
              </Grid>
            </Grid>
          )) ||
          (this.props.paymentThrough === 'CHEQUE' && (
            <Grid item xs={12}>
              <Grid
                container
                spacing={16}
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
              >
                <Grid item>
                  <TextField
                    id="outlined-uncontrolled"
                    label="Cheque No."
                    className={classes.textField}
                    margin="none"
                    variant="outlined"
                    value={this.props.referenceNumber}
                    onChange={this.props.handleChangereferenceNumber}
                  />
                </Grid>

                <Grid item>
                  <TextField
                    id="outlined-uncontrolled"
                    label="Bank Name"
                    className={classes.textField}
                    margin="none"
                    variant="outlined"
                    value={this.props.bankName}
                    onChange={this.props.handleChangeBankName}
                  />
                </Grid>

                <Grid item>
                  <TextField
                    id="outlined-uncontrolled"
                    label="Amount"
                    className={classes.textField}
                    margin="none"
                    variant="outlined"
                    value={this.props.paidMoney}
                    onChange={this.props.handleChangePaidMoney}
                  />
                </Grid>
              </Grid>
            </Grid>
          )) ||
          (this.props.paymentThrough === 'DD' && (
            <Grid item xs={12}>
              <Grid
                container
                spacing={16}
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
              >
                <Grid item>
                  <TextField
                    id="outlined-uncontrolled"
                    label="DD No."
                    className={classes.textField}
                    margin="none"
                    variant="outlined"
                    value={this.props.referenceNumber}
                    onChange={this.props.handleChangereferenceNumber}
                  />
                </Grid>

                <Grid item>
                  <TextField
                    id="outlined-uncontrolled"
                    label="Bank Name"
                    className={classes.textField}
                    margin="none"
                    variant="outlined"
                    value={this.props.bankName}
                    onChange={this.props.handleChangeBankName}
                  />
                </Grid>

                <Grid item>
                  <TextField
                    id="outlined-uncontrolled"
                    label="Amount"
                    className={classes.textField}
                    margin="none"
                    variant="outlined"
                    value={this.props.paidMoney}
                    onChange={this.props.handleChangePaidMoney}
                  />
                </Grid>
              </Grid>
            </Grid>
          ))}
      </div>
    )
  }
}

export default withStyles(style)(PaymentMethod)
