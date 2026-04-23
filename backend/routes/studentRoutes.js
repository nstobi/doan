const router = require('express').Router()
const ctrl   = require('../controllers/studentController')
const { auth, role } = require('../middleware/auth')

router.get('/',       auth, role(['admin', 'teacher']), ctrl.getAll)
router.get('/:id',    auth,                             ctrl.getOne)
router.post('/',      auth, role(['admin']),             ctrl.create)
router.put('/:id',    auth, role(['admin']),             ctrl.update)
router.delete('/:id', auth, role(['admin']),             ctrl.remove)
router.post('/:id/advance-semester', auth, role(['admin']),             ctrl.advanceSemester)
router.post('/:id/mock-test',        auth, role(['admin', 'teacher']),  ctrl.addMockTest)
router.get('/:id/mock-tests',        auth,                              ctrl.getMockTests)

module.exports = router