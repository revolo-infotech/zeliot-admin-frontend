import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Downshift from 'downshift'
import Input from '@material-ui/core/Input'
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem'
import InputAdornment from '@material-ui/core/InputAdornment'
import Icon from '@material-ui/core/Icon'
import Typography from '@material-ui/core/Typography'
import withStyles from '@material-ui/core/styles/withStyles'

const style = theme => ({
  inputRoot: {
    width: '100%'
  },
  chipRoot: {
    backgroundColor: '#f5f5f5',
    fontSize: '0.6rem',
    height: 'auto'
  },
  searchDropdown: {
    position: 'absolute',
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
    zIndex: 2,
    maxHeight: theme.spacing.unit * 25,
    overflowY: 'auto'
  },
  comboboxContainer: {
    position: 'relative'
  },
  cssUnderline: {
    '&:after': {
      borderBottomColor: theme.palette.secondary.main
    }
  },
  errorMessage: {
    textAlign: 'center',
    padding: theme.spacing.unit
  }
})

function renderInput({ InputProps, classes, disabled, ref, ...other }) {
  return (
    <Input
      disabled={disabled}
      inputRef={ref}
      classes={{
        root: classes.inputRoot,
        underline: classes.cssUnderline
      }}
      inputProps={{
        autoComplete: 'off'
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

function renderDropdownItem({
  item,
  itemProps,
  selectedItems,
  itemToStringKey,
  itemKey
}) {
  const isSelected = Boolean(
    selectedItems.find(a => a[itemKey] === item[itemKey])
  )

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
  itemProps: PropTypes.object,
  itemToStringKey: PropTypes.string.isRequired,
  itemKey: PropTypes.string.isRequired,
  selectedItems: PropTypes.array.isRequired,
  item: PropTypes.object.isRequired
}

function getFilteredItems(items, inputValue, searchByFields, filterSize) {
  let count = 0
  let filteredItems = []

  const finder = item => {
    for (let field of searchByFields) {
      if (item[field].toLowerCase().includes(inputValue.toLowerCase())) {
        filteredItems.push({
          ...item,
          searchedBy: field
        })
        return true
      }
    }
    return false
  }

  for (let item of items) {
    if (inputValue && count < filterSize) {
      if (finder(item)) {
        count++
      }
    }
  }

  return filteredItems
}

class MultiSelectComboBox extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    selectedItems: PropTypes.array.isRequired,
    onSelectedItemsChange: PropTypes.func.isRequired,
    searchByFields: PropTypes.arrayOf(PropTypes.string).isRequired,
    isLoading: PropTypes.bool.isRequired,
    itemKey: PropTypes.string.isRequired,
    itemToStringKey: PropTypes.string.isRequired,
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

  handleSelectionChange = selectedItem => {
    let action = 'ADD'
    let itemIndex = -1

    for (let i in this.props.selectedItems) {
      if (
        selectedItem[this.props.itemKey] ===
        this.props.selectedItems[i][this.props.itemKey]
      ) {
        action = 'REMOVE'
        itemIndex = i
        break
      }
    }

    if (action === 'ADD') {
      this.props.onSelectedItemsChange([
        selectedItem,
        ...this.props.selectedItems
      ])
    } else {
      let items = [...this.props.selectedItems]
      items.splice(itemIndex, 1)
      this.props.onSelectedItemsChange([...items])
    }
  }

  render() {
    const {
      classes,
      items,
      isLoading,
      placeholder,
      disabled,
      searchByFields,
      loadingComponent,
      errorComponent,
      itemKey,
      itemToStringKey,
      filterSize
    } = this.props

    return (
      <Downshift
        onChange={this.handleSelectionChange}
        selectedItem={this.props.selectedItems}
        itemToString={item => {
          return ''
        }}
      >
        {({
          getInputProps,
          getItemProps,
          isOpen,
          inputValue,
          selectedItem: selectedItems
        }) => (
          <div className={classes.comboboxContainer}>
            {renderInput({
              disabled,
              classes,
              InputProps: getInputProps({
                placeholder,
                id: 'vehicle-search-field',
                startAdornment: (
                  <InputAdornment>
                    <Icon>search</Icon>
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
                      searchByFields,
                      filterSize
                    ).map(item =>
                      renderDropdownItem({
                        item,
                        itemProps: getItemProps({ item }),
                        selectedItems,
                        itemKey,
                        itemToStringKey
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

export default withStyles(style)(MultiSelectComboBox)
