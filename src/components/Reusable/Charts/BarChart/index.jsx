import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  VerticalBarSeries
} from 'react-vis'
import 'react-vis/dist/style.css'

class BarChart extends Component {
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
        value: PropTypes.number.isRequired,
        label: PropTypes.string.isRequired
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
      bottom: 70
    }
  }

  _mapData() {
    return this.props.data.map(item => {
      return {
        x: item.label,
        y: item.value
      }
    })
  }

  render() {
    return (
      <XYPlot
        width={this.props.width}
        height={this.props.height}
        margin={this.props.margin}
        xType="ordinal"
      >
        <HorizontalGridLines />
        <VerticalGridLines />
        <XAxis position="start" tickLabelAngle={-45} />
        <YAxis />
        <VerticalBarSeries data={this._mapData()} />
      </XYPlot>
    )
  }
}

export default BarChart
