const Program = require('../models/Program')

exports.getAll = async (req, res) => {
  try {
    const programs = await Program.find()
      .populate('major', 'name code')
      .populate('semesters.subjects', 'name code credits')
    res.json(programs)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getByMajor = async (req, res) => {
  try {
    const program = await Program.findOne({ major: req.params.majorId })
      .populate('major', 'name code')
      .populate('semesters.subjects', 'name code credits')
    if (!program) return res.status(404).json({ message: 'Ngành này chưa có chương trình đào tạo' })
    res.json(program)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.create = async (req, res) => {
  try {
    const program = await Program.create(req.body)
    const populated = await Program.findById(program._id)
      .populate('major', 'name code')
      .populate('semesters.subjects', 'name code credits')
    res.status(201).json(populated)
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Ngành này đã có chương trình rồi' })
    res.status(500).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('major', 'name code')
      .populate('semesters.subjects', 'name code credits')
    if (!program) return res.status(404).json({ message: 'Không tìm thấy chương trình' })
    res.json(program)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    await Program.findByIdAndDelete(req.params.id)
    res.json({ message: 'Đã xóa chương trình' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}