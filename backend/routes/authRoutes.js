// routes/authRoutes.js - Đường dẫn xác thực

const router = require('express').Router()
const ctrl   = require('../controllers/authController')
const { auth, role } = require('../middleware/auth')

router.post('/login',                  ctrl.login)               // đăng nhập
router.get('/me',               auth,  ctrl.getMe)               // lấy thông tin bản thân
router.put('/change-password',  auth,  ctrl.changePassword)      // đổi mật khẩu
router.get('/teachers',         auth, role(['admin']), ctrl.getTeachers)           // danh sách GV
router.post('/create-teacher',  auth, role(['admin']), ctrl.createTeacher)         // tạo tài khoản GV
router.post('/create-student-account', auth, role(['admin']), ctrl.createStudentAccount) // tạo tài khoản SV
router.delete('/users/:id',     auth, role(['admin']), ctrl.deleteUser)            // xóa tài khoản

module.exports = router
