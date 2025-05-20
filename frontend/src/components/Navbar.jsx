import React, { useEffect, useState } from 'react'
import logo from "../images/logo.jpeg"
import { Link, useNavigate } from 'react-router-dom'
import Avatar from 'react-avatar';
import { IoMdLogOut } from "react-icons/io";
import { BsGridFill } from "react-icons/bs";
import { api_base_url, toggleClass } from '../helper';

const Navbar = ({ isGridLayout, setIsGridLayout }) => {

  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");;

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
      }
      else {
        setError(data.message);
      }
    })
  }, [])

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    window.location.reload();
  }

  return (
    <>
      <div className="navbar flex items-center justify-between px-[100px] h-[80px] bg-[#141414]">
        <div className="logo">
          <div className="flex items-center gap-2">
                <img className="w-[40px]" src={logo} alt="" />
                <h1 className="text-white text-2xl font-semibold">Gradious</h1>
          </div>
        </div>
        <div className="links flex items-center gap-4">
         <Link className='hover:text-gray-300'>Home</Link>
         <Link className='hover:text-gray-300'>About</Link>
          <Link className='hover:text-gray-300'>Contact</Link>
        
          {/* <button onClick={logout} className='btnBlue !bg-red-400 min-w-[50px] ml-2 '>Logout</button> */}
          <Avatar onClick={() => { toggleClass(".dropDownNavbar", "hidden") }} name={data ? data.name : ""} size="40" round="50%" className=' cursor-pointer ml-2' />
        </div>

        <div className='dropDownNavbar hidden absolute right-[60px] top-[80px] shadow-lg shadow-black/50 p-[10px] rounded-lg bg-[#1A1919] w-[150px] h-[150px]'>
          <div className='py-[10px] border-b-[1px] border-b-[#fff]'>
            <h3 className='text-[17px]' style={{ lineHeight: 1 }}>{data ? data.name : ""}</h3>
          </div>
          <i onClick={() => setIsGridLayout(!isGridLayout)} className='flex items-center gap-2 mt-3 mb-2 cursor-pointer' style={{ fontStyle: "normal" }}><BsGridFill className='text-[20px]' /> {isGridLayout ? "List" : "Grid"} layout</i>
          <i onClick={logout} className='flex items-center gap-2 mt-3 mb-2 cursor-pointer' style={{ fontStyle: "normal" }}><IoMdLogOut  className='text-[20px]' />Log Out</i>
        </div>
      </div>
    </>
  )
}

export default Navbar