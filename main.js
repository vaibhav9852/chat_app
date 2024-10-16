console.log('main file 1')
// import { createClient } from '@supabase/supabase-js'
//const { createClient } = supabase; 
const supabaseUrl = `https://qqryzonuyyktfakkijgm.supabase.co`
const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcnl6b251eXlrdGZha2tpamdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMDM1MjQsImV4cCI6MjA0NDU3OTUyNH0.L57NBOKE5Y-4tIGkNivnZtRyxP9UcfuW-gpnBTkQa5k`
const supabase = createClient(supabaseUrl, supabaseKey)


// signup 
 let singupName = document.querySelector('#signup-name')
 let singupEmail = document.querySelector('#signup-email')
 let signupPassword = document.querySelector('#signup-password')
 let singupButton = document.querySelector('#signup')

// login 
let loginUsernameInput = document.querySelector('#login-username')
let loginUserPassword = document.querySelector('#login-password')
let loginButton = document.querySelector('#login')

// message
let msgContainer = document.querySelector('#messages')
let msgValue = document.querySelector('#message')
let sendButton = document.querySelector('#send')
let logOutBuuton = document.querySelector('#logout')

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

// singup with supabase 
singupButton.onclick = async () =>{
   let userName = singupName.value
   let userEmail = singupEmail.value
   let password =  signupPassword.value
   console.log(userName,userEmail,password)
    try{
      let {user,error} = await supabase.auth.signUp({email:userEmail,password:password})
      if(error){
        alert('Signup failed')
        console.log('signup failed ',error)
      }else{
        // await supabase.from('users').insert([{id:user.id,name:userName}]);
         alert('Signup successful!')
         document.querySelector('#login-form').style.display = 'block'
         document.querySelector('#signup-form').style.display = 'none'
      }
    }catch(err){
      console.log('sigup failed ')
    }
}