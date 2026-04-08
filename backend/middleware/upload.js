const multer = require('multer')
const path   = require('path')
const { v4: uuidv4 } = require('uuid')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/materials/')
  },
  filename: (req, file, cb) => {
    const ext      = path.extname(file.originalname)
    const fileName = uuidv4() + ext
    cb(null, fileName)
  }
})

const fileFilter = (req, file, cb) => {
  const allowed = [
    '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt',
    '.jpg', '.jpeg', '.png', '.gif',
    '.mp4', '.avi', '.mov', '.mkv',
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
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
})

module.exports = upload
