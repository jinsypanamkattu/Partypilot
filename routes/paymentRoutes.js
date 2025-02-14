const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Route to create a payment intent
router.post("/create-payment-intent", paymentController.createPaymentIntent);

// Route to confirm payment and create a booking
router.post("/confirm-payment", paymentController.confirmPayment);

module.exports = router;
