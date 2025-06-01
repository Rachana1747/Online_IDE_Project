import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { api_base_url } from '../helper';
import Navbar from '../components/Navbar';

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submitForm = (e) => {
    e.preventDefault();

    fetch(api_base_url + "/login", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        identifier: identifier, 
        password: pwd
      })
    }).then(res => res.json()).then(data => {
      if (data.success === true) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("userId", data.userId);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 200);
      } else {
        setError(data.message);
      }
    });
  };

  return (
    <>
    <Navbar></Navbar>
      <div className="absolute top-[80px] left-1/2 -translate-x-1/2 container w-screen min-h-screen flex items-center justify-center bg-[#0D0C0C] mt-0 pt-0">
        <div className="w-[400px]">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-white text-2xl font-semibold">LogIn</h1>
          </div>

          <form onSubmit={submitForm} className='w-full mt-8'>

            <div className="inputBox">
              <input required onChange={(e) => setIdentifier(e.target.value)} value={identifier} type="text"  placeholder='Email or Username'/>
            </div>
            <div className="inputBox">
              <input  required onChange={(e) => setPwd(e.target.value)} value={pwd}  type="password"  placeholder='Password'  />
            </div>
            <p className='text-[gray]'>Don't have an account <Link to="/signUp" className='text-[#00AEEF]'>Sign Up</Link></p>
            <p className='text-red-500 text-[14px] my-2'>{error}</p>
            <button className="btnBlue w-full mt-[20px]">Login</button>
          </form>
        </div>
        {/* <div className="right w-[55%]">
          <img className='h-[100vh] w-[100%] object-cover' src={image} alt="" />
        </div> */}
      </div>
    </>
  );
};

export default Login;
