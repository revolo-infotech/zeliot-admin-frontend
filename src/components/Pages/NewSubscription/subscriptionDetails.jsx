import React, { Fragment } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import FileDownloadIcon from '@material-ui/icons/FileDownload'
import Select from 'react-select'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Divider from '@material-ui/core/Divider'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import getLoginId from '../../../utils/getLoginId'

const GET_BILLING_MODE = gql`
  query {
    billingMode: getAllBillingMode {
      id
      billingMode
    }
  }
`
const GET_DEVICE_MODELS = gql`
  query {
    deviceModel: allDeviceModels {
      id
      model_name
    }
  }
`
const GET_ACCESSORY = gql`
  query {
    accessoryDetails: getAllAccessoryTypes {
      id
      accessoryName
    }
  }
`
const GET_SIM_PROVIDER = gql`
  query {
    simDetails: allServiceProviders {
      id
      name
    }
  }
`

const style = theme => ({
  // textField: {
  //   marginLeft: theme.spacing.unit * 2,
  //   marginRight: theme.spacing.unit * 2,
  //   width: '100%'
  // }
  // root: {
  //   padding: theme.spacing.unit * 1,
  //   flexGrow: 1
  // },
  // input: {
  //   display: 'flex',
  //   padding: 0
  // }
  card: {
    overflow: 'visible'
  },
  italicizedText: {
    fontStyle: 'italic'
  },
  fileDownloadIcon: {
    marginLeft: theme.spacing.unit,
    marginRight: -theme.spacing.unit
  },
  wrapFileName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    maxWidth: '250px'
  },
  cardHeaderAction: {
    marginTop: '0px',
    marginRight: '-8px'
  }
})

