const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Admins only.' });
};

const isVendor = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Vendors only.' });
};

const isApproved = (req, res, next) => {
  if (req.user && req.user.isApproved) {
    return next();
  }
  res.status(403).json({ message: 'Your account is pending admin approval.' });
};

module.exports = { isAdmin, isVendor, isApproved };