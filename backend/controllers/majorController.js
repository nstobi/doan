// controllers/majorController.js - CRUD Ngành học

const Major = require('../models/Major')

// Lấy tất cả ngành học
exports.getAll = async (req, res) => {
  try {
    const majors = await Major.find().sort({ name: 1 })
    return res.json(majors)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

// Lấy 1 ngành theo ID
exports.getOne = async (req, res) => {
  try {
    const major = await Major.findById(req.params.id)
    if (!major) return res.status(404).json({ message: 'Không tìm thấy ngành học' })
    return res.json(major)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

// Tạo ngành mới
exports.create = async (req, res) => {
  try {
    const major = await Major.create(req.body)
    return res.status(201).json(major)
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Tên hoặc mã ngành đã tồn tại' })
    return res.status(500).json({ message: err.message })
  }
}

// Cập nhật ngành
exports.update = async (req, res) => {
  try {
    const major = await Major.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!major) return res.status(404).json({ message: 'Không tìm thấy ngành học' })
    return res.json(major)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

// Xóa ngành
exports.remove = async (req, res) => {
  try {
    await Major.findByIdAndDelete(req.params.id)
    return res.json({ message: 'Đã xóa ngành học' })
  } catch (err) { return res.status(500).json({ message: err.message }) }
}
