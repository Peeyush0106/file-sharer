// Database setup
var database = firebase.database();
var storageRef = firebase.storage().ref();
var auth = firebase.auth();
var loading_show = false;
var connectingPAdded = false;
var connectingP = document.createElement("p");
connectingP.innerText = "Connecting to database...";
var loading_show = false;
var noConnectionTimer = 0;

function randomNo(min, max) { return Math.round(Math.random() * (max - min)); }

checkConnection();
function checkConnection() {
    setTimeout(function () {
        // Check if we are connected to the internet or not.
        var connectedRef = firebase.database().ref(".info/connected");
        connectedRef.on("value", function (snap) {
            connected = snap.val();
            if (connected) {
                noConnectionTimer = 0;
                loading_show = false;
                if (connectingPAdded) {
                    document.body.removeChild(connectingP);
                    connectingPAdded = false;
                }
            }
            else {
                if (noConnectionTimer >= 10) {
                    connectingP.innerHTML = "You have very low or no internet connection. Please check your internet speed. If this does not help, try refreshing the page or contacting the owner, <div style='color: red; background-color: blue;'> Peeyush </div>";
                    loading_show = false;
                    connectingP.style["background-color"] = "orange";
                    connectingP.style.color = "black";
                    connectingP.style.fontSize = "30px";
                    connectingP.style.textAlign = "center";
                }
                else {
                    noConnectionTimer += 1;
                    loading_show = true;
                    if (!connectingPAdded) {
                        document.body.appendChild(connectingP);
                        connectingPAdded = true;
                    }
                }
            }
        });
        checkConnection();
    }, 2000);
}

document.getElementById("initial-form").addEventListener("submit", (e) => {
    e.preventDefault();

    userName = document.getElementById("inpt-name").value;
    email = document.getElementById("inpt-eml").value;
    pwd = document.getElementById("inpt-pwd").value;

    if (auth.currentUser) login = false;
    if (validateEmail(email)[0] === email && pwd !== "") {
        if (!auth.currentUser) {
            if (userName && !login) {
                auth.createUserWithEmailAndPassword(email, pwd).then((data) => {
                    database.ref("Users/" + auth.currentUser.uid).update({
                        name: userName
                    }).then(() => {
                        location.href = "../signed-in"
                    });
                });
            }
            if (login) {
                auth.signInWithEmailAndPassword(email, pwd).then(() => {
                    location.href = "../signed-in";
                    console.log("Success!");
                });
            }
        }
        if (!userName && !login && !signedIn) alert("Please enter a valid name.");
    }
    else if (!auth.currentUser) alert("Invalid email or password.");
    console.log(auth.currentUser);
});

function loginUser() {
    login = true;
    cancelBtnPressed = false;

    document.getElementById("initial-form").hidden = false;
    document.getElementById("start-form-your-name").style.display = "none";

    // Hiding the Login and Sign up button
    document.getElementById("login").style.display = "none";
    document.getElementById("login").hidden = true;
    document.getElementById("signup").style.display = "none";
    document.getElementById("signup").hidden = true;
}

function signupUser() {
    login = false;
    cancelBtnPressed = false;

    document.getElementById("initial-form").hidden = false;
    document.getElementById("start-form-your-name").style.display = "flex";

    // Hiding the Login and Sign up button
    document.getElementById("login").style.display = "none";
    document.getElementById("login").hidden = true;
    document.getElementById("signup").style.display = "none";
    document.getElementById("signup").hidden = true;
}

function cancelLoginOrSignup() {
    login = false;
    cancelBtnPressed = true;

    document.getElementById("initial-form").hidden = true;
    document.getElementById("start-form-your-name").style.display = "none";

    // Showing the Login and Sign up button
    document.getElementById("login").style.display = "block";
    document.getElementById("login").hidden = true;
    document.getElementById("signup").style.display = "block";
    document.getElementById("signup").hidden = true;
}

function validateEmail(email) {
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return (email.match(validRegex))
}