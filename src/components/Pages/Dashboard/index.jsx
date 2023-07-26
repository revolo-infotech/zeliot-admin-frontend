import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import ItemCard from '../../Reusable/ItemCard'
import PieChart from '../../Reusable/Charts/PieChart'
import DoughnutChart from '../../Reusable/Charts/DoughnutChart'
import BarChart from '../../Reusable/Charts/BarChart'
import LineChart from '../../Reusable/Charts/LineChart'
import TimeHeatMapChart from '../../Reusable/Charts/TimeHeatMapChart'

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 2
  }
})

const customData = [
  { value: 16, label: 'Orange', id: 1 },
  { value: 13, label: 'Apple', id: 2 },
  { value: 3, label: 'Grapes', id: 3 },
  { value: 20, label: 'Watermelon', id: 4 },
  { value: 8, label: 'Strawberry', id: 5 },
  { value: 5, label: 'Blueberry', id: 6 },
  { value: 18, label: 'Pineapple', id: 7 },
  { value: 12, label: 'Custard Apple', id: 8 }
]

const lineData = [9, 14, 17, 20, 23].map(item => {
  return {
    x: item,
    y: Math.random() * item
  }
})

let heatMapData = []
let id = 0
for (let i = 0; i < 7; i++) {
  for (let j = 0; j < 24; j++) {
    heatMapData.push({
      id: id++,
      day: i,
      time: j,
      value: Math.round(Math.random() * 10)
    })
  }
}

function Dashboard(props) {
  const { classes } = props
  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item>
          <ItemCard>
            <PieChart data={customData} />
          </ItemCard>
        </Grid>
        <Grid item>
          <ItemCard>
            <DoughnutChart data={customData} />
          </ItemCard>
        </Grid>
        <Grid item>
          <ItemCard>
            <BarChart data={customData} />
          </ItemCard>
        </Grid>
        <Grid item>
          <ItemCard>
            <LineChart data={lineData} />
          </ItemCard>
        </Grid>
        <Grid item>
          <ItemCard>
            <TimeHeatMapChart data={heatMapData} />
          </ItemCard>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(style)(Dashboard)
