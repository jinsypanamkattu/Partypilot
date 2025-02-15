const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

const router = express.Router();

// Process Payment

    exports.createPayment = async (req, res) => {
    try {
        const { bookingId, amount, currency, paymentMethod } = req.body;

        // Check if booking exists
        const booking = await Booking.findById(bookingId).populate("attendeeId").populate("eventId");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Create payment intent (for Stripe)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: currency || "USD",
            payment_method_types: ["card"]
        });

        // Save payment details to DB
        const newPayment = new Payment({
            bookingId,
            attendeeId: booking.attendeeId._id,
            eventId: booking.eventId._id,
            amount,
            currency,
            status: "pending",
            paymentMethod,
            paymentIntentId: paymentIntent.id
        });

        await newPayment.save();

        res.status(200).json({ clientSecret: paymentIntent.client_secret, message: "Payment initiated" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Confirm Payment (Stripe Webhook)
exports.confirmPayment = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;

            // Update Payment status in DB
            const payment = await Payment.findOneAndUpdate(
                { paymentIntentId: paymentIntent.id },
                { status: "Completed" },
                { new: true }
            );

            if (payment) {
                await Booking.findByIdAndUpdate(payment.bookingId, { bookingStatus: "Confirmed" });
            }

            res.status(200).json({ message: "Payment successful" });
        }
    } catch (error) {
        res.status(400).json({ error: "Webhook error" });
    }
};




