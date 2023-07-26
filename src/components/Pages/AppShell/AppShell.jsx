import React, { Component, Fragment } from 'react'
import { PrivateRoute } from '../../Router'
import Customers from '../Customers'
import InventoryOutward from '../Inventory/outward'
import Report from '../Report'
import Grid from '@material-ui/core/Grid'
import MenuDrawer from '../../Modules/MenuDrawer'
import NavBar from '../../Modules/NavBar'
import {
  MENU_DRAWER_WIDTH,
  MINI_MENU_DRAWER_WIDTH
} from '../../../constants/styles'
import { withStyles } from '@material-ui/core/styles'
import withWidth, { isWidthUp, isWidthDown } from '@material-ui/core/withWidth'
import VehicleRegistartion from '../../Modules/VehicleRegistartion'
import BulkVehicleRegistration from '../../Modules/VehicleRegistartion/BulkVehicleRegistration.jsx'
import RegisterCustomer from '../RegisterCustomer'
import ViewCustomer from '../ViewCustomer'
import InventoryDevices from '../InventoryDevices'
import InventorySims from '../InventorySims'
import InventoryAccessories from '../InventoryAccessories'
import EditCustomer from '../EditCustomer'
import EditSubscription from '../EditSubscription'
import Plans from '../Plans'
import AddPlan from '../Plans/addPlan'
import AddModel from '../../Modules/AddModel'
import AddDevice from '../../Modules/AddDevice'
import AddSim from '../../Modules/AddSim'
import AddProvider from '../../Modules/AddProvider'
import AddPartner from '../../Modules/AddPartner'
import AssignDevPartner from '../../Modules/AssignDevPartner'
import Subscriptions from '../Subscriptions'
import ViewSubscription from '../ViewSubscription'
import NewSubscription from '../NewSubscription'
import AssignDevices from '../AssignDevices/AssignInventory.jsx'
import SubscriptionDetails from '../SubscriptionDetails'
import ViewPlans from '../ViewPlans'
import AddManufacturer from '../../Modules/AddManufacturer'
import Gst from '../../Reusable/Gst'
import VehicleEdit from '../../Modules/VehicleRegistartion/VehicleEdit'
import BulkDeviceUpload from '../../Modules/BulkDeviceUpload'
import BulkSimUpload from '../../Modules/BulkSimUpload'
import BulkSimAssign from '../../Modules/BulkSimAssign'
import BulkDeviceAssign from '../../Modules/BulkDeviceAssign'
import RegisterBulkdevice from '../InventoryDevices/RegisterBulkDevice'
import RegisterBulkSim from '../InventorySims/RegisterBulkSim'
import VehcileDashboard from '../../Modules/VehcileDashboard'
import DeviceDashboard from '../../Modules/DeviceDashboard'
import RegisterBulkAccessory from '../InventoryAccessories/RegisterBulkAccessory'
import RegisterReseller from '../RegisterReseller'
import AssignLicenses from '../AssignLicenses'
import PullApi from '../../Modules/PullApi'
import createPlan from '../Plans/createPlan.jsx'
import UserDashboard from '../../Modules/UserDashboard/index.jsx'
import Reseller from '../Reseller'
import ResellerView from '../Reseller/ResellerView.jsx'
import ResellerEdit from '../Reseller/ResellerEdit.jsx'
import Partner from '../Partner'
import Manufacturer from '../Manufacturer'
import ViewLicense from '../Plans/ViewLicense.jsx'
import ManagePurchaseRequests from '../ManagePurchaseRequests'
import ApprovePurchaseRequest from '../ManagePurchaseRequests/ApprovePurchaseRequest.jsx'
import AssignDevicesForPR from '../ManagePurchaseRequests/AssignDevicesForPR.jsx'
import ViewPurchaseRequest from '../ManagePurchaseRequests/ViewPurchaseRequest.jsx'
import ViewDevice from '../../Modules/DeviceDashboard/ViewDevice'
import PartnerSMSPurchase from '../SMSPurchase/PartnerSMSPurchase'
import ClientSMSPurchase from '../SMSPurchase/ClientSMSPurchase'
import PartnerClientSMSReport from '../SMSPurchase/Reports/PartnerClientSMSReport'
import AdminClientSMSReport from '../SMSPurchase/Reports/AdminClientSMSReport'
import PanicAlertBitConfigurationSettings from '../PanicAlertBitConfigurationSettings'
import ViewVehicleList from '../../Modules/VehcileDashboard/ViewVehicleList'
import CurrentSummary from '../../Modules/CurrentSummary'
import ViewInventoryDevices from '../InventoryDevices/ViewInventoryDevices'
import RegisterBulkCustomer from '../RegisterCustomer/RegisterBulkCustomer.jsx'
import InvoiceDetails from '../Billing/InvoiceDetails'
import CreateProformaInvoice from '../Billing/CreateProformaInvoice'
import SearchDevice from '../SearchDevice'
import MakePayment from '../Billing/MakePayment'
import HistoryPacketReceived from '../Billing/HistoryPacketReceived'
import BillingDays from '../Billing/BillingDays'
import MakeAdvanceAmount from '../Billing/MakeAdvanceAmount'
import BillingHistoryReport from '../Billing/BillingHistoryReport'
import PartnerView from '../Partner/PartnerView.jsx'
import PartnerEdit from '../Partner/PartnerEdit.jsx'
import ClearRedis from '../ClearRedis'
import CurrentTrackinfo from '../../Modules/CurrentTrackinfo'
import FuelCalibration from '../FuelCalibration'
import PidsConfiguration from '../PidsConfiguration'
import IdleReport from '../IdleReport'
// import PaymentMethod from '../Billing/MakePayment/PaymentMethod.jsx'

