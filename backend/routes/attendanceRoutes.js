const router = require('express').Router()
const ctrl   = require('../controllers/attendanceController')

router.post('/bulk',                                 ctrl.bulkSave)
router.get('/class/:classId/session/:sessionIndex',  ctrl.getBySession)
router.get('/class/:classId/summary',                ctrl.getClassSummary)
router.get('/class/:classId/student/:studentId',     ctrl.getStudentSummary)
router.get('/student/:studentId',                    ctrl.getByStudent)

module.exports = router