import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'
import SimCardIcon from '@material-ui/icons/SimCard'
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard'
import MultilineChartIcon from '@material-ui/icons/MultilineChart'
import StyleIcon from '@material-ui/icons/Style'
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck'
import AddShoppingCart from '@material-ui/icons/AddShoppingCart'
import Search from '@material-ui/icons/Search'
import Refresh from '@material-ui/icons/Refresh'
import PhoneLinkIcon from '@material-ui/icons/Phonelink'

import APIIcon from '@material-ui/icons/Web'

export const SUPER_ADMIN_DRAWER_MENU_LIST_ITEMS = {
  Analytics: [
    {
      text: 'Dashboard',
      icon: StyleIcon,
      route: '/home/dashboard'
    },
    {
      text: 'Licenses',
      icon: MultilineChartIcon,
      route: '/home/ViewLicense'
    },
    {
      text: 'Users',
      icon: SupervisorAccountIcon,
      route: '/home/user/dashboard'
    }
  ],
  Inventory: [
    {
      text: 'Devices',
      icon: DeveloperBoardIcon,
      route: '/home/deviceDashboard/Dashboard'
    },
    {
      text: 'Sim Provider Details',
      icon: SimCardIcon,
      route: '/home/add-provider'
    },

    {
      text: 'SIM Details',
      icon: SimCardIcon,
      route: '/home/add-sim'
    },
    {
      text: 'Assign device/Sim',
      icon: PlaylistAddCheckIcon,
      route: '/home/assignDevPartner'
    },
    {
      text: 'Purchase Request',
      icon: AddShoppingCart,
      route: '/home/manage/purchase-requests'
    },
    {
      text: 'SMS Purchase',
      icon: AddShoppingCart,
      route: '/home/manage/purchase-SMS'
    },
    {
      text: 'Search Device',
      icon: Search,
      route: '/home/manage/search-Device'
    },

    {
      text: 'Current Trackinfo',
      icon: Refresh,
      route: '/home/superAdmin/CurrentTrackinfo'
    }
  ],
  Admin: [
    {
      text: 'Clear Redis',
      icon: Refresh,
      route: '/home/manage/Clear-Redis'
    },
    {
      text: 'Create Demo Link',
      icon: PhoneLinkIcon,
      route: '/home/manage/create-demo-link'
    },
    {
      text: 'API Dashboard',
      icon: APIIcon,
      route: '/home/manage/api-dashboard'
    }
  ]
}

export const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const time = [
  '12 AM',
  '1 AM',
  '2 AM',
  '3 AM',
  '4 AM',
  '5 AM',
  '6 AM',
  '7 AM',
  '8 AM',
  '9 AM',
  '10 AM',
  '11 AM',
  '12 PM',
  '1 PM',
  '2 PM',
  '3 PM',
  '4 PM',
  '5 PM',
  '6 PM',
  '7 PM',
  '8 PM',
  '9PM',
  '10 PM',
  '11 PM'
]
