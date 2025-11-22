import axios from 'axios'

// Configuración base de axios
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Interceptor para logging de requests
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para logging de responses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - ${response.status}`)
    return response
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Funciones de la API

/**
 * Obtener ubicaciones con filtros opcionales
 * @param {string} endpoint - Endpoint adicional (ej: '/machine/LAPTOP123')
 * @param {object} params - Parámetros de consulta
 */
export const fetchLocations = async (endpoint = '', params = {}) => {
  try {
    const response = await api.get(`/locations${endpoint}`, { params })
    return response.data
  } catch (error) {
    throw new Error(`Error fetching locations: ${error.response?.data?.message || error.message}`)
  }
}

/**
 * Obtener lista de máquinas registradas
 */
export const fetchMachines = async () => {
  try {
    const response = await api.get('/machines')
    return response.data
  } catch (error) {
    throw new Error(`Error fetching machines: ${error.response?.data?.message || error.message}`)
  }
}

/**
 * Obtener estadísticas generales del sistema
 */
export const fetchStats = async () => {
  try {
    const response = await api.get('/stats')
    return response.data
  } catch (error) {
    throw new Error(`Error fetching stats: ${error.response?.data?.message || error.message}`)
  }
}

/**
 * Obtener ubicaciones por máquina específica
 * @param {string} machineName - Nombre de la máquina
 * @param {object} params - Parámetros adicionales (limit, hours)
 */
export const fetchLocationsByMachine = async (machineName, params = {}) => {
  try {
    const response = await api.get(`/locations/machine/${encodeURIComponent(machineName)}`, { params })
    return response.data
  } catch (error) {
    throw new Error(`Error fetching locations for ${machineName}: ${error.response?.data?.message || error.message}`)
  }
}

/**
 * Obtener ubicaciones por fecha
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {object} params - Parámetros adicionales
 */
export const fetchLocationsByDate = async (date, params = {}) => {
  try {
    const response = await api.get('/locations', { 
      params: { date, ...params }
    })
    return response.data
  } catch (error) {
    throw new Error(`Error fetching locations for date ${date}: ${error.response?.data?.message || error.message}`)
  }
}

/**
 * Enviar nueva ubicación (para testing)
 * @param {object} locationData - Datos de ubicación
 */
export const sendLocation = async (locationData) => {
  try {
    const response = await api.post('/location', locationData)
    return response.data
  } catch (error) {
    throw new Error(`Error sending location: ${error.response?.data?.message || error.message}`)
  }
}

/**
 * Limpiar toda la base de datos (ADMIN)
 */
export const clearAllData = async () => {
  try {
    const response = await api.delete('/admin/clear-database', {
      data: { confirm: 'DELETE_ALL_DATA' }
    })
    return response.data
  } catch (error) {
    throw new Error(`Error clearing all data: ${error.response?.data?.message || error.message}`)
  }
}

/**
 * Limpiar datos de una máquina específica (ADMIN)
 * @param {string} machineName - Nombre de la máquina
 */
export const clearMachineData = async (machineName) => {
  try {
    const response = await api.delete(`/admin/clear-machine/${encodeURIComponent(machineName)}`, {
      data: { confirm: 'DELETE_MACHINE_DATA' }
    })
    return response.data
  } catch (error) {
    throw new Error(`Error clearing machine data: ${error.response?.data?.message || error.message}`)
  }
}

/**
 * Obtener información detallada de la base de datos
 */
export const fetchDatabaseInfo = async () => {
  try {
    const response = await api.get('/database/info')
    return response.data
  } catch (error) {
    throw new Error(`Error fetching database info: ${error.response?.data?.message || error.message}`)
  }
}

/**
 * Obtener solo el tamaño de la base de datos (endpoint rápido)
 */
export const fetchDatabaseSize = async () => {
  try {
    const response = await api.get('/database/size')
    return response.data
  } catch (error) {
    throw new Error(`Error fetching database size: ${error.response?.data?.message || error.message}`)
  }
}

// Funciones de utilidad

/**
 * Verificar si la API está disponible
 */
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/stats')
    return response.status === 200
  } catch (error) {
    console.warn('API Health Check failed:', error.message)
    return false
  }
}

/**
 * Formatear parámetros de consulta para evitar valores undefined
 * @param {object} params - Parámetros originales
 */
export const cleanParams = (params) => {
  const cleaned = {}
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value
    }
  })
  return cleaned
}

export default api