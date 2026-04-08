const jwt = require('jsonwebtoken')

// Xác thực JWT token
const auth = function (req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Bạn chưa đăng nhập' })
    }

    const token   = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    return next()
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}

// Phân quyền theo role
// Dùng: role(['admin']) hoặc role(['admin', 'teacher'])
const role = function (roles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa xác thực' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' })
    }
    return next()
  }
}

module.exports = { auth, role }
