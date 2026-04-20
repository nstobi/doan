// controllers/materialController.js - Học liệu

const Material = require('../models/Material')
const path     = require('path')
const fs       = require('fs')

// Xác định loại file từ đuôi file
const xacDinhLoai = (tenFile) => {
  const duoi = path.extname(tenFile).toLowerCase()
  if (['.mp4', '.avi', '.mov'].includes(duoi))  return 'video'
  if (['.jpg', '.jpeg', '.png', '.gif'].includes(duoi)) return 'image'
  if (['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt'].includes(duoi)) return 'document'
  return 'other'
}

// Lấy học liệu của 1 lớp
exports.getByClass = async (req, res) => {
  try {
    const materials = await Material.find({ class: req.params.classId })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
    return res.json(materials)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

// Upload học liệu mới
exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file' })

    const material = await Material.create({
      class:        req.params.classId,
      title:        req.body.title || req.file.originalname,
      description:  req.body.description || '',
      type:         xacDinhLoai(req.file.originalname),
      originalName: req.file.originalname,
      fileName:     req.file.filename,
      filePath:     req.file.path,
      fileSize:     req.file.size,
      uploadedBy:   req.user?.id
    })

    const populated = await Material.findById(material._id).populate('uploadedBy', 'name')
    return res.status(201).json(populated)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

// Tải file về
exports.download = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
    if (!material) return res.status(404).json({ message: 'Không tìm thấy tài liệu' })
    if (!fs.existsSync(material.filePath)) return res.status(404).json({ message: 'File không tồn tại trên server' })
    return res.download(material.filePath, material.originalName)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

// Xóa học liệu
exports.remove = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
    if (!material) return res.status(404).json({ message: 'Không tìm thấy tài liệu' })
    if (fs.existsSync(material.filePath)) fs.unlinkSync(material.filePath) // xóa file vật lý
    await Material.findByIdAndDelete(req.params.id)
    return res.json({ message: 'Đã xóa tài liệu' })
  } catch (err) { return res.status(500).json({ message: err.message }) }
}
