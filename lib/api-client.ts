import axios from 'axios'
import { normalizeError } from './api-error'
import { getAuthToken } from './storage'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Add token to all requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Response interceptor: Return data directly and normalize errors
apiClient.interceptors.response.use(
  (response) => response.data, // Backend returns { success: true, ...data }
  (error) => {
    // Return rejected promise with error message
    return Promise.reject(new Error(normalizeError(error)))
  }
)

export default apiClient
