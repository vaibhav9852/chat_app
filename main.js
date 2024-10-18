

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
document.querySelector('#show-login').onclick = () => {
    document.querySelector('#signup-form').style.display = 'none';
    document.querySelector('#login-form').style.display = 'block';
};

// Show signup form
document.querySelector('#show-signup').onclick = () => {
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
loginButton.onclick = async () => {
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

// Load users
// async function loadUsers() {
//     const response = await fetch(`https://chat-6d1a8-default-rtdb.firebaseio.com/myuser.json`);
//     const users = await response.json();
//     userList.innerHTML = "";
//     if (response.ok) {
//         for (const userId in users) {
//             if (users[userId].uid !== currentUserId) {
//                 const li = document.createElement("li");
//                 li.textContent = users[userId].uname;
//                 li.onclick = () => selectUser(users[userId].uid);
//                 userList.appendChild(li);
//             }
//         }
//     }
// }

async function loadUsers(){
    try{
    const response = await fetch(`${URL_DB}/myuser.json`);
    const users = await response.json();
    userList.innerHTML = ""; 
     if(response.ok){
    for (const userId in users) {
        if (users[userId].uid != currentUserId) {
          
            const li = document.createElement("li");
            const img = document.createElement("img")
            img.src=`https://www.svgrepo.com/show/43426/profile.svg`
            img.alt = 'Img'
            li.appendChild(img)
            li.classList.add("user");
            li.appendChild(document.createTextNode(`${users[userId].uname}`));
           selectedUserName =  users[userId].uname;
           console.log('loadUser selectedUserName--',selectedUserName)
            li.onclick = () => selectUser(users[userId].uid); // update userId to users[userId].uid
            userList.appendChild(li);
            console.log('if block not match',users[userId].uid != currentUserId)
            console.log('if block not match',users[userId].uid , currentUserId)
        }else{
          console.log('else block not match users[userId].uid , currentUserId, users[userId].uname',users[userId].uid , currentUserId, users[userId].uname)
          currentUserName = users[userId].uname;
        }
    }
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
    console.log('selectUser selectedUserId',selectedUserId)
    messagesDiv.innerHTML = "";
    loadMessages();
}

// Load messages
function loadMessages() {
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("timestamp")); // orderBy("timestamp")

    onSnapshot(q, (snapshot) => {
        messagesDiv.innerHTML = "";
        snapshot.forEach((doc) => {
            const message = doc.data();
            console.log('message',  message.participants.includes(`${currentUserId}-${currentUserName}`) ,
            message.participants.includes(`${selectedUserId}-${selectedUserName}`) , `${currentUserId}-${currentUserName}` , `${selectedUserId}-${selectedUserName}`)
            if (
                message.participants.includes(`${currentUserId}-${currentUserName}`) &&
                message.participants.includes(`${selectedUserId}-${selectedUserName}`)
            ) {
                const messageElement = document.createElement("div");
                const senderElement = document.createElement("div");
                senderElement.textContent = message.sender.split('-')[1];
                messageElement.textContent = message.text;

                messagesDiv.appendChild(senderElement);
                messagesDiv.appendChild(messageElement);
            }

            console.log('message in snap',message)
        });
    });
}

// Send message
sendButton.addEventListener("click", async () => {
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








