import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { withStyles } from '@material-ui/core/styles'
import { Query } from 'react-apollo'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import AccountMenu from '../AccountMenu'

const styles = theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer
  },
  flex: {
    flex: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  }
})

const GET_DOMAIN_CONFIG = gql`
  query($domain: String!) {
    domainConfiguration(domain: $domain) {
      header {
        title
      }
    }
  }
`

class NavBar extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired
  }

  state = {
    isAccountMenuOpen: false,
    anchorEl: null
  }

  openAccountMenu = e => {
    this.setState({
      isAccountMenuOpen: true,
      anchorEl: e.currentTarget
    })
  }

  closeAccountMenu = e => {
    this.setState({
      isAccountMenuOpen: false,
      anchorEl: null
    })
  }

  render() {
    const { classes } = this.props

    return (
      <AppBar position="fixed" color="secondary" className={classes.appBar}>
        <Toolbar variant="dense">
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
            onClick={this.props.handleMenuDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="title" color="inherit" className={classes.flex}>
            <Query
              query={GET_DOMAIN_CONFIG}
              variables={{ domain: window.location.host }}
            >
              {({ loading, error, data }) => {
                if (loading) return 'Loading'
                if (error) return 'Error'
                return data.domainConfiguration.header.title
              }}
            </Query>
          </Typography>
          <IconButton onClick={this.openAccountMenu} color="inherit">
            <AccountCircleIcon />
          </IconButton>

          <AccountMenu
            isAccountMenuOpen={this.state.isAccountMenuOpen}
            anchorEl={this.state.anchorEl}
            onClose={this.closeAccountMenu}
          />
        </Toolbar>
      </AppBar>
    )
  }
}

export default withStyles(styles)(NavBar)
