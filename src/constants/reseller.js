import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'
import SimCardIcon from '@material-ui/icons/SimCard'
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard'
import MultilineChartIcon from '@material-ui/icons/MultilineChart'
import StyleIcon from '@material-ui/icons/Style'
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck'
import AddShoppingCart from '@material-ui/icons/AddShoppingCart'
export const RESELLER_DRAWER_MENU_LIST_ITEMS = {
  MainMenu: [
    {
      text: 'Licenses',
      icon: MultilineChartIcon,
      route: '/home/reseller/licenses'
    },
    {
      text: 'Customers',
      icon: SupervisorAccountIcon,
      route: '/home/reseller/customers'
    },
    {
      text: 'Subscriptions',
      icon: StyleIcon,
      route: '/home/reseller/subscriptions'
    }
  ],
  Inventory: [
    {
      text: 'Devices',
      icon: DeveloperBoardIcon,
      route: '/home/reseller/devices'
    },
    {
      text: 'SIM Cards',
      icon: SimCardIcon,
      route: '/home/reseller/sims'
    }
  ],
  Actions: [
    {
      text: 'Vehicles',
      icon: PlaylistAddCheckIcon,
      route: '/home/reseller/VehcileDashboard/Dashboard'
    },
    {
      text: 'Purchase Requests',
      icon: AddShoppingCart,
      route: '/home/reseller/purchase-request'
    },
    {
      text: 'SMS Purchase',
      icon: AddShoppingCart,
      route: '/home/manage/partner/purchase-SMS'
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
