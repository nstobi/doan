// controllers/authController.js - Xử lý đăng nhập
// ===================================================
// Các chức năng:
//   login               → đăng nhập, trả về token
//   getMe               → lấy thông tin user đang đăng nhập
//   createTeacher       → admin tạo tài khoản giáo viên
//   createStudentAccount→ admin tạo tài khoản sinh viên
//   getTeachers         → lấy danh sách giáo viên
//   changePassword      → đổi mật khẩu
//   deleteUser          → xóa tài khoản
// ===================================================

const jwt     = require('jsonwebtoken')
const bcrypt  = require('bcryptjs')
const User    = require('../models/User')
const Student = require('../models/Student')

// Tạo JWT token chứa thông tin user
const taoToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // hết hạn sau 7 ngày
  )
}

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' })
    }

    // Tìm user theo email
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Email không tồn tại' })

    // So sánh password
    const dungPassword = await user.comparePassword(password)
    if (!dungPassword) return res.status(401).json({ message: 'Mật khẩu không đúng' })

    // Nếu là sinh viên, lấy thêm thông tin hồ sơ
    let thongTinSV = null
    if (user.role === 'student' && user.studentRef) {
      thongTinSV = await Student.findById(user.studentRef)
        .populate('major', 'name code')
        .select('studentId name major currentSemester')
    }

    return res.json({
      token: taoToken(user),
      user: {
        id:          user._id,
        name:        user.name,
        email:       user.email,
        role:        user.role,
        studentRef:  user.studentRef,
        studentInfo: thongTinSV
      }
    })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

// GET /api/auth/me - Lấy thông tin user đang đăng nhập
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password') // không trả về password
      .populate('studentRef', 'studentId name major currentSemester')
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' })
    return res.json(user)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/create-teacher - Admin tạo tài khoản giáo viên
exports.createTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' })
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    const user = await User.create({ name, email, password: hashedPassword, role: 'teacher' })

    return res.status(201).json({
      message: 'Tạo tài khoản giáo viên thành công',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Email này đã được sử dụng' })
    return res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/create-student-account - Admin tạo tài khoản sinh viên
exports.createStudentAccount = async (req, res) => {
  try {
    const { name, email, password, studentRef } = req.body
    if (!name || !email || !password || !studentRef) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' })
    }

    // Kiểm tra sinh viên tồn tại
    const sv = await Student.findById(studentRef)
    if (!sv) return res.status(404).json({ message: 'Không tìm thấy sinh viên' })

    const hashedPassword = bcrypt.hashSync(password, 10)
    const user = await User.create({
      name, email,
      password: hashedPassword,
      role: 'student',
      studentRef
    })

    return res.status(201).json({
      message: 'Tạo tài khoản sinh viên thành công',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, studentRef }
    })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Email này đã được sử dụng' })
    return res.status(500).json({ message: err.message })
  }
}

// GET /api/auth/teachers - Lấy danh sách giáo viên
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password').sort({ name: 1 })
    return res.json(teachers)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

// PUT /api/auth/change-password - Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user.id)

    const dungPassword = await user.comparePassword(oldPassword)
    if (!dungPassword) return res.status(400).json({ message: 'Mật khẩu cũ không đúng' })

    user.password = bcrypt.hashSync(newPassword, 10)
    await user.save()
    return res.json({ message: 'Đã đổi mật khẩu thành công' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

// DELETE /api/auth/users/:id - Xóa tài khoản
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    return res.json({ message: 'Đã xóa tài khoản' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}
