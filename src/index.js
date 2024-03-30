// import module
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");


const app = express();

//convert data ke json format
app.use(express.json());

app.use(express.urlencoded({extended: false}));

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("login", { errorMessage: "" });
});

app.get("/signup", (req, res) => {
    res.render("signup", { errorMessage: "" });
});

app.get("/plan", (req,res) => {
    res.render("plan");
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
            res.render("index", { userName: check.name });
        }
    } catch (error) {
        console.error(error);
        res.render("login", { errorMessage: "An error occurred while processing your request." });
    }
});


const port = 5001;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
})