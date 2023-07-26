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

const GET_MODELS = gql`
  query {
    models: allDeviceModels(status: 1) {
      id
      model_name
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
const ASSIGN_DEVICE = gql`
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
const GET_PARTNER_DETAILS = gql`
  query {
    allPartnerDetails(status: 1) {
      id
      businessName
      login {
        loginId
      }
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
  }
})

class BulkDeviceAssign extends Component {
  state = {
    open: false,
    open1: false,
    modelname: '',
    isModelNameValid: true,
    isManufacturerNameValid: true,
    manufacturerName: '',
    open_man: false,
    manufacturerCode: '',
    manufacturerId: '',
    publicUploadURL: '',
    fileName: '',
    bucketName: '',
    isUploading: false,
    partnername: '',
    open2: false,
    uploadSucess: true,
    response: '',
    failList: '',
    result: false
  }
  columns = ['Serial Number']

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,

    // sort: false,
    filter: false,
    //  search: false,
    print: false,
    download: false
    // viewColumns: false,
    // pagination: false
  }
  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }
  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleOpen = () => {
    this.setState({ open: true })
  }

  handleOpenSelect = () => {
    this.setState({ open1: true })
  }
  handleCloseSelect = () => {
    this.setState({ open1: false })
  }
  handleOpenSelectMan = () => {
    this.setState({ open_man: true })
  }
  handleCloseSelectMan = () => {
    this.setState({ open_man: false })
  }
  handleOpenSelect2 = () => {
    this.setState({ open2: true })
  }
  handleCloseSelect2 = () => {
    this.setState({ open2: false })
  }

  checkModelNameValidity = () => {
    this.setState({
      isModelNameValid: this.state.modelname !== ''
    })
  }
  checkManufacturerNameValidity = () => {
    console.log(this.state.manufacturerName)
    const code = this.state.manufacturerName.split('*')
    console.log('man', code[0])
    this.setState({
      isManufacturerNameValid: this.state.manufacturerName !== '',
      // manufacturerCode:this
      uniqueSerialNumber: code[1] + '_' + this.state.serialno,
      manufacturerId: code[0]
    })
  }

  // handleSubmit = addDevice => e => {
  handleSubmit = client => async event => {
    event.preventDefault()
    console.log(
      'click fun',
      this.state.manufacturerName,
      this.state.manufacturerCode,
      this.state.modelname
    )
    // let manarr = this.state.manufacturerName.split('*')

    const { data, Error } = await client.mutate({
      mutation: ASSIGN_DEVICE,
      variables: {
        fileInfo: {
          uploadFor: 'DeviceAssignToPartnerUploadBySuperAdmin',
          bucketName: this.state.bucketName,
          fileName: this.state.fileName,
          operationType: 'SKIP'
        },
        commonInput: {
          partnerLoginId: this.state.partnername,
          deviceModelId: this.state.modelname
        }
      }
    })
    let fullData = []

    let arrList = data.excelFileUpload.failedUploadList
    console.log('arr_list', JSON.parse(arrList))
    JSON.parse(arrList).forEach(element => {
      var rowData = []
      // this.clientId.push(element.id)
      rowData.push(element.Device_Serial_Number)
      fullData.push(rowData)
    })
    // this.state.simprovider = ''
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
    console.log('res=', data, Error)
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
      console.log('response', response)
      if (response.data && response.data.getPublicUploadURL) {
        const url = response.data.getPublicUploadURL.publicUploadURL
        const res = await axios.put(url, file)
        console.log('upload', res)
        this.setState({
          fileName: response.data.getPublicUploadURL.filename,
          bucketName: response.data.getPublicUploadURL.bucketName,
          publicUploadURL: response.data.getPublicUploadURL.publicUploadURL
        })
      }
    }
    // console.log('final',
    //   this.state.bucketName,
    //   this.state.fileName,
    //   this.state.publicUploadURL
    // )
    this.setState({ isUploading: false })
  }
  render() {
    const { classes } = this.props
    console.log('MIDhere=')

    return (
      <Query query={GET_MODELS}>
        {({ loading: isModelsLoading, error, data: { models } }) => (
          <Query query={GET_MANUFACTURER}>
            {({
              loading: isManufacturersLoading,
              error,
              data: { manufacturers }
            }) => {
              if (isModelsLoading || isManufacturersLoading) return null
              if (error) return `Error!: ${error}`
              return (
                <Query query={GET_PARTNER_DETAILS}>
                  {({ loading, error, data }) => {
                    const queriedData1 = data
                    if (loading) return 'Loading...'
                    if (error) return `Error!: ${error}`
                    console.log('Data=', queriedData1.allPartnerDetails)
                    return (
                      <div>
                        Assign Device Details :
                        {this.state.uploadSucess && (
                          <Typography variant="subheading" color="primary">
                            {this.state.response}
                          </Typography>
                        )}
                        <Divider light />
                        <form>
                          {/* <FormControl
                            className={classes.formControl}
                            style={{ minWidth: '60%' }}
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
                          </FormControl> */}
                          <FormControl
                            className={classes.formControl}
                            style={{ minWidth: '60%' }}
                          >
                            <InputLabel htmlFor="demo-controlled-open-select">
                              Select Model
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
                              {models.map(allDeviceModelsByStatus => (
                                <MenuItem
                                  value={allDeviceModelsByStatus.id}
                                  key={allDeviceModelsByStatus.id}
                                >
                                  {allDeviceModelsByStatus.model_name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl
                            className={classes.formControl}
                            style={{ minWidth: '50%' }}
                          >
                            <InputLabel htmlFor="demo-controlled-open-select">
                              Select Partner
                            </InputLabel>
                            <Select
                              open={this.state.open2}
                              onClose={this.handleCloseSelect2}
                              onOpen={this.handleOpenSelect2}
                              fullWidth
                              placeholder="a"
                              name="Select Partner"
                              value={this.state.partnername}
                              onChange={this.handleChange}
                              error={!this.state.isPartnerNameValid}
                              onBlur={this.checkPartnerNameValidity}
                              inputProps={{
                                name: 'partnername',
                                id: 'partnername'
                              }}
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              {queriedData1.allPartnerDetails.map(
                                allPartnerDetailsByStatus => (
                                  <MenuItem
                                    value={
                                      allPartnerDetailsByStatus.login.loginId
                                    }
                                    key={
                                      allPartnerDetailsByStatus.login.loginId
                                    }
                                  >
                                    {allPartnerDetailsByStatus.businessName}
                                  </MenuItem>
                                )
                              )}
                              {/* <MenuItem value={10}>Ten</MenuItem>
                              <MenuItem value={20}>Twenty</MenuItem>
                              <MenuItem value={30}>Thirty</MenuItem> */}
                            </Select>
                          </FormControl>
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
                                <Button variant="contained" component="span">
                                  {this.state.isUploading ? (
                                    <CircularProgress size={15} />
                                  ) : (
                                    'Upload'
                                  )}
                                </Button>
                              </label>
                            </Fragment>
                          </Grid>
                          <Grid item xs={12}>
                            <Button
                              onClick={this.handleClose}
                              color="default"
                              variant="contained"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={this.handleSubmit(this.props.client)}
                              type="submit"
                              color="primary"
                              variant="contained"
                              disabled={!this.state.isModelNameValid}
                            >
                              Submit
                            </Button>
                          </Grid>
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
                      </div>
                    )
                  }}
                </Query>
              )
            }}
          </Query>
        )}
      </Query>
    )
  }
}

export default withStyles(styles)(withRouter(withApollo(BulkDeviceAssign)))
