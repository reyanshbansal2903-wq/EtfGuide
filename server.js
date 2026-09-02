   require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();


// ==========================================
// BASIC SETTINGS
// ==========================================

app.use(bodyParser.urlencoded({ extended:    true }));

app.use(express.static(__dirname, {
    index: false
}));


// ==========================================
// LOGIN SESSIONS
// ==========================================

app.use(
    session({
        secret: "etf-guide-secret",
        resave: false,
        saveUninitialized: false
    })
);


// ==========================================
// MYSQL CONNECTION
// ==========================================

   password: process.env.DB_PASSWORD,


// ==========================================
// CONNECT TO MYSQL
// ==========================================

db.connect((err) => {

    if (err) {

        console.log("Database connection failed:", err);

    } else {

        console.log("Connected to MySQL!");

    }

});


// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {

    console.log("========== HOME PAGE ==========");
    console.log("Session:", req.session);
    console.log("Username:", req.session.username);


    // ==========================================
    // USER IS NOT LOGGED IN
    // ==========================================

    if (!req.session.username) {

        console.log("NO LOGIN SESSION - showing normal home page");

        return res.sendFile(__dirname + "/index.html");

    }


    console.log("LOGGED IN AS:", req.session.username);

    const username = req.session.username;


    // ==========================================
    // FIND USER'S PROFILE
    // ==========================================

    db.query(
        "SELECT Name FROM UserProfiles WHERE Username = ?",
        [username],
        (err, profileResults) => {

            if (err) {

                console.log("PROFILE QUERY ERROR:", err);

                return res.sendFile(__dirname + "/index.html");

            }


            // ==========================================
            // PROFILE DOES NOT EXIST
            // ==========================================

            if (profileResults.length === 0) {

                console.log("No profile found - sending user to profile page");

                return res.redirect("/profile");

            }


            const name = profileResults[0].Name;


            // ==========================================
            // FIND USER'S INVESTMENTS
            // ==========================================

            db.query(
                "SELECT Stock, Amount, Type FROM Investments WHERE Username = ?",
                [username],
                (err, investmentResults) => {

                    if (err) {

                        console.log("INVESTMENT QUERY ERROR:", err);

                        return res.sendFile(__dirname + "/index.html");

                    }


                    let investmentHTML = "";


                    // ==========================================
                    // NO INVESTMENTS
                    // ==========================================

                    if (investmentResults.length === 0) {

                        investmentHTML = `
                            <p>You haven't added any investments yet.</p>
                        `;

                    } else {


                        // ==========================================
                        // DISPLAY INVESTMENTS
                        // ==========================================

                        investmentResults.forEach((investment) => {

                            const amount =
                                Number(investment.Amount).toFixed(2);

                            const word =
                                investment.Type === "profit"
                                    ? "Profit"
                                    : "Loss";


                            investmentHTML += `
                                <div class="investment-item">

                                    <strong>
                                        ${investment.Stock}
                                    </strong>

                                    <span>
                                        ${word}: $${amount}
                                    </span>

                                </div>
                            `;

                        });

                    }


                    // ==========================================
                    // PERSONALIZED HOME PAGE
                    // ==========================================

                    res.send(`

                        <!DOCTYPE html>

                        <html lang="en">

                        <head>

                            <meta charset="UTF-8">

                            <meta name="viewport"
                                  content="width=device-width, initial-scale=1.0">

                            <title>Home | ETF Guide</title>

                            <link rel="stylesheet" href="/style.css">

                        </head>


                        <body>


                        <!-- ================================== -->
                        <!-- NAVIGATION -->
                        <!-- ================================== -->

                        <nav class="navbar">

                            <div class="nav-container">

                                <a href="/" class="logo">
                                    ETF<span>Guide</span>
                                </a>


                                <div class="nav-links">

                                    <a href="/">
                                        Home
                                    </a>

                                    <a href="/etfs">
                                        What Are ETFs?
                                    </a>

                                    <a href="/compare">
                                        ETF vs Stocks
                                    </a>

                                    <a href="/diversification">
                                        Spread Your Money
                                    </a>

                                    <a href="/investing">
                                        How It Works
                                    </a>

                                    <a href="/etf-chart">
                                        ETF Performance
                                    </a>

                                </div>


                                <div class="auth-buttons">

                                    <a href="/logout"
                                       class="login-button">

                                        Log Out

                                    </a>

                                </div>

                            </div>

                        </nav>


                        <!-- ================================== -->
                        <!-- WELCOME -->
                        <!-- ================================== -->

                        <section class="hero">

                            <div class="hero-content">

                                <p class="eyebrow">
                                    YOUR INVESTMENTS
                                </p>

                                <h1>
                                    Welcome, ${name}!
                                </h1>

                                <p>
                                    Here are the investments
                                    you entered into your account.
                                </p>

                            </div>

                        </section>


                        <!-- ================================== -->
                        <!-- INVESTMENTS -->
                        <!-- ================================== -->

                        <section class="section">

                            <div class="section-heading">

                                <p class="eyebrow">
                                    YOUR INVESTMENTS
                                </p>

                                <h2>
                                    Your Profit and Loss
                                </h2>

                                <p>
                                    This shows the profit or loss
                                    information you entered.
                                </p>

                            </div>


                            <div class="investment-list">

                                ${investmentHTML}

                            </div>


                            <div class="center-button">

                                <a href="/profile"
                                   class="primary-button">

                                    Edit My Investments

                                </a>

                            </div>

                        </section>


                        <!-- ================================== -->
                        <!-- BOTTOM SECTION -->
                        <!-- ================================== -->

                        <section class="dark-section">

                            <div class="two-column">

                                <div>

                                    <p class="eyebrow">
                                        YOUR ACCOUNT
                                    </p>

                                    <h2>
                                        Keep learning about investing.
                                    </h2>

                                </div>


                                <div>

                                    <p>
                                        Remember that investments can
                                        go up and down. Past performance
                                        does not guarantee future results.
                                    </p>

                                    <a href="/etf-chart"
                                       class="text-link">

                                        See ETF Performance →

                                    </a>

                                </div>

                            </div>

                        </section>


                        <!-- ================================== -->
                        <!-- FOOTER -->
                        <!-- ================================== -->

                        <footer>

                            <div class="footer-container">

                                <div>

                                    <div class="logo">
                                        ETF<span>Guide</span>
                                    </div>

                                    <p>
                                        A simple website explaining ETFs
                                        and investing.
                                    </p>

                                </div>


                                <div class="footer-links">

                                    <a href="/">
                                        Home
                                    </a>

                                    <a href="/etfs">
                                        What Are ETFs?
                                    </a>

                                    <a href="/compare">
                                        ETF vs Stocks
                                    </a>

                                    <a href="/diversification">
                                        Spread Your Money
                                    </a>

                                    <a href="/investing">
                                        How It Works
                                    </a>

                                    <a href="/etf-chart">
                                        ETF Performance
                                    </a>

                                </div>

                            </div>


                            <div class="copyright">

                                This website is for educational purposes only.
                                It is not financial advice.

                            </div>

                        </footer>


                        </body>

                        </html>

                    `);

                }

            );

        }

    );

}); // IMPORTANT: closes app.get("/")


