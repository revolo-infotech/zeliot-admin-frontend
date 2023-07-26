import React from 'react'
import Grid from '@material-ui/core/Grid'
import LoginForm from '../../Modules/LoginForm'
import LandingImg from '../../../static/png/landing-bg.jpg'

const style = {
  whiteText: {
    color: '#ffffff'
  },
  blackText: {
    color: '#000000'
  },
  gradient2: {
    zIndex: 10
  },
  fullScreen: {
    width: '100vw',
    height: '100vh'
  }
}

function Landing({ background, logo }) {
  return (
    <div
      style={{
        backgroundImage: `url(${background || LandingImg})`,
        backgroundSize: 'cover'
      }}
    >
      <div className="Landing" style={style.gradient2}>
        <Grid
          container
          alignItems="center"
          justify="center"
          style={style.fullScreen}
        >
          <Grid item xs={12} sm={6} md={5} lg={4}>
            <LoginForm logo={logo} />
          </Grid>
        </Grid>
      </div>
    </div>
  )
}

export default Landing
