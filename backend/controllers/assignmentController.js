const Assignment = require('../models/Assignment')
const Submission = require('../models/Submission')
const fs         = require('fs')

exports.getByClass = async (req, res) => {
  try {
    const assignments = await Assignment.find({ class: req.params.classId })
      .populate('createdBy', 'name')
      .sort({ dueDate: 1 })
    return res.json(assignments)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.getOne = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('class', 'name')
    if (!assignment) return res.status(404).json({ message: 'Không tìm thấy bài thi' })
    return res.json(assignment)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.create = async (req, res) => {
  try {
    const data = {
      class:       req.params.classId,
      title:       req.body.title,
      description: req.body.description || '',
      type:        req.body.type        || 'assignment',
      dueDate:     req.body.dueDate,
      maxScore:    req.body.maxScore    || 10,
      createdBy:   req.user?.id,
      attachments: []
    }

    if (req.files && req.files.length > 0) {
      data.attachments = req.files.map(f => ({
        originalName: f.originalname,
        fileName:     f.filename,
        filePath:     f.path,
        fileSize:     f.size
      }))
    }

    const assignment = await Assignment.create(data)
    const populated  = await Assignment.findById(assignment._id).populate('createdBy', 'name')
    return res.status(201).json(populated)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('createdBy', 'name')
    if (!assignment) return res.status(404).json({ message: 'Không tìm thấy bài thi' })
    return res.json(assignment)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id)
    return res.json({ message: 'Đã xóa bài thi' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student',  'studentId name email')
      .populate('gradedBy', 'name')
      .sort({ createdAt: -1 })
    return res.json(submissions)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.submit = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
    if (!assignment) return res.status(404).json({ message: 'Không tìm thấy bài thi' })
    if (assignment.status === 'closed') return res.status(400).json({ message: 'Bài thi đã đóng' })

    const isLate = new Date() > new Date(assignment.dueDate)
    const status = isLate ? 'late' : 'submitted'

    // Cho phép nộp lại: xóa bài cũ
    await Submission.deleteOne({ assignment: req.params.id, student: req.body.studentId })

    const submissionData = {
      assignment:  req.params.id,
      student:     req.body.studentId,
      content:     req.body.content || '',
      status,
      attachments: []
    }

    if (req.files && req.files.length > 0) {
      submissionData.attachments = req.files.map(f => ({
        originalName: f.originalname,
        fileName:     f.filename,
        filePath:     f.path,
        fileSize:     f.size
      }))
    }

    const submission = await Submission.create(submissionData)
    const populated  = await Submission.findById(submission._id)
      .populate('student', 'studentId name')

    return res.status(201).json({
      ...populated.toObject(),
      message: isLate ? '⚠️ Nộp bài thành công (trễ hạn)' : '✅ Nộp bài thành công'
    })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.grade = async (req, res) => {
  try {
    const { score, feedback } = req.body
    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { score, feedback, status: 'graded', gradedBy: req.user?.id, gradedAt: new Date() },
      { new: true }
    )
      .populate('student',  'studentId name')
      .populate('gradedBy', 'name')

    if (!submission) return res.status(404).json({ message: 'Không tìm thấy bài nộp' })
    return res.json(submission)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

exports.downloadSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
    if (!submission) return res.status(404).json({ message: 'Không tìm thấy bài nộp' })

    const file = submission.attachments[parseInt(req.params.fileIndex)]
    if (!file) return res.status(404).json({ message: 'Không tìm thấy file' })
    if (!fs.existsSync(file.filePath)) return res.status(404).json({ message: 'File không tồn tại' })

    return res.download(file.filePath, file.originalName)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}
