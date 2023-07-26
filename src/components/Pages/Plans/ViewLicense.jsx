import React, { Component, Fragment } from 'react'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import { Typography } from '@material-ui/core'
import MUIDataTable from 'mui-datatables'
import Grid from '@material-ui/core/Grid'
import EditLicense from './EditLicense.jsx'

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
  },
  button: {
    display: 'block',
    marginTop: theme.spacing.unit * 2
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  }
})
const GET_ALL_LICENSE_TYPE = gql`
  query getAllLicenseType($status: Int) {
    getAllLicenseType(status: $status) {
      id
      licenseType
      description
      featureList {
        id
        featureName
        costPerAssetPerMonth
        featureDescription
      }
      maxPrice
    }
  }
`

const GET_LICENCE_BY_ID = gql`
  query getLicenseType($id: Int!) {
    getLicenseType(id: $id) {
      licenseType
      description
      maxPrice
      featureList {
        id
      }
    }
  }
`

class ViewLicense extends Component {
  state = {
    licenceArr: [],
    renderArr: [],
    licenseDetails: [],
    modelStatus: false,
    lId: ''
  }
  getAllLicenses = async () => {
    console.log('hi')
    const licenses = await this.props.client.query({
      query: GET_ALL_LICENSE_TYPE,
      variables: {
        status: 1
      }
    })

    if (licenses && licenses.data) {
      this.mapToArr(licenses.data.getAllLicenseType)
    }
  }
  componentDidMount() {
    this.getAllLicenses()
  }

  columns = ['LICENSE NAME', 'DESCRIPTION', 'MAX PRICE', 'EDIT']
  mapToArr(licenses) {
    var rowData = []
    this.fullData = []
    this.loginId = []
    licenses.forEach(element => {
      rowData = []
      rowData.push(element.licenseType)
      rowData.push(element.description)
      rowData.push(element.maxPrice)
      rowData.push(
        <Button onClick={this.editLicenceInfo(element.id)}>Edit</Button>
      )
      this.fullData.push(rowData)
    })
    this.setState({ renderArr: this.fullData })
  }

  createPlan = e => {
    this.props.history.push({
      pathname: '/home/CreatePlan'
    })
  }
  editLicenceInfo = licenseId => async () => {
    console.log('licenseId=', licenseId)
    const { data } = await this.props.client.query({
      query: GET_LICENCE_BY_ID,
      variables: {
        id: parseInt(licenseId, 10)
      }
    })
    console.log(data)
    this.setState(
      { licenseDetails: data, modelStatus: true, lId: licenseId },
      () => {
        console.log(this.state.licenseDetails, this.state.modelStatus)
        console.log('lId4=', this.state.lId)
        // this.state.modelDetails.deviceModel.map(element =>
        //   console.log('sdsdsds= ', element.model_name)
        // )
      }
    )
  }
  closeEditModel = () => {
    this.setState({ modelStatus: false })
  }
  render() {
    console.log('this.state.licenseDetails1=', this.state.licenseDetails)
    const { classes } = this.props
    return (
      <Fragment>
        <div className={classes.root}>
          <Grid container spacing={16} direction="row">
            <Grid
              item
              container
              spacing={16}
              direction="row-reverse"
              justify="space-between"
            >
              <Grid item>
                <Button
                  onClick={this.createPlan}
                  variant="raised"
                  color="secondary"
                >
                  Create License
                </Button>
                {'  '}
              </Grid>
              <Grid item>
                <Typography variant="headline">Licences</Typography>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              {/* TODO: Replace this with a custom table going forward */}
              <MUIDataTable
                data={this.state.renderArr}
                columns={this.columns}
                // options={this.options}
              />
            </Grid>
            {this.state.modelStatus === true && (
              <EditLicense
                licenseInfo={this.state.licenseDetails}
                openStatus={this.state.modelStatus}
                closeEditModelFunction={this.closeEditModel}
                selectedId={this.state.lId}
              />
            )}
          </Grid>
        </div>
      </Fragment>
    )
  }
}

export default withStyles(styles)(withApollo(ViewLicense))
