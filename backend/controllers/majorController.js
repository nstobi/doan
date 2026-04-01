const Major = require('../models/Major')

exports.getAll = async (req, res) => {
  try {
    const majors = await Major.find().sort({ name: 1 })
    res.json(majors)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getOne = async (req, res) => {
  try {
    const major = await Major.findById(req.params.id)
    if (!major) return res.status(404).json({ message: 'Không tìm thấy ngành học' })
    res.json(major)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.create = async (req, res) => {
  try {
    const major = await Major.create(req.body)
    res.status(201).json(major)
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Tên hoặc mã ngành đã tồn tại' })
    res.status(500).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const major = await Major.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!major) return res.status(404).json({ message: 'Không tìm thấy ngành học' })
    res.json(major)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    await Major.findByIdAndDelete(req.params.id)
    res.json({ message: 'Đã xóa ngành học' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}