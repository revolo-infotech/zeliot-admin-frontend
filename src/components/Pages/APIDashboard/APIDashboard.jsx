import React from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import {
  Grid,
  Typography,
  Divider,
  withStyles,
  Button,
  Paper,
  Chip
} from '@material-ui/core'
import { DateTimePicker } from 'material-ui-pickers'
import MultiCheckComboBox from '../../common/MultiCheckComboBox'

const styles = {
  container: {
    background: 'white',
    height: '100%'
  },

  itemPadding: {
    padding: 16
  }
}

const GET_BUSINESS_ADMINS = gql`
  {
    partners: allPartnerDetails(status: 1) {
      name: businessName
      login {
        id: loginId
        username
      }
    }
  }
`

const GET_CLIENTS = gql`
  query($id: Int) {
    clients: allClientDetails(partnerLoginId: $id, status: 1) {
      name: clientName
      id: loginId
      login {
        username
      }
    }
  }
`

const GET_API_STATS = gql`
  query(
    $partnerIds: [Int!]!
    $clientIds: [Int!]!
    $from: String!
    $to: String!
    $limit: Int
  ) {
    apiStats: getApiStat(
      businessAdminId: $partnerIds
      clientId: $clientIds
      fromTimestamp: $from
      toTimestamp: $to
      limit: $limit
    ) {
      apiName
      apiCount
      apiType
    }
  }
`