// Reseller Pages
import ResLicense from '../reseller-module/License'
import ResViewLicense from '../reseller-module/License/ViewLicense'
import ResCustomers from '../reseller-module/Customers'
import ResRegisterCustomer from '../reseller-module/Customers/RegisterCustomer'
import ResViewCustomer from '../reseller-module/Customers/ViewCustomer'
import ResEditCustomer from '../reseller-module/Customers/EditCustomer'
import ResSubscriptions from '../reseller-module/Subscriptions'
import ResViewSubscription from '../reseller-module/Subscriptions/ViewSubscription'
import ResNewSubscription from '../reseller-module/Subscriptions/NewSubscription'
import ResEditSubscription from '../reseller-module/Subscriptions/EditSubscription'
import ResAssignDevices from '../reseller-module/Subscriptions/AssignDevices'
import ResInventoryDevices from '../reseller-module/InventoryDevices'
import ResViewInventoryDevices from '../reseller-module/InventoryDevices/ViewInventoryDevices'
import ResRegisterBulkDevices from '../reseller-module/InventoryDevices/RegisterBulkDevices'
import ResInventoryAccessories from '../reseller-module/InventoryAccessories'
import ResRegisterBulkAccessories from '../reseller-module/InventoryAccessories/RegisterBulkAccessories'
import ResInventorySims from '../reseller-module/InventorySims'
import ResRegisterBulkSim from '../reseller-module/InventorySims/RegisterBulkSim'
import ResVehicleRegistartion from '../reseller-module/VehicleRegistartion'
import ResVehicleEdit from '../reseller-module/VehicleRegistartion/VehicleEdit'
import ResBulkVehicleRegistration from '../reseller-module/VehicleRegistartion/BulkRegistration'
import ResPurchaseRequest from '../reseller-module/PurchaseRequest'
import ResNewRequest from '../reseller-module/PurchaseRequest/NewRequest.jsx'
import ResViewPendingRequest from '../reseller-module/PurchaseRequest/ViewPendingRequest.jsx'
import ResViewRequest from '../reseller-module/PurchaseRequest/ViewRequest.jsx'
import ResViewVehicleList from '../reseller-module/VehcileDashboard/ViewVehicleList'
import ResVehcileDashboard from '../reseller-module/VehcileDashboard'
import SATrackinfo from '../../Modules/CurrentTrackinfo/SATrackinfo.jsx'
import CreateDemoLink from '../CreateDemoLink'
import APIDashboard from '../APIDashboard'

