const Student = require('../models/Student')
const Program = require('../models/Program')

exports.getAll = async (req, res) => {
  try {
    const { major, status, search, examType } = req.query
    let query = {}
    if (major)    query.major    = major
    if (status)   query.status   = status
    if (examType) query.examType = examType
    if (search) {
      query.$or = [
        { name:      { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
        { phone:     { $regex: search, $options: 'i' } }
      ]
    }
    const students = await Student.find(query)
      .populate('major', 'name code type')
      .populate('enrolledSubjects.subject', 'name code skill')
      .sort({ studentId: 1 })
    return res.json(students)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

exports.getOne = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('major', 'name code description type targetScore')
      .populate('enrolledSubjects.subject', 'name code skill description')
    if (!student) return res.status(404).json({ message: 'Không tìm thấy học viên' })
    return res.json(student)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

exports.create = async (req, res) => {
  try {
    const { studentId, name, email, phone, dateOfBirth, major, targetScore, examType, entryScore } = req.body

    const student = new Student({
      studentId, name, email, phone, dateOfBirth, major,
      targetScore, examType, entryScore,
      currentSemester: 1,
      enrolledSubjects: []
    })

    // Tự động đăng ký kỹ năng Level 1
    if (major) {
      const program = await Program.findOne({ major })
      if (program) {
        const level1 = program.semesters.find(s => s.semesterNumber === 1)
        if (level1 && level1.subjects.length > 0) {
          student.enrolledSubjects = level1.subjects.map(id => ({
            subject: id, semester: 1, status: 'in_progress'
          }))
        }
      }
    }

    await student.save()
    const populated = await Student.findById(student._id)
      .populate('major', 'name code type')
      .populate('enrolledSubjects.subject', 'name code skill')
    return res.status(201).json(populated)
  } catch (err) {
    if (err.code === 11000) {
      const field = err.keyValue?.email ? 'Email' : 'Mã học viên'
      return res.status(400).json({ message: `${field} đã tồn tại` })
    }
    return res.status(500).json({ message: err.message }) }
}

exports.update = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('major', 'name code type')
      .populate('enrolledSubjects.subject', 'name code skill')
    if (!student) return res.status(404).json({ message: 'Không tìm thấy học viên' })
    return res.json(student)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

exports.remove = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id)
    return res.json({ message: 'Đã xóa học viên' })
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

exports.advanceSemester = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ message: 'Không tìm thấy học viên' })

    const nextLevel = student.currentSemester + 1
    const program   = await Program.findOne({ major: student.major })
    if (!program) return res.status(400).json({ message: 'Chương trình chưa có lộ trình học' })
    if (nextLevel > program.totalSemesters) {
      return res.status(400).json({ message: 'Học viên đã hoàn thành toàn bộ chương trình' })
    }

    const nextLevelData = program.semesters.find(s => s.semesterNumber === nextLevel)
    if (nextLevelData) {
      student.enrolledSubjects.push(...nextLevelData.subjects.map(id => ({
        subject: id, semester: nextLevel, status: 'in_progress'
      })))
    }
    student.currentSemester = nextLevel
    await student.save()

    const populated = await Student.findById(student._id)
      .populate('major', 'name code type')
      .populate('enrolledSubjects.subject', 'name code skill')
    return res.json(populated)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

// POST /api/students/:id/mock-test - Thêm kết quả mock test
exports.addMockTest = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ message: 'Không tìm thấy học viên' })

    student.mockTests.push(req.body)
    await student.save()

    return res.status(201).json({
      message: 'Đã lưu kết quả mock test',
      mockTests: student.mockTests
    })
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

// GET /api/students/:id/mock-tests - Lịch sử mock test
exports.getMockTests = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('mockTests name studentId')
    if (!student) return res.status(404).json({ message: 'Không tìm thấy học viên' })
    return res.json(student.mockTests.sort((a, b) => new Date(b.date) - new Date(a.date)))
  } catch (err) { return res.status(500).json({ message: err.message }) }
}