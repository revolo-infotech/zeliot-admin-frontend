import React, { Component, Fragment } from 'react'
import axios from 'axios'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import { withStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import MUIDataTable from 'mui-datatables'
import { Typography, Grid } from '@material-ui/core'
import withRouter from 'react-router-dom/withRouter'

const GET_PROVIDER = gql`
  query {
    allServiceProviders(status: 1) {
      id
      name
    }
  }
`
// calling server for updation
const ASSIGN_SIM = gql`
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

class BulkSimAssign extends Component {
  state = {
    open: false,
    open1: false,
    open2: false,
    simprovider: '',
    isPartnerNameValid: true,
    isSimProviderValid: true,
    partnername: '',
    response: '',
    uploadSucess: false,
    failList: '',
    result: false
  }
  columns = ['Phone Number']

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
  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
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
  handleOpenSelect2 = () => {
    this.setState({ open2: true })
  }
  handleCloseSelect2 = () => {
    this.setState({ open2: false })
  }
  checkSimProviderValidity = () => {
    this.setState({
      isSimProviderValid: this.state.simprovider !== ''
    })
  }
  // handleSubmit = addDevice => e => {
  handleSubmit = client => async event => {
    event.preventDefault()

    const { data, Error } = await client.mutate({
      mutation: ASSIGN_SIM,
      variables: {
        fileInfo: {
          uploadFor: 'SimAssignToPartnerUploadBySuperAdmin',
          bucketName: this.state.bucketName,
          fileName: this.state.fileName,
          operationType: 'SKIP'
        },
        commonInput: {
          partnerLoginId: this.state.partnername,
          serviceProviderId: this.state.simprovider
        }
      }
    })
    let fullData = []

    let arrList = data.excelFileUpload.failedUploadList
    console.log('arr_list', JSON.parse(arrList))
    JSON.parse(arrList).forEach(element => {
      var rowData = []
      // this.clientId.push(element.id)
      rowData.push(element.Phone_Number)

      fullData.push(rowData)
    })

    // this.state.simprovider = ''
    this.setState({
      simprovider: '',
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
    console.log('sim=')

    return (
      <Query query={GET_PROVIDER}>
        {({ loading, error, data }) => {
          const queriedData = data
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`
          return (
            <Query query={GET_PARTNER_DETAILS}>
              {({ loading, error, data }) => {
                const queriedData1 = data
                if (loading) return 'Loading...'
                if (error) return `Error!: ${error}`
                console.log('Data=', queriedData.allPartnerDetails)
                return (
                  <form>
                    <h3>Upload Sim Details</h3>
                    {this.state.uploadSucess && (
                      <Typography variant="subheading" color="primary">
                        {this.state.response}
                      </Typography>
                    )}
                    <FormControl
                      className={classes.formControl}
                      style={{ minWidth: ' 50%' }}
                    >
                      <InputLabel htmlFor="demo-controlled-open-select">
                        Sim Provider
                      </InputLabel>
                      <Select
                        open={this.state.open1}
                        fullWidth
                        onClose={this.handleCloseSelect}
                        onOpen={this.handleOpenSelect}
                        value={this.state.simprovider}
                        onChange={this.handleChange}
                        onBlur={this.checkSimProviderValidity}
                        inputProps={{
                          name: 'simprovider',
                          id: 'simprovider'
                        }}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {/* <MenuItem value={'1'}>Idea</MenuItem>
               <MenuItem value={'2'}>Airtel</MenuItem> */}
                        {queriedData.allServiceProviders.map(
                          allServiceProvidersByStatus => (
                            <MenuItem
                              value={allServiceProvidersByStatus.id}
                              key={allServiceProvidersByStatus.id}
                            >
                              {allServiceProvidersByStatus.name}
                            </MenuItem>
                          )
                        )}
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
                              value={allPartnerDetailsByStatus.login.loginId}
                              key={allPartnerDetailsByStatus.login.loginId}
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
                    <Button onClick={this.handleClose} color="primary">
                      Cancel
                    </Button>
                    <Button
                      onClick={this.handleSubmit(this.props.client)}
                      color="primary"
                      // type="submit"
                      disabled={!this.state.isSimProviderValid}
                    >
                      Submit
                    </Button>
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
                )
              }}
            </Query>
          )
        }}
      </Query>
    )
  }
}
export default withStyles(styles)(withRouter(withApollo(BulkSimAssign)))
