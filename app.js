// Database setup
var database = firebase.database();
var storageRef = firebase.storage().ref();

var attach, fileUpload, messages, msgPos, msgVals, txtElt, img_selected, cancelledUpload, choosingFile;

// Connection indicators
var noConnectionTimer = 0;
var connectingPAdded = false;
var connectingP = document.createElement("p");
connectingP.innerText = "Connecting to database...";
var loading_show = false;
var choosingFile = false;
var fileAboutToUploadState = false;
var documentAdjusted = false;
var chatModeOn = false;

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
        database.ref("messages").get().then((data) => {
            if (data.exists()) {
                var messages = 0;
                for (const i in data.val()) {
                    messages += 1;
                }
                console.log(messages);
                uploadMessage(messages + 1);
            }
            else uploadMessage(1);
        });

    });
};

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

var openChatBtn = document.getElementById("open-chat");
openChatBtn.hidden = true;
openChatBtn.onclick = function () {
    openChatBtn.hidden = true;
    uploadLocallyBtn.hidden = true;
    fileUpload.hidden = true;
    filePath.hidden = true;
    uploadToDatabaseBtn.hidden = true;
    uploadedImgElts.hidden = true;
    chatModeOn = true;
    loading_show = true;
    connectingP.innerText = "Loading chat..";
    if (!connectingPAdded) {
        document.body.appendChild(connectingP);
        connectingPAdded = true;
    }
    database.ref("messages").get().then((data) => {
        for (const j in data.val()) {
            const msg = data.val()[j];
            message = document.createElement("a");
            message.href = msg.fileURL;
            if (msg.fileName.length > 15) fileName = msg.fileName.slice(0, 15) + " ...";
            else fileName = msg.fileName;
            message.innerText = "Open file: " + fileName;
            message.target = "_blank";
            document.body.appendChild(message);
            message.className = "msg";
            document.body.appendChild(document.createElement("br"));
            document.body.appendChild(document.createElement("br"));
        }
        loading_show = false;
        document.body.removeChild(connectingP);
    });
}

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
        if (!chatModeOn) {
            uploadLocallyBtn.hidden = true;
            uploadedImgElts.hidden = false;
        }
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
                if (!chatModeOn) {
                    if (!fileAboutToUploadState) {
                        uploadLocallyBtn.hidden = false;
                        openChatBtn.hidden = false;
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
                if (!documentAdjusted) {
                    document.body.style.transition = "1s";
                    document.body.style.transform = "scale(.5)";
                    setTimeout(function () {
                        document.body.style.transform = "scale(1)";
                        documentAdjusted = true;
                    }, 1000);
                }
            }
            else {
                uploadLocallyBtn.hidden = true;
                fileUpload.hidden = true;
                filePath.hidden = true;
                uploadToDatabaseBtn.hidden = true;
                uploadedImgElts.hidden = true;
                openChatBtn.hidden = true;
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