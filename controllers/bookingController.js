const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');


const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

// Ensure badges folder exists
const badgeDir = path.join(__dirname, "../badges");
if (!fs.existsSync(badgeDir)) {
    fs.mkdirSync(badgeDir, { recursive: true });
}

// Booking an event
exports.bookEvent = async (req, res) => {
    try {
        const { attendeeId, eventId, ticketType, quantity, totalPrice } = req.body;

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // Check if ticket type is available
        const ticket = event.tickets.find(t => t.type === ticketType);
        if (!ticket || ticket.quantity - ticket.sold < quantity) {
            return res.status(400).json({ message: "Not enough tickets available" });
        }

        // Create a new booking
        const newBooking = new Booking({
            attendeeId,
            eventId,
            ticketType,
            quantity,
            totalPrice,
            bookingStatus: "Pending",
        });
        await newBooking.save();
       // res.status(201).json({ message: "Booked successfully.Continue to payment", Details: newBooking });

        // Generate QR Code with Booking ID
        const qrCodeData = `${process.env.FRONTEND_URL}/booking/${newBooking._id}`;
        const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
        newBooking.qrCode = qrCodeUrl;

        // Save booking in DB
        await newBooking.save();

        // Update ticket sold count
        ticket.sold += quantity;
        await event.save();

        // Generate PDF Badge
        const attendee = await User.findById(attendeeId);
        if (!attendee) return res.status(404).json({ message: "Attendee not found" });

        const badgePath = path.join(badgeDir, `${newBooking._id}.pdf`);
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(badgePath));
        doc.fontSize(20).text(`Event Badge for ${attendee.name}`, { align: "center" });
        doc.image(qrCodeUrl, { width: 150, align: "center" });
        doc.fontSize(14).text(`Event: ${event.name}`, { align: "center" });
        doc.text(`Ticket: ${ticketType}`, { align: "center" });
        doc.text(`Status: Confirmed`, { align: "center" });
        doc.end();

        // Update booking with badge URL
        newBooking.badgeUrl = badgePath;
        newBooking.badgeGenerated = true;
        await newBooking.save();

        // Send Email with Badge
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: attendee.email,
            subject: "Your Event Booking Confirmation & Badge",
            text: `Dear ${attendee.name},\n\nYour booking for ${event.name} is confirmed. Your badge is attached.\n\nBest regards,\nEvent Team`,
            attachments: [{ filename: "badge.pdf", path: badgePath }],
        };

        await transporter.sendMail(mailOptions);

        res.json({
            message: "Booking confirmed, QR code & badge generated, email sent.",
            booking: newBooking,
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId)
            .populate('eventId')
            .populate('attendeeId', 'name email');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Find the event and ticket
        const event = await Event.findById(booking.event);
        const ticket = event.tickets.find(t => t.type === booking.ticketType);

        // Restore ticket availability
        ticket.sold -= booking.quantity;
        await event.save();

        // Delete booking
        await booking.deleteOne();

        res.json({ message: 'Booking canceled successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
