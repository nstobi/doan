const router = require('express').Router()
const ctrl   = require('../controllers/programController')

router.get('/',               ctrl.getAll)
router.get('/major/:majorId', ctrl.getByMajor)
router.post('/',              ctrl.create)
router.put('/:id',            ctrl.update)
router.delete('/:id',         ctrl.remove)

module.exports = router