// ==========================================
// REGISTER PAGE
// ==========================================

app.get("/register", (req, res) => {

    res.sendFile(__dirname + "/register.html");

});


// ==========================================
// REGISTER USER
// ==========================================

app.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;


    // ==========================================
    // USERNAME LENGTH
    // ==========================================

    if (!username || username.length < 8) {

        return res.send(`

            <h2>Registration Error</h2>

            <p>
                Your username must be at least 8 characters long.
            </p>

            <a href="/register">
                Go back to Register
            </a>

        `);

    }


    // ==========================================
    // PASSWORD LENGTH
    // ==========================================

    if (!password || password.length < 8) {

        return res.send(`

            <h2>Registration Error</h2>

            <p>
                Your password must be at least 8 characters long.
            </p>

            <a href="/register">
                Go back to Register
            </a>

        `);

    }


    // ==========================================
    // NO SPACES
    // ==========================================

    if (/\s/.test(username) || /\s/.test(password)) {

        return res.send(`

            <h2>Registration Error</h2>

            <p>
                Username and password cannot contain spaces.
            </p>

            <a href="/register">
                Go back to Register
            </a>

        `);

    }


    // ==========================================
    // USERNAME CANNOT END WITH SPECIAL CHARACTER
    // ==========================================

    if (/[^a-zA-Z0-9]$/.test(username)) {

        return res.send(`

            <h2>Registration Error</h2>

            <p>
                Your username cannot end with a special character.
            </p>

            <a href="/register">
                Go back to Register
            </a>

        `);

    }


    // ==========================================
    // PASSWORD CANNOT END WITH SPECIAL CHARACTER
    // ==========================================

    if (/[^a-zA-Z0-9]$/.test(password)) {

        return res.send(`

            <h2>Registration Error</h2>

            <p>
                Your password cannot end with a special character.
            </p>

            <a href="/register">
                Go back to Register
            </a>

        `);

    }


    // ==========================================
    // PASSWORD NEEDS CAPITAL LETTER
    // ==========================================

    if (!/[A-Z]/.test(password)) {

        return res.send(`

            <h2>Registration Error</h2>

            <p>
                Your password needs at least one capital letter.
            </p>

            <a href="/register">
                Go back to Register
            </a>

        `);

    }


    // ==========================================
    // PASSWORD NEEDS NUMBER
    // ==========================================

    if (!/[0-9]/.test(password)) {

        return res.send(`

            <h2>Registration Error</h2>

            <p>
                Your password needs at least one number.
            </p>

            <a href="/register">
                Go back to Register
            </a>

        `);

    }


    // ==========================================
    // PASSWORD NEEDS SPECIAL CHARACTER
    // ==========================================

    if (!/[^a-zA-Z0-9\s]/.test(password)) {

        return res.send(`

            <h2>Registration Error</h2>

            <p>
                Your password needs at least one special character.
            </p>

            <a href="/register">
                Go back to Register
            </a>

        `);

    }


    // ==========================================
    // CHECK IF USERNAME ALREADY EXISTS
    // ==========================================

    db.query(
        "SELECT * FROM Users WHERE Username = ?",
        [username],
        (err, results) => {

            if (err) {

                console.log(err);

                return res.send("Database error.");

            }


            if (results.length > 0) {

                return res.send(`

                    <h2>Registration Error</h2>

                    <p style="color:red;">
                        This username already exists.
                    </p>

                    <a href="/register">
                        Go back to Register
                    </a>

                `);

            }


            // ==========================================
            // HASH PASSWORD
            // ==========================================

            bcrypt.hash(
                password,
                10,
                (err, hashedPassword) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            "Error securing password."
                        );

                    }


                    // ==========================================
                    // SAVE USER
                    // ==========================================

                    const sql =
                        "INSERT INTO Users (Username, Password) VALUES (?, ?)";


                    db.query(
                        sql,
                        [username, hashedPassword],
                        (err, result) => {

                            if (err) {

                                console.log(err);

                                return res.send(
                                    "Error registering user."
                                );

                            }


                            res.send(`

                                <h2>Registration successful!</h2>

                                <p>
                                    Your account has been created.
                                </p>

                                <a href="/login">
                                    Go to Login
                                </a>

                            `);

                        }

                    );

                }

            );

        }

    );

});


