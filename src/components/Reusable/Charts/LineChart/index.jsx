import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  XYPlot,
  HorizontalGridLines,
  VerticalGridLines,
  XAxis,
  YAxis,
  LineSeries,
  Crosshair
} from 'react-vis'
import 'react-vis/dist/style.css'

class LineChart extends Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    margin: PropTypes.shape({
      left: PropTypes.number,
      right: PropTypes.number,
      top: PropTypes.number,
      bottom: PropTypes.number
    }),
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
      })
    ).isRequired
  }

  static defaultProps = {
    width: 450,
    height: 300,
    margin: {
      left: 40,
      right: 10,
      top: 10,
      bottom: 40
    }
  }

  state = {
    selectedValue: false
  }

  _mapData() {
    return this.props.data.map(item => {
      return {
        x: item.x,
        y: item.y
      }
    })
  }
  render() {
    return (
      <XYPlot
        width={this.props.width}
        height={this.props.height}
        margin={this.props.margin}
        onMouseLeave={e => this.setState({ selectedValue: false })}
      >
        <HorizontalGridLines />
        <VerticalGridLines />
        <XAxis title="" position="start" />
        <YAxis title="" />
        <LineSeries
          data={this._mapData()}
          onNearestX={d => this.setState({ selectedValue: d })}
        />
        {this.state.selectedValue && (
          <Crosshair values={[this.state.selectedValue]} />
        )}
      </XYPlot>
    )
  }
}

export default LineChart
