const Sequelize = require('sequelize');
const { Movie } = require('./sequelize/models');

async function handlePositioning(pos, item, isUpdate, itemToUpdate) {
    const maxMovies = 100; 
    let updatedPositionItem = null;

    const { count, rows: movies }  = await Movie.findAndCountAll({ order: [['position', 'ASC']] });

    if (count < maxMovies && pos > count) {
        const newPos = Math.min(pos, count + 1);
        
        if (!item.id) {
            updatedPositionItem = await Movie.create({ ...item, position: newPos });
        } else {
            updatedPositionItem = await Movie.update({ position: newPos }, { where: { id: itemToUpdate.id } });
        }
    } else {
        if (isUpdate) {
            const currentPosition = itemToUpdate.position;

            if (pos > currentPosition) {
                await Movie.decrement('position', {
                    by: 1,
                    where: {
                        position: { [Sequelize.Op.gt]: currentPosition, [Sequelize.Op.lte]: pos },
                    },
                });
            } else if (pos < currentPosition) {
                await Movie.increment('position', {
                    by: 1,
                    where: {
                        position: { [Sequelize.Op.gte]: pos, [Sequelize.Op.lt]: currentPosition },
                    },
                });
            }

            await Movie.update({ position: pos }, { where: { id: itemToUpdate.id } });
        } else {
            const replacedMovie = await Movie.findOne({
                where: { position: pos },
            });

            if (replacedMovie) {
                await Movie.increment('position', {
                    by: 1,
                    where: { position: { [Sequelize.Op.gte]: pos } },
                });
            }

            newMovie = await Movie.create({ ...item, position: pos });

            const moviesToRemove = await Movie.findAll({
                where: { position: { [Sequelize.Op.gt]: maxMovies } },
                order: [['position', 'ASC']],
            });

            if (moviesToRemove.length > 0) {
                for (const movie of moviesToRemove) {
                    if (movie.id !== newMovie.id) {
                        await movie.destroy();
                        break; 
                    }
                }
            }

            updatedPositionItem = newMovie; 
        }
    }

    return updatedPositionItem;
}

module.exports = handlePositioning;