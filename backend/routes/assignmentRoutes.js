const router = require('express').Router()
const ctrl   = require('../controllers/assignmentController')
const upload = require('../middleware/upload')
const { auth, role } = require('../middleware/auth')

router.get('/class/:classId',   auth,                            ctrl.getByClass)
router.get('/:id',              auth,                            ctrl.getOne)
router.post('/class/:classId',  auth, role(['admin', 'teacher']), upload.array('files', 5), ctrl.create)
router.put('/:id',              auth, role(['admin', 'teacher']), ctrl.update)
router.delete('/:id',           auth, role(['admin', 'teacher']), ctrl.remove)
router.get('/:id/submissions',  auth, role(['admin', 'teacher']), ctrl.getSubmissions)
router.post('/:id/submit',      auth,                            upload.array('files', 5), ctrl.submit)
router.put('/submissions/:submissionId/grade',               auth, role(['admin', 'teacher']), ctrl.grade)
router.get('/submissions/:submissionId/download/:fileIndex', auth,                            ctrl.downloadSubmission)

module.exports = router
