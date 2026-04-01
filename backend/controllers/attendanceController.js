const Attendance = require('../models/Attendance')
const ClassModel = require('../models/ClassModel')

// Điểm danh bulk (giữ nguyên)
exports.bulkSave = async (req, res) => {
  try {
    const { classId, sessionIndex, records } = req.body
    await Attendance.deleteMany({ class: classId, sessionIndex })
    const docs = records.map(r => ({
      class:           classId,
      sessionIndex,
      student:         r.studentId,
      status:          r.status,
      note:            r.note || '',
      approvedAbsence: r.approvedAbsence || false
    }))
    const saved = await Attendance.insertMany(docs)
    res.status(201).json({
      message: `Đã điểm danh ${saved.length} sinh viên`,
      count:   saved.length
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Xem điểm danh theo buổi (giữ nguyên)
exports.getBySession = async (req, res) => {
  try {
    const { classId, sessionIndex } = req.params
    const records = await Attendance.find({
      class:        classId,
      sessionIndex: parseInt(sessionIndex)
    }).populate('student', 'studentId name email')
    res.json(records)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ✦ Thống kê điểm danh nâng cao
// Trả về: số buổi present/absent/late, tỉ lệ %, cảnh báo nghỉ nhiều
exports.getClassSummary = async (req, res) => {
  try {
    const cls = await ClassModel.findById(req.params.classId)
      .populate('students', 'studentId name email')
    if (!cls) return res.status(404).json({ message: 'Không tìm thấy lớp' })

    const stats = await Attendance.aggregate([
      { $match: { class: cls._id } },
      { $group: {
          _id:   { student: '$student', status: '$status' },
          count: { $sum: 1 }
      }},
      { $group: {
          _id: '$_id.student',
          statusCounts: { $push: { status: '$_id.status', count: '$count' } }
      }}
    ])

    const statsMap = {}
    stats.forEach(item => {
      const sid = item._id.toString()
      statsMap[sid] = { present: 0, absent: 0, late: 0 }
      item.statusCounts.forEach(sc => { statsMap[sid][sc.status] = sc.count })
    })

    const totalSessions = cls.sessions.length
    const maxAbsences   = cls.maxAbsences || 3

    const summary = cls.students.map(student => {
      const sid      = student._id.toString()
      const present  = statsMap[sid]?.present || 0
      const absent   = statsMap[sid]?.absent  || 0
      const late     = statsMap[sid]?.late    || 0
      const attended = present + late

      // Tỉ lệ tham gia = (có mặt + trễ) / tổng buổi
      const attendanceRate = totalSessions > 0
        ? Math.round((attended / totalSessions) * 100)
        : 0

      // Cảnh báo nếu vắng >= maxAbsences
      const warning = absent >= maxAbsences

      return {
        student: {
          id:        student._id,
          studentId: student.studentId,
          name:      student.name
        },
        totalSessions,
        present,
        absent,
        late,
        attendanceRate,  // ✦ tỉ lệ % tham gia
        warning,         // ✦ true nếu nghỉ quá số buổi cho phép
        maxAbsences
      }
    })

    res.json(summary)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Lịch sử điểm danh của 1 sinh viên
exports.getByStudent = async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId })
      .populate('class', 'name')
      .sort({ createdAt: -1 })
    res.json(records)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ✦ Thống kê điểm danh của 1 sinh viên trong 1 lớp
exports.getStudentSummary = async (req, res) => {
  try {
    const { classId, studentId } = req.params

    const cls = await ClassModel.findById(classId)
    if (!cls) return res.status(404).json({ message: 'Không tìm thấy lớp' })

    const records = await Attendance.find({
      class:   classId,
      student: studentId
    }).sort({ sessionIndex: 1 })

    const present = records.filter(r => r.status === 'present').length
    const absent  = records.filter(r => r.status === 'absent').length
    const late    = records.filter(r => r.status === 'late').length
    const total   = cls.sessions.length
    const attended = present + late
    const attendanceRate = total > 0 ? Math.round((attended / total) * 100) : 0
    const warning = absent >= (cls.maxAbsences || 3)

    res.json({
      totalSessions: total,
      present, absent, late,
      attendanceRate,
      warning,
      maxAbsences: cls.maxAbsences || 3,
      records  // chi tiết từng buổi
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}