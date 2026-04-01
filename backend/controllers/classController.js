const ClassModel = require('../models/ClassModel')
const Student    = require('../models/Student')

exports.getAll = async (req, res) => {
  try {
    const classes = await ClassModel.find()
      .populate('subject',  'name code credits')
      .populate('major',    'name code')
      .populate('teacher',  'name email')
      .populate('students', 'studentId name email')
      .sort({ createdAt: -1 })
    res.json(classes)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getOne = async (req, res) => {
  try {
    const cls = await ClassModel.findById(req.params.id)
      .populate('subject',  'name code credits description')
      .populate('major',    'name code')
      .populate('teacher',  'name email')
      .populate('students', 'studentId name email currentSemester')
    if (!cls) return res.status(404).json({ message: 'Không tìm thấy lớp học' })
    res.json(cls)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.create = async (req, res) => {
  try {
    const cls = new ClassModel(req.body)

    const students = await Student.find({
      major:           req.body.major,
      currentSemester: req.body.semester,
      status:          'active'
    }).select('_id')

    if (students.length > 0) {
      cls.students = students.map(s => s._id)
    }

    await cls.save()

    const populated = await ClassModel.findById(cls._id)
      .populate('subject',  'name code')
      .populate('major',    'name code')
      .populate('teacher',  'name email')
      .populate('students', 'studentId name')

    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const cls = await ClassModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('subject',  'name code')
      .populate('major',    'name code')
      .populate('teacher',  'name email')
      .populate('students', 'studentId name')
    if (!cls) return res.status(404).json({ message: 'Không tìm thấy lớp học' })
    res.json(cls)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.addSession = async (req, res) => {
  try {
    const cls = await ClassModel.findById(req.params.id)
    if (!cls) return res.status(404).json({ message: 'Không tìm thấy lớp học' })
    cls.sessions.push(req.body)
    await cls.save()
    res.status(201).json(cls)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    await ClassModel.findByIdAndDelete(req.params.id)
    res.json({ message: 'Đã xóa lớp học' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}