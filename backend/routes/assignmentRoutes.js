// routes/assignmentRoutes.js

const router = require('express').Router()
const ctrl   = require('../controllers/assignmentController')
const upload = require('../middleware/upload')

// Bài thi
router.get('/class/:classId',          ctrl.getByClass)
router.get('/:id',                     ctrl.getOne)
router.post('/class/:classId',         upload.array('files', 5), ctrl.create)
router.put('/:id',                     ctrl.update)
router.delete('/:id',                  ctrl.remove)

// Bài nộp
router.get('/:id/submissions',                              ctrl.getSubmissions)
router.post('/:id/submit',             upload.array('files', 5), ctrl.submit)
router.put('/submissions/:submissionId/grade',              ctrl.grade)
router.get('/submissions/:submissionId/download/:fileIndex',ctrl.downloadSubmission)

module.exports = router