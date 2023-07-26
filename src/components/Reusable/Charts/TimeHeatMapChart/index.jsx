import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { XYPlot, HeatmapSeries, XAxis, YAxis, Hint } from 'react-vis'
import { days, time } from '../../../../constants/others'
import { withStyles } from '@material-ui/core/styles'
import { HEATMAP_CHART_STYLE } from '../../../../constants/classes'

class TimeHeatMapChart extends Component {
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
        day: PropTypes.number.isRequired,
        time: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired
      })
    ).isRequired
  }

  static defaultProps = {
    width: 300,
    height: 400,
    margin: {
      left: 50,
      right: 10,
      top: 10,
      bottom: 40
    }
  }

  state = {
    selectedValue: false
  }

  _getMinAndMax() {
    const valueArray = this.props.data.map(item => item.value)
    this._minVal = Math.min(...valueArray)
    this._maxVal = Math.max(...valueArray)
  }

  _computeData() {
    this._getMinAndMax(this.props.data)
    return this.props.data.map(val => {
      return {
        x: val.day,
        y: val.time,
        color: Math.round(
          ((val.value - this._minVal) / (this._maxVal - this._minVal)) * 10
        ),
        value: val.value
      }
    })
  }

  render() {
    const { classes } = this.props
    return (
      <XYPlot
        width={this.props.width}
        height={this.props.height}
        margin={this.props.margin}
      >
        <XAxis tickFormat={v => days[v]} />
        <YAxis tickFormat={v => time[v]} />
        <HeatmapSeries
          data={this._computeData()}
          stroke="white"
          colorRange={['white', 'black']}
          onValueMouseOver={d => this.setState({ selectedValue: d })}
          onValueMouseOut={d => this.setState({ selectedValue: false })}
        />
        {this.state.selectedValue && (
          <Hint value={this.state.selectedValue} orientation="topleft">
            <div className={classes['chart-hint']}>
              <span>{this.state.selectedValue.value}</span>
            </div>
          </Hint>
        )}
      </XYPlot>
    )
  }
}

export default withStyles(HEATMAP_CHART_STYLE)(TimeHeatMapChart)
