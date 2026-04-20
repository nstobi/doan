// ===================================================
// middleware/auth.js - Kiểm tra đăng nhập và quyền
// ===================================================
// Middleware là hàm chạy TRƯỚC khi xử lý request
//
// Có 2 middleware ở đây:
//   1. auth  → kiểm tra người dùng đã đăng nhập chưa
//   2. role  → kiểm tra người dùng có đủ quyền không
//
// Cách dùng trong route:
//   router.get('/', auth, controller)               → cần đăng nhập
//   router.post('/', auth, role(['admin']), ctrl)   → cần là admin
// ===================================================

const jwt = require('jsonwebtoken')

// Kiểm tra JWT token hợp lệ không
const auth = function (req, res, next) {
  // Lấy token từ header: "Authorization: Bearer eyJhbGci..."
  const authHeader = req.headers.authorization

  // Không có token → chưa đăng nhập
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập' })
  }

  // Tách lấy phần token (bỏ chữ "Bearer ")
  const token = authHeader.split(' ')[1]

  try {
    // Giải mã token → lấy thông tin user
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { id, role, name, email }
    return next()      // cho đi tiếp
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}

// Kiểm tra role (quyền) của user
// roles: mảng các role được phép, ví dụ ['admin'] hoặc ['admin', 'teacher']
const role = function (roles) {
  return function (req, res, next) {
    // Nếu role của user không nằm trong danh sách cho phép → từ chối
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' })
    }
    return next()
  }
}

module.exports = { auth, role }
