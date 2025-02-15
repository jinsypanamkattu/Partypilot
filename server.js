const express=require("express")
require('dotenv').config();
const cors=require("cors")


const connectDB = require("./config/db")
connectDB()


const app=express()
const PORT= process.env.PORT || 5005

const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

app.use(cors())
app.use(express.json())

const userRoutes = require("./routes/userRoutes");
app.use("/api/user", userRoutes);

const eventRoutes = require("./routes/eventRoutes");
app.use("/api/event", eventRoutes);

const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api/booking", bookingRoutes);

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payments", paymentRoutes);

const reportRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportRoutes);



app.listen(PORT ,()=>console.log(`server running ${PORT }`))