// ==========================================
// LOGIN PAGE
// ==========================================

app.get("/login", (req, res) => {

    res.sendFile(__dirname + "/login.html");

});


// ==========================================
// LOGIN USER
// ==========================================

app.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;


    // ==========================================
    // FIND USER BY USERNAME
    // ==========================================

    const sql =
        "SELECT * FROM Users WHERE Username = ?";


    db.query(
        sql,
        [username],
        (err, results) => {

            if (err) {

                console.log(err);

                return res.send(
                    "Database error."
                );

            }


            // ==========================================
            // USER DOES NOT EXIST
            // ==========================================

            if (results.length === 0) {

                return res.send(`

                    <h2>Login Failed</h2>

                    <p style="color:red;">
                        Username or password is incorrect.
                    </p>

                    <a href="/login">
                        Go back to Login
                    </a>

                `);

            }


            const user = results[0];


            // ==========================================
            // CHECK PASSWORD
            // ==========================================

            bcrypt.compare(
                password,
                user.Password,
                (err, passwordMatches) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            "Error checking password."
                        );

                    }


                    // ==========================================
                    // WRONG PASSWORD
                    // ==========================================

                    if (!passwordMatches) {

                        return res.send(`

                            <h2>Login Failed</h2>

                            <p style="color:red;">
                                Username or password is incorrect.
                            </p>

                            <a href="/login">
                                Go back to Login
                            </a>

                        `);

                    }


                    // ==========================================
                    // LOGIN SUCCESSFUL
                    // ==========================================

                    req.session.username = username;


                    console.log("LOGIN SUCCESSFUL");
                    console.log(
                        "Username saved in session:",
                        req.session.username
                    );


                    // ==========================================
                    // CHECK PROFILE
                    // ==========================================

                    db.query(
                        "SELECT * FROM UserProfiles WHERE Username = ?",
                        [username],
                        (err, profileResults) => {

                            if (err) {

                                console.log(err);

                                return res.send(
                                    "Database error."
                                );

                            }


                            // ==========================================
                            // NEW USER
                            // ==========================================

                            if (profileResults.length === 0) {

                                return res.redirect("/profile");

                            }


                            // ==========================================
                            // EXISTING USER
                            // ==========================================

                            res.redirect("/");

                        }

                    );

                }

            );

        }

    );

});


