

function onlyAdmin(req, res, next) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).send("Access denied");
  }
  next();
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send("Access denied");
    }
    next();
  };
}

module.exports = { onlyAdmin, allowRoles };
