import React from 'react'
import Loadable from 'react-loadable'
import Loader from '../components/common/Loader'

export const AsyncDefaultLanding = Loadable({
  loader: () => import('../components/Pages/Landing'),
  loading: () => <Loader fullscreen={true} />
})

export const AsyncPlainLanding = Loadable({
  loader: () => import('../components/Pages/PlainLanding'),
  loading: () => <Loader fullscreen={true} />
})