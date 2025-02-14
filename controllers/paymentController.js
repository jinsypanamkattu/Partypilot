const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Event = require("../models/Event");


// Ensure badges folder exists
const badgeDir = path.join(__dirname, "../badges");
if (!fs.existsSync(badgeDir)) {
    fs.mkdirSync(badgeDir, { recursive: true });
}

// Create a payment intent with Stripe
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert amount to cents
      currency,
      payment_method_types: ["card"],
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Payment initiation failed", error: error.message });
  }
};



exports.confirmPayment = async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    // Retrieve and verify the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    // Find the existing booking
    const booking = await Booking.findById(bookingId).populate("attendeeId").populate("eventId")
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if the event exists
    const event = await Event.findById(booking.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the ticket type exists and there are enough tickets available
    const ticket = event.tickets.find((t) => t.type === booking.ticketType);
    if (!ticket || ticket.quantity - ticket.sold < booking.quantity) {
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    // Update the ticket sold count
    ticket.sold += booking.quantity;
    await event.save();

    // Update the booking status
    booking.bookingStatus = "Confirmed";
    await booking.save();

    // Store payment details in the Payment collection
    const newPayment = new Payment({
      attendeeId: booking.attendeeId,
      eventId: booking.eventId,
      bookingId: booking._id,
      paymentIntentId,
      amount: booking.totalPrice,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      paymentMethod: paymentIntent.payment_method_types[0], // Example: "card"
    });
    await newPayment.save();

    // ✅ Generate QR Code
    const qrCodePath = `public/qrcodes/${booking._id}.png`;
    await QRCode.toFile(qrCodePath, `Booking ID: ${booking._id}`);

    // ✅ Generate Badge as PDF
    const badgePath = `public/badges/${booking._id}.pdf`;
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(badgePath));
    doc.fontSize(20).text(`Event: ${event.name}`, 100, 100);
    doc.fontSize(16).text(`Attendee: ${booking.attendeeId.name}`, 100, 150);
    doc.fontSize(16).text(`Ticket Type: ${booking.ticketType}`, 100, 200);
    doc.end();

    // ✅ Send Email with QR Code & Badge
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.attendeeId.email,
      subject: "Your Event Ticket & Badge",
      text: `Dear ${booking.attendeeId.name},\n\nYour booking for ${event.name} is confirmed! Please find your QR code and badge attached.`,
      attachments: [
        { filename: "qr_code.png", path: qrCodePath },
        { filename: "badge.pdf", path: badgePath },
      ],
    };

    await transporter.sendMail(mailOptions);

    // ✅ Update booking with QR code & badge URLs
    booking.qrCode = qrCodePath;
    booking.badgeUrl = badgePath;
    booking.badgeGenerated = true;
    await booking.save();

    res.status(200).json({
      message: "Booking confirmed! QR code & badge sent via email.",
      booking,
      payment: newPayment,
    });

  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ message: "Payment confirmation failed", error: error.message });
  }
};
