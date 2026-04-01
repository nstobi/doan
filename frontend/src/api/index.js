// src/api/index.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000
})

// ── Majors ────────────────────────────────
export const majorAPI = {
  getAll:  ()           => api.get('/majors'),
  getOne:  (id)         => api.get(`/majors/${id}`),
  create:  (data)       => api.post('/majors', data),
  update:  (id, data)   => api.put(`/majors/${id}`, data),
  remove:  (id)         => api.delete(`/majors/${id}`)
}

// ── Subjects ──────────────────────────────
export const subjectAPI = {
  getAll:  ()           => api.get('/subjects'),
  getOne:  (id)         => api.get(`/subjects/${id}`),
  create:  (data)       => api.post('/subjects', data),
  update:  (id, data)   => api.put(`/subjects/${id}`, data),
  remove:  (id)         => api.delete(`/subjects/${id}`)
}

// ── Programs ──────────────────────────────
export const programAPI = {
  getAll:     ()          => api.get('/programs'),
  getByMajor: (majorId)   => api.get(`/programs/major/${majorId}`),
  create:     (data)      => api.post('/programs', data),
  update:     (id, data)  => api.put(`/programs/${id}`, data),
  remove:     (id)        => api.delete(`/programs/${id}`)
}

// ── Students ──────────────────────────────
export const studentAPI = {
  getAll:          (params) => api.get('/students', { params }),
  getOne:          (id)     => api.get(`/students/${id}`),
  create:          (data)   => api.post('/students', data),
  update:          (id, data) => api.put(`/students/${id}`, data),
  remove:          (id)     => api.delete(`/students/${id}`),
  advanceSemester: (id)     => api.post(`/students/${id}/advance-semester`)
}

// ── Classes ───────────────────────────────
export const classAPI = {
  getAll:     ()          => api.get('/classes'),
  getOne:     (id)        => api.get(`/classes/${id}`),
  create:     (data)      => api.post('/classes', data),
  update:     (id, data)  => api.put(`/classes/${id}`, data),
  remove:     (id)        => api.delete(`/classes/${id}`),
  addSession: (id, data)  => api.post(`/classes/${id}/sessions`, data)
}

// ── Attendance ────────────────────────────
export const attendanceAPI = {
  bulkSave:          (data)                  => api.post('/attendance/bulk', data),
  getBySession:      (classId, sessionIndex) => api.get(`/attendance/class/${classId}/session/${sessionIndex}`),
  getClassSummary:   (classId)               => api.get(`/attendance/class/${classId}/summary`),
  getStudentSummary: (classId, studentId)    => api.get(`/attendance/class/${classId}/student/${studentId}`),
  getByStudent:      (studentId)             => api.get(`/attendance/student/${studentId}`)
}

export const assignmentAPI = {
  getByClass:   (classId)        => api.get(`/assignments/class/${classId}`),
  getOne:       (id)             => api.get(`/assignments/${id}`),
  create:       (classId, data)  => api.post(`/assignments/class/${classId}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update:       (id, data)       => api.put(`/assignments/${id}`, data),
  remove:       (id)             => api.delete(`/assignments/${id}`),
  getSubmissions: (id)           => api.get(`/assignments/${id}/submissions`),
  submit:       (id, data)       => api.post(`/assignments/${id}/submit`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  grade:        (submissionId, data) => api.put(`/assignments/submissions/${submissionId}/grade`, data)
}
export const materialAPI = {
  getByClass: (classId)      => api.get(`/materials/class/${classId}`),
  upload:     (classId, formData) => api.post(`/materials/class/${classId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  download:   (id)           => api.get(`/materials/${id}/download`, { responseType: 'blob' }),
  remove:     (id)           => api.delete(`/materials/${id}`)
}
export default api