const router = require('express').Router()
const ctrl   = require('../controllers/attendanceController')
const { auth, role } = require('../middleware/auth')

router.post('/bulk',                                auth, role(['admin', 'teacher']), ctrl.bulkSave)
router.get('/class/:classId/session/:sessionIndex', auth,                            ctrl.getBySession)
router.get('/class/:classId/summary',               auth,                            ctrl.getClassSummary)
router.get('/class/:classId/student/:studentId',    auth,                            ctrl.getStudentSummary)
router.get('/student/:studentId',                   auth,                            ctrl.getByStudent)

module.exports = router
