import React from 'react'
import logo from "../images/logo.jpeg"
import { FiDownload } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';


const EditiorNavbar = () => {
  const navigate=useNavigate();
  return (
    <>
      <div className="EditiorNavbar flex items-center justify-between px-[100px] h-[80px] bg-[#141414]">
        <div className="logo">
          <div className="flex items-center gap-2">
              <img className="w-[60px]" src={logo} alt="" />
              <h1 className="text-white text-2xl font-semibold">Gradious</h1>
          </div>
        </div>
        <p>Welcome , Do your Own Code!!</p>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")}className="bg-[#1A1919] text-white px-4 py-2 rounded hover:bg-[#333]"> Home </button>
            <i className='p-[8px] btn bg-black rounded-[5px] cursor-pointer text-[20px] text-white'>
            <FiDownload />
          </i>
        </div>

      </div>
    </>
  )
}

export default EditiorNavbar