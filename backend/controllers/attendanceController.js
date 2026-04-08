const Attendance = require('../models/Attendance')
const ClassModel = require('../models/ClassModel')

exports.bulkSave = async (req, res) => {
  try {
    const { classId, sessionIndex, records } = req.body
    await Attendance.deleteMany({ class: classId, sessionIndex })

    const docs = records.map(r => ({
      class:           classId,
      sessionIndex,
      student:         r.studentId,
      status:          r.status,
      note:            r.note            || '',
      approvedAbsence: r.approvedAbsence || false,
      recordedBy:      req.user?.id
    }))

    const saved = await Attendance.insertMany(docs)
    return res.status(201).json({
      message: `Đã điểm danh ${saved.length} sinh viên`,
      count:   saved.length
    })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.getBySession = async (req, res) => {
  try {
    const { classId, sessionIndex } = req.params
    const records = await Attendance.find({
      class:        classId,
      sessionIndex: parseInt(sessionIndex)
    }).populate('student', 'studentId name email')
    return res.json(records)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.getClassSummary = async (req, res) => {
  try {
    const cls = await ClassModel.findById(req.params.classId)
      .populate('students', 'studentId name email')
    if (!cls) return res.status(404).json({ message: 'Không tìm thấy lớp' })

    const stats = await Attendance.aggregate([
      { $match: { class: cls._id } },
      { $group: { _id: { student: '$student', status: '$status' }, count: { $sum: 1 } } },
      { $group: { _id: '$_id.student', statusCounts: { $push: { status: '$_id.status', count: '$count' } } } }
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
      const sid     = student._id.toString()
      const present = statsMap[sid]?.present || 0
      const absent  = statsMap[sid]?.absent  || 0
      const late    = statsMap[sid]?.late    || 0
      const attended        = present + late
      const attendanceRate  = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0
      const warning         = absent >= maxAbsences

      return {
        student: { id: student._id, studentId: student.studentId, name: student.name },
        totalSessions,
        present, absent, late,
        attendanceRate,
        warning,
        maxAbsences
      }
    })

    return res.json(summary)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.getStudentSummary = async (req, res) => {
  try {
    const { classId, studentId } = req.params
    const cls = await ClassModel.findById(classId)
    if (!cls) return res.status(404).json({ message: 'Không tìm thấy lớp' })

    const records = await Attendance.find({
      class: classId, student: studentId
    }).sort({ sessionIndex: 1 })

    const present  = records.filter(r => r.status === 'present').length
    const absent   = records.filter(r => r.status === 'absent').length
    const late     = records.filter(r => r.status === 'late').length
    const total    = cls.sessions.length
    const attended = present + late
    const attendanceRate = total > 0 ? Math.round((attended / total) * 100) : 0
    const warning  = absent >= (cls.maxAbsences || 3)

    return res.json({
      totalSessions: total,
      present, absent, late,
      attendanceRate, warning,
      maxAbsences: cls.maxAbsences || 3,
      records
    })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.getByStudent = async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId })
      .populate('class', 'name')
      .sort({ createdAt: -1 })
    return res.json(records)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}
