// import module
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const {collection, contact, classes, plan} = require("./config");
const bodyParser = require("body-parser");



const app = express();

//convert data ke json format
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));


//GET
// Route untuk halaman utama
app.get("/", (req, res) => {
    res.render("login", { errorMessage: "" });
});


app.get("/login", (req, res) => {
    res.render("login", { errorMessage: "" });
});

// Route untuk halaman signup
app.get("/signup", (req, res) => {
    res.render("signup", { errorMessage: "" });
});

// Route untuk halaman plan
app.get("/plan", (req,res) => {
    res.render("plan");
});

//contacts
app.get("/contacts", async (req,res) => {
    try {
        const contactsData = await contact.find(); // Menunggu promise untuk diselesaikan
        res.render("contacts", { contacts: contactsData }); // Mengirimkan data kontak ke template contacts.ejs
    } catch (error) {
        console.error("Failed to `fetch contacts:", error);
        res.status(500).send( "Internal Server Error");
    }
});


//contacts edit
app.get("/contacts_edit/:id", (req, res, next) => {
    console.log(req.params.id);
    contact.findOneAndUpdate({_id: req.params.id}, req.body, {new: true})
        .then(docs => {
            if (docs) {
                res.render("contacts_edit", {contact: docs});
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
            console.log("deleted successfully");
            res.redirect("/contacts");
        })
        .catch(err => {
            console.log("Something Went Wrong");
            next(err);
        });
});



app.get("/profile", (req,res) => {
    res.render("profile");
});

app.get("/admin", (req,res) => {
    res.render("admin");
});

app.get("/cart", async (req, res) => {
    try {
        // Ambil semua kontak dari database
        const contacts = await contact.find();
        res.render("cart", { contact: contacts }); // Render halaman cart.ejs dengan data kontak
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).send("Internal Server Error");
    }

});




//POST
//contact
app.post("/contacts",async (req, res, )=> {
    const {nama, phone} = req.body;

    console.log(nama, phone);

    try {
        const contactCon = new contact({
            nama : nama,
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
            console.log("something went wrong");
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
    const data = {
        name: req.body.username,
        password: req.body.password
    }
    
    //cek apakah nama sama atau tidak
    const existingUser = await collection.findOne({name: data.name});
    if(existingUser){
        res.render("signup", { errorMessage: "User already exist, pick another Username." });
            return;
    }else{
        //hash password
        const saltRounds = 10;
        const hashedpassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedpassword;

        const userdata = await collection.insertMany(data);
        console.log(userdata);    

        res.render("login", { errorMessage: "" });
    }
});


app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });

        if (!check) {
            res.render("login", { errorMessage: "User name can't be found" });
            return;
        }
        
        // Compare passwords
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            res.render("login", { errorMessage: "Wrong password" });
        } else {
            res.render("index", { userName: check.name, admin:check.admin});
        }
    } catch (error) {
        console.error(error);
        res.render("login", { errorMessage: "An error occurred while processing your request." });
    }
});



// Endpoint untuk menampilkan profil pengguna
app.get("/profile", async (req, res) => {
    try {
        // Dapatkan data profil pengguna dari basis data
        const user = await collection.findOne({ name: req.body.username });
        if (!user) {
            res.render("profile", { errorMessage: "User not found" });
            return;
        }
        res.render("profile", { user }); // Melewatkan objek user ke halaman profile.ejs
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        res.status(500).send("Internal Server Error");
    }
});


// Endpoint untuk memperbarui nama pengguna
app.post("/profile/update-name", async (req, res) => {
    try {
        const newName = req.body.newName;
        await collection.updateOne({ name: req.body.username }, { $set: { name: newName } });
        res.redirect("/profile");
    } catch (error) {
        console.error("Failed to update username:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Endpoint untuk memperbarui kata sandi pengguna
app.post("/profile/update-password", async (req, res) => {
    try {
        const newPassword = req.body.newPassword;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await collection.updateOne({ name: req.body.username }, { $set: { password: hashedPassword } });
        res.redirect("/profile");
    } catch (error) {
        console.error("Failed to update password:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Endpoint untuk menghapus profil pengguna
app.post("/profile/delete", async (req, res) => {
    try {
        await collection.deleteOne({ name: req.body.username });
        res.redirect("/login"); // Redirect ke halaman login setelah penghapusan profil
    } catch (error) {
        console.error("Failed to delete user profile:", error);
        res.status(500).send("Internal Server Error");
    }
});





const port = 5001;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
})