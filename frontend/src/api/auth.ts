import api from './axios'
import type { AuthResponse } from '../types'

export interface RegisterDto {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface LoginDto {
  email: string
  password: string
}

export const register = (dto: RegisterDto) =>
  api.post<AuthResponse>('/api/auth/register', dto).then((r) => r.data)

export const login = (dto: LoginDto) =>
  api.post<AuthResponse>('/api/auth/login', dto).then((r) => r.data)
