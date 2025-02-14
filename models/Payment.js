const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  attendeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },
  paymentMethod: { type: String, enum: ["credit_card", "paypal", "stripe"], required: true },
  currency: { type: String, default: "usd" },
  paymentIntentId: { type: String, required: true }, 
  transactionDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);
