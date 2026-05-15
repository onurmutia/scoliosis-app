import axios from "axios"

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
})

export const getPatients = () => API.get("/api/patients").then(r => r.data)
export const getPatient = (id) => API.get(`/api/patients/${id}`).then(r => r.data)
export const addPatient = (data) => API.post("/api/patients", data).then(r => r.data)
export const updatePatient = (id, data) => API.put(`/api/patients/${id}`, data).then(r => r.data)
export const deletePatient = (id) => API.delete(`/api/patients/${id}`).then(r => r.data)
export const addVisit = (patientId, data) => API.post(`/api/patients/${patientId}/visits`, data).then(r => r.data)
export const uploadPhoto = (patientId, formData) =>
  API.post(`/api/patients/${patientId}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data)
