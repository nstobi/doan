require('dotenv').config()
const express  = require('express')
const cors     = require('cors')
const mongoose = require('mongoose')
const path     = require('path')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB'))
  .catch(err => console.error('❌ Lỗi MongoDB:', err.message))

// Import tất cả models trước
require('./models/User')
require('./models/Major')
require('./models/Subject')
require('./models/Program')
require('./models/Student')
require('./models/ClassModel')
require('./models/Attendance')
require('./models/Material')
require('./models/Assignment')
require('./models/Submission')

// Routes
app.use('/api/auth',        require('./routes/authRoutes'))
app.use('/api/majors',      require('./routes/majorRoutes'))
app.use('/api/subjects',    require('./routes/subjectRoutes'))
app.use('/api/programs',    require('./routes/programRoutes'))
app.use('/api/students',    require('./routes/studentRoutes'))
app.use('/api/classes',     require('./routes/classRoutes'))
app.use('/api/attendance',  require('./routes/attendanceRoutes'))
app.use('/api/materials',   require('./routes/materialRoutes'))
app.use('/api/assignments', require('./routes/assignmentRoutes'))

app.get('/api/health', (req, res) => res.json({ status: 'OK' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`))
