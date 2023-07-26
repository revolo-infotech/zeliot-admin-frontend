import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import 'react-vis/dist/style.css'
import { RadialChart, Hint } from 'react-vis'
import { EXTENDED_DISCRETE_COLOR_RANGE as COLOR_RANGE } from '../../../../constants/styles'
import { RADIAL_CHART_STYLE } from '../../../../constants/classes'

class PieChart extends Component {
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
    width: 200,
    height: 200,
    margin: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10
    }
  }

  state = {
    selectedValue: false
  }

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
        innerRadius={0}
        radius={Math.min(this.props.width / 2 - 4, this.props.height / 2 - 4)}
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

export default withStyles(RADIAL_CHART_STYLE)(PieChart)
