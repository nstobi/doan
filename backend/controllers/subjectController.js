const Subject = require('../models/Subject')

exports.getAll = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ code: 1 })
    return res.json(subjects)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.getOne = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
    if (!subject) return res.status(404).json({ message: 'Không tìm thấy môn học' })
    return res.json(subject)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.create = async (req, res) => {
  try {
    const subject = await Subject.create(req.body)
    return res.status(201).json(subject)
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Mã môn học đã tồn tại' })
    return res.status(500).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!subject) return res.status(404).json({ message: 'Không tìm thấy môn học' })
    return res.json(subject)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id)
    return res.json({ message: 'Đã xóa môn học' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}
