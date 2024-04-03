// import module
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const {collection, contact} = require("./config");



const app = express();

//convert data ke json format
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

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

app.get("/contacts", (req,res) => {
    res.render("contacts");
});

app.get("/profile", (req,res) => {
    res.render("profile");
});

app.get("/admin", (req,res) => {
    res.render("admin");
});


//contact
app.post('/add',async (req, res, next)=> {
    // const name = req.body.name;
    // const phone = req.body.phone;

    const {name, phone} = req.body;

    console.log(name, phone);

    try {
        const contactCon = new contact({
            name,
            phone
        });

        await contactCon.save();
        console.log("Data recorded successfully");
        res.redirect('/');``
    } catch (error) {
        console.log("Something went wrong:", error);
        // Lakukan penanganan kesalahan yang sesuai di sini
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