// config/createAdmin.js - Tạo tài khoản admin
// ===================================================
// Chạy 1 lần duy nhất khi cài hệ thống lần đầu:
//   node config/createAdmin.js
// ===================================================

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
const User     = require('../models/User')

async function createAdmin() {
  // Kết nối MongoDB
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ Kết nối MongoDB')

  // Xóa admin cũ (nếu muốn tạo lại)
  await User.deleteOne({ email: 'admin@school.edu.vn' })

  // Hash password trước khi lưu
  const hashedPassword = bcrypt.hashSync('Admin@123', 10)

  // Tạo tài khoản admin
  await User.create({
    name:     'Admin Hệ thống',
    email:    'admin@school.edu.vn',
    password: hashedPassword,
    role:     'admin'
  })

  console.log('✅ Tạo tài khoản admin thành công!')
  console.log('   Email   : admin@school.edu.vn')
  console.log('   Password: Admin@123')
  console.log('')
  console.log('👉 Đăng nhập tại: http://localhost:8080/login')

  await mongoose.disconnect()
  process.exit(0)
}

createAdmin().catch(err => {
  console.error('❌ Lỗi:', err.message)
  process.exit(1)
})
