import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListSubheader from '@material-ui/core/ListSubheader'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import {
  MENU_DRAWER_WIDTH,
  MINI_MENU_DRAWER_WIDTH
} from '../../../constants/styles'
import { SUPER_ADMIN_DRAWER_MENU_LIST_ITEMS } from '../../../constants/others'
import {
  PARTNER_DRAWER_MENU_LIST_ITEMS,
  INVENTORY_DRAWER_MENU_LIST_ITEMS,
  SALES_DRAWER_MENU_LIST_ITEMS,
  ACCOUNT_DRAWER_MENU_LIST_ITEMS,
  SERVICE_DRAWER_MENU_LIST_ITEMS
} from '../../../constants/partnerOthers'
import { RESELLER_DRAWER_MENU_LIST_ITEMS } from '../../../constants/reseller'
import classNames from 'classnames'
import Divider from '@material-ui/core/Divider'
import Tooltip from '@material-ui/core/Tooltip'
import getAccountType from '../../../utils/getAccountType'

const styles = theme => ({
  drawerPaperHello: {
    width: MENU_DRAWER_WIDTH,
    overflowY: 'auto',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawer: {
    height: '100%',
    overflowX: 'hidden'
  },
  drawerPaperClose: {
    // width: theme.spacing.unit * 7,
    [theme.breakpoints.down('xs')]: {
      width: '0px',
      marginRight: '0px',
      marginLeft: '0px'
    },
    [theme.breakpoints.up('sm')]: {
      width: MINI_MENU_DRAWER_WIDTH
    },
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  menuItem: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.common.white
    }
  }
})

function MenuDrawerList(props) {
  const { isMini, menuItemClass, closeMobileMenuDrawer } = props

  let menuListItems = []

  switch (getAccountType()) {
    case 'SAL':
      menuListItems = SALES_DRAWER_MENU_LIST_ITEMS
      break
    case 'SER':
      menuListItems = SERVICE_DRAWER_MENU_LIST_ITEMS
      break
    case 'INV':
      menuListItems = INVENTORY_DRAWER_MENU_LIST_ITEMS
      break
    case 'ACC':
      menuListItems = ACCOUNT_DRAWER_MENU_LIST_ITEMS
      break
    case 'RES':
      menuListItems = RESELLER_DRAWER_MENU_LIST_ITEMS
      break
    case 'SA':
      menuListItems = SUPER_ADMIN_DRAWER_MENU_LIST_ITEMS
      break
    default:
      menuListItems = PARTNER_DRAWER_MENU_LIST_ITEMS
  }

  return (
    <List>
      {Object.keys(menuListItems).map(drawerMenuListItem => (
        <React.Fragment key={drawerMenuListItem}>
          <ListSubheader disableSticky={true}>
            <RenderSubheading heading={drawerMenuListItem} isMini={isMini} />
          </ListSubheader>
          {menuListItems[drawerMenuListItem].map(item => (
            <ListItem
              key={item.text}
              button
              component={props => (
                <NavLink
                  to={item.route}
                  activeClassName={menuItemClass}
                  onClick={closeMobileMenuDrawer}
                  {...props}
                />
              )}
              dense={true}
            >
              <Tooltip
                title={isMini ? item.text : ''}
                placement="right"
                key={item.text}
              >
                <ListItemIcon color="inherit">
                  <item.icon />
                </ListItemIcon>
              </Tooltip>
              {!isMini && <ListItemText>{item.text}</ListItemText>}
            </ListItem>
          ))}
        </React.Fragment>
      ))}
    </List>
  )
}

function RenderSubheading(props) {
  const heading = props.heading
  const isMini = props.isMini

  if (heading === 'MainMenu') return null
  if (isMini === true) {
    return <Divider />
  } else {
    return heading
  }
}

class MenuDrawer extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    isMenuDrawerOpen: PropTypes.bool.isRequired,
    variant: PropTypes.string
  }

  static defaultProps = {
    variant: 'persistent'
  }

  render() {
    const { classes } = this.props

    return (
      <Drawer
        anchor="left"
        variant="permanent"
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
        classes={{
          paper: classNames(
            classes.drawerPaperHello,
            'appbar-top-margin drawer-height-with-appbar',
            !this.props.isMenuDrawerOpen && classes.drawerPaperClose
          )
        }}
        open={this.props.isMenuDrawerOpen}
      >
        <div className={classes.drawer}>
          <MenuDrawerList
            menuItemClass={classes.menuItem}
            isMini={!this.props.isMenuDrawerOpen}
            closeMobileMenuDrawer={this.props.closeMobileMenuDrawer}
          />
        </div>
      </Drawer>
    )
  }
}

export default withStyles(styles)(MenuDrawer)
