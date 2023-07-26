import React, { Component } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import { ButtonBase } from '@material-ui/core'

const style = theme => ({
  title: {
    fontSize: 14
  },
  card: {
    width: '100%',
    height: '100%',
    textAlign: 'center'
  },
  buttonBase: {
    width: '100%',
    height: '100%',
    textAlign: 'left'
  },
  pos: {
    marginBottom: 12
  }
})

class DetailsCard extends Component {
  render() {
    const { classes } = this.props

    return (
      <ButtonBase
        className={classes.buttonBase}
        onClick={() => this.props.handleClick(this.props.status)}
      >
        <Card className={classes.card} raised={!this.props.isClicked}>
          <CardContent>
            <Typography variant="body2">{this.props.title}</Typography>
            <br />
            <Typography variant="title" color="error">
              {this.props.count}
            </Typography>
          </CardContent>
        </Card>
      </ButtonBase>
    )
  }
}

export default withStyles(style)(DetailsCard)
