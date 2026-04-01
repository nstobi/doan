// routes/materialRoutes.js

const router = require('express').Router()
const ctrl   = require('../controllers/materialController')
const upload = require('../middleware/upload')

// Lấy học liệu theo lớp
router.get('/class/:classId', ctrl.getByClass)

// Upload học liệu (single file, field name: 'file')
router.post('/class/:classId', upload.single('file'), ctrl.upload)

// Download file
router.get('/:id/download', ctrl.download)

// Xóa tài liệu
router.delete('/:id', ctrl.remove)

module.exports = router