import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import { withStyles, Typography } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Popover from '@material-ui/core/Popover'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import gql from 'graphql-tag'
import { AuthConsumer } from '@/auth'
import getLoginId from '../../../utils/getLoginId'

const GET_PARTNER = gql`
  query partnerDetail($loginId: Int) {
    partnerDetail(loginId: $loginId) {
      businessName
      email
    }
  }
`
const GET_RESELLER = gql`
  query getResellerDetails($loginId: Int) {
    getResellerDetails(loginId: $loginId) {
      resellerName
      email
    }
  }
`

const styles = theme => ({
  accountMenuPopover: {
    zIndex: 2200
  },
  accountCard: {
    width: '300px',
    borderRadius: '5px'
  },
  cardContent: {
    padding: '10px !important'
  },
  LogoutButton: {
    borderColor: 'rgb(230, 50, 50)'
  }
})

class AccountMenu extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loginUserName: '',
      loginEmail: ''
    }
  }

  static propTypes = {
    isAccountMenuOpen: PropTypes.bool.isRequired
  }

  getLoginDetails = async () => {
    const accountType = localStorage.getItem('Account_type')

    if (accountType === 'PA') {
      const partnerDetail = await this.props.client.query({
        query: GET_PARTNER,
        variables: {
          loginId: getLoginId()
        }
      })
      this.setState({
        loginUserName: partnerDetail.data.partnerDetail.businessName,
        loginEmail: partnerDetail.data.partnerDetail.email
      })
    } else if (accountType === 'RES') {
      const ResellerDetails = await this.props.client.query({
        query: GET_RESELLER,
        variables: {
          loginId: getLoginId()
        }
      })
      this.setState({
        loginUserName: ResellerDetails.data.getResellerDetails.resellerName,
        loginEmail: ResellerDetails.data.getResellerDetails.email
      })
    } else {
      this.setState({
        loginUserName: 'Zeliot',
        loginEmail: 'contact@zeliot.in'
      })
    }
  }

  componentDidMount() {
    this.getLoginDetails()
  }

  render() {
    const { classes, isAccountMenuOpen } = this.props

    return (
      <Popover
        className={classes.accountMenuPopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        open={isAccountMenuOpen}
        anchorEl={this.props.anchorEl}
        onClose={this.props.onClose}
      >
        <Card className={classes.accountCard}>
          <CardContent className={classes.cardContent}>
            <Grid container spacing={8}>
              <Grid item xs={12}>
                <Typography variant="body2">Account</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption">Name</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography> {this.state.loginUserName} </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption">Email</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>{this.state.loginEmail}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Grid container justify="flex-end">
                  <Button
                    className={classes.LogoutButton}
                    variant="outlined"
                    onClick={this.props.logout}
                  >
                    Logout
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Popover>
    )
  }
}

export default withStyles(styles)(
  withRouter(
    withApollo(props => (
      <AuthConsumer>
        {({ logout }) => <AccountMenu {...props} logout={logout} />}
      </AuthConsumer>
    ))
  )
)
