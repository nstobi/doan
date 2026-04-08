const router = require('express').Router()
const ctrl   = require('../controllers/subjectController')
const { auth, role } = require('../middleware/auth')

router.get('/',       auth,                  ctrl.getAll)
router.get('/:id',    auth,                  ctrl.getOne)
router.post('/',      auth, role(['admin']),  ctrl.create)
router.put('/:id',    auth, role(['admin']),  ctrl.update)
router.delete('/:id', auth, role(['admin']),  ctrl.remove)

module.exports = router
