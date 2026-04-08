const router = require('express').Router()
const ctrl   = require('../controllers/classController')
const { auth, role } = require('../middleware/auth')

router.get('/',              auth,                            ctrl.getAll)
router.get('/:id',           auth,                            ctrl.getOne)
router.post('/',             auth, role(['admin', 'teacher']), ctrl.create)
router.put('/:id',           auth, role(['admin', 'teacher']), ctrl.update)
router.delete('/:id',        auth, role(['admin']),            ctrl.remove)
router.post('/:id/sessions', auth, role(['admin', 'teacher']), ctrl.addSession)

module.exports = router
