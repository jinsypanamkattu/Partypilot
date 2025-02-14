const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tickets: [
        {
            type: { type: String, required: true }, // e.g., General, VIP, Student
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            sold: { type: Number, default: 0 },
        }
    ],
    promoCodes: [
        {
            code: { type: String, required: true, unique: true }, // e.g., "EARLYBIRD"
            discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
            discountValue: { type: Number, required: true }, // E.g., 20% or $10
            maxUses: { type: Number, default: 100 }, // Limit on redemptions
            usedCount: { type: Number, default: 0 }, // Track usage
            expirationDate: { type: Date, required: true }
        }
    ],
    agenda: [
        {
            title: { type: String, required: true }, // e.g., "Keynote Speech"
            description: { type: String },
            speaker: { type: String }, // Name of the speaker or panel
            startTime: { type: Date, required: true },
            endTime: { type: Date, required: true }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Event", EventSchema);