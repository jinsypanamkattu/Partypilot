const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Route to create a payment intent
router.post("/process-payment", paymentController.createPayment);

// Route to confirm payment and create a booking
router.post("/confirm-payment", paymentController.confirmPayment);

module.exports = router;
