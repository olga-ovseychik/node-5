const express = require('express');
const { sequelize } = require('./sequelize/models');
const movieRoutes = require('./routes/movie.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/api/auth/', authRoutes);
app.use('/api/films/', movieRoutes);

app.use((req, res, next) => {
    const error = new Error('Not Found.');
    error.status = 404;
    next(error);
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ 
        error: { message: err.message } 
    });
});

sequelize.authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch(error => console.error('Unable to connect to the database:', error));

sequelize.sync()
    .then(() => console.log(`Database synced successfully.`))
    .catch((error) => console.error('Failed syncing to the database:', error));

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://localhost:${PORT}.`);
});