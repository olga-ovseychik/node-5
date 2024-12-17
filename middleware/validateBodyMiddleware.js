const { sequelize } = require('../sequelize/models'); 

async function validateBodyMiddleware(req, res, next) {
    try {
        const Model = sequelize.models['Movie'];

        const attributes = Model.rawAttributes;
        const isPatch = req.method === 'PATCH';

        for (const key in attributes) {
            if (key === 'id' || key === 'userId' || key === 'createdAt' || key === 'updatedAt') continue;

            const attribute = attributes[key];
            const value = req.body[key];

            if (!isPatch && !req.body.hasOwnProperty(key)) {
                throw new Error(`Missing field: '${key}'`);
            }

            if (value === undefined) continue;

            const expectedType = attribute.type.key.toLowerCase();
            const actualType = typeof value;

            if (
                (expectedType === 'integer' && !Number.isInteger(value)) ||
                (expectedType === 'float' && actualType !== 'number') ||
                (expectedType === 'string' && actualType !== 'string') ||
                (expectedType === 'boolean' && actualType !== 'boolean')
            ) {
                throw new Error(`Invalid type for field '${key}'. Expected '${expectedType}', got '${actualType}'.`);
            }

            if ((key === 'budget' || key === 'gross') && value < 0) {
                throw new Error(`Negative values are not allowed for '${key}'.`);
            }

            if (key === 'position') {
                if (value < 1) {
                    throw new Error(`Invalid value for 'position' field. Minimum is 1.`);
                }

                const count = await Model.count(); 
                if (value > 100 && count === 100) {
                    throw new Error(`'position' value is out of range. There are no more empty slots.`);
                }
            }

            if (key === 'rating' && (Number(value) < 1.0 || Number(value) > 10.0)) {
                throw new Error(`'rating' value is out of range. Expected from 1.0 to 10.0.`);
            }

            if (key === 'year' && (value < 1895 || value > new Date().getFullYear())) {
                throw new Error(`Invalid value for 'year' field. Allowed range is 1895 to the current year.`);
            }

            if (key === 'poster') {
                const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[^\s]*)?\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
                if (!regex.test(value)) {
                    throw new Error(`Invalid value for 'poster' field.`);
                }
            }
        }

        next();
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
}

module.exports = validateBodyMiddleware;
