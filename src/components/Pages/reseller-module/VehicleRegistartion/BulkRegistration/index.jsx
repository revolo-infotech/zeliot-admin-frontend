import React, { Component, Fragment } from 'react'
import Button from '@material-ui/core/Button'
import gql from 'graphql-tag'
import Grid from '@material-ui/core/Grid'
import { Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import withSharedSnackbar from '../../../../HOCs/withSharedSnackbar'
import Select from 'react-select'
import CircularProgress from '@material-ui/core/CircularProgress'
import axios from 'axios'
import { withApollo } from 'react-apollo'
import getLoginId from '../../../../../utils/getLoginId'

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    flexGrow: 1
  }
})

const GET_MANUFACTURERS = gql`
  query {
    manufacturers: getAllManufacturer(status: 1) {
      id
      manufacturerName
      manufacturerCode
    }
  }
`

const GET_CLIENTS = gql`
  query allClientDetails($partnerLoginId: Int) {
    clientsDetails: allClientDetails(partnerLoginId: $partnerLoginId) {
      clientName
      loginId
    }
  }
`

const ADD_VEHICLES = gql`
  mutation excelFileUpload(
    $fileInfo: FileUploadInput!
    $commonInput: CommonInput!
  ) {
    excelFileUpload(fileInfo: $fileInfo, commonInput: $commonInput) {
      failedToUpload
      totalExcelDataRecords
      totalDuplicateRecords
      successfullyUploaded
      failedUploadList
    }
  }
`

const GET_UPLOAD_URL = gql`
  mutation($fileExtension: String!) {
    getPublicUploadURL(fileExtension: $fileExtension) {
      bucketName
      filename
      publicUploadURL
    }
  }
`

class VehicleRegistration extends Component {
  state = {
    clients: [],
    manufacturers: [],
    client: { value: null, label: null },
    manufacturer: { value: null, label: null, code: null },
    isUploading: false,
    fileName: '',
    bucketName: '',
    publicUploadURL: '',
    response: ''
  }

  async componentDidMount() {
    let data = await this.props.client.query({
      query: GET_CLIENTS,
      variables: {
        partnerLoginId: getLoginId()
      }
    })

    const allClients = data.data.clientsDetails.map(client => ({
      value: client.loginId,
      label: client.clientName
    }))

    data = await this.props.client.query({
      query: GET_MANUFACTURERS
    })

    const allManufacturers = data.data.manufacturers.map(manufacturer => ({
      value: manufacturer.id,
      label: manufacturer.manufacturerName,
      code: manufacturer.manufacturerCode
    }))

    this.setState({
      clients: allClients,
      manufacturers: allManufacturers
    })
  }

  handleSelectChange = name => value => {
    this.setState({ [name]: value })
  }

  onUpload = async ({
    target: {
      validity,
      files: [file]
    }
  }) => {
    this.setState({ isUploading: true })
    if (validity.valid) {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1)

      const response = await this.props.client.mutate({
        mutation: GET_UPLOAD_URL,
        variables: {
          fileExtension
        }
      })

      if (response.data && response.data.getPublicUploadURL) {
        const url = response.data.getPublicUploadURL.publicUploadURL
        await axios.put(url, file)
        this.setState({
          fileName: response.data.getPublicUploadURL.filename,
          bucketName: response.data.getPublicUploadURL.bucketName,
          publicUploadURL: response.data.getPublicUploadURL.publicUploadURL
        })
      }
    }
    this.setState({ isUploading: false })
  }

  handleSubmit = async event => {
    const { data } = await this.props.client.mutate({
      mutation: ADD_VEHICLES,
      variables: {
        fileInfo: {
          uploadFor: 'VehicleUpload',
          bucketName: this.state.bucketName,
          fileName: this.state.fileName,
          operationType: 'SKIP'
        },
        commonInput: {
          clientLoginId: this.state.client.value,
          partnerLoginId: getLoginId(),
          manufacturerCode: this.state.manufacturer.code
        }
      }
    })

    let fullData = []

    let arrList = data.excelFileUpload.failedUploadList

    JSON.parse(arrList).forEach(element => {
      var rowData = []
      rowData.push(element.Serial_Number)
      rowData.push(element.IMEI)

      fullData.push(rowData)
    })

    this.setState({
      response:
        'Total Excel Records= ' +
        data.excelFileUpload.totalExcelDataRecords +
        ',' +
        'Total Records Uploaded=' +
        data.excelFileUpload.successfullyUploaded +
        ', Total Records Failed To Upload=' +
        data.excelFileUpload.failedToUpload +
        ', Total Duplicate Records in Excel=' +
        data.excelFileUpload.totalDuplicateRecords
    })
  }

  handleCancel = event => {
    this.props.history.goBack()
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <Grid container spacing={16} direction="row">
          <Grid item xs={12}>
            <Typography variant="headline">Bulk Device Registration</Typography>
          </Grid>

          {/* Customer Select */}
          <Grid container item xs={12} direction="row">
            <Grid item xs={4}>
              <Select
                classes={classes}
                options={this.state.clients}
                value={this.state.client.value}
                onChange={this.handleSelectChange('client')}
                placeholder="Select Customer"
              />
            </Grid>
          </Grid>

          {/* Manufacturer Select */}
          <Grid container item xs={12} direction="row">
            <Grid item xs={4}>
              <Select
                classes={classes}
                options={this.state.manufacturers}
                value={this.state.manufacturer.value}
                onChange={this.handleSelectChange('manufacturer')}
                placeholder="Select Manufacturer"
              />
            </Grid>
          </Grid>

          {/* Upload Button */}
          <Grid item xs={12}>
            <Fragment>
              <input
                accept="*/*"
                id="contained-button-file"
                multiple
                type="file"
                style={{
                  display: 'none'
                }}
                onChange={this.onUpload}
              />
              <label htmlFor="contained-button-file">
                Upload excel file here &nbsp;
                <Button variant="contained" component="span" color="primary">
                  {this.state.isUploading ? (
                    <CircularProgress size={15} />
                  ) : (
                    'Upload'
                  )}
                </Button>
              </label>
            </Fragment>
          </Grid>

          {/* Submit and Cancel Button */}
          <Grid item container spacing={16} direction="row">
            <Grid item>
              <Button
                color="secondary"
                variant="raised"
                onClick={this.handleSubmit}
              >
                Submit
              </Button>
            </Grid>
            <Grid item>
              <Button
                color="primary"
                variant="raised"
                onClick={this.handleCancel}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography>{this.state.response}</Typography>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(
  withApollo(withSharedSnackbar(VehicleRegistration))
)
