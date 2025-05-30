import React, { useState } from 'react'
import logo from "../images/logo.jpeg"
import { Link, useNavigate } from 'react-router-dom';
// import image from "../images/authPageSide.png";
import { api_base_url } from '../helper';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const submitForm = (e) => {
    e.preventDefault();
    fetch(api_base_url + "/signUp",{
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        name: name,
        email: email,
        password: pwd
      })
    }).then((res)=>res.json()).then((data)=>{
      if(data.success === true){
        toast.success("Account created successfully");
        navigate("/login"); 
      }
      else{
        setError(data.message);
      }
    })
  }

  return (
    <>
     <Navbar></Navbar>
      <div className=" login-container w-screen min-h-screen flex items-center justify-center bg-[#0D0C0C]] mt-0 pt-0">
        <div className="w-[400px]">
           <div className="flex items-center gap-2 justify-center mb-6">
                   {/* <img className="w-[60px]" src={logo} alt="" /> */}
               <h1 className="text-white text-2xl font-semibold ">Sign Up</h1>
          </div>
          <form onSubmit={submitForm} className='w-full' action="">
            <div className="inputBox">
              <input required onChange={(e)=>{setUsername(e.target.value)}} value={username} type="text" placeholder='Username'/>
            </div>

            <div className="inputBox">
              <input required onChange={(e)=>{setName(e.target.value)}} value={name} type="text" placeholder='Name'/>
            </div>

            <div className="inputBox">
              <input required onChange={(e)=>{setEmail(e.target.value)}} value={email} type="email" placeholder='Email'/>
            </div>

            <div className="inputBox">
              <input required onChange={(e)=>{setPwd(e.target.value)}} value={pwd} type="password" placeholder='Password'/>
            </div>

            <p className='text-[gray]'>Already have an account <Link to="/login" className='text-[#00AEEF]'>login</Link></p>

            <p className='text-red-500 text-[14px] my-2'>{error}</p>

            <button className="btnBlue w-full mt-[20px]">Sign Up</button>
          </form>
        </div>
        {/* <div className="right w-[55%]">
          <img className='h-[100vh] w-[100%] object-cover' src={image} alt="" />
        </div> */}
      </div>
    </>
  )
}

export default SignUp