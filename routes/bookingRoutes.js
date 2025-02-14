const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');

router.post('/', BookingController.bookEvent);
router.get('/:bookingId', BookingController.getBookingById);
router.delete('/:bookingId', BookingController.cancelBooking);

module.exports = router;
