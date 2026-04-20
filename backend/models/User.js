// ===================================================
// models/User.js - Schema tài khoản người dùng
// ===================================================
// Lưu thông tin đăng nhập của admin, teacher, student
// Password được hash bằng bcrypt (không lưu plaintext)
// ===================================================

const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type:    String,
    enum:    ['admin', 'teacher', 'student'], // chỉ 3 giá trị này
    default: 'student'
  },
  // Nếu là student, liên kết với hồ sơ sinh viên
  studentRef: {
    type:    mongoose.Schema.Types.ObjectId,
    ref:     'Student',
    default: null
  }
}, { timestamps: true })

// So sánh password khi đăng nhập
// Dùng: user.comparePassword('matkhau123') → true/false
UserSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password)
}

module.exports = mongoose.model('User', UserSchema)