// ==========================================
// PROFILE PAGE
// ==========================================

app.get("/profile", (req, res) => {

    if (!req.session.username) {

        return res.redirect("/login");

    }


    res.sendFile(__dirname + "/profile.html");

});


// ==========================================
// SAVE PROFILE + INVESTMENTS
// ==========================================

app.post("/profile", (req, res) => {

    console.log("========== PROFILE SAVE ==========");
    console.log("Session username:", req.session.username);
    console.log("Form data:", req.body);


    // ==========================================
    // MAKE SURE USER IS LOGGED IN
    // ==========================================

    if (!req.session.username) {

        console.log("ERROR: No session username!");

        return res.status(401).send(`

            <h2>You are not logged in</h2>

            <p>
                Your login session disappeared before
                the information could be saved.
            </p>

            <a href="/login">
                Go back to Login
            </a>

        `);

    }


    const username = req.session.username;
    const name = req.body.name;


    let stocks = req.body.stock || [];
    let amounts = req.body.amount || [];
    let types = req.body.type || [];


    // ==========================================
    // MAKE SURE EVERYTHING IS AN ARRAY
    // ==========================================

    if (!Array.isArray(stocks)) {

        stocks = [stocks];

    }


    if (!Array.isArray(amounts)) {

        amounts = [amounts];

    }


    if (!Array.isArray(types)) {

        types = [types];

    }


    console.log("Username:", username);
    console.log("Name:", name);
    console.log("Stocks:", stocks);
    console.log("Amounts:", amounts);
    console.log("Types:", types);


    // ==========================================
    // CHECK NAME
    // ==========================================

    if (!name || name.trim() === "") {

        return res.send(`

            <h2>Something went wrong</h2>

            <p>
                Please enter your name.
            </p>

            <a href="/profile">
                Go back
            </a>

        `);

    }


    // ==========================================
    // SAVE USER PROFILE
    // ==========================================

    const profileSQL = `

        INSERT INTO UserProfiles
        (Username, Name)

        VALUES (?, ?)

        ON DUPLICATE KEY UPDATE
        Name = ?

    `;


    db.query(
        profileSQL,
        [username, name.trim(), name.trim()],
        (err) => {

            if (err) {

                console.log(
                    "PROFILE DATABASE ERROR:",
                    err
                );

                return res.status(500).send(`

                    <h2>Error saving your profile</h2>

                    <p>
                        ${err.message}
                    </p>

                    <a href="/profile">
                        Go back
                    </a>

                `);

            }


            console.log("Profile saved successfully!");


            // ==========================================
            // DELETE OLD INVESTMENTS
            // ==========================================

            db.query(
                "DELETE FROM Investments WHERE Username = ?",
                [username],
                (err) => {

                    if (err) {

                        console.log(
                            "DELETE INVESTMENTS ERROR:",
                            err
                        );

                        return res.status(500).send(`

                            <h2>Error updating investments</h2>

                            <p>
                                ${err.message}
                            </p>

                            <a href="/profile">
                                Go back
                            </a>

                        `);

                    }


                    console.log(
                        "Old investments deleted."
                    );


                    // ==========================================
                    // CREATE VALID INVESTMENTS
                    // ==========================================

                    const investments = [];


                    for (
                        let i = 0;
                        i < stocks.length;
                        i++
                    ) {

                        const stock = stocks[i];
                        const amount = amounts[i];
                        const type = types[i];


                        // Skip empty rows
                        if (
                            !stock ||
                            stock.trim() === "" ||
                            amount === undefined ||
                            amount === "" ||
                            !type
                        ) {

                            continue;

                        }


                        investments.push([
                            username,
                            stock.trim(),
                            Number(amount),
                            type
                        ]);

                    }


                    console.log(
                        "Investments to save:",
                        investments
                    );


                    // ==========================================
                    // NO INVESTMENTS
                    // ==========================================

                    if (investments.length === 0) {

                        console.log(
                            "No investments entered."
                        );

                        return res.redirect("/");

                    }


                    // ==========================================
                    // SAVE INVESTMENTS
                    // ==========================================

                    const investmentSQL = `

                        INSERT INTO Investments
                        (Username, Stock, Amount, Type)

                        VALUES ?

                    `;


                    db.query(
                        investmentSQL,
                        [investments],
                        (err, result) => {

                            if (err) {

                                console.log(
                                    "INVESTMENT DATABASE ERROR:",
                                    err
                                );

                                return res.status(500).send(`

                                    <h2>
                                        Error saving investments
                                    </h2>

                                    <p>
                                        ${err.message}
                                    </p>

                                    <p>
                                        Check your VS Code
                                        terminal for the full error.
                                    </p>

                                    <a href="/profile">
                                        Go back
                                    </a>

                                `);

                            }


                            console.log(
                                "Investments saved:",
                                result.affectedRows
                            );

                            console.log(
                                "========== SAVE COMPLETE =========="
                            );


                            // ==========================================
                            // GO TO HOME PAGE
                            // ==========================================

                            res.redirect("/");

                        }

                    );

                }

            );

        }

    );

});


// ==========================================
// LOGOUT
// ==========================================

app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            console.log(
                "Logout error:",
                err
            );

        }

        res.redirect("/");

    });

});


// ==========================================
// OTHER WEBSITE PAGES
// ==========================================

app.get("/etfs", (req, res) => {

    res.sendFile(
        __dirname + "/etfs.html"
    );

});


app.get("/compare", (req, res) => {

    res.sendFile(
        __dirname + "/compare.html"
    );

});


app.get("/diversification", (req, res) => {

    res.sendFile(
        __dirname + "/diversification.html"
    );

});


app.get("/investing", (req, res) => {

    res.sendFile(
        __dirname + "/investing.html"
    );

});


app.get("/etf-chart", (req, res) => {

    res.sendFile(
        __dirname + "/etf-chart.html"
    );

});


// ==========================================
// START SERVER
// ==========================================

app.listen(3000, () => {

    console.log(
        "Server running on http://localhost:3000"
    );

});