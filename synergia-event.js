require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));


const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  event: { type: String, required: true },
  ticketType: String,
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);


app.get('/api/bookings', async (req, res) => {
  const bookings = await Booking.find();
  res.status(200).json(bookings);
});


app.post('/api/bookings', async (req, res) => {
  const { name, email, event, ticketType } = req.body;
  if (!name || !email || !event) {
    return res.status(400).json({ msg: 'Name, email, and event are required' });
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Please enter a valid email address" });
    }

    const existingBooking = await Booking.findOne({ email });
    if (existingBooking) {
      return res.status(409).json({ msg: "Booking with given email already exists" });
    }
  const booking = await Booking.create({ name, email, event, ticketType });
  res.status(201).json({ booking, msg: 'Booking created successfully' });
});

app.get('/api/bookings/search', async (req, res) => {
  const { email } = req.query;
  const bookings = await Booking.find({ email });
  res.status(200).json(bookings);
});


app.get('/api/bookings/filter', async (req, res) => {
  const { event } = req.query;
  const bookings = await Booking.find({ event });
  res.status(200).json(bookings);
});


app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    res.status(200).json(booking);
  } catch (err) {
    res.status(400).json({ msg: 'Invalid ID format' });
  }
});


app.put('/api/bookings/:id', async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ msg: 'Booking not found' });
    res.status(200).json({ updated, msg: 'Booking updated successfully' });
  } catch (err) {
    res.status(400).json({ msg: 'Invalid ID format' });
  }
});


app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'Booking not found' });
    res.status(200).json({ msg: 'Booking deleted successfully' });
  } catch (err) {
    res.status(400).json({ msg: 'Invalid ID format' });
  }
});





const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
