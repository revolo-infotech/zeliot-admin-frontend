import React, { Component, Fragment } from 'react'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import { withStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import { Typography, Grid } from '@material-ui/core'
import axios from 'axios'
import withRouter from 'react-router-dom/withRouter'
import getLoginId from '../../../../../utils/getLoginId'

const GET_PROVIDER = gql`
  query {
    allServiceProviders(status: 1) {
      id
      name
    }
  }
`
// calling server for updation
const ADD_SIM = gql`
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

class RegisterBulkSim extends Component {
  state = {
    open: false,
    open1: false,
    simprovider: '',
    uploadSucess: true,
    isSimProviderValid: false,
    response: '',
    failList: '',
    result: false,
    fileName: ''
  }
  columns = ['Phone Number', 'SIM Number', 'Monthly Charges']

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,

    print: false,
    download: false
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
  checkSimProviderValidity = () => {
    this.setState({
      isSimProviderValid: this.state.simprovider !== ''
    })
  }
  // handleSubmit = addDevice => e => {
  handleSubmit = client => async event => {
    event.preventDefault()

    const { data } = await client.mutate({
      mutation: ADD_SIM,
      variables: {
        fileInfo: {
          uploadFor: 'SimUploadByPartner',
          bucketName: this.state.bucketName,
          fileName: this.state.fileName,
          operationType: 'SKIP'
        },
        commonInput: {
          partnerLoginId: getLoginId(),
          serviceProviderId: this.state.simprovider
        }
      }
    })

    let fullData = []

    let arrList = data.excelFileUpload.failedUploadList

    JSON.parse(arrList).forEach(element => {
      var rowData = []
      // this.clientId.push(element.id)
      rowData.push(element.Phone_Number)
      rowData.push(element.Phone_Number)
      rowData.push(element.Monthly_Charges)
      fullData.push(rowData)
    })

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
      <Query query={GET_PROVIDER}>
        {({ loading, error, data }) => {
          const queriedData = data
          if (loading) return 'Loading...'
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
                  <Typography variant="headline">Select SIM Details</Typography>
                </Grid>
                <form style={{ minWidth: '40%' }}>
                  {this.state.uploadSucess && (
                    <Typography variant="subheading" color="primary">
                      {this.state.response}
                    </Typography>
                  )}
                  <FormControl
                    className={classes.formControl}
                    style={{ minWidth: ' 60%' }}
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
                  <Button
                    onClick={this.handleClose}
                    color="default"
                    variant="contained"
                  >
                    Cancel
                  </Button>
                  &nbsp; &nbsp;
                  <Button
                    onClick={this.handleSubmit(this.props.client)}
                    color="primary"
                    type="submit"
                    variant="contained"
                    disabled={
                      !(
                        this.state.isSimProviderValid &&
                        this.state.fileName !== ''
                      )
                    }
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
              </Grid>
            </div>
          )
        }}
      </Query>
    )
  }
}

export default withStyles(styles)(withRouter(withApollo(RegisterBulkSim)))
