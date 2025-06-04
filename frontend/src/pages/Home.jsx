import React from 'react'
import { useNavigate } from 'react-router-dom'
import HomeNavbar from '../components/HomeNavbar';

function Dashboard() { 
const navigate = useNavigate();

  const handleStartCoding = () => {
  navigate("/editor");
};

const handleSignUp=()=>{
  navigate("/signUp");
}
  return (
    <>
    <HomeNavbar/>
     <div className="w-screen h-screen flex flex-col items-center text-white px-4 pt-24">

  <h1 className="text-center text-4xl md:text-4xl font-bold tracking-wide leading-tight animate-fadeInUp">
   Where you <span className="text-pink-400">write</span>, <span className="text-blue-400">run</span>, and <span className="text-purple-400">reimagine</span><br />
    front-end code with real-time JavaScript compilation 

  </h1>
   <p className="mt-6 text-center text-lg text-gray-300 max-w-2xl font-light animate-fadeInUp delay-100">
   Build beautiful static websites, run JavaScript instantly, and fix bugs easily. Whether you're trying new ideas, showing your work, or looking for
    inspiration — this editor is your creative space. Code it.
   Run it. Share it. Let others explore and clone your project to make it their own.
  </p>
   <div className="mt-6">
  <div className="main-btn">
    <button onClick={handleStartCoding}  className="border border-purple-500 text-white px-6 py-3 rounded-lg  hover:text-white transition-all duration-300 shadow-lg hover:shadow-purple-500/40">
      Start coding
    </button>
  </div>
</div>
<div className='registration'>
  <button onClick={handleSignUp} className="border border-purple-500 text-white px-6 py-3 rounded-lg  hover:text-white transition-all duration-300 shadow-lg hover:shadow-purple-500/40">SignUp Here </button>

</div>
<div>
</div>
</div>

    </>
  )
}

export default Dashboard
