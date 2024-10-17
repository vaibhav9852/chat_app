


let currentUserId = null;
let selectedUserId = null;
let currentUserName = null;
let selectedUserName = null;

const paaswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/; 
const emailRegex =  /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/; 

// signup 
 let singupName = document.querySelector('#signup-name')
 let singupEmail = document.querySelector('#signup-email')
 let signupPassword = document.querySelector('#signup-password')
 let singupButton = document.querySelector('#signup')

// login 
let loginUsername = document.querySelector('#login-username')
let loginUserPassword = document.querySelector('#login-password')
let loginButton = document.querySelector('#login')

// message
 const chatContainer = document.getElementById("chat-container");
let messagesDiv = document.querySelector('#messages')
let  messageInput = document.querySelector('#message')
let sendButton = document.querySelector('#send')
const userList = document.querySelector('#user-list')



// show login form 
  document.querySelector('#show-login').onclick = () =>{
  document.querySelector('#signup-form').style.display = 'none'
  document.querySelector('#login-form').style.display = 'block'
}

// show signup form 
document.querySelector('#show-signup').onclick = () =>{
  document.querySelector('#signup-form').style.display = 'block'
  document.querySelector('#login-form').style.display = 'none'
}

// singup with firebase
singupButton.onclick = async (event) =>{
  event.preventDefault();

   let userName = singupName.value
   let userEmail = singupEmail.value
   let password =  signupPassword.value
   let nameErr = ''
   let passwordErr = ''
   let emailErr = ''
   

   if(!userName.trim().length){
    nameErr = 'please give user name'
   } else if(userName.trim().length < 4){
       nameErr = 'user name minimum length should be 4'
   }else if(!userEmail.trim().length){
    emailErr = 'please provide email'
 }else if(!emailRegex.test(userEmail)){
      emailErr = 'Unvalid email'
 }
   else if(!password.trim().length){
     passwordErr = 'please give user password'
   }else if(password.trim().length < 6){
    passwordErr = 'password minimum length should be 6'
  }else if(!paaswordRegex.test(password)){
    passwordErr = 'Passwords must contain:lower letter,upper letter,1 numeric character,1 special character'

  }
     if(nameErr){
      document.querySelector('#signup-name-err').appendChild(document.createTextNode(`${nameErr}`))
     }
     if(emailErr){
      document.querySelector('#signup-mail-err').appendChild(document.createTextNode(`${emailErr}`))
     }
     if(passwordErr){
      document.querySelector('#signup-password-err').appendChild(document.createTextNode(`${passwordErr}`))
     }


    try{
      if(!nameErr && !emailErr && !passwordErr){
        document.querySelector('#signup-name-err').innerHTML=''
        document.querySelector('#signup-mail-err').innerHTML=''
        document.querySelector('#signup-password-err').innerHTML=''
       // console.log('email,password',userEmail,password)
     let response = await fetch(URL_SIGNUP,{
      method:'POST',
      body : JSON.stringify({
        name : userName ,
        email : userEmail,
        password : password,
         returnSecureToken : true,
        }),
        headers : {'Content-Type':'application/json'}
     })
    // console.log('signup response',response)
     let data = await response.json()
     console.log('signup data ..',data)
     if(data.idToken){
      alert('Signup successful')
      let response2 = await fetch(`${URL_DB}/myuser.json`,{
        method:'POST',
        headers : {'Content-Type':'application/json'},
        body: JSON.stringify({uname:userName,uid:data.localId}),
       
      })
      let data2 = await response2.json()
      console.log('data2',data2)
      if(response2.ok){
      //  console.log('data2',data2,data2.name)
         currentUserId =  `${data.localId}`;
       //  console.log('currentUserId',currentUserId)
            document.querySelector('#login-form').style.display = 'block'
         document.querySelector('#signup-form').style.display = 'none'
     }else{
      alert('Signup failed')
      document.querySelector('#signup-form-err').appendChild(document.createTextNode(`${data.error.message}`))
     }
    }
  }
    }catch(err){
      console.log('sigup failed ',err)
    }
}

// login with supabase

