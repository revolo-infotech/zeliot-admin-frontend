import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Chip from '@material-ui/core/Chip'
import gql from 'graphql-tag'
import Query from 'react-apollo/Query'

const GET_ALL_LICENCES = gql`
  query {
    getAllLicenseType(status: 1) {
      id
      licenseType
    }
  }
`
const GET_MODELS = gql`
  query {
    models: allDeviceModels(status: 1) {
      id
      model_name
    }
  }
`
const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: '100%',
    maxWidth: 700
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  chip: {
    margin: theme.spacing.unit / 4
  },
  noLabel: {
    marginTop: theme.spacing.unit * 3
  }
})

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
}

// function getStyles(name, that) {
//   return {
//     fontWeight:
//       that.state.name.indexOf(name) === -1
//         ? that.props.theme.typography.fontWeightRegular
//         : that.props.theme.typography.fontWeightMedium
//   }
// }

class LicensesList extends React.Component {
  state = {
    name: []
  }

  handleChange = event => {
    this.setState({ name: event.target.value })
  }

  render() {
    const { classes } = this.props

    return (
      <Query query={GET_MODELS}>
        {({ loading: isModelsLoading, error, data: { models } }) => (
          <Query query={GET_ALL_LICENCES}>
            {({ loading, error, data }) => {
              if (loading || isModelsLoading) return 'Loading'
              if (error) return `Error!: ${error}`
              const licenseDetails = data.getAllLicenseType

              // console.log('licenseDetails', data)

              return (
                // <div>Test</div>
                <div className={classes.root}>
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="select-multiple-chip">
                      Select Licenses *
                    </InputLabel>
                    <Select
                      multiple
                      value={this.props.licenseId}
                      onChange={this.props.handleChangeLicense}
                      input={<Input id="select-multiple-chip" />}
                      renderValue={selected => (
                        <div className={classes.chips}>
                          {selected.map(value => (
                            <Chip
                              key={value.id}
                              label={value.licenseType}
                              className={classes.chip}
                            />
                          ))}
                        </div>
                      )}
                      MenuProps={MenuProps}
                    >
                      {licenseDetails.map(name => (
                        <MenuItem
                          key={name.id}
                          value={name}
                          // style={getStyles(name.id, this)}
                        >
                          {name.licenseType}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="select-multiple-chip">
                      Select Models *
                    </InputLabel>
                    <Select
                      multiple
                      value={this.props.modelName}
                      onChange={this.props.handleChangeModels}
                      input={<Input id="select-multiple-chip" />}
                      renderValue={selected => (
                        <div className={classes.chips}>
                          {selected.map(value => (
                            <Chip
                              key={value.id}
                              label={value.model_name}
                              className={classes.chip}
                            />
                          ))}
                        </div>
                      )}
                      MenuProps={MenuProps}
                    >
                      {models.map(name => (
                        <MenuItem
                          key={name.id}
                          value={name}
                          // style={getStyles(name.id, this)}
                        >
                          {name.model_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              )
            }}
          </Query>
        )}
      </Query>
    )
  }
}

LicensesList.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(LicensesList)
