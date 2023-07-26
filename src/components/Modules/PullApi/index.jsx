import React, { Component } from 'react'

export default class PullApi extends Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      posts: []
    }
  }
  fetchFirst(url) {
    var that = this
    if (url) {
      fetch('https://www.reddit.com/r/' + url + '.json')
        // fetch('http://104.211.217.189/aquila_api/fuel_alert/' + url + '.php')
        .then(function(response) {
          return response.json()
        })
        .then(function(result) {
          that.setState({
            items: result.data.children,
            lastPostName:
              result.data.children[result.data.children.length - 1].data.name
          })
          console.log('sssss', that.state.items)
        })
    }
  }

  componentDidMount() {
    this.fetchFirst('reactjs')
  }
  render() {
    const { error, items } = this.state
    if (error) {
      return <div>Error: {error.message}</div>
    } else {
      return (
        <ul>
          {items.map(item => (
            <li key={item.kind}>{item.data.author_fullname}</li>
          ))}
        </ul>
      )
    }
  }
}
