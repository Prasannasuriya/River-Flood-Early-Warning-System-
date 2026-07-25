const express = require('express');
const router = express.Router();
const {
    getReadings,
    getReadingById,
    createReading,
    updateReading,
    deleteReading
} = require('../controllers/readingController');

router.get('/', getReadings);
router.get('/:id', getReadingById);
router.post('/', createReading);
router.put('/:id', updateReading);
router.delete('/:id', deleteReading);

module.exports = router;
