import React, { Component } from 'react'
import Checkbox from '@material-ui/core/Checkbox'
import Grid from '@material-ui/core/Grid'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'

export default class AllFeatures extends Component {
  // constructor(props) {
  //   super(props)
  // }
  render() {
    // console.log('component=', this.props.defaultFeatures)
    const featuresLists = this.props.allFeaturesList
    // const defaultFeatures = this.props.defaultFeatures
    const tempState = this.props.tempState
    // let defaultFeaturesIds
    // if (defaultFeatures) {
    //   defaultFeaturesIds = defaultFeatures.getPlans.featureList.map(
    //     item => item.id
    //   )
    // }
    console.log('featuresLists', featuresLists)
    console.log('tempState', tempState)
    return (
      <Grid container>
        <Grid item xs={12}>
          <FormGroup>
            <Grid container>
              {featuresLists.features &&
                featuresLists.features.map(featuresList => (
                  <Grid item xs={12} sm={6} md={4} key={featuresList.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={tempState[featuresList.id]}
                          onChange={this.props.handleChangeChecked(
                            featuresList.id,
                            featuresList.costPerAssetPerMonth
                          )}
                          value={featuresList.id}
                        />
                      }
                      label={featuresList.featureName}
                    />
                  </Grid>
                ))}
              {/* {defaultFeatures === undefined &&
                featuresList.map(allFeatures => {
                  return (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={tempState.id}
                          // onChange={this.props.handleChangeChecked()}
                          value={allFeatures.id}
                        />
                      }
                      label={allFeatures.featureName}
                    />
                  )
                })} */}
              {/* {defaultFeatures !== undefined &&
                featuresList.map(allFeature => {
                  if (defaultFeaturesIds.includes(allFeature.id)) {
                    return (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked="true"
                            // onChange={this.props.handleChangeChecked('one')}
                            value={allFeature.id}
                          />
                        }
                        label={allFeature.featureName}
                      />
                    )
                  } else {
                    return (
                      <FormControlLabel
                        control={<Checkbox value={allFeature.id} />}
                        label={allFeature.featureName}
                      />
                    )
                  }
                })} */}
            </Grid>
          </FormGroup>
        </Grid>
      </Grid>
    )
  }
}
