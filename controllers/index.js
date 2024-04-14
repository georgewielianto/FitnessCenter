// import module
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const { collection, contact, classes, plan } = require("../utils/config");
const bodyParser = require("body-parser");
const session = require('express-session');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");


const app = express();

// Convert data ke format JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(cookieParser());

// Middleware sesi
app.use(session({
    secret: 'secret-key', // Ganti dengan kunci rahasia yang lebih aman
    resave: false,
    saveUninitialized: true
}));

// Middleware untuk memverifikasi token JWT
const verifyToken = (req, res, next) => {
    const token = req.cookies.token; // Now req.cookies should be populated
    if (!token) {
        return res.status(401).send("Unauthorized");
    }
    try {
        // Verifikasi token
        const decoded = jwt.verify(token, "your_secret_key");
        req.user = decoded; // Simpan informasi pengguna yang di-decode dalam permintaan
        next(); // Lanjutkan ke rute berikutnya
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(403).send("Invalid token");
    }
};

//GET
// Route untuk halaman utama
app.get("/", verifyToken, (req, res) => {
    res.render("login", { errorMessage: "" });
});

app.get("/login", verifyToken, (req, res) => {
    res.render("login", { errorMessage: "" });
});

// Route untuk halaman signup
app.get("/signup", verifyToken, (req, res) => {
    res.render("signup", { errorMessage: "" });
});

// Route untuk halaman plan
app.get('/plan', verifyToken, async (req, res) => {
    try {
        // Ambil semua rencana dari database
        const plans = await plan.find();
        res.render('plan', { plans });
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).send('Internal Server Error');
    }
});

//contacts
app.get('/contacts', verifyToken, async (req, res) => {
    try {
        // Ambil semua kontak dari database
        const contactsData = await contact.find();
        res.render("contacts", { contacts: contactsData });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).send('Internal Server Error');
    }
});

//contacts edit
app.get("/contacts_edit/:id", (req, res, next) => {
    console.log(req.params.id);
    contact.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
        .then(docs => {
            if (docs) {
                res.render("contacts_edit", { contact: docs });
            } else {
                console.log("Contact not found");
                // Handle the case where the contact is not found
            }
        })
        .catch(err => {
            console.log("Error:", err);
            // Handle other errors
            res.status(500).send("Internal Server Error");
        });
});

//Delete Contact
app.get("/delete/:id", (req, res, next) => {
    contact.findByIdAndDelete(req.params.id)
        .then(docs => {
            console.log("Deleted successfully");
            res.redirect("/contacts");
        })
        .catch(err => {
            console.log("Something Went Wrong");
            next(err);
        });
});

app.get("/profile", (req, res) => {
    res.render("profile", { errorMessage: "" });
});

app.get("/admin", (req, res) => {
    res.render("admin");
});

app.get("/cart", verifyToken, async (req, res) => {
    try {
        // Ambil semua kontak dari database
        const contacts = await contact.find();

        // Ambil semua rencana dari database
        const plans = await plan.find();

        res.render("cart", { req: req, contact: contacts, plans: plans }); // Render halaman cart.ejs dengan data kontak dan rencana
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).send("Internal Server Error");
    }
});

//POST
app.post('/plan', async (req, res) => {
    try {
        // Ambil ID rencana yang dipilih dari body permintaan
        const { planId } = req.body;

        // Temukan rencana berdasarkan ID
        const selectedPlan = await plan.findById(planId);

        // Simpan detail rencana di sesi
        req.session.selectedPlan = selectedPlan;

        // Redirect ke halaman cart
        res.redirect('/cart');
    } catch (error) {
        console.error('Error selecting plan:', error);
        res.status(500).send('Internal Server Error');
    }
});

//contact
app.post("/contacts", async (req, res) => {
    const { nama, phone } = req.body;

    console.log(nama, phone);

    try {
        const contactCon = new contact({
            nama: nama,
            phone: phone
        });

        await contactCon.save();
        console.log("Data recorded successfully");
        res.redirect('/contacts');
    } catch (error) {
        console.log("Something went wrong:", error);
    }
});

//contact_edit
app.post("/contacts_edit/:id", (req, res, next) => {
    contact.findByIdAndUpdate(req.params.id, req.body)
        .then(docs => {
            res.redirect("/contacts");
        })
        .catch(err => {
            console.log("Something went wrong");
            next(err);
        });
});

//plan
//Admin - menambah kelas baru
//menambah kelas baru
app.post("/admin", async (req, res) => {
    try {
        const { title, description, imageUrl } = req.body;

        // Buat instance kelas baru menggunakan model Classes
        const newClass = new classes({
            title: title,
            description: description,
            imageUrl: imageUrl
        });

        // Simpan kelas ke dalam database
        await newClass.save();

        res.status(201).send("Class added successfully");
    } catch (error) {
        console.error("Error adding class:", error);
        res.status(500).send("Error adding class");
    }
});

//register user
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Cek apakah nama pengguna sudah ada
        const existingUser = await collection.findOne({ name: username });
        if (existingUser) {
            return res.render("signup", { errorMessage: "User already exists, please choose another username." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat pengguna baru
        await collection.insertOne({ name: username, password: hashedPassword });

        res.render("login", { errorMessage: "" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Cari pengguna berdasarkan nama pengguna
        const user = await collection.findOne({ name: username });
        if (!user) {
            return res.render("login", { errorMessage: "User not found" });
        }

        // Bandingkan password yang di-hash dengan password yang dimasukkan
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.render("login", { errorMessage: "Incorrect password" });
        }

        // Buat token JWT
        const token = jwt.sign({ username: user.name }, "your_secret_key");

        // Simpan token di cookie
        res.cookie("token", token, { httpOnly: true });

        res.render("index", { userName: user.name, admin: user.admin });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Endpoint untuk memperbarui nama pengguna
app.post("/profile/update-name", verifyToken, async (req, res) => {
    try {
        const { username, newName } = req.body;
        await collection.updateOne({ name: username }, { $set: { name: newName } });
        res.redirect("/profile");
    } catch (error) {
        console.error("Failed to update username:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Endpoint untuk memperbarui kata sandi pengguna
app.post("/profile/update-password", verifyToken, async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await collection.updateOne({ name: username }, { $set: { password: hashedPassword } });
        res.redirect("/profile");
    } catch (error) {
        console.error("Failed to update password:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Endpoint untuk menghapus profil pengguna
app.post("/profile/delete", verifyToken, async (req, res) => {
    try {
        const { username } = req.body;
        await collection.deleteOne({ name: username });
        res.redirect("/login"); // Redirect ke halaman login setelah penghapusan profil
    } catch (error) {
        console.error("Failed to delete user profile:", error);
        res.status(500).send("Internal Server Error");
    }
});

const port = 5001;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
