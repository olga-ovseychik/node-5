function authorizeRoleMiddleware(req, res, next) {
    const  { superUser } = req.user;

    if (!superUser) {
        return res.status(403).send({ message: "Forbidden." });
    }

    next();
}

module.exports = authorizeRoleMiddleware;