const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const Payment = require("../models/Payment");
const User = require("../models/User");

// Get overview report (total bookings, revenue, etc.)
exports.getOverviewReport = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const totalRevenue = await Payment.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        res.status(200).json({
            totalBookings,
            totalRevenue: totalRevenue[0]?.total || 0,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch overview report", error: error.message });
    }
};

// Get report for a specific event

exports.getEventReport = async (req, res) => {
    try {
        const { eventId } = req.params;  // Get eventId from request params

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ error: "Invalid Event ID" });
        }

        const revenue = await Payment.aggregate([
            {
                $match: { eventId: new mongoose.Types.ObjectId(eventId) } //  Convert eventId to ObjectId
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" }  //  Calculate total revenue
                }
            }
        ]);

        res.json({ totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0 });
    } catch (error) {
        res.status(500).json({ error: "Server Error", details: error.message });
    }
};




// Get attendee report (all attendees with event details)
exports.getAttendeeReport = async (req, res) => {
    try {
        const attendees = await Booking.find().populate("attendeeId eventId");
        //console.log(attendees);

        const report = attendees.map((b) => ({
            attendee: b.attendeeId.name,
            email: b.attendeeId.email,
            event: b.eventId.name,
            ticketType: b.ticketType,
        }));

        res.status(200).json({ attendees: report });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch attendee report", error: error.message });
    }
};



//to get total attendees for a specific event

exports.getEventAttendees = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Count total attendees by summing up the 'quantity' field in bookings for this event
        const result = await Booking.aggregate([
            { $match: { eventId: new mongoose.Types.ObjectId(eventId) } }, // Filter by event ID
            { $group: { _id: "$eventId", totalAttendees: { $sum: "$quantity" } } } // Sum quantity
        ]);

        // If no attendees found, return 0
        const totalAttendees = result.length > 0 ? result[0].totalAttendees : 0;

        res.status(200).json({
            eventId,
            totalAttendees,
        });
    } catch (error) {
        console.error("Error fetching attendee count:", error);
        res.status(500).json({ message: "Error fetching attendee count", error: error.message });
    }
};