const style = theme => ({
  [theme.breakpoints.up('sm')]: {
    drawerOpenMargin: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      }),
      marginLeft: MENU_DRAWER_WIDTH,
      width: `calc(100% - ${MENU_DRAWER_WIDTH}px)`
    },
    drawerClosedMargin: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      marginLeft: MINI_MENU_DRAWER_WIDTH,
      width: `calc(100% - ${MINI_MENU_DRAWER_WIDTH}px)`
    }
  },
  mainContent: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      boxSizing: 'border-box'
    },
    minHeight: 'calc(100vh - 48px)'
  }
})

class AppShell extends Component {
  state = {
    isMenuDrawerOpen: isWidthUp('sm', this.props.width, true),
    isAlertsDrawerOpen: false
  }

  handleMenuDrawerToggle = () => {
    this.setState({ isMenuDrawerOpen: !this.state.isMenuDrawerOpen })
  }

  handleAlertsDrawerToggle = () => {
    this.setState({ isAlertsDrawerOpen: !this.state.isAlertsDrawerOpen })
  }

  closeMobileMenuDrawer = () => {
    if (isWidthDown('xs', this.props.width, true)) {
      this.setState({ isMenuDrawerOpen: false })
    }
  }

  render() {
    const { classes } = this.props
    const mainClasses = [
      classes.mainContent,
      this.state.isMenuDrawerOpen
        ? classes.drawerOpenMargin
        : classes.drawerClosedMargin,
      'appbar-top-margin'
    ]

    return (
      <Fragment>
        <MenuDrawer
          isMenuDrawerOpen={this.state.isMenuDrawerOpen}
          closeMobileMenuDrawer={this.closeMobileMenuDrawer}
        />
        <Grid container>
          <NavBar
            handleMenuDrawerToggle={this.handleMenuDrawerToggle}
            handleAlertsDrawerToggle={this.handleAlertsDrawerToggle}
          />
          <main className={mainClasses.join(' ')}>
            <PrivateRoute path="/home/report" component={Report} />
            <PrivateRoute exact path="/home/add-model" component={AddModel} />
            <PrivateRoute
              exact
              path="/home/add-provider"
              component={AddProvider}
            />
            <PrivateRoute exact path="/home/add-device" component={AddDevice} />
            <PrivateRoute exact path="/home/add-sim" component={AddSim} />
            <PrivateRoute
              exact
              path="/home/add-partner"
              component={AddPartner}
            />
            <PrivateRoute
              exact
              path="/home/add-manufacturer"
              component={AddManufacturer}
            />
            <PrivateRoute
              exact
              path="/home/AssignDevPartner"
              component={AssignDevPartner}
            />
            <PrivateRoute exact path="/home/customers" component={Customers} />
            <PrivateRoute
              exact
              path="/home/customers/view/:loginId"
              component={ViewCustomer}
            />
            <PrivateRoute
              exact
              path="/home/inventory/devices"
              component={InventoryDevices}
            />
            <PrivateRoute
              exact
              path="/home/inventory/sims"
              component={InventorySims}
            />
            <PrivateRoute
              exact
              path="/home/inventory/sims/bulk-upload"
              component={RegisterBulkSim}
            />
            <PrivateRoute
              exact
              path="/home/inventory/accessories"
              component={InventoryAccessories}
            />
            <PrivateRoute
              exact
              path="/home/inventory/outward"
              component={InventoryOutward}
            />
            <PrivateRoute
              exact
              path="/home/customers/edit/:loginId"
              component={EditCustomer}
            />
            <PrivateRoute
              exact
              path="/home/customers/add"
              component={RegisterCustomer}
            />
            <PrivateRoute
              exact
              path="/home/customer/vehicle/register"
              component={VehicleRegistartion}
            />

            <PrivateRoute
              exact
              path="/home/customer/vehicle/register/bulk"
              component={BulkVehicleRegistration}
            />
            <PrivateRoute
              exact
              path="/home/customer/vehicle/registervehicle/:loginId"
              component={VehicleRegistartion}
            />
            <PrivateRoute exact path="/home/Plans" component={Plans} />
            <PrivateRoute
              exact
              path="/home/Plans/addPlan"
              component={AddPlan}
            />
            <PrivateRoute
              exact
              path="/home/subscriptions"
              component={Subscriptions}
            />
            <PrivateRoute
              exact
              path="/home/subscriptions/view"
              component={SubscriptionDetails}
            />
            <PrivateRoute
              exact
              path="/home/subscriptions/new"
              component={NewSubscription}
            />
            <PrivateRoute
              exact
              path="/home/subscriptions/new/:loginId"
              component={NewSubscription}
            />
            <PrivateRoute
              exact
              path="/home/subscriptions/view/:loginId/:subscriptionId"
              component={ViewSubscription}
            />
            <PrivateRoute
              exact
              path="/home/subscriptions/edit/:loginId/:subscriptionId"
              component={EditSubscription}
            />
            <PrivateRoute
              exact
              path="/home/Plans/view/:planId"
              component={ViewPlans}
            />

            <PrivateRoute
              exact
              path="/home/subscriptions/assign/:loginId/:subscriptionId"
              component={AssignDevices}
            />
            <PrivateRoute
              exact
              path="/home/vehicles/edit/:entityId"
              component={VehicleEdit}
            />
            <PrivateRoute exact path="/home/Gst" component={Gst} />
            <PrivateRoute
              exact
              path="/home/DeviceInventory/BulkUpload"
              component={BulkDeviceUpload}
            />
            <PrivateRoute
              exact
              path="/home/DeviceInventory/DeviceBulkUpload"
              component={RegisterBulkdevice}
            />
            <PrivateRoute
              exact
              path="/home/SimInventory/BulkSimUpload" // for SA inv
              component={BulkSimUpload}
            />

            <PrivateRoute
              exact
              path="/home/AccessoryInventory/RegisterBulkAccessory" // for business admin inv
              component={RegisterBulkAccessory}
            />
            <PrivateRoute
              exact
              path="/home/DeviceInventory/BulkDeviceAssign"
              component={BulkDeviceAssign}
            />
            <PrivateRoute
              exact
              path="/home/SimInventory/BulkSimAssign"
              component={BulkSimAssign}
            />
            <PrivateRoute
              exact
              path="/home/VehcileDashboard/Dashboard"
              component={VehcileDashboard}
            />
            <PrivateRoute
              exact
              path="/home/deviceDashboard/Dashboard"
              component={DeviceDashboard}
            />
            <PrivateRoute
              exact
              path="/home/RegisterReseller"
              component={RegisterReseller}
            />
            <PrivateRoute
              exact
              path="/home/AssignLicenses"
              component={AssignLicenses}
            />
            <PrivateRoute exact path="/home/device/api" component={PullApi} />
            <PrivateRoute
              exact
              path="/home/user/dashboard"
              component={UserDashboard}
            />
            <PrivateRoute
              exact
              path="/home/users/reseller"
              component={Reseller}
            />
            <PrivateRoute
              exact
              path="/home/reseller/view/:loginId"
              component={ResellerView}
            />
            <PrivateRoute
              exact
              path="/home/reseller/edit/:loginId"
              component={ResellerEdit}
            />
            <PrivateRoute
              exact
              path="/home/users/partner"
              component={Partner}
            />
            <PrivateRoute
              exact
              path="/home/users/manufacturer"
              component={Manufacturer}
            />
            <PrivateRoute
              exact
              path="/home/CreatePlan"
              component={createPlan}
            />
            <PrivateRoute
              exact
              path="/home/ViewLicense"
              component={ViewLicense}
            />
            <PrivateRoute
              exact
              path="/home/manage/purchase-requests"
              component={ManagePurchaseRequests}
            />
            <PrivateRoute
              exact
              path="/home/manage/purchase-requests/pending/:purchaseRequestId"
              component={ApprovePurchaseRequest}
            />
            <PrivateRoute
              exact
              path="/home/manage/purchase-requests/view/:purchaseRequestId"
              component={ViewPurchaseRequest}
            />
            <PrivateRoute
              exact
              path="/home/manage/purchase-requests/approved/:purchaseRequestId"
              component={AssignDevicesForPR}
            />
            <PrivateRoute
              exact
              path="/home/inventory/deviceview/:modelId"
              component={ViewDevice}
            />
            <PrivateRoute
              exact
              path="/home/manage/purchase-SMS"
              component={PartnerSMSPurchase}
            />
            <PrivateRoute
              exact
              path="/home/manage/partner/purchase-SMS"
              component={ClientSMSPurchase}
            />
            <PrivateRoute
              exact
              path="/home/manage/partner/SalesReport"
              component={PartnerClientSMSReport}
            />
            <PrivateRoute
              exact
              path="/home/manage/admin/SalesReport"
              component={AdminClientSMSReport}
            />

            <PrivateRoute
              exact
              path="/home/VehicleDashboard/ViewVehicles:status"
              component={ViewVehicleList}
            />
            <PrivateRoute
              exact
              path="/home/devices/view/:modelId"
              component={ViewInventoryDevices}
            />
            <PrivateRoute
              exact
              path="/home/customers/BulkRegister"
              component={RegisterBulkCustomer}
            />
            <PrivateRoute
              exact
              path="/home/manage/Clear-Redis"
              component={ClearRedis}
            />
            <PrivateRoute
              exact
              path="/home/manage/create-demo-link"
              component={CreateDemoLink}
            />
            <PrivateRoute
              exact
              path="/home/manage/admin/CurrentTrackinfo"
              component={CurrentTrackinfo}
            />
            <PrivateRoute
              exact
              path="/home/superAdmin/CurrentTrackinfo"
              component={SATrackinfo}
            />
            <PrivateRoute
              exact
              path="/home/settings/FuelCalibration"
              component={FuelCalibration}
            />
            <PrivateRoute
              exact
              path="/home/reports/IdleReport"
              component={IdleReport}
            />

            <PrivateRoute
              exact
              path="/home/manage/admin/PidsConfiguration"
              component={PidsConfiguration}
            />
            {/* Reseller Routes */}

            {/* Licenses */}
            <PrivateRoute
              exact
              path="/home/reseller/licenses"
              component={ResLicense}
            />
            <PrivateRoute
              exact
              path="/home/reseller/licenses/view/:licenseId"
              component={ResViewLicense}
            />

            {/* Customers */}
            <PrivateRoute
              exact
              path="/home/reseller/customers"
              component={ResCustomers}
            />
            <PrivateRoute
              exact
              path="/home/reseller/customers/add"
              component={ResRegisterCustomer}
            />
            <PrivateRoute
              exact
              path="/home/reseller/customers/view/:loginId"
              component={ResViewCustomer}
            />
            <PrivateRoute
              exact
              path="/home/reseller/customers/edit/:loginId"
              component={ResEditCustomer}
            />

            {/* Subscriptions */}
            <PrivateRoute
              exact
              path="/home/reseller/subscriptions"
              component={ResSubscriptions}
            />
            <PrivateRoute
              exact
              path="/home/reseller/subscriptions/view/:loginId/:subscriptionId"
              component={ResViewSubscription}
            />
            <PrivateRoute
              exact
              path="/home/reseller/subscriptions/new"
              component={ResNewSubscription}
            />
            <PrivateRoute
              exact
              path="/home/reseller/subscriptions/new/:loginId"
              component={ResNewSubscription}
            />
            <PrivateRoute
              exact
              path="/home/reseller/subscriptions/edit/:loginId/:subscriptionId"
              component={ResEditSubscription}
            />
            <PrivateRoute
              exact
              path="/home/reseller/subscriptions/assign/:loginId/:subscriptionId"
              component={ResAssignDevices}
            />

            {/* Inventory */}
            <PrivateRoute
              exact
              path="/home/reseller/devices"
              component={ResInventoryDevices}
            />
            <PrivateRoute
              exact
              path="/home/reseller/devices/bulk-register"
              component={ResRegisterBulkDevices}
            />
            <PrivateRoute
              exact
              path="/home/reseller/devices/view/:modelId"
              component={ResViewInventoryDevices}
            />
            <PrivateRoute
              exact
              path="/home/reseller/accessories"
              component={ResInventoryAccessories}
            />
            <PrivateRoute
              exact
              path="/home/reseller/accessories/bulk-register"
              component={ResRegisterBulkAccessories}
            />
            <PrivateRoute
              exact
              path="/home/reseller/sims"
              component={ResInventorySims}
            />
            <PrivateRoute
              exact
              path="/home/reseller/sims/bulk-register"
              component={ResRegisterBulkSim}
            />

            {/* Vehicle Registration */}
            <PrivateRoute
              exact
              path="/home/reseller/vehicles/register"
              component={ResVehicleRegistartion}
            />
            <PrivateRoute
              exact
              path="/home/reseller/vehicles/edit/:entityId"
              component={ResVehicleEdit}
            />
            <PrivateRoute
              exact
              path="/home/reseller/vehicles/bulk-register"
              component={ResBulkVehicleRegistration}
            />
            <PrivateRoute
              exact
              path="/home/reseller/VehicleDashboard/ViewVehicles:status"
              component={ResViewVehicleList}
            />
            <PrivateRoute
              exact
              path="/home/reseller/VehcileDashboard/Dashboard"
              component={ResVehcileDashboard}
            />

            {/* Purchase Requests */}
            <PrivateRoute
              exact
              path="/home/reseller/purchase-request"
              component={ResPurchaseRequest}
            />
            <PrivateRoute
              exact
              path="/home/reseller/purchase-request/new"
              component={ResNewRequest}
            />
            <PrivateRoute
              exact
              path="/home/reseller/purchase-request/pending/:purchaseRequestId"
              component={ResViewPendingRequest}
            />
            <PrivateRoute
              exact
              path="/home/reseller/purchase-request/view/:purchaseRequestId"
              component={ResViewRequest}
            />
            <PrivateRoute
              exact
              path="/home/reseller/purchase-request/view/:purchaseRequestId"
              component={PanicAlertBitConfigurationSettings}
            />
            <PrivateRoute
              exact
              path="/home/manage/admin/PanicAlertBitConfigurationSettings"
              component={PanicAlertBitConfigurationSettings}
            />
            <PrivateRoute
              exact
              path="/home/manage/admin/CurrentSummary"
              component={CurrentSummary}
            />
            <PrivateRoute
              exact
              path="/home/manage/admin/InvoiceDetails"
              component={InvoiceDetails}
            />
            <PrivateRoute
              exact
              path="/home/manage/admin/CreateProformaInvoice/:id"
              component={CreateProformaInvoice}
            />
            <PrivateRoute
              exact
              path="/home/manage/search-Device"
              component={SearchDevice}
            />
            <PrivateRoute
              exact
              path="/home/manage/makePayment/:id"
              component={MakePayment}
            />
            <PrivateRoute
              exact
              path="/home/manage/histroyPacketRcv"
              component={HistoryPacketReceived}
            />
            <PrivateRoute
              exact
              path="/home/manage/billingDays"
              component={BillingDays}
            />
            <PrivateRoute
              exact
              path="/home/manage/makeAdvanceAmount"
              component={MakeAdvanceAmount}
            />
            <PrivateRoute
              exact
              path="/home/manage/billingHistoryReport"
              component={BillingHistoryReport}
            />
            <PrivateRoute
              path="/home/partner/view/:loginId"
              component={PartnerView}
            />
            <PrivateRoute
              exact
              path="/home/partner/edit/:loginId"
              component={PartnerEdit}
            />
            <PrivateRoute
              exact
              path="/home/manage/api-dashboard"
              render={() => <APIDashboard />}
            />
          </main>
        </Grid>
      </Fragment>
    )
  }
}

export default withWidth()(withStyles(style)(AppShell))
