import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Modal from '@material-ui/core/Modal'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import withSharedSnackbar from '../../../../HOCs/withSharedSnackbar'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import { Checkbox } from '@material-ui/core'
import FormControlLabel from '@material-ui/core/FormControlLabel'

const GET_ALL_FEATURES = gql`
  query {
    features: allFeatures(status: 1) {
      id
      featureName
      costPerAssetPerMonth
      featureDescription
    }
  }
`

function getModalStyle() {
  const top = 50
  const left = 50
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`
  }
}

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 100,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4
  }
})

class ViewLicenseInfo extends React.Component {
  constructor(props) {
    super(props)
    this.licenseInformation = this.props.licenseInfo
    console.log(
      'this.featureList2323= ',
      this.licenseInformation.getLicenseType
    )
    this.mapToArr(this.licenseInformation.getLicenseType.featureList)
    this.state = {
      licenseType: this.licenseInformation.getLicenseType.licenseType,
      description: this.licenseInformation.getLicenseType.description,
      maxPrice: this.licenseInformation.getLicenseType.maxPrice,
      licenseId: this.props.selectedId,
      open1: false,
      isLicenseNameValid: true,
      featureList: this.licenseInformation.getLicenseType.featureList,
      checkListArr: ''
    }
  }
  checkedlist = []
  mapToArr(feature) {
    // let checkedlist = []
    feature.forEach(element => {
      this.checkedlist[element.id] = true
    })
    console.log('checkedlist', this.checkedlist)
  }
  checkModelNameValidity = () => {
    const regex = new RegExp(
      // eslint-disable-next-line
      /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{2,}$/
    )
    this.setState({
      isModelNameValid:
        regex.test(this.state.modelname) || this.state.modelname === ''
    })
  }
  checkmaxPriceValidity = () => {
    const regex = new RegExp(/^[0-9]{2,4}$/)
    this.setState({
      ismaxPriceValid:
        regex.test(this.state.maxPrice) || this.state.maxPrice === ''
    })
  }
  checkVersionValidity = () => {
    const regex = new RegExp(
      // eslint-disable-next-line
      // 1-3 dot-separated components, each numeric except that the last one may be *
      /^(\d+\.)?(\d+\.)?(\*|\d+)$/
    )
    this.setState({
      isVersionValid:
        regex.test(this.state.version) || this.state.version === ''
    })
  }
  checkDeviceTypeValidity = () => {
    this.setState({
      isDeviceTypeValid: this.state.devicetype !== ''
    })
  }
  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }
  handleOpenSelect = () => {
    this.setState({ open1: true })
  }
  handleCloseSelect = () => {
    this.setState({ open1: false })
  }
  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }
  render() {
    const { classes } = this.props
    return (
      <div>
        <Button>Edit</Button>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.props.openStatus}
          // onClose={this.handleClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <DialogContent>
              <FormControl
                className={classes.formControl}
                style={{ minWidth: '100%' }}
              >
                <TextField
                  margin="dense"
                  id="licenseType"
                  name="licenseType"
                  label="License Name"
                  type="text"
                  required
                  value={this.state.licenseType}
                  fullWidth
                  onChange={this.handleInputChange('licenseType')}
                />
              </FormControl>
              <FormControl
                className={classes.formControl}
                style={{ minWidth: '100%' }}
              >
                <TextField
                  margin="dense"
                  id="description"
                  label="Description"
                  type="text"
                  required
                  // fullWidth
                  value={this.state.description}
                  onChange={this.handleInputChange('description')}
                />
              </FormControl>
              <FormControl
                className={classes.formControl}
                style={{ minWidth: '100%' }}
              >
                <TextField
                  margin="dense"
                  id="maxPrice"
                  label="Max Price"
                  type="text"
                  required
                  // fullWidth
                  value={this.state.maxPrice}
                  onChange={this.handleInputChange('maxPrice')}
                  error={!this.state.maxPrice}
                  onBlur={this.checkmaxPriceValidity}
                />
              </FormControl>
              <br />
              <Typography variant="title">Features</Typography>
              <Query query={GET_ALL_FEATURES}>
                {({ loading, error, data: { features } }) => {
                  console.log('data', features)
                  if (loading) return 'Loading...'
                  if (error) return `Error!: ${error}`
                  return (
                    <div>
                      <Grid
                        item
                        container
                        spacing={8}
                        direction="row"
                        justify="flex-start"
                        alignItems="flex-start"
                      >
                        {features &&
                          features.map(featuresList => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={
                                    /* eslint-disable */
                                    this.checkedlist[featuresList.id] || false
                                    /* eslint-enable */
                                  }
                                />
                              }
                              label={featuresList.featureName}
                            />
                          ))}
                      </Grid>
                    </div>
                  )
                }}
              </Query>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={this.props.closeEditModelFunction}
                color="default"
                variant="contained"
              >
                Close
              </Button>
            </DialogActions>
          </div>
        </Modal>
      </div>
    )
  }
}

ViewLicenseInfo.propTypes = {
  classes: PropTypes.object.isRequired
}

// We need an intermediary variable for handling the recursive nesting.
export default withStyles(styles)(
  withSharedSnackbar(withApollo(ViewLicenseInfo))
)
