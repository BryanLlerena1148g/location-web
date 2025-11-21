import React, { useState, useEffect } from 'react'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Grid, 
  Paper,
  Box,
  Tabs,
  Tab
} from '@mui/material'
import {
  Map as MapIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material'
import LocationMap from './components/LocationMap'
import LocationSidebar from './components/LocationSidebar'
import AdminPanel from './components/AdminPanel'
import { fetchLocations, fetchMachines, fetchStats } from './services/api'

function App() {
  const [activeTab, setActiveTab] = useState(0)
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🗺️ adobeFirewall Tracker
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {activeTab === 0 && (
              selectedMachine ? `📱 ${selectedMachine}` : '🌍 Todas las máquinas'
            )}
            {activeTab === 0 && locations.length > 0 && ` • ${locations.length} ubicaciones`}
            {activeTab === 1 && '⚠️ Modo Administración'}
          </Typography>
        </Toolbar>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.1)',
            '& .MuiTab-root': { 
              color: 'rgba(255,255,255,0.7)',
              minHeight: 48
            },
            '& .Mui-selected': { 
              color: 'white !important' 
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'white'
            }
          }}
        >
          <Tab 
            icon={<MapIcon />} 
            label="Mapa de Ubicaciones" 
            iconPosition="start"
            sx={{ textTransform: 'none' }}
          />
          <Tab 
            icon={<AdminIcon />} 
            label="Panel de Administración" 
            iconPosition="start"
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
      </AppBar>

      <Box sx={{ flexGrow: 1, height: 'calc(100vh - 112px)' }}>
        {activeTab === 0 && (
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
        )}

        {activeTab === 1 && <AdminPanel />}
      </Box>
    </Box>
  )
}

export default App