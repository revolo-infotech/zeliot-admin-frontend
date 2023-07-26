import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import gql from 'graphql-tag'
import { withStyles } from '@material-ui/core/styles'
import { ApolloConsumer } from 'react-apollo'
import { Typography } from '@material-ui/core'
import Radio from '@material-ui/core/Radio'
import getLoginId from '../../../../utils/getLoginId'

// calling server for updation
const UPDATE_SIM_STATUS = gql`
  mutation updateSimDetail(
    $id: Int!
    $phoneNumber: String!
    $simNumber: String!
    $ownerLoginId: Int!
    $monthlyCharges: Int!
    $status: Int!
    $service_provider_id: Int!
  ) {
    updateSimDetail(
      id: $id
      phoneNumber: $phoneNumber
      simNumber: $simNumber
      ownerLoginId: $ownerLoginId
      monthlyCharges: $monthlyCharges
      status: $status
      service_provider_id: $service_provider_id
    )
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
    padding: theme.spacing.unit * 2,
    flexGrow: 1
  }
})

class EditStatus extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }

  state = {
    newStatusSelected: false,
    selectedValue: '',
    simStatus: '',
    updateSuccess: false
  }

  handleChange = event => {
    if (event.target.value !== this.props.category) {
      this.setState({
        selectedValue: event.target.value,
        newStatusSelected: true,
        simStatus: event.target.name
      })
    } else {
      this.setState({
        selectedValue: event.target.value,
        newStatusSelected: false,
        simStatus: event.target.name
      })
    }
  }

  updateSimStatus = async () => {
    // console.log(this.props.simId)
    const { data } = await this.props.client.mutate({
      mutation: UPDATE_SIM_STATUS,
      variables: {
        id: this.props.simId,
        phoneNumber: this.props.phoneNumber,
        simNumber: this.props.simNumber,
        ownerLoginId: getLoginId(),
        monthlyCharges: this.props.monthlyCharges,
        status: parseInt(this.state.simStatus, 10),
        service_provider_id: this.props.serviceProviderId
      }
    })

    if (data.updateSimDetail === true) {
      this.setState({ updateSuccess: true, newStatusSelected: false })
    }

    // () => this.props.handleClose()
  }

  componentDidMount() {
    this.setState({ selectedValue: this.props.category })
  }

  render() {
    // SIM Card categories
    let simCategories = [
      {
        category: 'Activated',
        status: 1,
        count: 0,
        installed: 0,
        uninstalled: 0
      },
      {
        category: 'Deactivated',
        status: 0,
        count: 0,
        installed: 0,
        uninstalled: 0
      },
      {
        category: 'Safe Custody',
        status: 99,
        count: 0,
        installed: 0,
        uninstalled: 0
      }
    ]

    let activeCategories = ['Activate', 'Deactivate', 'Safe Custody']
    let status
    if (this.state.updateSuccess === true) {
      status = (
        <Grid item xs={12}>
          <Typography variant="body2" color="primary">
            Update Successful
          </Typography>
        </Grid>
      )
    } else {
      status = null
    }

    return (
      <div>
        <DialogTitle id="form-dialog-title">Edit SIM Status</DialogTitle>
        <DialogContent>
          <Grid container spacing={16} direction="row">
            <Grid item xs={4}>
              <Typography variant="body1">Service Provider:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">
                {this.props.serviceProvider}
              </Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body1">SIM Number:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">{this.props.simNumber}</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body1">Phone Number:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">{this.props.phoneNumber}</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body1">Cost per month:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">
                {this.props.monthlyCharges}
              </Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body1">Current Status:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">{this.props.category}</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body1">Installation Status:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">{this.props.isInstalled}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subheading">Update SIM Status</Typography>
            </Grid>

            {activeCategories.map(category => {
              return (
                <Grid item xs={4} alignItems="center" justify="center">
                  <Typography variant="body1">{category}</Typography>
                </Grid>
              )
            })}

            {simCategories.map(sim => {
              return (
                <Grid item xs={4} alignItems="center">
                  <Radio
                    checked={this.state.selectedValue === sim.category}
                    onChange={this.handleChange}
                    value={sim.category}
                    name={sim.status}
                    aria-label={sim.category}
                  />
                </Grid>
              )
            })}
            {status}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.props.handleClose}
            color="default"
            variant="contained"
          >
            Cancel
          </Button>
          <Button
            onClick={this.updateSimStatus}
            color="primary"
            type="submit"
            variant="contained"
            disabled={!this.state.newStatusSelected}
          >
            Update
          </Button>
        </DialogActions>
      </div>
    )
  }
}

const withApolloClient = Component => props => (
  <ApolloConsumer>
    {client => <Component client={client} {...props} />}
  </ApolloConsumer>
)

export default withStyles(styles)(withApolloClient(EditStatus))
