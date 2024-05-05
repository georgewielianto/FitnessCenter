// import module
//EXPRESS SESION
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const { collection, contact, classes, plan, trainers } = require("../utils/config");
const bodyParser = require("body-parser");
const session = require('express-session');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");



const app = express();

//MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(cookieParser());
app.use(methodOverride("_method")); 

// SESSION MIDDLEWARE
app.use(session({
    secret: 'secret-key', 
    resave: false,
    saveUninitialized: true
}));

// JWT MIDDLEWARE
const verifyToken = (req, res, next) => {
    const token = req.cookies.token; 
    if (!token && req.path !== '/login') { 
        return res.status(401).send("Unauthorized");
    }
    try {
        if (token) { 
            // Verifikasi token
            const decoded = jwt.verify(token, "your_secret_key");
            req.user = decoded; // Simpan informasi pengguna yang di-decode dalam permintaan
        }
        next(); // Lanjutkan ke rute berikutnya
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(403).send("Invalid token");
    }
};



//ROUTING(GET&POST)
//GET
// Route untuk halaman utama
app.get("/", verifyToken, (req, res) => {
    res.render("login", { errorMessage: "" });
});


app.get("/index", verifyToken, async (req, res) => {
    try {
        const classesData = await classes.find(); 
        const trainersData = await trainers.find();
        res.render("index", { 
            userName: req.user.username, 
            isAdmin: req.user.isAdmin,
            newUsername: req.session.newUsername,
            classes: classesData,
            trainers: trainersData
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).send('Internal Server Error');
    }
});




app.get("/login", verifyToken, (req, res) => {
    res.render("login", { errorMessage: "" });
});

// Route untuk halaman signup
app.get("/signup", (req, res) => {
    res.render("signup", { errorMessage: "" });
});

// Route untuk halaman plan
app.get('/plan', verifyToken, async (req, res) => {
    try {
        // Ambil semua plan dari database
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
            }
        })
        .catch(err => {
            console.log("Error:", err);
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


app.get("/profile", verifyToken, (req, res) => {
    res.render("profile", { 
        userName: req.user ? req.user.username : "", 
        errorMessage: "",
        newUsername: req.session.newUsername 
    });
});

app.get("/admin", (req, res) => {
    res.render("admin");
});

app.get("/admin_edit/:id", async (req, res) => {
    try {
        const classId = req.params.id;
        const classData = await classes.findById(classId);
        res.render("admin_edit", { cls: classData });
    } catch (error) {
        console.error("Error fetching class data for editing:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/trainer_edit/:id", async (req, res) => {
    try {
        const trainerId = req.params.id;
        const trainerData = await trainers.findById(trainerId);
        res.render("trainer_edit", { trainers: trainerData });
    } catch (error) {
        console.error("Error fetching class data for editing:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/cart", verifyToken, async (req, res) => {
    try {
        // Ambil semua kontak dari database
        const contacts = await contact.find();

        // Ambil semua plan dari database
        const plans = await plan.find();

        res.render("cart", { req: req, contact: contacts, plans: plans }); 
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).send("Internal Server Error");
    }
});



//POST
app.post('/plan', async (req, res) => {
    try {
    
        const { planId } = req.body;

        // Temukan rencana berdasarkan ID
        const selectedPlan = await plan.findById(planId);

        req.session.selectedPlan = selectedPlan;

        res.redirect('/cart');
    } catch (error) {
        console.error('Error selecting plan:', error);
        res.status(500).send('Internal Server Error');
    }
});

//contact
app.post("/contacts", async (req, res) => {
    const { nama, phone, email } = req.body;

    console.log(nama, phone, email);

    try {
        const contactCon = new contact({
            nama: nama,
            phone: phone,
            email: email
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

// POST untuk edit classes melalui akun admin
app.post("/admin_edit/:id", async (req, res) => {
    try {
        const classId = req.params.id;
        const { title, description, imageUrl } = req.body;
        // Perbarui detail kelas di database
        await classes.findByIdAndUpdate(classId, { title, description, imageUrl });
        res.redirect("/index");
    } catch (error) {
        console.error("Error updating class:", error);
        res.status(500).send("Internal Server Error");
    }
});




//Admin - menambah Classes baru
app.post("/admin", async (req, res) => {
    try {
        // Periksa apakah data yang diterima adalah untuk menambah kelas atau trainer
        const { title, description, imageUrl, trainerName, trainerDesc, trainerImg } = req.body;

        // Jika data yang diterima berisi informasi tentang kelas (title, description, imageUrl)
        if (title && description && imageUrl) {
            // Buat instance kelas baru menggunakan model Classes
            const newClass = new classes({
                title: title,
                description: description,
                imageUrl: imageUrl
            });

            // Simpan kelas ke dalam database
            await newClass.save();

            res.status(201).send("Class added successfully");
        } 
        // Jika data yang diterima berisi informasi tentang trainer (trainerName, trainerDesc, trainerImg)
        else if (trainerName && trainerDesc && trainerImg) {
            // Buat instance trainer baru menggunakan model Trainers
            const newTrainer = new trainers({
                trainerName: trainerName,
                trainerDesc: trainerDesc,
                trainerImg: trainerImg
            });

            await newTrainer.save();

            res.status(201).send("Trainer added successfully");
        } else {
            // Jika data yang diterima tidak sesuai format
            res.status(400).send("Bad Request: Invalid data format");
        }
    } catch (error) {
        console.error("Error adding data:", error);
        res.status(500).send("Error adding data");
    }
});




// Endpoint untuk menghapus Classes berdasarkan ID
app.post("/classes/:id", async (req, res) => {
    try {
        const deletedClass = await classes.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.status(404).send("Class not found");
        }
        res.redirect("/index?successMessage=Classes%20successfully%20deleted");
    } catch (error) {
        console.error("Error deleting class:", error);
        res.status(500).send("Internal Server Error");
    }
});

//Delete trainer
app.post("/trainers/:id", async (req, res) => {
    try {
        const deletedClass = await trainers.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.status(404).send("Class not found");
        }
        res.redirect("/index?successMessage=Trainer%20successfully%20deleted");
    } catch (error) {
        console.error("Error deleting class:", error);
        res.status(500).send("Internal Server Error");
    }
});

//POST Edit trainer
app.post("/trainer_edit/:id", async (req, res) => {
    try {
        const trainerId = req.params.id;
        const { trainerName, trainerDesc, trainerImg } = req.body;
        // Perbarui detail kelas di database
        await trainers.findByIdAndUpdate(trainerId, { trainerName, trainerDesc, trainerImg });
        res.redirect("/index");
    } catch (error) {
        console.error("Error updating class:", error);
        res.status(500).send("Internal Server Error");
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
        await collection.create({ name: username, password: hashedPassword });

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

        const isAdmin = user.admin || false;
        // Buat token JWT
        const token = jwt.sign({ username: user.name, isAdmin: isAdmin }, "your_secret_key", {
            //cookie expires
            expiresIn: '30d'
        });

        // Simpan token di cookie
        res.cookie("token", token, { httpOnly: true });

        delete req.session.newUsername;

        req.session.newUsername = user.name;

        res.redirect("index");
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send("Internal Server Error");
    }
});


// Endpoint untuk memperbarui nama user
app.post("/profile/update-name", verifyToken, async (req, res) => {
    try {
        const { newName } = req.body;
        const username = req.user.username;

        const existingUser = await collection.findOne({ name: newName });
        if (existingUser) {
            return res.render("profile", { 
                userName: username, 
                errorMessage: "Username already exists, pick another Username!!!", 
                newUsername: req.session.newUsername 
            });
        }

        await collection.updateOne({ name: username }, { $set: { name: newName } });

        req.session.newUsername = newName;

        res.render("profile", { 
            userName: newName, 
            errorMessage: "", 
            newUsername: newName 
        });
    } catch (error) {
        console.error("Failed to update username:", error);
        res.status(500).send("Internal Server Error");
    }
});






// Endpoint untuk memperbarui kata sandi User
app.post("/profile/update-password", verifyToken, async (req, res) => {
    try {
        const { newPassword } = req.body;
        const username = req.user.username;

        // Hash password baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password di dalam database menggunakan findOneAndUpdate
        await collection.findOneAndUpdate({ name: username }, { $set: { password: hashedPassword } });
        
        // Redirect ke halaman profile setelah berhasil memperbarui password
        res.redirect("/profile?successMessage=Password%20successfully%20updated");
    } catch (error) {
        console.error("Failed to update password:", error);
        res.status(500).send("Internal Server Error");
    }
});




// Endpoint untuk menghapus profil pengguna
app.post("/profile/delete", verifyToken, async (req, res) => {
    try {
        const { username } = req.user; // Menggunakan informasi pengguna yang sudah disimpan di req.user

        // Hapus pengguna dari database
        const deletedUser = await collection.deleteOne({ name: username });

        // Periksa apakah pengguna berhasil dihapus
        if (deletedUser.deletedCount === 1) {
            // Hapus cookie token untuk logout pengguna
            res.clearCookie("token");
            // Redirect ke halaman login setelah penghapusan profil
            return res.redirect("/login");
        } else {
            // Jika pengguna tidak ditemukan dalam database
            return res.status(404).send("User not found");
        }
    } catch (error) {
        console.error("Failed to delete user profile:", error);
        res.status(500).send("Internal Server Error");
    }
});


//SERVER INITIALIZATION
const port = 5001;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
