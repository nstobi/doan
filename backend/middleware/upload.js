// ===================================================
// middleware/upload.js - Xử lý upload file
// ===================================================
// Dùng thư viện Multer để nhận file từ request
// File được lưu vào thư mục: uploads/materials/
// Tên file được đổi thành UUID để tránh trùng lặp
// ===================================================

const multer = require('multer')
const path   = require('path')
const { v4: uuidv4 } = require('uuid')

// Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
  // Thư mục lưu file
  destination: (req, file, cb) => {
    cb(null, 'uploads/materials/')
  },
  // Đặt tên file = UUID + đuôi gốc (ví dụ: abc123.pdf)
  filename: (req, file, cb) => {
    const ext      = path.extname(file.originalname)
    const fileName = uuidv4() + ext
    cb(null, fileName)
  }
})

// Chỉ cho phép upload các loại file này
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    '.pdf', '.doc', '.docx', '.ppt', '.pptx',
    '.xls', '.xlsx', '.txt',
    '.jpg', '.jpeg', '.png', '.gif',
    '.mp4', '.avi', '.mov',
    '.zip', '.rar'
  ]
  const ext = path.extname(file.originalname).toLowerCase()

  if (allowedExtensions.includes(ext)) {
    cb(null, true)  // cho phép
  } else {
    cb(new Error(`Loại file không được hỗ trợ: ${ext}`))
  }
}

// Tạo middleware upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // tối đa 100MB
})

module.exports = upload
