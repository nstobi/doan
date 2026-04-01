const auth = (req, res, next) => {
  req.user = {
    id:   '000000000000000000000001',
    role: 'admin',
    name: 'Admin'
  }
  next()
}

const role = (roles) => {
  return (req, res, next) => {
    next()
  }
}

module.exports = { auth, role }