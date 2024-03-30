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

const contactSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    nomor_telepon: {
        type: Number,
        required: true
    }
});



const collection = new mongoose.model("Users", LoginSchema);

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;

module.exports = collection;