function APIDashboard(props) {
  const [fromTime, setFromTime] = React.useState(null)
  const [toTime, setToTime] = React.useState(null)

  const [selectedPartners, setSelectedPartners] = React.useState([])
  const [selectedClients, setSelectedClients] = React.useState([])

  const [loadingPartners, setLoadingPartners] = React.useState(false)
  const [partners, setPartners] = React.useState([])

  const [loadingClients, setLoadingClients] = React.useState(false)
  const [clients, setClients] = React.useState([])

  const [newPartner, setNewPartner] = React.useState(null)

  const [apiStats, setApiStats] = React.useState(null)

  React.useEffect(() => {}, [selectedPartners])

  React.useEffect(
    () => {
      async function fetchBusinessAdmins() {
        setLoadingPartners(true)

        const response = await props.client.query({
          query: GET_BUSINESS_ADMINS
        })

        setLoadingPartners(false)

        if (response && response.data && response.data.partners) {
          setPartners(
            response.data.partners.map(partner => ({
              id: partner.login.id,
              name: `${partner.name} (${partner.login.username})`
            }))
          )
        }
      }

      fetchBusinessAdmins()
    },
    [props.client]
  )

  React.useEffect(
    () => {
      function filterClients(allClients) {
        const selectedPartnerIds = selectedPartners.map(p => p.id)

        const filteredClients = allClients.filter(client =>
          selectedPartnerIds.includes(client.partnerId)
        )

        setClients(filteredClients)

        const filteredClientIds = filteredClients.map(c => c.id)

        setSelectedClients(selectedClients =>
          selectedClients.filter(sc => filteredClientIds.includes(sc.id))
        )
      }

      async function fetchClients(id) {
        setLoadingClients(true)

        const response = await props.client.query({
          query: GET_CLIENTS,
          variables: {
            id
          }
        })

        setLoadingClients(false)

        if (response && response.data && response.data.clients) {
          const allClients = clients.concat(
            response.data.clients.map(client => ({
              id: client.id,
              name: `${client.name} (${client.login.username})`,
              partnerId: id
            }))
          )

          filterClients(allClients)
        }
      }

      if (newPartner) {
        fetchClients(newPartner.id)
      } else {
        filterClients(clients)
      }
    },
    [props.client, selectedPartners, newPartner]
  )

  function handleSelectedPartnersChange(newSelectedPartners) {
    if (newSelectedPartners.length < selectedPartners.length) {
      setNewPartner(null)
      setSelectedPartners(newSelectedPartners)
    } else {
      for (let n of newSelectedPartners) {
        let flag = false
        for (let p of selectedPartners) {
          if (p.id === n.id) {
            flag = true
            break
          }
        }

        if (!flag) {
          setNewPartner(n)
          break
        }
      }

      setSelectedPartners(newSelectedPartners)
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault()
    const response = await props.client.query({
      query: GET_API_STATS,
      variables: {
        partnerIds: selectedPartners.map(p => p.id),
        clientIds: selectedClients.map(c => c.id),
        from: String(fromTime.unix()),
        to: String(toTime.unix())
      }
    })

    if (response && response.data && response.data.apiStats) {
      setApiStats(response.data.apiStats)
    }
  }

  const handleDelete = (id, type) => {
    if (type === 'partner') {
      setSelectedPartners(selectedPartners =>
        selectedPartners.filter(partner => partner.id !== id)
      )
    } else {
      setSelectedClients(selectedClients =>
        selectedClients.filter(client => client.id !== id)
      )
    }
  }

  const { classes } = props

  const enableSubmit = selectedClients.length > 0 && fromTime && toTime

  return (
    <Grid container className={classes.container} alignContent="flex-start">
      <Grid item xs={12} className={classes.itemPadding}>
        <Typography variant="title">API Dashboard</Typography>
      </Grid>

      <Grid item xs={12}>
        <Divider />
      </Grid>

      <Grid item xs={12} className={classes.itemPadding}>
        <form onSubmit={handleFormSubmit}>
          <Grid container spacing={16} alignItems="center">
            <Grid item>
              <MultiCheckComboBox
                items={partners}
                itemKey="id"
                itemToStringKey="name"
                itemToLabelKey="type"
                placeholder="Select Business admins"
                isLoading={loadingPartners}
                filterSize={100}
                selectedItems={selectedPartners}
                onSelectedItemsChange={handleSelectedPartnersChange}
                searchByFields={['name']}
              />
            </Grid>

            <Grid item>
              <MultiCheckComboBox
                items={clients}
                itemKey="id"
                itemToStringKey="name"
                itemToLabelKey="type"
                placeholder="Select Clients"
                isLoading={loadingClients}
                filterSize={100}
                selectedItems={selectedClients}
                onSelectedItemsChange={setSelectedClients}
                searchByFields={['name']}
                disabled={selectedPartners.length === 0}
              />
            </Grid>

            <Grid item>
              <DateTimePicker
                label="From Time"
                value={fromTime}
                onChange={setFromTime}
                inputProps={{
                  name: 'fromTime'
                }}
              />
            </Grid>

            <Grid item>
              <DateTimePicker
                label="To Time"
                value={toTime}
                onChange={setToTime}
                inputProps={{
                  name: 'toTime'
                }}
              />
            </Grid>

            <Grid item>
              <Button
                color="primary"
                variant="outlined"
                disabled={!enableSubmit}
                type="submit"
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Grid>

      <Grid item xs={12} container style={{ padding: 16 }} spacing={16}>
        {selectedPartners.length > 0 && (
          <React.Fragment>
            <Grid item xs={12}>
              <Typography>Business Admins</Typography>
            </Grid>

            {selectedPartners.map(partner => (
              <Grid item>
                <Chip
                  label={partner.name}
                  onDelete={() => handleDelete(partner.id, 'partner')}
                />
              </Grid>
            ))}
          </React.Fragment>
        )}

        {selectedClients.length > 0 && (
          <React.Fragment>
            <Grid item xs={12}>
              <Typography>Clients</Typography>
            </Grid>
            {selectedClients.map(client => (
              <Grid item>
                <Chip
                  label={client.name}
                  onDelete={() => handleDelete(client.id, 'client')}
                />
              </Grid>
            ))}
          </React.Fragment>
        )}
      </Grid>

      <Grid item xs={12}>
        <Divider />
      </Grid>

      {apiStats && (
        <Grid item xs={12} container spacing={16} style={{ padding: 16 }}>
          {!apiStats.length ? (
            <Grid item xs={12}>
              <Typography>No API Stats available</Typography>
            </Grid>
          ) : (
            apiStats.map(stat => (
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Paper style={{ padding: 8 }}>
                  <Grid container spacing={8}>
                    <Grid item xs={12}>
                      <Typography
                        align="right"
                        style={{
                          color:
                            stat.apiType === 'query'
                              ? '#b52253'
                              : stat.apiType === 'mutation'
                                ? '#296994'
                                : '#759c1c'
                        }}
                      >
                        {stat.apiType}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography align="center" variant="subheading">
                        {stat.apiName}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography align="center" variant="title">
                        {stat.apiCount}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Grid>
  )
}

export default withStyles(styles)(withApollo(APIDashboard))
