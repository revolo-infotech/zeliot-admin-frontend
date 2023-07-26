import React, { Component } from 'react'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import { withStyles } from '@material-ui/core/styles'

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
  },
  //   selstyle: {
  //     maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
  //     width: 250
  //   },
  formControl: {
    margin: theme.spacing.unit * 3
  },
  group: {
    margin: `${theme.spacing.unit}px 0`
  }
})

class BitSelectionSettings extends Component {
  //   constructor(props) {
  //     super(props)
  //   }
  //   state = {
  //     bit: 'None',
  //     type: this.props.type,
  //     entity: this.props.entity,
  //     bitPosition: [],
  //     entityId: [],
  //     panicSettingsDetails: []
  //   }

  //   bitPositionArr = []
  //   handleChange = (bit, type, entity) => event => {
  //     console.log('event.target.value', bit, type, entity)
  //     let bitposistion = {}
  //     bitposistion.bit = bit
  //     bitposistion.type = type
  //     bitposistion.entity = entity
  //     this.bitPositionArr.map(item => {
  //       if (item && item.type) {
  //         if (item.type === type) {
  //           return bitposistion
  //         }
  //       }
  //       return item
  //     })
  //     this.bitPositionArr.push(bitposistion)
  //     this.setState({
  //       bit: event.target.value,
  //       type: type,
  //       entity: entity,
  //       panicSettingsDetails: this.bitPositionArr
  //     })
  //     console.log('panicSettingsDetails', this.state.panicSettingsDetails)
  //   }

  //   state = {
  //     value: (this.props.bitSettings && this.props.bitSettings.bit) || ''
  //   }

  onChange = (e, value) => {
    // console.log(value)
    const op = this.props.options.find(
      option => String(option.bit) === String(value)
    )
    console.log('OP: ', op)
    this.props.onBitChange(op || null)
    // this.setState({ value })
  }

  render() {
    const { classes, options, bitSettings } = this.props
    // const { spacing, value } = this.state
    console.log(bitSettings)
    return (
      <div>
        <FormControl component="fieldset" className={classes.formControl}>
          <RadioGroup
            aria-label="Panic"
            name="panic"
            className={classes.group}
            value={(bitSettings && bitSettings.bit) || null}
            onChange={this.onChange}
            // value={this.state.bit}
            // onChange={this.handleChange(
            //   this.state.bit,
            //   this.state.type,
            //   this.state.entity
            // )}
          >
            <FormControlLabel value={''} control={<Radio />} label="None" />
            {options.map(option => (
              <FormControlLabel
                value={option.bit}
                control={<Radio />}
                label={option.bit}
              />
            ))}
            {/* <FormControlLabel value="256" control={<Radio />} label="256" />
            <FormControlLabel value="2048" control={<Radio />} label="2048" />
            <FormControlLabel value="None" control={<Radio />} label="None" /> */}
          </RadioGroup>
        </FormControl>
      </div>
    )
  }
}
export default withStyles(style)(BitSelectionSettings)
