import React, { Component, Fragment } from 'react'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import { Typography } from '@material-ui/core'
import MUIDataTable from 'mui-datatables'
import Grid from '@material-ui/core/Grid'
import ViewLicenseInfo from './ViewLicense/ViewLicenseInfo.jsx'
import getLoginId from '../../../../utils/getLoginId'
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
  query getAllLicenseTypeResellerAssignDetails($resellerLoginId: Int!) {
    allPlans: getAllLicenseTypeResellerAssignDetails(
      resellerLoginId: $resellerLoginId
    ) {
      id
      licenseType {
        licenseType
        description
        maxPrice
      }
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

class License extends Component {
  state = {
    licenceArr: [],
    renderArr: [],
    licenseDetails: [],
    modelStatus: false,
    lId: ''
  }

  getAllLicenses = async () => {
    const licenses = await this.props.client.query({
      query: GET_ALL_LICENSE_TYPE,
      variables: {
        resellerLoginId: getLoginId()
      }
    })

    if (licenses && licenses.data) {
      this.mapToArr(licenses.data.allPlans)
    }
  }

  componentDidMount() {
    this.getAllLicenses()
  }

  columns = ['LICENSE NAME', 'DESCRIPTION', 'MAX PRICE', 'VIEW']

  mapToArr(licenses) {
    let rowData = []
    this.fullData = []
    this.loginId = []

    licenses.forEach(element => {
      rowData = []
      rowData.push(element.licenseType.licenseType)
      rowData.push(element.licenseType.description)
      rowData.push(element.licenseType.maxPrice)
      rowData.push(<Button onClick={this.viewLicenceDetails(12)}>VIEW</Button>)
      this.fullData.push(rowData)
    })

    this.setState({ renderArr: this.fullData })
  }

  createPlan = e => {
    this.props.history.push({
      pathname: '/home/CreatePlan'
    })
  }

  viewLicenceDetails = licenseId => async () => {
    const { data } = await this.props.client.query({
      query: GET_LICENCE_BY_ID,
      variables: {
        id: parseInt(licenseId, 10)
      }
    })

    this.setState({ licenseDetails: data, modelStatus: true, lId: licenseId })
  }

  closeEditModel = () => {
    this.setState({ modelStatus: false })
  }

  render() {
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
                <Typography variant="headline">Licences</Typography>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              {/* TODO: Replace this with a custom table going forward */}
              <MUIDataTable
                data={this.state.renderArr}
                columns={this.columns}
              />
            </Grid>
            {this.state.modelStatus === true && (
              <ViewLicenseInfo
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

export default withStyles(styles)(withApollo(License))
