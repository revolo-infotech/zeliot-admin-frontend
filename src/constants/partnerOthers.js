import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'
import SimCardIcon from '@material-ui/icons/SimCard'
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard'
import MultilineChartIcon from '@material-ui/icons/MultilineChart'
import StyleIcon from '@material-ui/icons/Style'
import DeviceHubIcon from '@material-ui/icons/DeviceHub'
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck'
import AddShoppingCart from '@material-ui/icons/AddShoppingCart'
import Receipt from '@material-ui/icons/Receipt'
import Search from '@material-ui/icons/Search'

export const PARTNER_DRAWER_MENU_LIST_ITEMS = {
  MainMenu: [
    {
      text: 'Plans',
      icon: MultilineChartIcon,
      route: '/home/Plans'
    },
    {
      text: 'Customers',
      icon: SupervisorAccountIcon,
      route: '/home/customers'
    },
    {
      text: 'Subscriptions',
      icon: StyleIcon,
      route: '/home/subscriptions'
    }
  ],
  Inventory: [
    {
      text: 'Devices',
      icon: DeveloperBoardIcon,
      route: '/home/inventory/devices'
    },
    {
      text: 'Accessories',
      icon: DeviceHubIcon,
      route: '/home/inventory/accessories'
    },
    {
      text: 'SIM Cards',
      icon: SimCardIcon,
      route: '/home/inventory/sims'
    }
  ],
  Actions: [
    {
      text: 'Search Device',
      icon: Search,
      route: '/home/manage/search-Device'
    },
    {
      text: 'Vehicles',
      icon: PlaylistAddCheckIcon,
      route: '/home/VehcileDashboard/Dashboard'
    },
    {
      text: 'SMS Purchase',
      icon: AddShoppingCart,
      route: '/home/manage/partner/purchase-SMS'
    },
    {
      text: 'Panic Settings',
      icon: PlaylistAddCheckIcon,
      route: '/home/manage/admin/PanicAlertBitConfigurationSettings'
    },
    {
      text: 'Fuel Calibration',
      icon: PlaylistAddCheckIcon,
      route: '/home/settings/FuelCalibration'
    },
    {
      text: 'Current Summary',
      icon: StyleIcon,
      route: '/home/manage/admin/CurrentSummary'
    },
    {
      text: 'Current Trackinfo',
      icon: StyleIcon,
      route: '/home/manage/admin/CurrentTrackinfo'
    },
    {
      text: 'Idle Report',
      icon: StyleIcon,
      route: '/home/reports/IdleReport'
    },
    {
      text: 'Billing',
      icon: Receipt,
      route: '/home/manage/admin/InvoiceDetails'
    },
    {
      text: 'PIDs configuration',
      icon: Receipt,
      route: '/home/manage/admin/PidsConfiguration'
    }
  ]
}

export const SALES_DRAWER_MENU_LIST_ITEMS = {
  MainMenu: [
    {
      text: 'Customers',
      icon: SupervisorAccountIcon,
      route: '/home/customers'
    },
    {
      text: 'Subscriptions',
      icon: StyleIcon,
      route: '/home/subscriptions'
    }
  ]
}

export const INVENTORY_DRAWER_MENU_LIST_ITEMS = {
  MainMenu: [
    {
      text: 'Subscriptions',
      icon: StyleIcon,
      route: '/home/subscriptions'
    }
  ],
  Inventory: [
    {
      text: 'Devices',
      icon: DeveloperBoardIcon,
      route: '/home/inventory/devices'
    },
    {
      text: 'Accessories',
      icon: DeviceHubIcon,
      route: '/home/inventory/accessories'
    },
    {
      text: 'SIM Cards',
      icon: SimCardIcon,
      route: '/home/inventory/sims'
    }
  ]
}

export const SERVICE_DRAWER_MENU_LIST_ITEMS = {
  Actions: [
    {
      text: 'Vehicles',
      icon: PlaylistAddCheckIcon,
      route: '/home/VehcileDashboard/Dashboard'
    },
    {
      text: 'SMS Purchase',
      icon: AddShoppingCart,
      route: '/home/manage/partner/purchase-SMS'
    },
    {
      text: 'Panic Settings',
      icon: PlaylistAddCheckIcon,
      route: '/home/manage/admin/PanicAlertBitConfigurationSettings'
    },
    {
      text: 'Current Summary',
      icon: StyleIcon,
      route: '/home/manage/admin/CurrentSummary'
    },
    {
      text: 'Billing',
      icon: Receipt,
      route: '/home/manage/admin/InvoiceDetails'
    }
  ]
}

export const ACCOUNT_DRAWER_MENU_LIST_ITEMS = {
  Actions: [
    {
      text: 'Billing',
      icon: Receipt,
      route: '/home/manage/admin/InvoiceDetails'
    },
    {
      text: 'Subscriptions',
      icon: StyleIcon,
      route: '/home/subscriptions'
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
