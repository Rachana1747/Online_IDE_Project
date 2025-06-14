import React, { useEffect, useState } from 'react';
import logo from "../images/logo.png";
import { Link, useNavigate } from 'react-router-dom';
import Avatar from 'react-avatar';
import { IoMdLogOut } from "react-icons/io";
import { api_base_url, toggleClass } from '../helper';

const EditiorNavbar = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(api_base_url + "/getUserDetails", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: localStorage.getItem("userId")
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setData(data.user);
      } else {
        setError(data.message);
      }
    });
  }, []);

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  
  return (
    <>
      <div className="EditiorNavbar flex items-center justify-between px-[18px] h-[60px] bg-[#1b1b1b]">
        <div className="logo">
          <div className="flex items-center gap-4">
            <img className="w-[40px]" src={logo} alt="Logo" />
            <h1 className="text-white text-3xl font-semibold">Gradious</h1>
          </div>
        </div>
        {/* <p className="text-white">Welcome, Do your Own Code!!</p> */}
        <div className="links flex items-center gap-4">
         
    {isLoggedIn ? (
      <>
      <Link to='/dashboard' className='hover:text-gray-300'>Dashboard</Link>
       <Avatar
       onClick={() => toggleClass(".dropDownNavbar", "hidden")}
       name={data ? data.name : ""}
       size="40"
       round="50%"
       className='cursor-pointer ml-2'
    />
    </>
    ) : (
      <>
      <Link to='/' className='hover:text-gray-300'>Home</Link>
    <button
      onClick={() => navigate("/login")}
      className='ml-4 px-3 py-1 border border-white text-white rounded transition'>Login</button>

      </>
  )}
   </div>
        <div className='dropDownNavbar hidden absolute right-[15px] top-[90px] shadow-lg shadow-black/50 p-[10px] rounded-lg bg-[#1A1919] w-[150px] h-[110px] text-white'>
          <div className='py-[10px] border-b-[1px] border-b-[#fff]'>
            <h3 className='text-[17px]' style={{ lineHeight: 1 }}>{data ? data.name : ""}</h3>
          </div>
          <i onClick={logout} className='flex items-center gap-2 mt-3 mb-2 cursor-pointer' style={{ fontStyle: "normal" }}>
            <IoMdLogOut className='text-[20px]' />Log Out
          </i>
        </div>
      </div>
    </>
  );
};

export default EditiorNavbar;