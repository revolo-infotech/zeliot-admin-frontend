import React from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { withStyles } from '@material-ui/core/styles'

const style = {
  smoothBorder: {
    borderRadius: '5px'
  }
}

function ItemCard(props) {
  const { classes } = props
  return (
    <Card className={classes.smoothBorder}>
      <CardContent>{props.children}</CardContent>
    </Card>
  )
}

export default withStyles(style)(ItemCard)
