import React, { Component } from 'react'
import Select from 'react-select'
// import { withStyles } from '@material-ui/core/styles'

export default class Gst extends Component {
  //   handleSelectGstChange = name => value => {
  //     console.log('On slelect Day change ', name, ' ', value)
  //     this.setState({ [name]: value })
  //   }
  constructor(props) {
    super(props)
    this.state = {
      gstRates: '',
      gstRate: ''
    }
    let gstRates = ['5', '10', '12', '15']
    const billingGst = gstRates.map(gst => ({
      value: gst,
      label: gst
    }))
    this.setState({
      gstRates: billingGst
    })
    console.log(this.state.gstRates)
    // const { classes } = this.props
  }

  render() {
    return (
      <Select
        // classes={classes}
        options={this.state.gstRates}
        // components={components}
        value={this.props.gstRate}
        // onChange={this.handleSelectGstChange('gstRate')}
        placeholder="Gst"
      />
    )
  }
}
// export default withStyles(Gst)
