const jwt = require('jsonwebtoken');
const { Manager } = require('../sequelize/models');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ error: 'No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, user) => {
        if (err) {
            return res.status(401).send({ error: 'Unauthorized.' });
        }

        const { dataValues } = await Manager.findByPk(user.id);
        const { id: userId, email, super: superUser } = dataValues;

        req.user = { userId, email, superUser };
        next();
    });
}

module.exports = authMiddleware;