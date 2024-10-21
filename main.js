

// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Your web app's Firebase configuration

const URL_SIGNUP = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`
const URL_SIGNIN = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`
const URL_DB = `https://chat-6d1a8-default-rtdb.firebaseio.com`

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore and Auth
const auth = getAuth();
const db = getFirestore();

let currentUserId = null;
let selectedUserId = null;
let currentUserName = null;
let selectedUserName = null;
let showLast24Hours = false;

// Elements for signup and login
const signupName = document.querySelector('#signup-name');
const signupEmail = document.querySelector('#signup-email');
const signupPassword = document.querySelector('#signup-password');
const signupButton = document.querySelector('#signup');

const loginUsername = document.querySelector('#login-username');
const loginUserPassword = document.querySelector('#login-password');
const loginButton = document.querySelector('#login');

const messagesDiv = document.querySelector('#messages');
const messageInput = document.querySelector('#message');
const sendButton = document.querySelector('#send');
const userList = document.querySelector('#user-list');

// Show login form
document.querySelector('#show-login').onclick = (event) => {
  event.preventDefault()
    document.querySelector('#signup-form').style.display = 'none';
    document.querySelector('#login-form').style.display = 'block';
};

// Show signup form
document.querySelector('#show-signup').onclick = (event) => {
  event.preventDefault()
    document.querySelector('#signup-form').style.display = 'block';
    document.querySelector('#login-form').style.display = 'none';
};

// Signup with Firebase
signupButton.onclick = async (event) => {
    event.preventDefault();
    let userName = signupName.value;
    let userEmail = signupEmail.value;
    let password = signupPassword.value;

    try {
        let response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`, {
            method: 'POST',
            body: JSON.stringify({ name: userName, email: userEmail, password: password, returnSecureToken: true }),
            headers: { 'Content-Type': 'application/json' }
        });

        let data = await response.json();
        if (data.idToken) {
            alert('Signup successful');
            await addDoc(collection(db, "users"), {
                uname: userName,
                uid: data.localId
            });
            currentUserId = data.localId;
            console.log(' currentUserId..', currentUserId)
            document.querySelector('#login-form').style.display = 'block';
            document.querySelector('#signup-form').style.display = 'none';
        } else {
            alert('Signup failed: ' + data.error.message);
        }
    } catch (err) {
        console.error('Signup failed', err);
    }
};

// Login with Firebase
loginButton.onclick = async (event) => {
  event.preventDefault();
    let userEmail = loginUsername.value;
    let userPassword = loginUserPassword.value;

    try {
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, password: userPassword })
        });

        const data = await response.json();
        if (!response.ok) {
            alert('Signin failed: ' + data.error.message);
        } else {
            alert('Signin successful!');
            currentUserId = data.localId;
            console.log('login  currentUserId', currentUserId)
            document.querySelector('#auth-container').style.display = 'none';
            document.querySelector('#chat-container').style.display = 'flex';
            loadUsers();
        }
    } catch (error) {
        console.error('Signin error', error);
    }
};


async function loadUsers(){
    try{
    const response = await fetch(`${URL_DB}/myuser.json`);
    const users = await response.json();
    userList.innerHTML = ""; 
     if(response.ok){
    //for (const userId in users) 
    Object.keys(users).map((userId) =>  {
        if (users[userId].uid != currentUserId) {
          
            const li = document.createElement("li");
            const img = document.createElement("img")
            img.src=`https://www.svgrepo.com/show/43426/profile.svg`
            img.alt = 'Img'
            li.appendChild(img)
            li.classList.add("user");
            li.appendChild(document.createTextNode(`${users[userId].uname}`));
           selectedUserName =  users[userId].uname;
           console.log('loadUser selectedUserName',selectedUserName)
            li.onclick = () => selectUser(users[userId].uid); // update userId to users[userId].uid
            userList.appendChild(li);
            // console.log('if block not match',users[userId].uid != currentUserId)
            // console.log('if block not match',users[userId].uid , currentUserId)
        }else{
         // console.log('else block not match users[userId].uid , currentUserId, users[userId].uname',users[userId].uid , currentUserId, users[userId].uname)
          currentUserName = users[userId].uname;
        }
    })
  }else{
    throw new Error('Error while load user')
  }
  }catch(error){
    console.log('user load error',error)
  }
  }

// Select user to chat
function selectUser(userId) {
    selectedUserId = userId;
   // console.log('selectUser selectedUserId',selectedUserId)
    messagesDiv.innerHTML = "";
    loadMessages();
}


// Load messages
function loadMessages() {
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("timestamp")); // orderBy("timestamp")
     
    onSnapshot(q, (snapshot) => {
      alert('load')
        messagesDiv.innerHTML = ""; 
        snapshot.forEach((doc) => {
        
        //  console.log('d11',doc._document.data.value.mapValue.fields.timestamp.timestampValue)
        
          
       //   console.log('TimeValue',doc._document.data.value.mapValue.fields.timestamp.timestampValu)

            const message = doc.data();
            let messageTimeStamp = message.timestamp.seconds * 1000 // convert to mili second 
            let isLast24Hours = Date.now() - messageTimeStamp <= 24 * 60 * 60 * 1000;
             console.log('message----', message )
             console.log('messageTimeStamp',messageTimeStamp, Date.now())
             console.log('isLast24Hours',isLast24Hours)
             console.log('showLast24Hours',showLast24Hours)
             console.log('!showLast24Hours || isLast24Hours',!showLast24Hours , isLast24Hours , !showLast24Hours || isLast24Hours)
    
            if (
                message.participants.includes(`${currentUserId}-${currentUserName}`) &&
                message.participants.includes(`${selectedUserId}-${selectedUserName}`) &&  (!showLast24Hours || isLast24Hours)  
            ){
                const messageElement = document.createElement("div");
                const senderElement = document.createElement("div");
                messageElement.setAttribute('class','user-message')
                senderElement.setAttribute('class','sender-name')
                senderElement.textContent = message.sender.split('-')[1];
                messageElement.textContent = message.text;

                messagesDiv.appendChild(senderElement);
                messagesDiv.appendChild(messageElement);

                console.log('if block message---',message)
            }
        });
    }); 
}

// Send message
sendButton.addEventListener("click", async (event) => {
  event.preventDefault();
    const messageText = messageInput.value;
    
    if (messageText && selectedUserId) {
      console.log('sendButton, `${currentUserId}-${currentUserName}`, `${selectedUserId}-${selectedUserName}`',`${currentUserId}-${currentUserName}`, `${selectedUserId}-${selectedUserName}`)
        await addDoc(collection(db, "messages"), {
            text: messageText,
            sender: `${currentUserId}-${currentUserName}`,
            participants: [`${currentUserId}-${currentUserName}`, `${selectedUserId}-${selectedUserName}`],
            timestamp: new Date()
        });
        messageInput.value = ""; // Clear the input field  
    }
}); 

// last24hours

document.querySelector('#last-24').onclick = async (event) =>{
    event.preventDefault();
    showLast24Hours = !showLast24Hours
    //alert(showLast24Hours)
    loadMessages();
}







 







