import React, { Component } from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import moment from 'moment'
import Select from 'react-select'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'

const GET_PARTNER_CLIENT_LIST = gql`
  query allClientDetails($status: Int, $superAdmin: Boolean) {
    clients: allClientDetails(status: $status, superAdmin: $superAdmin) {
      loginId
      clientName
    }
  }
`
const CLEAR_CACHE = gql`
  query publishMQTTUsingClientLoginId($clientLoginId: Int!) {
    publishMQTTUsingClientLoginId(clientLoginId: $clientLoginId)
  }
`

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  iconSmall: {
    fontSize: 20
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  dense: {
    marginTop: 16
  }
})

class ClearRedis extends Component {
  state = {
    clientname: '',
    response: '',
    clientNames: []
  }

  clearCache = async () => {
    const { data } = await this.props.client.query({
      query: CLEAR_CACHE,
      variables: {
        clientLoginId: parseInt(this.state.clientname, 10)
      }
    })

    if (data.publishMQTTUsingClientLoginId === true) {
      this.setState({ response: 'Cache Cleared Successfully' })
    } else {
      this.setState({ response: 'Request Failed' })
    }

    this.props.openSnackbar(this.state.response)
  }

  getFormattedDate = timestamp =>
    moment(timestamp * 1000).format('MMM Do YYYY, h:mm a')

  handleChange = async event => {
    this.setState({ clientname: event.value })
  }

  getClients = async () => {
    const { data } = await this.props.client.query({
      query: GET_PARTNER_CLIENT_LIST,
      variables: {
        status: 1,
        superAdmin: true
      },
      fetchPolicy: 'network-only'
    })

    const allClients = data.clients.map(client => ({
      value: client.loginId,
      label: client.clientName
    }))
    this.setState({ clientNames: allClients })
  }

  componentDidMount() {
    this.getClients(this.props.client)
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <Typography variant="subtitle1" gutterBottom>
          <h2>Clear Redis</h2>
        </Typography>
        <Grid container spacing={16}>
          <Grid item xs={3}>
            <Select
              classes={classes}
              options={this.state.clientNames}
              // components={components}
              value={this.state.clientname}
              onChange={this.handleChange}
              placeholder="Select Client"
            />
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={this.clearCache}
              disabled={this.state.clientname === ''}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(withApollo(withSharedSnackbar(ClearRedis)))
