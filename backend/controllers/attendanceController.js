// controllers/attendanceController.js - Điểm danh

const Attendance = require('../models/Attendance')
const ClassModel = require('../models/ClassModel')

exports.bulkSave = async (req, res) => {
  try {
    const { classId, sessionIndex, records } = req.body
    await Attendance.deleteMany({ class: classId, sessionIndex })
    const docs = records.map(r => ({
      class: classId, sessionIndex, student: r.studentId,
      status: r.status, note: r.note || '',
      approvedAbsence: r.approvedAbsence || false, recordedBy: req.user?.id
    }))
    const saved = await Attendance.insertMany(docs)
    return res.status(201).json({ message: `Đã điểm danh ${saved.length} sinh viên`, count: saved.length })
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

exports.getBySession = async (req, res) => {
  try {
    const records = await Attendance.find({ class: req.params.classId, sessionIndex: parseInt(req.params.sessionIndex) })
      .populate('student', 'studentId name email')
    return res.json(records)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

exports.getClassSummary = async (req, res) => {
  try {
    const cls = await ClassModel.findById(req.params.classId).populate('students', 'studentId name email')
    if (!cls) return res.status(404).json({ message: 'Không tìm thấy lớp' })

    const stats = await Attendance.aggregate([
      { $match: { class: cls._id } },
      { $group: { _id: { student: '$student', status: '$status' }, count: { $sum: 1 } } },
      { $group: { _id: '$_id.student', statusCounts: { $push: { status: '$_id.status', count: '$count' } } } }
    ])

    const statsMap = {}
    stats.forEach(item => {
      statsMap[item._id.toString()] = { present: 0, absent: 0, late: 0 }
      item.statusCounts.forEach(sc => { statsMap[item._id.toString()][sc.status] = sc.count })
    })

    const summary = cls.students.map(sv => {
      const sid  = sv._id.toString()
      const p    = statsMap[sid]?.present || 0
      const a    = statsMap[sid]?.absent  || 0
      const l    = statsMap[sid]?.late    || 0
      const tong = cls.sessions.length
      return {
        student: { id: sv._id, studentId: sv.studentId, name: sv.name },
        totalSessions: tong, present: p, absent: a, late: l,
        attendanceRate: tong > 0 ? Math.round(((p + l) / tong) * 100) : 0,
        warning: a >= (cls.maxAbsences || 3), maxAbsences: cls.maxAbsences || 3
      }
    })
    return res.json(summary)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

exports.getStudentSummary = async (req, res) => {
  try {
    const { classId, studentId } = req.params
    const cls     = await ClassModel.findById(classId)
    if (!cls) return res.status(404).json({ message: 'Không tìm thấy lớp' })
    const records = await Attendance.find({ class: classId, student: studentId }).sort({ sessionIndex: 1 })
    const p = records.filter(r => r.status === 'present').length
    const a = records.filter(r => r.status === 'absent').length
    const l = records.filter(r => r.status === 'late').length
    const t = cls.sessions.length
    return res.json({
      totalSessions: t, present: p, absent: a, late: l,
      attendanceRate: t > 0 ? Math.round(((p + l) / t) * 100) : 0,
      warning: a >= (cls.maxAbsences || 3), maxAbsences: cls.maxAbsences || 3, records
    })
  } catch (err) { return res.status(500).json({ message: err.message }) }
}

exports.getByStudent = async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId }).populate('class', 'name').sort({ createdAt: -1 })
    return res.json(records)
  } catch (err) { return res.status(500).json({ message: err.message }) }
}
