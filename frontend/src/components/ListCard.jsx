import React, { useState } from 'react'
import img from "../images/code.png"
import deleteImg from "../images/delete.png"
import { api_base_url } from '../helper';
import { useNavigate } from 'react-router-dom';
import { FaRegClone } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { toast } from 'react-toastify';

const ListCard = ({ item }) => {
  const navigate = useNavigate();
  const [isDeleteModelShow, setIsDeleteModelShow] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(item.title);

  const deleteProj = (id) => {
    fetch(api_base_url + "/deleteProject", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        progId: id,
        userId: localStorage.getItem("userId")
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setIsDeleteModelShow(false)
        window.location.reload()
      } else {
        alert(data.message)
        setIsDeleteModelShow(false)
      }
    })
  }

  const handleShare = async (e) => {
    e.stopPropagation();
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.warning("Please login to share your project.");
      return;
    }

    if (!item._id) {
      toast.warning("Project not found.");
      return;
    }

    try {
      const shareUrl = `${window.location.origin}/share/${item._id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Shareable link copied to clipboard!");
    } catch (error) {
      toast.error("Something went wrong while sharing.");
      console.error(error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`${api_base_url}/updateProjectTitle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: item._id,
          newTitle,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Title updated!");
        setIsEditModalOpen(false);
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to update title.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
      console.error(error);
    }
  };

  return (
    <>
      <div onClick={() => { navigate(`/editor/${item._id}`) }} className="listCard ml-80 mb-2 w-[780px] flex items-center justify-between p-[10px] bg-[#141414] cursor-pointer rounded-lg hover:bg-[#202020]">
        <div className='flex items-center gap-2'>
          <img className='w-[60px]' src={img} alt="" />
          <div>
            <h4 className='text-[15px]'>{item.title}</h4>
            <p className='text-[gray] text-[12px]'>Created on {new Date(item.date).toDateString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button title='copy link'><FaRegClone className="w-[17px] h-[20px] text-[gray]" onClick={handleShare} /></button>
          <button title='Edit the title' onClick={(e) => {
            e.stopPropagation();
            setNewTitle(item.title);
            setIsEditModalOpen(true);
          }}>
            <FiEdit className="w-[17px] h-[20px] text-[gray]" />
          </button>
          <img onClick={(e) => {
            e.stopPropagation();
            setIsDeleteModelShow(true);
          }} className="w-[20px] h-[20px] cursor-pointer" src={deleteImg} alt="delete" />
        </div>
      </div>

      {
        isDeleteModelShow ? (
          <div className="model fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.1)] flex justify-center items-center flex-col">
            <div className="mainModel w-[20vw] h-[20vh] bg-[#141414] rounded-lg p-[20px]">
              <h4>Do you want to delete <br /> this project</h4>
              <div className='flex w-full mt-5 items-center gap-[10px]'>  
                <button onClick={() => { setIsDeleteModelShow(false) }} className='p-[10px] rounded-lg bg-[#1A1919] text-white cursor-pointer min-w-[49%]'>Cancel</button>
                <button onClick={() => { deleteProj(item._id) }} className='p-[10px] rounded-lg bg-[#FF4343] text-white cursor-pointer min-w-[49%]'>Delete</button>
              </div>
            </div>
          </div>
        ) : ""
      }

      {
        isEditModalOpen ? (
          <div className='model fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.1)] flex justify-center items-center flex-col'>
            <div className='mainModel w-[20vw] h-[25vh] bg-[#141414] rounded-lg p-[20px]'>
              <h4 className='text-white mb-4'>Edit the project Title</h4>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2 rounded bg-[#1A1A1A] text-white"
              />
              <div className='flex w-full mt-5 items-center gap-[10px]'> 
                <button onClick={() => { setIsEditModalOpen(false) }} className='p-[10px] rounded-lg bg-[#1A1919] text-white cursor-pointer min-w-[49%]'>Cancel</button>
                <button onClick={handleSaveEdit} className='p-[10px] rounded-lg bg-[#FF4343] text-white cursor-pointer min-w-[49%]'>Save</button>
              </div>
            </div>
          </div>
        ) : ""
      }
    </>
  )
}

export default ListCard
