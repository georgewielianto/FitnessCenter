const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/Login");

//cek koneksi database
connect.then(() => {
    console.log("Database connected Sucsessfully");
})
.catch(() => {
    console.log("Database cant connect");
});

const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const planSchema = new mongoose.Schema({
    name: String,
    price: Number,
    quantity: Number
});

const Plan = mongoose.model("Plan", planSchema);

const collection = new mongoose.model("Users", LoginSchema);

module.exports = collection;