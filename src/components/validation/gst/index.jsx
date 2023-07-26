import React from 'react'
export default class gst extends React.Component {
  state = {
    error: ''
  }
  handleClick = e => {
    if (e.target.value.length < 15 || e.target.value.length > 15) {
      // alert('Not Valid')
      this.setState({ error: 'Not valid' })
    } else if (e.target.value.length == 15) {
      if (
        !e.target.value.match(
          /^(0[1-9]|[1-2][0-9]|3[0-5])([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}([a-zA-Z0-9]){1}([a-zA-Z]){1}([0-9]){1}?$/
        )
      ) {
        this.setState({ error: 'GST Is not Valid!' })
      } else {
        this.setState({ error: 'Valid' })
      }
    } else {
      this.setState({ error: '' })
    }
  }
  render() {
    return (
      <React.Fragment>
        <input type="text" onChange={e => this.handleClick(e)} />
        <span style={{ color: 'red', fontSize: '10px' }}>
          {this.state.error}
        </span>
      </React.Fragment>
    )
  }
}
