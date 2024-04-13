const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/Login");
const bodyParser = require("body-parser");

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
    },
    admin:{
        type: Boolean,
        default:false,
        require:true
    }
});

const ContactShema = new mongoose.Schema({
    nama: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true 
    }
    
});

const ClassesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    }
    
});

const PlanSchema = new mongoose.Schema({
    plan: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
})


const collection = new mongoose.model("Users", LoginSchema);

const contact = new mongoose.model("Contact", ContactShema);

const classes = new mongoose.model("Classes", ClassesSchema);

const plan = new mongoose.model("Plan", PlanSchema);

// module.exports = collection;

module.exports = {
    collection,
    contact,
    classes,
    plan
};

