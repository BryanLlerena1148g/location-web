import React from 'react'
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material'
import {
  Refresh,
  Computer,
  LocationOn,
  Schedule,
  TrendingUp,
  FilterList
} from '@mui/icons-material'

const LocationSidebar = ({
  machines,
  locations,
  selectedMachine,
  selectedLocation,
  stats,
  loading,
  error,
  filters,
  onMachineSelect,
  onLocationSelect,
  onFilterChange,
  onRefresh
}) => {

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora mismo'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays === 1) return 'Ayer'
    return `Hace ${diffDays} días`
  }

  const getLocationStatusColor = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffHours = (now - time) / (1000 * 60 * 60)
    
    if (diffHours < 1) return 'success'
    if (diffHours < 6) return 'warning'
    return 'error'
  }

  return (
    <Box className="sidebar" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header con controles */}
      <Paper elevation={2} sx={{ p: 2, m: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="h2">
            📊 Control Panel
          </Typography>
          <IconButton onClick={onRefresh} disabled={loading} color="primary">
            <Refresh />
          </IconButton>
        </Box>

        {/* Filtros */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Límite"
              value={filters.limit}
              onChange={(e) => onFilterChange({ limit: parseInt(e.target.value) || 100 })}
              inputProps={{ min: 10, max: 1000 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Últimas horas"
              value={filters.hours}
              onChange={(e) => onFilterChange({ hours: parseInt(e.target.value) || 24 })}
              inputProps={{ min: 1, max: 168 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Estadísticas rápidas */}
      {stats && (
        <Paper elevation={1} sx={{ p: 2, m: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            📈 Estadísticas Generales
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Chip
                icon={<LocationOn />}
                label={`${stats.total_locations || 0} ubicaciones`}
                size="small"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <Chip
                icon={<Computer />}
                label={`${stats.unique_machines || 0} equipos`}
                size="small"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Lista de máquinas */}
      <Paper elevation={1} sx={{ p: 2, m: 1, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle2">
            🖥️ Máquinas ({machines.length})
          </Typography>
          {selectedMachine && (
            <Button
              size="small"
              onClick={() => onMachineSelect('')}
              variant="outlined"
            >
              Ver todas
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 1 }} size="small">
            {error}
          </Alert>
        )}

        <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }} dense>
          {machines.map((machine) => (
            <ListItem key={machine.name} disablePadding>
              <ListItemButton
                selected={selectedMachine === machine.name}
                onClick={() => onMachineSelect(machine.name)}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" noWrap>
                        {machine.name}
                      </Typography>
                      <Chip
                        label={machine.locations_count || machine.count}
                        size="small"
                        color={getLocationStatusColor(machine.last_seen)}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="textSecondary">
                      {formatTimeAgo(machine.last_seen)}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Lista de ubicaciones */}
      <Paper elevation={1} sx={{ p: 2, m: 1, flexGrow: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle2" gutterBottom>
          📍 Ubicaciones {selectedMachine ? `de ${selectedMachine}` : 'recientes'} ({locations.length})
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={30} />
          </Box>
        ) : (
          <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }} dense>
            {locations.map((location, index) => (
              <ListItem key={`${location.id}-${index}`} disablePadding>
                <ListItemButton
                  selected={selectedLocation && selectedLocation.id === location.id}
                  onClick={() => onLocationSelect(location)}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                  className="location-item"
                >
                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant="body2" noWrap>
                          📱 {location.machine_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          📍 {location.city || 'Ciudad desconocida'}, {location.country || 'País desconocido'}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          🕒 {formatTimeAgo(location.created_at || location.timestamp)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          🎯 {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}

            {locations.length === 0 && !loading && (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="textSecondary" textAlign="center">
                      {selectedMachine 
                        ? `No hay ubicaciones para ${selectedMachine} en las últimas ${filters.hours} horas`
                        : 'No hay ubicaciones disponibles'
                      }
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        )}
      </Paper>

      {/* Información detallada de ubicación seleccionada */}
      {selectedLocation && (
        <Paper elevation={2} sx={{ p: 2, m: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            📋 Detalles de Ubicación
          </Typography>
          <Typography variant="body2" component="div">
            <Box mb={1}>
              <strong>📱 Máquina:</strong> {selectedLocation.machine_name}
            </Box>
            <Box mb={1}>
              <strong>👤 Usuario:</strong> {selectedLocation.user_name || 'N/A'}
            </Box>
            <Box mb={1}>
              <strong>🕒 Timestamp:</strong> {new Date(selectedLocation.created_at || selectedLocation.timestamp).toLocaleString()}
            </Box>
            <Box mb={1}>
              <strong>📡 Fuente:</strong> {selectedLocation.location_source || 'Desconocida'}
            </Box>
            {selectedLocation.accuracy && (
              <Box mb={1}>
                <strong>🎯 Precisión:</strong> {selectedLocation.accuracy}m
              </Box>
            )}
            {selectedLocation.public_ip && (
              <Box mb={1}>
                <strong>🌐 IP Pública:</strong> {selectedLocation.public_ip}
              </Box>
            )}
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default LocationSidebar