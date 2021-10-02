// Database setup
var database = firebase.database();
var storageRef = firebase.storage().ref();

var attach, fileUpload, messages, msgPos, msgVals, txtElt, img_selected, cancelledUpload, choosingFile;
// Connection indicators
var noConnectionTimer = 0;
var shownHelloGif = false;
var msgInQueue = [];
var connectingPAdded = false;
var connectingP = document.createElement("p");
connectingP.innerText = "Connecting to database...";
var loading_show = false;
var choosingFile = false;
var fileAboutToUploadState = false;
var allMessages = "initialization";
var directHelloShow = true;

cancelledUpload = false;

fileUpload = document.getElementById("file-upload");
filePath = document.getElementById("spnFilePath");

uploadLocallyBtn = document.getElementById("btnFileUpload");
uploadLocallyBtn.hidden = true;
uploadLocallyBtn.onclick = function () {
    fileUpload.click(); cancelledUpload = false; choosingFile = true;
};

uploadToDatabaseBtn = document.getElementById("upload-btn");
uploadToDatabaseBtn.onclick = function () {
    loading_show = true;
    fileRef = storageRef.child(fileUpload.files[0].name);
    fileRef.put(fileUpload.files[0]).then(() => {
        getNoOfMessages(function (noOfMsg) {
            if (noOfMsg === 0) uploadMessage(1);
            else uploadMessage(messages + 1);
        });
    });
};

function getNoOfMessages(functionToCall) {
    database.ref("messages").get().then((data) => {
        var messages = 0;
        if (data.exists()) for (const i in data.val()) messages += 1;
        functionToCall(messages);
    });
}

function uploadMessage(msgNo) {
    storageRef.child(fileUpload.files[0].name).getDownloadURL().then(url => {
        database.ref("messages/" + msgNo).update({
            fileURL: url,
            fileName: fileUpload.files[0].name
        }).then(() => {
            loading_show = false;
            var succesDiv = document.createElement("div");
            succesDiv.innerHTML = `
                <br><br>
                <div class="alert" style="font-size: 30px;">
                    <span class="closebtn"  style="font-size: 30px;" onclick="this.parentElement.style.display='none';">&times;</span>
                    File uploaded successfully
                </div>
            `;
            document.body.appendChild(succesDiv);
        });
    });
}

uploadedImgElts = document.getElementById("uploaded-img-elts");
document.getElementById("cncl-btn").onclick = function () {
    uploadedImgElts.hidden = true;
    btnFileUpload.src = "attachment.png";
    filePath.innerHTML = "";
    uploadLocallyBtn.hidden = false;
    document.getElementById("uploaded-img").src = "";
    document.getElementById("uploaded-img").alt = "";
    document.getElementById("file-upload-form").reset();
    cancelledUpload = true;
    fileAboutToUploadState = false;
};

setInterval(refreshMsgSet, 1000);

function showChat(directLoad, addedMsg, msgNo) {
    if (!directLoad) {
        loading_show = true;
        connectingP.innerText = "Loading chat..";
        if (!connectingPAdded) {
            document.body.appendChild(connectingP);
            connectingPAdded = true;
        }
        database.ref("messages").get().then((data) => {
            for (const j in data.val()) {
                const msg = data.val()[j];
                if (msg.fileURL && msg.fileName) {
                    message = document.createElement("a");
                    message.href = msg.fileURL;
                    if (msg.fileName.length > 15) fileName = msg.fileName.slice(0, 15) + " ...";
                    else fileName = msg.fileName;
                    message.innerText = "Open file: " + fileName;
                    message.target = "_blank";
                    document.getElementById("messages").appendChild(message);
                    message.className = "msg";
                }
                else if (msg.msg) {
                    message = document.createElement("p");
                    message.innerText = msg.msg;
                    document.getElementById("messages").appendChild(message);
                    message.className = "msg";
                }
                for (let k = 0; k < 2; k++) document.body.appendChild(document.createElement("br"));
            }

            loading_show = false;
            if (connectingPAdded) {
                document.body.removeChild(connectingP);
                connectingPAdded = false;
            }
        });
    }
    else {
        msgInQueue.push(addedMsg);
        document.getElementById("msg-box").value = "";
        database.ref("messages/" + msgNo).update({ msg: addedMsg });

        var msgData, message;
        message = document.createElement("p");
        message.innerText = "sending message..";
        document.getElementById("messages").appendChild(message);
        message.id = "message-" + msgNo;
        message.className = "msg";

        database.ref("messages").get().then((data) => {
            document.getElementById("messages").innerHTML = "";
            msgData = data.val();
            msgData[msgNo].msg = addedMsg
            for (const j in msgData) {
                const msg = msgData[j];
                if (msg.fileURL && msg.fileName) {
                    message = document.createElement("a");
                    message.href = msg.fileURL;
                    if (msg.fileName.length > 15) fileName = msg.fileName.slice(0, 15) + " ...";
                    else fileName = msg.fileName;
                    message.innerText = "Open file: " + fileName;
                    message.target = "_blank";
                    document.getElementById("messages").appendChild(message);
                    message.className = "msg";
                }
                else if (msg.msg) {
                    message = document.createElement("p");
                    message.innerText = msg.msg;
                    document.getElementById("messages").appendChild(message);
                    message.className = "msg";
                }
                for (let k = 0; k < 2; k++) document.body.appendChild(document.createElement("br"));
            }
            msgInQueue_temp = msgInQueue;
            console.log(msgInQueue);
            for (var i = 1; i < msgInQueue_temp.length + 1; i++) {
                msgInQueue = [];
                console.log(msgInQueue);
                msgInQueue[i - 1] = msgInQueue_temp[i];
                // request successful
                if (msgInQueue[i - 1] === undefined) msgInQueue[i - 1] = "";
            }
            console.log(msgInQueue);
        });
    }
}

