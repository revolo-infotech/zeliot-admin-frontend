import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import gql from 'graphql-tag'
import MUIDataTable from 'mui-datatables'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withApollo } from 'react-apollo'

const GET_PLAN_COUNT = gql`
  query {
    provider: allServiceProviders(status: 1) {
      id
      name
    }
  }
`
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
  }
})

class PlanCount extends Component {
  constructor(props) {
    super(props)
    this.state = {
      licenseName: 'Aquila Basic'
    }
  }

  fullData = []
  columns = []
  options = {}

  getAllPlansCount = async () => {
    this.fullData = []
    this.columns = ['EXPIRY DATE', 'AVL QUANTITY', 'SELECT QUANTITY']

    this.options = {
      selectableRows: false,
      responsive: 'scroll',
      rowsPerPage: 10
    }
    const response = await this.props.client.query({
      query: GET_PLAN_COUNT
    })
    if (response.data) {
      var rowData = []
      response.data.provider.forEach(element => {
        rowData = []
        rowData.push(element.id)
        rowData.push(element.name)
        rowData.push(
          <TextField
            id={element.name}
            name={element.name}
            className="textfield"
            margin="dense"
            label="Plan Name"
            type="text"
          />
        )
        this.fullData.push(rowData)
      })
    }
  }

  componentDidMount() {
    this.getAllPlansCount()
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <form>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <h4>Assign License</h4>
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
            >
              Submit
            </Button>
          </Grid>
          <MUIDataTable
            title={this.state.licenseName}
            data={this.fullData}
            columns={this.columns}
            options={this.options}
          />
        </form>
      </div>
    )
  }
}

export default withStyles(styles)(withApollo(PlanCount))
