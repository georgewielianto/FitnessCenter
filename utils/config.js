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
    },
    email:{
        type: String,
        required:true
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



// Simpan rencana-rencana hanya jika belum ada di database
plan.findOneAndUpdate(
    { plan: "Basic Plan" }, // Kriteria pencarian
    { $setOnInsert: { plan: "Basic Plan", price: 150000, quantity: 1 } }, // Data yang akan disimpan jika dokumen tidak ditemukan
    { upsert: true } // Opsi upsert
)
.then(savedPlan => {
    console.log('Rencana berhasil disimpan:', savedPlan);
})
.catch(error => {
    console.error('Gagal menyimpan rencana:', error);
});

plan.findOneAndUpdate(
    { plan: "Weekly Plan" }, // Kriteria pencarian
    { $setOnInsert: { plan: "Weekly Plan", price: 300000, quantity: 1 } }, // Data yang akan disimpan jika dokumen tidak ditemukan
    { upsert: true } // Opsi upsert
)
.then(savedPlan => {
    console.log('Rencana berhasil disimpan:', savedPlan);
})
.catch(error => {
    console.error('Gagal menyimpan rencana:', error);
});

plan.findOneAndUpdate(
    { plan: "Monthly Plan" }, // Kriteria pencarian
    { $setOnInsert: { plan: "Monthly Plan", price: 450000, quantity: 1 } }, // Data yang akan disimpan jika dokumen tidak ditemukan
    { upsert: true } // Opsi upsert
)
.then(savedPlan => {
    console.log('Rencana berhasil disimpan:', savedPlan);
})
.catch(error => {
    console.error('Gagal menyimpan rencana:', error);
});