function refreshMsgSet() {
    database.ref("messages").get().then((data) => {
        if (JSON.stringify(allMessages) !== JSON.stringify(data.val())) {
            if (allMessages !== "initialization" && JSON.stringify(allMessages) !== null && data.val() === null) location.reload();
            allMessages = data.val();
            document.getElementById("messages").innerHTML = "";
            msgData = data.val();
            for (const j in msgData) {
                const msg = msgData[j];
                if (msg.fileURL && msg.fileName) {
                    message = document.createElement("a");
                    message.href = msg.fileURL;
                    if (msg.fileName.length > 15) fileName = msg.fileName.slice(0, 15) + " ...";
                    else fileName = msg.fileName;
                    message.innerText = "Open file: " + fileName;
                    message.target = "_blank";
                    document.getElementById("messages").appendChild(message);
                    message.className = "msg";
                    for (let k = 0; k < 2; k++) document.body.appendChild(document.createElement("br"));
                }
                else if (msg.msg) {
                    message = document.createElement("p");
                    message.innerText = msg.msg;
                    document.getElementById("messages").appendChild(message);
                    message.className = "msg";
                    for (let k = 0; k < 2; k++) document.body.appendChild(document.createElement("br"));
                }
            }
        }
        if (!data.exists()) {
            setInterval(showHelloGif, 1000);
        }
    });
}

function showHelloGif() {
    database.ref("messages").get().then((data) => {
        if (!data.exists() && !document.getElementById("no-msg-info")) {
            console.log("gif");
            var randomHelloGifNumber = randomNo(0, 3);
            var allHelloGifs = ["hello.gif", "hello-2.gif", "hello-3.webp", "hello-4.gif"];
            no_message_info = document.createElement("p");
            no_message_info.innerHTML = `
                    no messages yet.. <br>
                    Start chatiting by saying <br> <button onclick="sendHello();" id="helloBtn"> Hello </button> <br><br>
                    <img src=` + allHelloGifs[randomHelloGifNumber] + ` id="hello-gif" width=200 />
                `;
            no_message_info.id = "no-msg-info";
            document.body.appendChild(no_message_info);
        }
    });
}

function randomNo(min, max) { return Math.round(Math.random() * (max - min)); }

fileUpload.onchange = function () {
    if (fileUpload.files[0] && !cancelledUpload && choosingFile) {
        fileAboutToUploadState = true;
        var fileName = fileUpload.value.split('\\')[fileUpload.value.split('\\').length - 1];
        filePath.innerHTML = "<b> Selected File: </b>" + fileName;

        // showing an image if it is an image
        if (fileUpload.files[0].type.slice(0, 5) === "image") {
            document.getElementById("uploaded-img-txt-img").hidden = false;
            document.getElementById("uploaded-img").src = URL.createObjectURL(fileUpload.files[0]);
            document.getElementById("uploaded-img").alt = fileName;
        }
        uploadLocallyBtn.hidden = true;
        uploadedImgElts.hidden = false;
    }
}

document.getElementById("uploaded-img").onload = function () {
    if (document.getElementById("uploaded-img").width < 100) document.getElementById("uploaded-img").width = 100;
    if (document.getElementById("uploaded-img").width > window.screen.availWidth) document.getElementById("uploaded-img").width = window.screen.availWidth - 100;
};

checkConnection();
function checkConnection() {
    setTimeout(function () {
        // Check if we are connected to the internet or not.
        var connectedRef = firebase.database().ref(".info/connected");
        connectedRef.on("value", function (snap) {
            connected = snap.val();
            if (connected) {
                noConnectionTimer = 0;
                if (!fileAboutToUploadState) {
                    uploadLocallyBtn.hidden = false;
                }
                loading_show = false;
                if (connectingPAdded) {
                    document.body.removeChild(connectingP);
                    connectingPAdded = false;
                }
                if (fileAboutToUploadState) {
                    fileUpload.hidden = false;
                    filePath.hidden = false;
                    uploadToDatabaseBtn.hidden = false;
                    uploadedImgElts.hidden = false;
                    document.getElementById("cncl-btn").hidden = false;
                }
            }
            else {
                uploadLocallyBtn.hidden = true;
                fileUpload.hidden = true;
                filePath.hidden = true;
                uploadToDatabaseBtn.hidden = true;
                uploadedImgElts.hidden = true;
                document.getElementById("cncl-btn").hidden = true;

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

function sendMessageWhenPressedEnter(event) {
    if ((event.keyCode === 13 && !event.shiftKey && document.getElementById("msg-box").value !== "")) {
        event.preventDefault();
        console.log("msg sent");
        getNoOfMessages(function (noOfMsg) {
            msgNo = noOfMsg + 1;
            showChat(true, document.getElementById("msg-box").value, msgNo);
        });
        document.getElementById("no-msg-info").innerHTML = "";
    }
}

function sendHello() {
    console.log("helloSent");
    no_message_info.innerHTML = "";
    showChat(true, "hello", 1);
}