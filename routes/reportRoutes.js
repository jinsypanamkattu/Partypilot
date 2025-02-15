const express = require("express");
const { getOverviewReport, getEventReport, getAttendeeReport, getEventAttendees } = require("../controllers/reportController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin and organizer report overview
router.get("/overview", authenticate, authorizeRoles("admin", "organizer"), getOverviewReport);

// Event-specific report
router.get("/event/:eventId", authenticate, authorizeRoles("admin", "organizer"), getEventReport);

// Attendee report
router.get("/attendees", authenticate, authorizeRoles("admin", "organizer"), getAttendeeReport);

//Attendee count for a specific event
router.get("/event/:eventId/attendees-count", authenticate, authorizeRoles("admin", "organizer"), getEventAttendees);


module.exports = router;
