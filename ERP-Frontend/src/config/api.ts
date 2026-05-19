
import axios, { type AxiosInstance } from 'axios'

const createApiClient = (baseURL: string): AxiosInstance =>
  axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  })

export const crmApi       = createApiClient('/api/crm')
export const rhApi        = createApiClient('/api/rh')
export const biApi        = createApiClient('/api/bi')
export const projetApi    = createApiClient('/api/projet')
export const helpdeskApi  = createApiClient('/api/helpdesk')
export const timesheetApi = createApiClient('/api/timesheet')








/*
import axios from 'axios';

export const helpdeskApi = axios.create({
  baseURL: '/api/helpdesk',
  headers: { 'Content-Type': 'application/json' },
});

export const timesheetApi = axios.create({
  baseURL: '/api/timesheet',
  headers: { 'Content-Type': 'application/json' },
});*/