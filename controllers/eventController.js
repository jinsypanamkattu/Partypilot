const Event = require("../models/Event");
// Create an event
const createEvent = async (req, res, next) => {
   
    try {
         // Extract organizer ID from the authenticated user
        const organizerId = req.user.id;

        const { name, date, location, description, status, tickets, promoCodes, agenda } = req.body;

        // Validate required fields
        if (!name || !date || !location || !description || !organizerId) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }
        // Create a new event
        const newEvent = new Event({
            name,
            date,
            location,
            description,
            organizer: organizerId,
            status: status || "draft", // Default to 'Upcoming' if not provided
            tickets,
            promoCodes,
            agenda
        });
        // Save event to database
        await newEvent.save();
        res.status(201).json({ message: "Event created successfully", event: newEvent });
    } catch (error) {
        next(error);
    }
};


// List all events
const getAllEvents = async (req, res, next) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
       next(error);
    }
};


const getOrganizerEvents = async (req, res) => {
  try {
    const organizerId = req.user.id; // Extract organizer ID from the JWT token

    const events = await Event.find({ organizer: organizerId });

    if (events.length === 0) {
      return res.status(404).json({ message: "No events found for this organizer" });
    }

    res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching organizer's events:", error);
    res.status(500).json({ message: "Failed to retrieve events", error: error.message });
  }
};

const getAllPublishedEvents = async (req, res) => {
    try {
      
  
      const events = await Event.find({ status: "published" });
  
      if (events.length === 0) {
        return res.status(404).json({ message: "No events are there under published" });
      }
  
      res.status(200).json({ events });
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to retrieve events", error: error.message });
    }
  };


// Get event by ID
const getEventById = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        res.status(200).json(event);
    } catch (error) {
        next(error);
    }
};

// Update event by ID
const updateEvent = async (req, res, next) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEvent) return res.status(404).json({ message: "Event not found" });

        res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
    } catch (error) {
        next(error);
    }
};

// Delete event by ID
const deleteEvent = async (req, res, next) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ message: "Event not found" });

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        next(error);
    }
};
// Export all functions
module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    getOrganizerEvents,
    getAllPublishedEvents,
    deleteEvent
};