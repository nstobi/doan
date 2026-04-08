const jwt     = require('jsonwebtoken')
const User    = require('../models/User')
const Student = require('../models/Student')

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' })
    }

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Email không tồn tại' })

    const isMatch = await user.comparePassword(password)
    if (!isMatch) return res.status(401).json({ message: 'Mật khẩu không đúng' })

    let studentInfo = null
    if (user.role === 'student' && user.studentRef) {
      studentInfo = await Student.findById(user.studentRef)
        .populate('major', 'name code')
        .select('studentId name major currentSemester')
    }

    return res.json({
      token: generateToken(user),
      user: {
        id:          user._id,
        name:        user.name,
        email:       user.email,
        role:        user.role,
        studentRef:  user.studentRef,
        studentInfo
      }
    })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, studentRef } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' })
    }

    const user = await User.create({
      name,
      email,
      password,
      role:       role       || 'student',
      studentRef: studentRef || null
    })

    return res.status(201).json({
      token: generateToken(user),
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role
      }
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email này đã được sử dụng' })
    }
    return res.status(500).json({ message: err.message })
  }
}

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('studentRef', 'studentId name major currentSemester')

    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' })
    return res.json(user)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}
