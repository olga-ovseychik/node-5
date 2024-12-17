const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Manager } = require('../sequelize/models');


const register = async (req, res) => {
    try {
        const { email, password, super: superUser } = req.body;
        
        const user = await Manager.findOne({ where: { email } });

        if (user) {
            return res.status(409).send({ error: `User with email address '${email}' already exists.` });
        }

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, async function(err, hash) {
                await Manager.create({ email, password: hash, super: superUser });
            });
        });

        res.status(201).send({ message: 'User registered successfully.' });          
    } catch (error) {
        console.error(error.stack);;
        res.status(500).send({ message: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Manager.findOne({ where: { email } });

        if (!user) {
            return res.status(401).send({ error: 'Invalid email or password.' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).send({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET_KEY, 
            { expiresIn: '5m' }
        );

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

module.exports = { register, login };