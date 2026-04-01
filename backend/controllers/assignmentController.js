// controllers/assignmentController.js

const Assignment = require('../models/Assignment')
const Submission = require('../models/Submission')
const path       = require('path')
const fs         = require('fs')

// ── Bài thi ──────────────────────────────

// GET /api/assignments/class/:classId
exports.getByClass = async (req, res) => {
  try {
    const assignments = await Assignment.find({ class: req.params.classId })
      .populate('createdBy', 'name')
      .sort({ dueDate: 1 })
    res.json(assignments)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/assignments/:id
exports.getOne = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('class', 'name')
    if (!assignment) return res.status(404).json({ message: 'Không tìm thấy bài thi' })
    res.json(assignment)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/assignments/class/:classId
// Tạo bài thi mới (có thể kèm file đề)
exports.create = async (req, res) => {
  try {
    const data = {
      class:       req.params.classId,
      title:       req.body.title,
      description: req.body.description,
      type:        req.body.type || 'assignment',
      dueDate:     req.body.dueDate,
      maxScore:    req.body.maxScore || 10,
      createdBy:   req.user?.id,
      attachments: []
    }

    // Nếu có file đề bài đính kèm
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
    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/assignments/:id
exports.update = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    ).populate('createdBy', 'name')
    if (!assignment) return res.status(404).json({ message: 'Không tìm thấy bài thi' })
    res.json(assignment)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/assignments/:id
exports.remove = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id)
    res.json({ message: 'Đã xóa bài thi' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Bài nộp ──────────────────────────────

// GET /api/assignments/:id/submissions
// Giáo viên xem tất cả bài nộp
exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'studentId name email')
      .populate('gradedBy', 'name')
      .sort({ createdAt: -1 })
    res.json(submissions)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/assignments/:id/submit
// Sinh viên nộp bài
exports.submit = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
    if (!assignment) return res.status(404).json({ message: 'Không tìm thấy bài thi' })
    if (assignment.status === 'closed') return res.status(400).json({ message: 'Bài thi đã đóng' })

    // Kiểm tra nộp trễ
    const isLate   = new Date() > new Date(assignment.dueDate)
    const status   = isLate ? 'late' : 'submitted'

    // Xóa bài nộp cũ nếu có (cho phép nộp lại)
    await Submission.deleteOne({
      assignment: req.params.id,
      student:    req.body.studentId
    })

    const submissionData = {
      assignment:  req.params.id,
      student:     req.body.studentId,
      content:     req.body.content || '',
      status,
      attachments: []
    }

    // Nếu có file đính kèm
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

    res.status(201).json({
      ...populated.toObject(),
      message: isLate ? '⚠️ Nộp bài thành công (trễ hạn)' : '✅ Nộp bài thành công'
    })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Bạn đã nộp bài rồi' })
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/assignments/submissions/:submissionId/grade
// Giáo viên chấm điểm
exports.grade = async (req, res) => {
  try {
    const { score, feedback } = req.body

    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      {
        score,
        feedback,
        status:   'graded',
        gradedBy: req.user?.id,
        gradedAt: new Date()
      },
      { new: true }
    )
      .populate('student', 'studentId name')
      .populate('gradedBy', 'name')

    if (!submission) return res.status(404).json({ message: 'Không tìm thấy bài nộp' })
    res.json(submission)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/assignments/submissions/:submissionId/download/:fileIndex
// Download file bài nộp
exports.downloadSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
    if (!submission) return res.status(404).json({ message: 'Không tìm thấy bài nộp' })

    const file = submission.attachments[parseInt(req.params.fileIndex)]
    if (!file) return res.status(404).json({ message: 'Không tìm thấy file' })

    if (!fs.existsSync(file.filePath)) return res.status(404).json({ message: 'File không tồn tại' })
    res.download(file.filePath, file.originalName)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}