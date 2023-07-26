import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { RadialChart, Hint } from 'react-vis'
import 'react-vis/dist/style.css'
import { EXTENDED_DISCRETE_COLOR_RANGE as COLOR_RANGE } from '../../../../constants/styles'
import { RADIAL_CHART_STYLE } from '../../../../constants/classes'

class DoughnutChart extends Component {
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
    ).isRequired,
    doughnutWidthPRatio: PropTypes.number
  }

  static defaultProps = {
    width: 200,
    height: 200,
    margin: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10
    },
    doughnutWidthRatio: 0.3
  }

  state = {
    selectedValue: false
  }

  _radius = Math.min(this.props.width / 2 - 4, this.props.height / 2 - 4)

  _innerRadius = Math.round(this._radius * (1 - this.props.doughnutWidthRatio))

  _mapData() {
    const arcClass = this.props.classes['arc']
    return this.props.data.map(item => {
      return { ...item, className: arcClass }
    })
  }

  render() {
    const { classes } = this.props
    return (
      <RadialChart
        animation
        innerRadius={this._innerRadius}
        radius={this._radius}
        colorRange={COLOR_RANGE}
        getAngle={d => d.value}
        data={this._mapData()}
        onValueMouseOver={v => this.setState({ selectedValue: v })}
        onSeriesMouseOut={v => this.setState({ selectedValue: false })}
        width={this.props.width}
        height={this.props.height}
      >
        {this.state.selectedValue && (
          <Hint value={this.state.selectedValue}>
            <div className={classes['chart-hint']}>
              <span>{this.state.selectedValue.label}: </span>
              <span>{this.state.selectedValue.value}</span>
            </div>
          </Hint>
        )}
      </RadialChart>
    )
  }
}

export default withStyles(RADIAL_CHART_STYLE)(DoughnutChart)
