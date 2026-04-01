const router = require('express').Router()
const ctrl   = require('../controllers/classController')

router.get('/',              ctrl.getAll)
router.get('/:id',           ctrl.getOne)
router.post('/',             ctrl.create)
router.put('/:id',           ctrl.update)
router.delete('/:id',        ctrl.remove)
router.post('/:id/sessions', ctrl.addSession)

module.exports = router