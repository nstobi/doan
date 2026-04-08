const router = require('express').Router()
const ctrl   = require('../controllers/materialController')
const upload = require('../middleware/upload')
const { auth, role } = require('../middleware/auth')

router.get('/class/:classId',  auth,                            ctrl.getByClass)
router.post('/class/:classId', auth, role(['admin', 'teacher']), upload.single('file'), ctrl.upload)
router.get('/:id/download',    auth,                            ctrl.download)
router.delete('/:id',          auth, role(['admin', 'teacher']), ctrl.remove)

module.exports = router
