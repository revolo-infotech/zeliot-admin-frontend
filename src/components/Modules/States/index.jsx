import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Select from 'react-select'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import NoSsr from '@material-ui/core/NoSsr'
import TextField from '@material-ui/core/TextField'
import Chip from '@material-ui/core/Chip'
import MenuItem from '@material-ui/core/MenuItem'
import { emphasize } from '@material-ui/core/styles/colorManipulator'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

const GET_STATES_FOR_COUNTRY = gql`
  query getStatesByCountryId($countryId: Int!) {
    allStatesByCountryId(country_id: $countryId) {
      name
      zone_id
    }
  }
`

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  input: {
    display: 'flex',
    padding: 0
  },
  valueContainer: {
    display: 'flex',
    flex: 1,
    alignItems: 'center'
  },
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === 'light'
        ? theme.palette.grey[300]
        : theme.palette.grey[700],
      0.08
    )
  },
  noOptionsMessage: {
    fontSize: 16,
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`
  },
  singleValue: {
    fontSize: 16
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16
  }
})

function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  )
}

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />
}

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          ref: props.innerRef,
          children: props.children,
          ...props.innerProps
        }
      }}
    />
  )
}

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  )
}

function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  )
}

function SingleValue(props) {
  return (
    <Typography
      className={props.selectProps.classes.singleValue}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  )
}

function ValueContainer(props) {
  return (
    <div className={props.selectProps.classes.valueContainer}>
      {props.children}
    </div>
  )
}

function MultiValue(props) {
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={classNames(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused
      })}
      onDelete={event => {
        props.removeProps.onClick()
        props.removeProps.onMouseDown(event)
      }}
    />
  )
}

const components = {
  Option,
  Control,
  NoOptionsMessage,
  Placeholder,
  SingleValue,
  MultiValue,
  ValueContainer
}

class States extends React.Component {
  render() {
    const { classes } = this.props

    return (
      <Query
        query={GET_STATES_FOR_COUNTRY}
        variables={{ countryId: parseInt(this.props.countryId, 10) }}
      >
        {({ loading, error, data: { allStatesByCountryId } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`

          const sortedStates = allStatesByCountryId.map(state => ({
            value: state.zone_id,
            label: state.name
          }))

          return (
            <div className={classes.root}>
              <NoSsr>
                <Select
                  classes={classes}
                  options={sortedStates}
                  components={components}
                  value={this.props.zoneId}
                  onChange={this.props.handleStateChange}
                  placeholder="Select State *"
                />
              </NoSsr>
            </div>
          )
        }}
      </Query>
    )
  }
}

States.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(States)
