const express = require("express");
//const { createEvent } = require("../controllers/eventController");
const  eventController = require("../controllers/eventController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

//const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();
//router.post("/create", createEvent);


// Routes for event management
router.post("/create", authenticate, authorizeRoles("admin", "organizer"), eventController.createEvent); // Create an event
router.get('/list', eventController.getAllEvents); // List all events
router.get('/published', eventController.getAllPublishedEvents); // Get event by ID
router.get('/:id', eventController.getEventById); // Get event by ID

router.put('/:id', authenticate, authorizeRoles("admin", "organizer"), eventController.updateEvent); // Update event by ID
router.delete('/:id', authenticate, authorizeRoles("admin", "organizer"), eventController.deleteEvent); // Delete event by ID

router.get("/organizer/:id", authenticate, authorizeRoles("admin", "organizer"), eventController.getOrganizerEvents);// Only admins and organizers can access their own events

//router.post("/add", protect,authorize("owner"),addBike);
module.exports = router;