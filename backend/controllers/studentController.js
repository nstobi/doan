// controllers/studentController.js - Quản lý sinh viên
// LOGIC AUTO-ENROLL: tạo SV -> tự động đăng ký môn kỳ 1

const Student = require('../models/Student')
const Program = require('../models/Program')

exports.getAll = async (req, res) => {
  try {
    const { major, status, search } = req.query
    let query = {}
    if (major)  query.major  = major
    if (status) query.status = status
    if (search) {
      query.$or = [
        { name:      { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } }
      ]
    }
    const students = await Student.find(query)
      .populate('major', 'name code')
      .populate('enrolledSubjects.subject', 'name code credits')
      .sort({ studentId: 1 })
    return res.json(students)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

exports.getOne = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('major', 'name code description')
      .populate('enrolledSubjects.subject', 'name code credits description')
    if (!student) return res.status(404).json({ message: 'Không tìm thấy sinh viên' })
    return res.json(student)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

exports.create = async (req, res) => {
  try {
    const { studentId, name, email, phone, dateOfBirth, major } = req.body
    const student = new Student({ studentId, name, email, phone, dateOfBirth, major, currentSemester: 1, enrolledSubjects: [] })

    // TỰ ĐỘNG ĐĂNG KÝ MÔN KỲ 1
    if (major) {
      const program = await Program.findOne({ major })
      if (program) {
        const ky1 = program.semesters.find(s => s.semesterNumber === 1)
        if (ky1 && ky1.subjects.length > 0) {
          student.enrolledSubjects = ky1.subjects.map(id => ({ subject: id, semester: 1, status: 'in_progress' }))
        }
      }
    }

    await student.save()
    const populated = await Student.findById(student._id)
      .populate('major', 'name code')
      .populate('enrolledSubjects.subject', 'name code credits')
    return res.status(201).json(populated)
  } catch (err) {
    if (err.code === 11000) {
      const field = err.keyValue?.email ? 'Email' : 'Mã sinh viên'
      return res.status(400).json({ message: `${field} đã tồn tại` })
    }
    return res.status(500).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('major', 'name code')
      .populate('enrolledSubjects.subject', 'name code credits')
    if (!student) return res.status(404).json({ message: 'Không tìm thấy sinh viên' })
    return res.json(student)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

exports.remove = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id)
    return res.json({ message: 'Đã xóa sinh viên' })
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

exports.advanceSemester = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ message: 'Không tìm thấy sinh viên' })

    const kyMoi    = student.currentSemester + 1
    const program  = await Program.findOne({ major: student.major })
    if (!program) return res.status(400).json({ message: 'Ngành chưa có chương trình đào tạo' })
    if (kyMoi > program.totalSemesters) return res.status(400).json({ message: 'Đã hoàn thành toàn bộ chương trình' })

    const kyMoiData = program.semesters.find(s => s.semesterNumber === kyMoi)
    if (kyMoiData) {
      student.enrolledSubjects.push(...kyMoiData.subjects.map(id => ({ subject: id, semester: kyMoi, status: 'in_progress' })))
    }

    student.currentSemester = kyMoi
    await student.save()

    const populated = await Student.findById(student._id)
      .populate('major', 'name code')
      .populate('enrolledSubjects.subject', 'name code credits')
    return res.json(populated)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}
