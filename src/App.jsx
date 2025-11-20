import React, { useState, useEffect } from 'react'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Grid, 
  Paper,
  Box
} from '@mui/material'
import LocationMap from './components/LocationMap'
import LocationSidebar from './components/LocationSidebar'
import { fetchLocations, fetchMachines, fetchStats } from './services/api'

function App() {
  const [locations, setLocations] = useState([])
  const [machines, setMachines] = useState([])
  const [selectedMachine, setSelectedMachine] = useState('')
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    limit: 100,
    hours: 24
  })

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  // Cargar ubicaciones cuando cambian los filtros
  useEffect(() => {
    loadLocations()
  }, [selectedMachine, filters])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [machinesData, statsData] = await Promise.all([
        fetchMachines(),
        fetchStats()
      ])
      
      setMachines(machinesData.machines || [])
      setStats(statsData.statistics || null)
    } catch (err) {
      console.error('Error loading initial data:', err)
      setError('Error cargando datos iniciales')
    } finally {
      setLoading(false)
    }
  }

  const loadLocations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let locationsData
      if (selectedMachine) {
        // Cargar ubicaciones de máquina específica
        locationsData = await fetchLocations(`/machine/${selectedMachine}`, {
          limit: filters.limit,
          hours: filters.hours
        })
      } else {
        // Cargar todas las ubicaciones
        locationsData = await fetchLocations('', {
          limit: filters.limit
        })
      }
      
      setLocations(locationsData.locations || [])
    } catch (err) {
      console.error('Error loading locations:', err)
      setError('Error cargando ubicaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleMachineSelect = (machineName) => {
    setSelectedMachine(machineName)
    setSelectedLocation(null)
  }

  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }

  const handleRefresh = () => {
    loadLocations()
    loadInitialData()
  }

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🗺️ Location Tracker Viewer
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {selectedMachine ? `📱 ${selectedMachine}` : '🌍 Todas las máquinas'} 
            {locations.length > 0 && ` • ${locations.length} ubicaciones`}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, display: 'flex', height: 'calc(100vh - 64px)' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Sidebar */}
          <Grid item xs={12} md={4} lg={3}>
            <LocationSidebar
              machines={machines}
              locations={locations}
              selectedMachine={selectedMachine}
              selectedLocation={selectedLocation}
              stats={stats}
              loading={loading}
              error={error}
              filters={filters}
              onMachineSelect={handleMachineSelect}
              onLocationSelect={handleLocationSelect}
              onFilterChange={handleFilterChange}
              onRefresh={handleRefresh}
            />
          </Grid>

          {/* Map */}
          <Grid item xs={12} md={8} lg={9}>
            <LocationMap
              locations={locations}
              selectedLocation={selectedLocation}
              loading={loading}
              onLocationSelect={handleLocationSelect}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default App