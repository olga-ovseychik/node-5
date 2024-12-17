const Sequelize = require('sequelize');
const handlePositioning = require('../helper');
const { Movie } = require('../sequelize/models');


const getMovies = async (req, res) => {
	try {
        const { count, rows }  = await Movie.findAndCountAll({});

        if (!count) {
            return res.status(200).json({ message: 'No movies found.'});
        }

        res.status(200).json(rows);
	} catch (error) {
		res.status(500).send({ error: error.message });
	}
}

const getMovie = async (req, res) => {
	try {
        const movie = await Movie.findByPk(req.params.id);

        if (!movie) return res.status(404).json({ error: `Movie not found.` });
        
        res.status(200).json(movie);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

const createMovieItem = async (req, res) => {
    try {
        const { userId } = req.user;
        const { position } = req.body;

        const updatedPositionItem = await handlePositioning(position, {...req.body, userId}, false);

        res.status(201).json(!updatedPositionItem ? req.body : updatedPositionItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const updateMovieItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { position } = req.body;
        const { userId } = req.user;

        const movie = await Movie.findByPk(id);

        if (!movie) {
            return res.status(404).json({ error: `Movie not found.` });
        }

        if (movie.userId !== userId) {
            return res.status(403).send({ error: 'Forbidden to update this resource.' });
        }

        if (position && position !== movie.position) {
            await handlePositioning(position, {...req.body, userId: id}, true, movie);
        } else {
            await movie.update(req.body);
        }

        const updatedMovie = await Movie.findByPk(id);

        res.status(200).json(updatedMovie);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const deleteMovieItem = async (req, res) => {
    try {
        const { userId } = req.user;

        const movie = await Movie.findByPk(req.params.id);

        if (movie.userId !== userId) {
            return res.status(403).send({ error: 'Forbidden to delete this resource.' });
        }

        if (!movie) {
            return res.status(404).json({ error: `Movie not found.` });
        }
        const { id, position } = movie;

        await movie.destroy();

        await Movie.decrement('position', {
            by: 1,
            where: { position: { [Sequelize.Op.gte]: position } },
        });
        
        res.status(200).send(`Movie with id: ${id} was successfully deleted.`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { 
    getMovies, 
    getMovie,
    createMovieItem,
    updateMovieItem,
    deleteMovieItem 
};