loginButton.onclick = async () =>{
  let userEmail = loginUsername.value;
  let userPassword = loginUserPassword.value;

  let passwordErr = ''
   let emailErr = ''
    
   if(!userEmail.trim().length){
    emailErr = 'please provide email'
 }else if(!emailRegex.test(userEmail)){
      emailErr = 'Unvalid email'
 }
   else if(!userPassword.trim().length){
     passwordErr = 'please give user password'
   }else if(userPassword.trim().length < 6){
    passwordErr = 'password minimum length should be 6'
  }else if(!paaswordRegex.test(userPassword)){
    passwordErr = 'Passwords must contain:lower letter,upper letter,1 numeric character,1 special character'

  }
     if(emailErr){
      document.querySelector('#sigin-mail-err').appendChild(document.createTextNode(`${emailErr}`))
     }
     if(passwordErr){
      document.querySelector('#sigin-password-err').appendChild(document.createTextNode(`${passwordErr}`))
     }

  try{
    
     if(!emailErr && !passwordErr){
    //  console.log('login cre',userEmail,userPassword)
     const response = await fetch(URL_SIGNIN,{
      method:'POST',
      headers: { "Content-Type": "application/json" },
      body : JSON.stringify({
        email: userEmail,
        password : userPassword
      })
     })
     const data = await response.json() 
     
     console.log('signin data..',data)
  if(!response.ok){
    alert('Signin failed!')
    document.querySelector('#signin-form-err').appendChild(document.createTextNode(`${data.error.message}`))
  }else{
    alert('Sigin successful!')
    currentUserId = data.localId;
   // console.log('data..',data,data.localId,currentUserId)
   
  
    document.querySelector('#auth-container').style.display = 'none'
    document.querySelector('#chat-container').style.display = 'flex'

     loadUsers();

  }
}
  }catch(error){
    console.log('sigin error',error)
  }
}

//  load users

async function loadUsers(){
  try{
  const response = await fetch(`${URL_DB}/myuser.json`);
  const users = await response.json();
  console.log('load user',users)
  userList.innerHTML = ""; 
   if(response.ok){
  for (const userId in users) {
      if (users[userId].uid != currentUserId) {
          const li = document.createElement("li");
          li.textContent = users[userId].uname;
          li.classList.add("user");
         // let name = users[userId].uname
          li.onclick = () => selectUser(users[userId].uid); // update userId to users[userId].uid
         // console.log('new type id',userId)
          userList.appendChild(li);
          console.log('if block not match',users[userId].uid != currentUserId)
          console.log('if block not match',users[userId].uid , currentUserId)
      }else{
        console.log('else block not match',users[userId].uid != currentUserId)
        console.log('else block not match',users[userId].uid , currentUserId)
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
  alert('selected')
  selectedUserId = userId;
  messagesDiv.innerHTML = "";
  loadMessages();
}


// Load messages
async function loadMessages() {
  const response = await fetch(`${URL_DB}/messages.json`);
  const messages = await response.json();
  messagesDiv.innerHTML = "";

  for (const key in messages) {
      const message = messages[key];
      console.log('during show msg---',currentUserId, selectedUserId, message.participants.includes(currentUserId),message.participants.includes(selectedUserId))
      if (message.participants.includes(currentUserId) && message.participants.includes(selectedUserId)) {
          const messageElement = document.createElement("div");
          const senderElement = document.createElement("div");
          messageElement.setAttribute('class','user-message')
          senderElement.setAttribute('class','sender-name')
          // let sender = message.sender.split('-')[1]
          // console.log('sender---',message.sender,message.sender.split('-')[1])
          senderElement.textContent =  `${message.sender}`
          messageElement.textContent = `${message.text}`;

          messagesDiv.appendChild(senderElement);
          messagesDiv.appendChild(messageElement);
      }
  }
}


// Send message
sendButton.addEventListener("click", async () => {
  const messageText = messageInput.value;
  if (messageText && selectedUserId) {
      await fetch(`${URL_DB}/messages.json`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              text: messageText,
              sender: currentUserId,
              participants: [currentUserId, selectedUserId],
          })
      });
      messageInput.value = "";
      console.log('during send msg both id',currentUserId, selectedUserId)
      loadMessages(); // Refresh messages
  }
});







