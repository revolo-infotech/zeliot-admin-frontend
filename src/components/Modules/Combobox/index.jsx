import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Input from '@material-ui/core/Input'
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem'
import InputAdornment from '@material-ui/core/InputAdornment'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Downshift from 'downshift'

const style = theme => ({
  searchDropdown: {
    position: 'absolute',
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
    zIndex: 1,
    maxHeight: theme.spacing.unit * 25,
    overflowY: 'auto'
  },
  inputRoot: {
    width: '100%'
  },
  comboboxContainer: {
    position: 'relative',
    width: '100%'
  },
  cssUnderline: {
    '&:after': {
      borderBottomColor: '#96ED1E'
    }
  },
  errorMessage: {
    textAlign: 'center',
    padding: theme.spacing.unit
  }
})

/**
 * Renders the Input component of Combobox
 * @param {Object} props Props passed to the Input component of Combobox
 */
function renderInput({ InputProps, classes, ref, disabled, ...other }) {
  return (
    <Input
      disabled={disabled}
      inputRef={ref}
      classes={{
        root: classes.inputRoot,
        underline: classes.cssUnderline
      }}
      {...InputProps}
      {...other}
    />
  )
}

renderInput.propTypes = {
  InputProps: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  ref: PropTypes.element.isRequired,
  disabled: PropTypes.bool.isRequired
}

/**
 * Renders each item in the dropdown
 * @param {Object} props Props passed to the individual dropdown item
 */
function renderDropdownItem({
  item,
  itemProps,
  selectedItem,
  itemToStringKey,
  itemKey
}) {
  const isSelected = selectedItem && selectedItem[itemKey] === item[itemKey]

  return (
    <MenuItem
      {...itemProps}
      key={item[itemKey]}
      selected={isSelected}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400
      }}
    >
      {item[itemToStringKey]}
    </MenuItem>
  )
}

renderDropdownItem.propTypes = {
  itemToStringKey: PropTypes.string.isRequired,
  itemKey: PropTypes.string.isRequired,
  itemProps: PropTypes.object,
  selectedItem: PropTypes.string.isRequired,
  item: PropTypes.object.isRequired
}

/**
 * Filter most relevant items
 * @param {Array} items The array of items to be filtered
 * @param {String} inputValue The value entered in the input against which items are to be filtered
 * @param {String} itemToStringKey The key of the object to be used to filter items
 * @returns {Array} Filtered array of items
 */
function getFilteredItems(items, inputValue, itemToStringKey, filterSize) {
  let count = 0

  return items.filter(item => {
    const keep =
      (!inputValue ||
        item[itemToStringKey]
          .toLowerCase()
          .indexOf(inputValue.toLowerCase()) !== -1) &&
      count < filterSize

    if (keep) {
      count += 1
    }

    return keep
  })
}

class ComboBox extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    selectedItem: PropTypes.object,
    itemToStringKey: PropTypes.string.isRequired,
    onSelectedItemChange: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    itemKey: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    loadingComponent: PropTypes.element,
    errorComponent: PropTypes.element,
    disabled: PropTypes.bool,
    filterSize: PropTypes.number
  }

  static defaultProps = {
    placeholder: 'Search',
    loadingComponent: <Typography>Loading ...</Typography>,
    errorComponent: <Typography>Something went wrong. Try again!</Typography>,
    disabled: false,
    filterSize: 5
  }

  handleSelectionChange = (selectedItem, stateAndHelpers) => {
    this.props.onSelectedItemChange(selectedItem)
  }

  render() {
    const {
      classes,
      items,
      isLoading,
      placeholder,
      disabled,
      itemToStringKey,
      loadingComponent,
      errorComponent,
      itemKey,
      filterSize
    } = this.props

    return (
      <Downshift
        selectedItem={this.props.selectedItem}
        onChange={this.handleSelectionChange}
        itemToString={item => (item ? item[itemToStringKey] : '')}
      >
        {({
          getInputProps,
          getItemProps,
          isOpen,
          inputValue,
          selectedItem,
          clearSelection
        }) => (
          <div className={classes.comboboxContainer}>
            {renderInput({
              disabled,
              classes,
              InputProps: getInputProps({
                placeholder,
                id: 'vehicle-search-field',
                onChange: e => {
                  if (e.target.value === '') {
                    clearSelection()
                  }
                },
                startAdornment: (
                  <InputAdornment>
                    <Icon>search</Icon>
                  </InputAdornment>
                ),
                endAdornment: selectedItem && (
                  <InputAdornment>
                    <IconButton onClick={clearSelection} disabled={disabled}>
                      <Icon>close</Icon>
                    </IconButton>
                  </InputAdornment>
                )
              })
            })}
            {isOpen ? (
              <Paper className={classes.searchDropdown} square>
                {/* eslint-disable indent */
                items.length > 0
                  ? getFilteredItems(
                      items,
                      inputValue,
                      itemToStringKey,
                      filterSize
                    ).map(item =>
                      renderDropdownItem({
                        item,
                        itemProps: getItemProps({ item }),
                        selectedItem,
                        itemToStringKey,
                        itemKey
                      })
                    )
                  : isLoading
                    ? loadingComponent
                    : errorComponent
                /* eslint-enable indent */
                }
              </Paper>
            ) : null}
          </div>
        )}
      </Downshift>
    )
  }
}

export default withStyles(style)(ComboBox)
