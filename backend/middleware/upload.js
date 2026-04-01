// middleware/upload.js
// Cấu hình Multer để xử lý upload file

const multer = require('multer')
const path   = require('path')
const { v4: uuidv4 } = require('uuid')

// Cấu hình nơi lưu file và tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/materials/')
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique: uuid + extension gốc
    // Ví dụ: a1b2c3d4.pdf
    const ext      = path.extname(file.originalname)
    const fileName = uuidv4() + ext
    cb(null, fileName)
  }
})

// Giới hạn loại file được upload
const fileFilter = (req, file, cb) => {
  const allowed = [
    // Document
    '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt',
    // Image
    '.jpg', '.jpeg', '.png', '.gif',
    // Video
    '.mp4', '.avi', '.mov', '.mkv',
    // Other
    '.zip', '.rar'
  ]
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error(`Loại file không được hỗ trợ: ${ext}`))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024  // Tối đa 100MB
  }
})

module.exports = upload