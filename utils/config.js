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

//MODELS
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

//MODELS
const ContactShema = new mongoose.Schema({
    nama: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true 
    },
    email:{
        type: String,
        required:true
    }
    
});


//MODELS
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


//MODELS
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


//EXPORT MODEL KE APLIKASI UTAMA
module.exports = {
    collection,
    contact,
    classes,
    plan
};



// Simpan Plans Ke database
plan.findOneAndUpdate(
    { plan: "Basic Plan" }, 
    { $setOnInsert: { plan: "Basic Plan", price: 150000, quantity: 1 } }, 
    { upsert: true } 
)
.then(savedPlan => {
    console.log('Rencana berhasil disimpan:', savedPlan);
})
.catch(error => {
    console.error('Gagal menyimpan rencana:', error);
});

plan.findOneAndUpdate(
    { plan: "Weekly Plan" }, 
    { $setOnInsert: { plan: "Weekly Plan", price: 300000, quantity: 1 } }, 
    { upsert: true } 
)
.then(savedPlan => {
    console.log('Rencana berhasil disimpan:', savedPlan);
})
.catch(error => {
    console.error('Gagal menyimpan rencana:', error);
});

plan.findOneAndUpdate(
    { plan: "Monthly Plan" }, 
    { $setOnInsert: { plan: "Monthly Plan", price: 450000, quantity: 1 } }, 
    { upsert: true } 
)
.then(savedPlan => {
    console.log('Rencana berhasil disimpan:', savedPlan);
})
.catch(error => {
    console.error('Gagal menyimpan rencana:', error);
});




