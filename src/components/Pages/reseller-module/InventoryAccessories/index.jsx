import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import MenuIcon from '@material-ui/icons/Menu'
import Dialog from '@material-ui/core/Dialog'
import RegisterAccessory from './RegisterAccessory'
import FileSaver from 'file-saver'
import getLoginId from '../../../../utils/getLoginId'

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  iconSmall: {
    fontSize: 20
  }
})

const GET_ACCESSORY_STOCK = gql`
  query getPartnerAccessoryStockByAccessoryType($partnerLoginId: Int!) {
    accessory: getPartnerAccessoryStockByAccessoryType(
      partnerLoginId: $partnerLoginId
    ) {
      accessoryTypeName
      availableStock
      totalAssignedAccessory
    }
  }
`
const GET_FILE_FORMAT = gql`
  query getPublicDownloadURL($bucketname: String!, $filename: String!) {
    getPublicDownloadURL(bucketName: $bucketname, filename: $filename)
  }
`
class InventoryDevices extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }
  clientId = []

  columns = ['MODEL NAME', 'TOTAL QUANTITY', 'AVAILABLE STOCK']

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15
  }

  state = {
    open: false
  }

  mapToArr(devices) {
    var rowData = []
    var fullData = []
    // this.clientId = []
    devices.forEach(element => {
      rowData = []
      // this.clientId.push(element.id)
      rowData.push(element.accessoryTypeName)
      rowData.push(element.totalAssignedAccessory)
      rowData.push(element.availableStock)
      fullData.push(rowData)
    })

    return fullData
  }
  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }
  addBulkUpload = e => {
    this.props.history.push({
      pathname: '/home/reseller/accessories/bulk-register'
    })
  }
  downloadBulkUpload = client => async event => {
    const { data } = await client.query({
      query: GET_FILE_FORMAT,
      variables: {
        bucketname: 'excel-templates',
        filename: 'deviceUpload.xlsx'
      },
      errorPolicy: 'all'
    })

    FileSaver.saveAs(data.getPublicDownloadURL, 'sample.xlsx')
  }
  render() {
    const { classes } = this.props
    return (
      <Query
        query={GET_ACCESSORY_STOCK}
        variables={{
          partnerLoginId: getLoginId()
        }}
      >
        {({ loading, error, data: { accessory } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`
          const data = this.mapToArr(accessory)

          return (
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
                      color="secondary"
                      variant="contained"
                      className={classes.button}
                      onClick={this.handleClickOpen}
                    >
                      New Accessory
                    </Button>
                    {'  '}
                    <Button
                      color="secondary"
                      variant="contained"
                      className={classes.button}
                      onClick={this.addBulkUpload}
                    >
                      Bulk Upload
                    </Button>{' '}
                    <Button
                      color="secondary"
                      variant="contained"
                      className={classes.button}
                      onClick={this.downloadBulkUpload(this.props.client)}
                    >
                      Download Format
                    </Button>{' '}
                    <Button variant="outlined" className={classes.button}>
                      <MenuIcon className={classes.iconSmall} />
                    </Button>
                  </Grid>
                  <Grid item>
                    <Typography variant="headline">Accessories</Typography>
                  </Grid>
                </Grid>
                <Dialog
                  open={this.state.open}
                  onClose={this.handleClose}
                  aria-labelledby="form-dialog-title"
                >
                  <RegisterAccessory handleClose={this.handleClose} />
                </Dialog>
                <Grid item xs={12}>
                  <MUIDataTable
                    data={data}
                    columns={this.columns}
                    options={this.options}
                  />
                </Grid>
              </Grid>
            </div>
          )
        }}
      </Query>
    )
  }
}

export default withStyles(style)(withApollo(InventoryDevices))
