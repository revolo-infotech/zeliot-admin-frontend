import React, { Component } from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import FolderIcon from '@material-ui/icons/Folder'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Loader from '../../../components/common/Loader'

const GET_PLAN_INFO = gql`
  query getPlans($id: Int!) {
    planinfo: getPlans(id: $id) {
      id
      planName
      description
      costPerAsset
      featureList {
        featureName
        costPerAssetPerMonth
      }
    }
  }
`
const style = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  button: {
    margin: theme.spacing.unit
  },
  input: {
    display: 'none'
  }
})

class PlanDetails extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }

  mapToArr = data => {
    const FeatureList = data.map(item => (
      <ListItem>
        <ListItemIcon>
          <FolderIcon />
        </ListItemIcon>
        {/* <ListItemText>{`${item.featureName}-${
          item.costPerAssetPerMonth
        }`}</ListItemText> */}
        <ListItemText>{`${item.featureName}`}</ListItemText>
      </ListItem>
    ))
    return FeatureList
  }

  render() {
    const { classes } = this.props
    return (
      <Query
        query={GET_PLAN_INFO}
        variables={{
          id: parseInt(this.props.planId, 10)
        }}
      >
        {({ loading, error, data: { planinfo } }) => {
          if (loading) return <Loader />
          if (error) return `Error!: ${error}`
          const retarr = this.mapToArr(planinfo.featureList)
          return (
            <Grid container spacing={16}>
              <Grid item xs={12}>
                <Typography variant="headline">{planinfo.planName}</Typography>
              </Grid>
              <Grid item xs={12}>
                <ExpansionPanel>
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography className={classes.heading}>
                      Feature List
                    </Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <List dense="false">{retarr}</List>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </Grid>
            </Grid>
          )
          // return (
          //   <div>
          //     <Grid item>
          //       <CardContent>
          //         <Typography
          //           className={classes.title}
          //           color="textSecondary"
          //           variant="caption"
          //         >
          //           Plan Name
          //         </Typography>
          //         <Typography variant="headline">
          //           {planinfo.planName}
          //         </Typography>
          //       </CardContent>
          //     </Grid>
          //     <Grid item>
          //       <ExpansionPanel>
          //         <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          //           <Typography className={classes.heading}>
          //             Feature List
          //           </Typography>
          //         </ExpansionPanelSummary>
          //         <ExpansionPanelDetails>
          //           <List dense="false">{retarr}</List>
          //         </ExpansionPanelDetails>
          //       </ExpansionPanel>
          //     </Grid>
          //   </div>
          // )
        }}
      </Query>
    )
  }
}
PlanDetails.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(style)(PlanDetails)