function SubscriptionDetails(props) {
  const { classes } = props

  return (
    <Query
      query={GET_BILLING_MODE}
      variables={{
        partnerLoginId: getLoginId()
      }}
    >
      {({ loading, error, data: { billingMode } }) => {
        if (loading) return 'Loading...'
        if (error) return `Error!: ${error}`

        const billingModes = billingMode.map(billingMode => ({
          value: billingMode.id,
          label: billingMode.billingMode
        }))

        return (
          <Query query={GET_DEVICE_MODELS}>
            {({ loading, error, data: { deviceModel } }) => {
              if (loading) return 'Loading...'
              if (error) return `Error!: ${error}`

              const deviceModels = deviceModel.map(deviceModel => ({
                value: deviceModel.id,
                label: deviceModel.model_name
              }))

              return (
                <Query query={GET_ACCESSORY}>
                  {({ loading, error, data: { accessoryDetails } }) => {
                    if (loading) return 'Loading...'
                    if (error) return `Error!: ${error}`

                    const accessoryModels = accessoryDetails.map(
                      accessoryDetails => ({
                        value: accessoryDetails.id,
                        label: accessoryDetails.accessoryName
                      })
                    )

                    return (
                      <Query query={GET_SIM_PROVIDER}>
                        {({ loading, error, data: { simDetails } }) => {
                          if (loading) return 'Loading...'
                          if (error) return `Error!: ${error}`

                          const simProviders = simDetails.map(simDetails => ({
                            value: simDetails.id,
                            label: simDetails.name
                          }))
                          return (
                            <Card className={classes.card}>
                              <CardHeader
                                title="Subscription Details"
                                subheader="All fields marked with a (*) are mandatory"
                                subheaderTypographyProps={{
                                  className: classes.italicizedText
                                }}
                                classes={{ action: classes.cardHeaderAction }}
                                action={
                                  <Fragment>
                                    <input
                                      accept=".pdf"
                                      id="contained-button-pi-upload"
                                      type="file"
                                      style={{
                                        display: 'none'
                                      }}
                                      onChange={props.handlePIUpload}
                                    />
                                    <label htmlFor="contained-button-pi-upload">
                                      <Button
                                        variant="contained"
                                        color="secondary"
                                        component="span"
                                      >
                                        {props.isPIUploading ? (
                                          <CircularProgress
                                            size={15}
                                            color="inherit"
                                          />
                                        ) : (
                                          <span
                                            className={classes.wrapFileName}
                                          >
                                            {props.PIFileName === null
                                              ? 'Upload PI'
                                              : props.PIFileName}
                                          </span>
                                        )}
                                        {props.isPIUploading ||
                                        props.PIFileName ? null : (
                                            <FileDownloadIcon
                                              className={classes.fileDownloadIcon}
                                            />
                                          )}
                                      </Button>
                                    </label>
                                  </Fragment>
                                }
                              />
                              <CardContent>
                                <Grid container spacing={16}>
                                  <Grid item xs={12}>
                                    <Grid
                                      container
                                      alignItems="center"
                                      spacing={16}
                                    >
                                      <Grid item xs={12} sm={3}>
                                        <Select
                                          options={billingModes}
                                          value={props.billingMode}
                                          onChange={props.handleSelectBillingModeChange(
                                            'billingMode'
                                          )}
                                          placeholder="Billing Mode *"
                                        />
                                      </Grid>
                                      <Grid item sm={1} />
                                      <Grid item xs={12} sm={3}>
                                        <Select
                                          options={props.billingFrequencies}
                                          value={props.billingFrequency}
                                          onChange={props.handleSelectChange(
                                            'billingFrequency'
                                          )}
                                          placeholder="Billing Frequency *"
                                        />
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Grid
                                      container
                                      alignItems="center"
                                      spacing={8}
                                    >
                                      <Grid item xs={12} sm={3}>
                                        <TextField
                                          fullWidth
                                          id="quantity"
                                          label="Total Device Quantity *"
                                          value={props.totalQuantity}
                                          onChange={props.handleChange(
                                            'totalQuantity'
                                          )}
                                          type="number"
                                          margin="none"
                                        />
                                      </Grid>
                                      <Grid item sm={1} />
                                      <Grid item xs={12} sm={3}>
                                        <TextField
                                          fullWidth
                                          id="amount"
                                          label="MMTC *"
                                          value={props.totalAmount}
                                          onChange={props.handleChange(
                                            'totalAmount'
                                          )}
                                          margin="none"
                                        />
                                      </Grid>
                                      <Grid item sm={1} />
                                      <Grid item xs={12} sm={3}>
                                        <Typography variant="body1">
                                          Total Amount per month (excluding
                                          GST): &nbsp;
                                        </Typography>
                                        <Typography variant="body2">
                                          {console.log(props.grandTotalAmount)}
                                          {isNaN(
                                            parseInt(props.grandTotalAmount, 10)
                                          )
                                            ? '-'
                                            : props.grandTotalAmount}
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Grid container alignItems="center">
                                      <Grid item xs={12} sm={3}>
                                        <TextField
                                          fullWidth
                                          id="salesRemarks"
                                          label="Sales Remarks"
                                          value={props.salesRemarks}
                                          onChange={
                                            props.handleSalesRemarksChange
                                          }
                                          margin="none"
                                        />
                                      </Grid>
                                    </Grid>
                                  </Grid>

                                  <Grid item xs={12}>
                                    <Divider />
                                  </Grid>

                                  <Grid item xs={12}>
                                    <Grid
                                      container
                                      alignItems="baseline"
                                      spacing={8}
                                    >
                                      <Grid item xs={12}>
                                        <Typography variant="body1">
                                          Devices
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12} sm={3}>
                                        <Select
                                          options={deviceModels}
                                          value={props.deviceModel}
                                          onChange={props.handleSelectChange(
                                            'deviceModel'
                                          )}
                                          placeholder="Select Model *"
                                        />
                                      </Grid>
                                      <Grid item sm={1} />
                                      <Grid item xs={12} sm={3}>
                                        <TextField
                                          fullWidth
                                          id="deviceQuantity"
                                          label="Quantity *"
                                          value={props.deviceQuantity}
                                          onChange={props.handleChange(
                                            'deviceQuantity'
                                          )}
                                          type="number"
                                          margin="none"
                                        />
                                      </Grid>
                                    </Grid>
                                  </Grid>

                                  <Grid item xs={12}>
                                    <Divider />
                                  </Grid>

                                  <Grid item xs={12}>
                                    <Grid
                                      container
                                      alignItems="baseline"
                                      spacing={8}
                                    >
                                      <Grid item xs={12}>
                                        <Typography variant="body1">
                                          Accessories
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12} sm={3}>
                                        <Select
                                          options={accessoryModels}
                                          value={props.accessoryModel}
                                          onChange={props.handleSelectChange(
                                            'accessoryModel'
                                          )}
                                          placeholder="Select Type"
                                        />
                                      </Grid>
                                      <Grid item sm={1} />
                                      <Grid item xs={12} sm={3}>
                                        <TextField
                                          fullWidth
                                          id="accessoryQuantity"
                                          label="Quantity"
                                          value={props.accessoryQuantity}
                                          onChange={props.handleChange(
                                            'accessoryQuantity'
                                          )}
                                          type="number"
                                          margin="none"
                                        />
                                      </Grid>
                                    </Grid>
                                  </Grid>

                                  <Grid item xs={12}>
                                    <Divider />
                                  </Grid>

                                  <Grid item xs={12}>
                                    <Grid
                                      container
                                      alignItems="baseline"
                                      spacing={8}
                                    >
                                      <Grid item xs={12}>
                                        <Typography variant="body1">
                                          SIM Cards
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12} sm={3}>
                                        <Select
                                          options={simProviders}
                                          value={props.simModel}
                                          onChange={props.handleSelectChange(
                                            'simModel'
                                          )}
                                          placeholder="Select Provider"
                                        />
                                      </Grid>
                                      <Grid item sm={1} />
                                      <Grid item xs={12} sm={3}>
                                        <TextField
                                          fullWidth
                                          id="simQuantity"
                                          label="Quantity"
                                          value={props.simQuantity}
                                          onChange={props.handleChange(
                                            'simQuantity'
                                          )}
                                          type="number"
                                          margin="none"
                                        />
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </CardContent>
                              <CardActions>
                                <Button
                                  color="secondary"
                                  variant="raised"
                                  onClick={props.handleSaveClick}
                                  disabled={props.isSaveButtonDisabled}
                                >
                                  Save
                                </Button>
                                <Button
                                  color="secondary"
                                  onClick={props.handleCancelClick}
                                >
                                  Cancel
                                </Button>
                              </CardActions>
                            </Card>
                          )
                        }}
                      </Query>
                    )
                  }}
                </Query>
              )
            }}
          </Query>
        )
      }}
    </Query>
  )
}

SubscriptionDetails.PropTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(style)(withApollo(SubscriptionDetails))
