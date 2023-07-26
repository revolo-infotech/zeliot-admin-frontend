import React from 'react'
export default class Name extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      fields: {},
      errors: {}
    }
  }

  handleValidation() {
    let fields = this.state.fields
    let errors = {}
    let formIsValid = true

    // Name
    if (!fields['name']) {
      formIsValid = false
      errors['name'] = 'Cannot be empty'
    }

    if (typeof fields['name'] !== 'undefined') {
      if (!fields['name'].match(/^[a-zA-Z]+$/)) {
        formIsValid = false
        errors['name'] = 'Only letters'
      }
    }
    this.setState({ errors: errors })
    return formIsValid
  }
  handleChange(field, e) {
    console.log('sdsdsd')
    e.preventDefault()
    this.handleValidation()
    let fields = this.state.fields
    fields[field] = e.target.value
    this.setState({ fields })
  }

  render() {
    return (
      <div>
        <input
          ref="name"
          type="text"
          size="30"
          placeholder="Name"
          onChange={this.handleChange.bind(this, 'name')}
          value={this.state.fields['name']}
        />
        <br />
        <span style={{ color: 'red', fontSize: '10px' }}>
          {this.state.errors['name']}
        </span>
      </div>
    )
  }
}
