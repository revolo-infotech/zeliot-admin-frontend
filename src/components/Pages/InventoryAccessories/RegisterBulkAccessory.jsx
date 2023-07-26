import React, { Component, Fragment } from 'react'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import { withStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import Divider from '@material-ui/core/Divider'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import { Typography, Grid } from '@material-ui/core'
import axios from 'axios'
import withRouter from 'react-router-dom/withRouter'
import MUIDataTable from 'mui-datatables'
import getLoginId from '../../../utils/getLoginId'

const GET_ACCESSORY = gql`
  query {
    accessory: getAllAccessoryTypes(status: 1) {
      id
      accessoryName
      version
    }
  }
`

const GET_MANUFACTURER = gql`
  query {
    manufacturers: getAllManufacturer(status: 1) {
      id
      manufacturerName
      manufacturerCode
    }
  }
`

// calling server for updation
const ADD_ACCESSORY = gql`
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

const styles = theme => ({
  button: {
    display: 'block',
    marginTop: theme.spacing.unit * 2
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 2
  }
})

class RegisterBulkAccessory extends Component {
  state = {
    open: false,
    open1: false,
    modelname: '',
    isModelNameValid: false,
    isManufacturerNameValid: false,
    manufacturerName: '',
    open_man: false,
    manufacturerCode: '',
    manufacturerId: '',
    publicUploadURL: '',
    fileName: '',
    bucketName: '',
    isUploading: false,
    uploadSucess: true,
    response: '',
    failList: '',
    result: false,
    isLoading: false
  }
  columns = ['Serial Number']

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    print: false,
    download: false
  }

  handleInputChange = key => e => this.setState({ [key]: e.target.value })

  handleChange = event =>
    this.setState({ [event.target.name]: event.target.value })

  handleOpen = () => this.setState({ open: true })

  handleOpenSelect = () => this.setState({ open1: true })

  handleCloseSelect = () => this.setState({ open1: false })

  handleOpenSelectMan = () => this.setState({ open_man: true })

  handleCloseSelectMan = () => this.setState({ open_man: false })

  checkModelNameValidity = () =>
    this.setState({
      isModelNameValid: this.state.modelname !== ''
    })

  checkManufacturerNameValidity = () => {
    const code = this.state.manufacturerName.split('*')
    this.setState({
      isManufacturerNameValid: this.state.manufacturerName !== '',
      uniqueSerialNumber: code[1] + '_' + this.state.serialno,
      manufacturerId: code[0]
    })
  }

  handleSubmit = client => async event => {
    event.preventDefault()
    this.setState({ isLoading: true })
    let manarr = this.state.manufacturerName.split('*')
    const { data, errors } = await client.mutate({
      mutation: ADD_ACCESSORY,
      variables: {
        fileInfo: {
          uploadFor: 'AccessoryUploadByPartner',
          bucketName: this.state.bucketName,
          fileName: this.state.fileName,
          operationType: 'SKIP'
        },
        commonInput: {
          partnerLoginId: getLoginId(),
          manufacturerId: parseInt(manarr[0], 10),
          manufacturerCode: manarr[1],
          deviceModelId: parseInt(this.state.modelname, 10)
        }
      }
    })
    this.setState({ isLoading: false })
    let fullData = []
    if (data !== null) {
      let arrList = data.excelFileUpload.failedUploadList
      JSON.parse(arrList).forEach(element => {
        let rowData = []
        rowData.push(element.Serial_Number)
        fullData.push(rowData)
      })

      this.setState({
        device_model_id: '',

        manufacturerId: '',
        response:
          'Total Excel Records= ' +
          data.excelFileUpload.totalExcelDataRecords +
          ',' +
          'Total Records Uploaded=' +
          data.excelFileUpload.successfullyUploaded +
          ', Total Records Failed To Upload=' +
          data.excelFileUpload.failedToUpload +
          ', Total Duplicate Records in Excel=' +
          data.excelFileUpload.totalDuplicateRecords,
        uploadSucess: true,
        failList: fullData,
        result: true
      })
    } else {
      this.setState({ response: errors[0].message, uploadSucess: true })
    }
  }

  onUpload = async ({
    target: {
      validity,
      files: [file]
    }
  }) => {
    // TODO: Handle upload errors
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

  render() {
    const { classes } = this.props

    return (
      <Query query={GET_ACCESSORY} fetchPolicy="network-only">
        {({ loading: isModelsLoading, error, data: { accessory } }) => (
          <Query query={GET_MANUFACTURER} fetchPolicy="network-only">
            {({
              loading: isManufacturersLoading,
              error,
              data: { manufacturers }
            }) => {
              if (isModelsLoading || isManufacturersLoading) return null
              if (error) return `Error!: ${error}`
              return (
                <div className={classes.root}>
                  <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="center"
                    spacing={16}
                  >
                    <Grid item xs={12}>
                      <Typography variant="title">
                        {' '}
                        Add Acessory Details
                      </Typography>
                    </Grid>

                    {this.state.uploadSucess && (
                      <Typography variant="subheading" color="primary">
                        {this.state.response}
                      </Typography>
                    )}
                    <Divider light />
                    <form style={{ minWidth: '40%' }}>
                      <FormControl
                        className={classes.formControl}
                        style={{ minWidth: '100%' }}
                      >
                        <InputLabel htmlFor="demo-controlled-open-select">
                          Select Manufacturer
                        </InputLabel>
                        <Select
                          open={this.state.open_man}
                          fullWidth
                          onClose={this.handleCloseSelectMan}
                          onOpen={this.handleOpenSelectMan}
                          value={this.state.manufacturerName}
                          onChange={this.handleChange}
                          onBlur={this.checkManufacturerNameValidity}
                          inputProps={{
                            name: 'manufacturerName',
                            id: 'manufacturerName'
                          }}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {manufacturers.map(manufacturer => (
                            <MenuItem
                              value={
                                manufacturer.id +
                                '*' +
                                manufacturer.manufacturerCode
                              }
                              key={manufacturer.id}
                            >
                              {manufacturer.manufacturerName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl
                        className={classes.formControl}
                        style={{ minWidth: '100%' }}
                      >
                        <InputLabel htmlFor="demo-controlled-open-select">
                          Select Accessory Type
                        </InputLabel>
                        <Select
                          open={this.state.open1}
                          fullWidth
                          onClose={this.handleCloseSelect}
                          onOpen={this.handleOpenSelect}
                          value={this.state.modelname}
                          onChange={this.handleChange}
                          onBlur={this.checkModelNameValidity}
                          inputProps={{
                            name: 'modelname',
                            id: 'modelname'
                          }}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {accessory.map(allDeviceModelsByStatus => (
                            <MenuItem
                              value={allDeviceModelsByStatus.id}
                              key={allDeviceModelsByStatus.id}
                            >
                              {allDeviceModelsByStatus.accessoryName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>{' '}
                      <br />
                      <br />
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
                            <Button
                              variant="contained"
                              component="span"
                              color="primary"
                            >
                              {this.state.isUploading ? (
                                <CircularProgress size={15} />
                              ) : (
                                'Upload'
                              )}
                            </Button>
                          </label>
                        </Fragment>
                      </Grid>
                      <br />
                      <br />
                      <Grid item xs={12}>
                        <Button
                          onClick={() => this.props.history.goBack()}
                          color="default"
                          variant="contained"
                        >
                          Cancel
                        </Button>
                        {'       '}
                        {'       '}
                        <Button
                          onClick={this.handleSubmit(this.props.client)}
                          type="submit"
                          color="primary"
                          variant="contained"
                          disabled={
                            !(
                              this.state.isModelNameValid &&
                              this.state.fileName !== '' &&
                              this.state.isManufacturerNameValid
                            )
                          }
                        >
                          Submit
                        </Button>
                      </Grid>{' '}
                      {this.state.isLoading && (
                        <h3>Excel sheet upload is in progress..</h3>
                      )}
                      {this.state.result && (
                        <Grid item xs={12}>
                          {/* TODO: Replace this with a custom table going forward */}
                          <h5>Failed records list</h5>
                          <MUIDataTable
                            data={this.state.failList}
                            columns={this.columns}
                            options={this.options}
                          />
                        </Grid>
                      )}
                    </form>
                  </Grid>
                </div>
              )
            }}
          </Query>
        )}
      </Query>
    )
  }
}

export default withStyles(styles)(withRouter(withApollo(RegisterBulkAccessory)))
