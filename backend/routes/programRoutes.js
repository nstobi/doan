const router = require('express').Router()
const ctrl   = require('../controllers/programController')
const { auth, role } = require('../middleware/auth')

router.get('/',               auth,                 ctrl.getAll)
router.get('/major/:majorId', auth,                 ctrl.getByMajor)
router.post('/',              auth, role(['admin']), ctrl.create)
router.put('/:id',            auth, role(['admin']), ctrl.update)
router.delete('/:id',         auth, role(['admin']), ctrl.remove)

module.exports = router
