import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material'
import {
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import { clearAllData, clearMachineData, fetchMachines, fetchDatabaseInfo } from '../services/api'

const AdminPanel = () => {
  const [machines, setMachines] = useState([])
  const [databaseInfo, setDatabaseInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [openClearAll, setOpenClearAll] = useState(false)
  const [openClearMachine, setOpenClearMachine] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Cargar lista de máquinas
  const loadMachines = async () => {
    try {
      setLoading(true)
      const data = await fetchMachines()
      setMachines(data.machines || [])
    } catch (error) {
      showSnackbar('Error cargando máquinas: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Cargar información de base de datos
  const loadDatabaseInfo = async () => {
    try {
      const data = await fetchDatabaseInfo()
      setDatabaseInfo(data.database || null)
    } catch (error) {
      showSnackbar('Error cargando información de BD: ' + error.message, 'error')
    }
  }

  // Mostrar notificación
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  // Limpiar todos los datos
  const handleClearAll = async () => {
    if (confirmText !== 'ELIMINAR TODO') {
      showSnackbar('Debes escribir "ELIMINAR TODO" para confirmar', 'error')
      return
    }

    try {
      setLoading(true)
      const result = await clearAllData()
      showSnackbar(`✅ ${result.message}. Registros eliminados: ${result.deleted_records}`, 'success')
      setOpenClearAll(false)
      setConfirmText('')
      loadMachines() // Recargar lista
      loadDatabaseInfo() // Recargar info de BD
    } catch (error) {
      showSnackbar('Error eliminando datos: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Limpiar datos de máquina específica
  const handleClearMachine = async () => {
    if (confirmText !== 'ELIMINAR MAQUINA') {
      showSnackbar('Debes escribir "ELIMINAR MAQUINA" para confirmar', 'error')
      return
    }

    try {
      setLoading(true)
      const result = await clearMachineData(selectedMachine)
      showSnackbar(`✅ ${result.message}. Registros eliminados: ${result.deleted_records}`, 'success')
      setOpenClearMachine(false)
      setConfirmText('')
      setSelectedMachine('')
      loadMachines() // Recargar lista
      loadDatabaseInfo() // Recargar info de BD
    } catch (error) {
      showSnackbar('Error eliminando datos: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Abrir dialog para limpiar máquina específica
  const openClearMachineDialog = (machineName) => {
    setSelectedMachine(machineName)
    setOpenClearMachine(true)
  }

  React.useEffect(() => {
    loadMachines()
    loadDatabaseInfo()
  }, [])

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="error">
        ⚠️ Panel de Administración
      </Typography>
      
      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>ADVERTENCIA:</strong> Las operaciones de eliminación son irreversibles. 
        Úsalas con extrema precaución.
      </Alert>

      <Grid container spacing={3}>
        {/* Información de base de datos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💾 Información de Base de Datos
              </Typography>
              {databaseInfo ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      📁 Tamaño del archivo
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {databaseInfo.file?.size_human || 'N/A'}
                    </Typography>
                    <Typography variant="caption">
                      ({databaseInfo.file?.size_mb} MB)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      📊 Total de registros
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {databaseInfo.statistics?.total_records?.toLocaleString() || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      🗂️ Páginas SQLite
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {databaseInfo.sqlite?.page_count?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="caption">
                      ({databaseInfo.sqlite?.page_size} bytes/página)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      📅 Última modificación
                    </Typography>
                    <Typography variant="body2">
                      {databaseInfo.file?.last_modified 
                        ? new Date(databaseInfo.file.last_modified).toLocaleString()
                        : 'N/A'
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={loadDatabaseInfo}
                      disabled={loading}
                    >
                      🔄 Actualizar Información
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Cargando información de base de datos...
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Acciones globales */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error">
                🗑️ Limpiar Base de Datos Completa
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Elimina TODAS las ubicaciones de TODAS las máquinas. Esta acción no se puede deshacer.
              </Typography>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteSweepIcon />}
                onClick={() => setOpenClearAll(true)}
                disabled={loading}
                fullWidth
              >
                Limpiar Toda la Base de Datos
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de máquinas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🖥️ Máquinas Registradas
              </Typography>
              <Button
                variant="outlined"
                onClick={loadMachines}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                Recargar Lista
              </Button>
              
              {machines.length > 0 ? (
                <List dense>
                  {machines.map((machine) => (
                    <React.Fragment key={machine.machine_name}>
                      <ListItem>
                        <ListItemText
                          primary={machine.machine_name}
                          secondary={`${machine.count} ubicaciones • Última vez: ${new Date(machine.last_seen).toLocaleString()}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => openClearMachineDialog(machine.machine_name)}
                            title={`Eliminar datos de ${machine.machine_name}`}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay máquinas registradas o están cargando...
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog: Limpiar toda la base de datos */}
      <Dialog open={openClearAll} onClose={() => setOpenClearAll(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon color="error" sx={{ mr: 1 }} />
            Confirmar Eliminación Total
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Vas a eliminar TODAS las ubicaciones de TODAS las máquinas.
            Esta acción es IRREVERSIBLE.
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Para confirmar, escribe exactamente: <strong>ELIMINAR TODO</strong>
          </Typography>
          <TextField
            fullWidth
            label="Confirmación"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="ELIMINAR TODO"
            error={confirmText !== '' && confirmText !== 'ELIMINAR TODO'}
            helperText={confirmText !== '' && confirmText !== 'ELIMINAR TODO' ? 'Texto incorrecto' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenClearAll(false); setConfirmText('') }}>
            Cancelar
          </Button>
          <Button
            onClick={handleClearAll}
            color="error"
            variant="contained"
            disabled={loading || confirmText !== 'ELIMINAR TODO'}
          >
            {loading ? 'Eliminando...' : 'Eliminar Todo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Limpiar máquina específica */}
      <Dialog open={openClearMachine} onClose={() => setOpenClearMachine(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon color="error" sx={{ mr: 1 }} />
            Eliminar Datos de Máquina
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Vas a eliminar todas las ubicaciones de: <strong>{selectedMachine}</strong>
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Para confirmar, escribe exactamente: <strong>ELIMINAR MAQUINA</strong>
          </Typography>
          <TextField
            fullWidth
            label="Confirmación"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="ELIMINAR MAQUINA"
            error={confirmText !== '' && confirmText !== 'ELIMINAR MAQUINA'}
            helperText={confirmText !== '' && confirmText !== 'ELIMINAR MAQUINA' ? 'Texto incorrecto' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenClearMachine(false); setConfirmText(''); setSelectedMachine('') }}>
            Cancelar
          </Button>
          <Button
            onClick={handleClearMachine}
            color="error"
            variant="contained"
            disabled={loading || confirmText !== 'ELIMINAR MAQUINA'}
          >
            {loading ? 'Eliminando...' : 'Eliminar Máquina'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AdminPanel