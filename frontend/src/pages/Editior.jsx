import React, { useEffect, useState, useRef } from 'react';
import EditiorNavbar from '../components/EditorNavbar';
import Editor from '@monaco-editor/react';
import { MdLightMode } from 'react-icons/md';
import { AiOutlineExpandAlt } from "react-icons/ai";
import { api_base_url } from '../helper';
import { useParams } from 'react-router-dom';
import { IoIosSave } from "react-icons/io";
import { toast } from 'react-toastify';
import { IoShareSocial } from "react-icons/io5";
import { FaRegClone } from "react-icons/fa";


const Editior = ({ hideSave = false, hideClone = true }) => {
  const [tab, setTab] = useState("html");
  const [isLightMode, setIsLightMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
    </body>
</html>`);
  const [cssCode, setCssCode] = useState( `body{
      margin: 0;
      padding: 0;
      box-sizing: border-box;
}`);


  const [jsCode, setJsCode] = useState(`console.log("Hello world")`);
  const [rightTab, setRightTab] = useState("output");
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [outputSrcDoc, setOutputSrcDoc] = useState("");
  const editorRef = useRef(null);

  const { projectID } = useParams();

  const changeTheme = () => {
    const editorNavbar = document.querySelector(".EditiorNavbar");
    if (isLightMode) {
      editorNavbar.style.background = "#141414";
      document.body.classList.remove("lightMode");
      setIsLightMode(false);
    } else {
      editorNavbar.style.background = "#f4f4f4";
      document.body.classList.add("lightMode");
      setIsLightMode(true);
    }
  };

  const hiddenIframeRef = useRef(null);

  useEffect(() => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    hiddenIframeRef.current = iframe;

    return () => {
      if (hiddenIframeRef.current) {
        document.body.removeChild(hiddenIframeRef.current);
      }
    };
  }, []);


  const run = () => {
    setConsoleLogs([]);
    const js = `(function(){
        if (!window._hasLoggedPatch) {
          const originalLog = console.log;
          console.log = function(...args) {
            window.parent.postMessage({ type: "console", data: args.join(" ") }, "*");
            originalLog.apply(console, args);
          };
          window._hasLoggedPatch = true;
        }
        try {
          ${jsCode}
        } catch (err) {
          console.log("Error: " + err.message);
        }
      })();
    `;
    const iframe = hiddenIframeRef.current;
    const doc = iframe.contentWindow.document;

    const combinedCode = `
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>${js}<\/script>
        </body>
      </html>
    `;

    doc.open();
    doc.write(combinedCode);
    doc.close();

    setOutputSrcDoc(combinedCode);
  };



 const insertLibrary = (url, activeTab) => {
  if (editorRef.current && activeTab === "html") {
    const editor = editorRef.current;
    const selection = editor.getSelection();
    const range = {
      startLineNumber: selection.startLineNumber,
      startColumn: selection.startColumn,
      endLineNumber: selection.endLineNumber,
      endColumn: selection.endColumn,
    };
    const tag = url.endsWith('.js')
      ? `<script src="${url}"></script>`
      : `<link rel="stylesheet" href="${url}" />`;

    editor.executeEdits("insert-library", [
      { range, text: tag, forceMoveMarkers: true }
    ]);
  } else {
    toast.warning("Libraries can only be inserted into the HTML editor.");
  }
};


  useEffect(() => {
    const timeout = setTimeout(() => {
      run();
    }, 200);

    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode]);

  useEffect(() => {
    fetch(api_base_url + "/getProject", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: localStorage.getItem("userId"),
        projId: projectID
      })
    })
      .then(res => res.json())
      .then(data => {
        setHtmlCode(data.project.htmlCode);
        setCssCode(data.project.cssCode);
        setJsCode(data.project.jsCode);
      });
  }, [projectID]);


  const handleSave = () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      toast.warning("Please login or signup to save your code.");
      return;
    }

    fetch(api_base_url + "/updateProject",{
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: localStorage.getItem("userId"),
        projId: projectID,
        htmlCode: htmlCode,
        cssCode: cssCode,
        jsCode: jsCode
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
          toast.success("Project saved successfully!");
      } else {
         toast.error("Something went wrong while saving.");
      }
    })
    .catch((err) => {
      console.error("Error saving project:", err);
      toast.error("Failed to save project. Try again.");
    });
  };

  
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        const userId = localStorage.getItem("userId");
        if (!userId) {
          toast.warning("Please login or signup to save your code.");
          return;
        }
        fetch(api_base_url + "/updateProject", {
          mode: "cors",
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: localStorage.getItem("userId"),
            projId: projectID,
            htmlCode: htmlCode,
            cssCode: cssCode,
            jsCode: jsCode
          })
        })
        .then(res => res.json())
        .then(data => {
          console.log(data)
          if (data.success) {
            toast.success("Project saved successfully!");
          } else {
            toast.error("Something went wrong while saving.");
          }
        })
        .catch((err) => {
           console.error("Error saving project:", err);
           toast.error("Failed to save project. Try again.");
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [projectID, htmlCode, cssCode, jsCode]);


  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "console") {
        setConsoleLogs(prev => [...prev, event.data.data]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const libraryOptions = [
    { name: "jQuery", url: "https://code.jquery.com/jquery-3.6.0.min.js" },
    { name: "Lodash", url: "https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js" },
    { name: "Axios", url: "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js" },
    { name: "Bootstrap CSS", url: "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" },
    { name: "Bootstrap JS", url: "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js" },
    { name: "Tailwind CSS", url: "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" },
    { name: "Font Awesome", url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" },
    { name: "Anime.js", url: "https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js" },
    { name: "Chart.js", url: "https://cdn.jsdelivr.net/npm/chart.js" },
    { name: "Moment.js", url: "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js" },
    { name: "GSAP", url: "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.0/gsap.min.js" }
  ];


const handleShare = async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    toast.warning("Please login to share your project.");
    return;
  }
  if (!projectID) {
    toast.warning("Please save the project before sharing.");
    return;
  }
  try {
    const shareUrl = `${window.location.origin}/share/${projectID}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Shareable link copied to clipboard!");
  } catch (error) {
    toast.error("Something went wrong while sharing.");
    console.error(error);
  }
};

const { projectId } = useParams();
useEffect(() => {
  fetch(`${api_base_url}/sharedProject/${projectId}`, {
    method: "GET",
  })
  .then((res) => {
    // if (!res.ok) throw new Error("Failed to fetch shared project");
    return res.json();
  })
  .then((data) => {
    if (data.success && data.project) {
      setHtmlCode(data.project.htmlCode);
      setCssCode(data.project.cssCode);
      setJsCode(data.project.jsCode);
    } 
  })
  .catch((err) => {
    toast.error(err.message || "Error loading shared project");
  });
}, [projectId]);


const handleClone = async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    toast.warning("Please login to clone this project.");
    return;
  }

  try {
    const response = await fetch(`${api_base_url}/cloneProject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        htmlCode,
        cssCode,
        jsCode,
      }),
    });

   const data = await response.json();
     if (response.ok && data.success && data.newProjectId) {  
    window.location.href = `/editor/${data.newProjectId}`; 
   }
   toast.success("Project cloned successfully.");
  
  } catch (error) {
    console.error(error);
    toast.error("An error occurred while cloning.");
  }
};

 
return (
    <>
      <EditiorNavbar />
      <div className="flex">
        <div className={`left w-[${isExpanded ? "100%" : "50%"}]`}>
          <div className="tabs flex items-center justify-between gap-2 w-full bg-[#1A1919] h-[50px] px-[20px]">
            <div className="tabs flex items-center gap-2">
              <div onClick={() => setTab("html")} className={`tab cursor-pointer p-[6px] px-[10px] text-[15px] 
                ${tab === "html" ? "bg-gray-600" : "bg-[#1E1E1E] hover:bg-gray-600"}`}>HTML</div>
              <div onClick={() => setTab("css")} className={`tab cursor-pointer p-[6px] px-[10px] text-[15px] 
                ${tab === "css" ? "bg-gray-600" : "bg-[#1E1E1E] hover:bg-gray-600"}`}>CSS</div>
              <div onClick={() => setTab("js")} className={`tab cursor-pointer p-[6px] px-[10px] text-[15px] 
                ${tab === "js" ? "bg-gray-600" : "bg-[#1E1E1E] hover:bg-gray-600"}`}>JavaScript</div>
              <select className=" tab ml-2 bg-[#1E1E1E] text-white  px-2 py-1 text-sm" onChange={(e) => insertLibrary(e.target.value,tab)}>
                <option value="">Add Library</option>
                {libraryOptions.map((lib, idx) => (
                  <option key={idx} value={lib.url}>{lib.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              {!hideClone && ( <button onClick={handleClone} className='px-4 py-1 hover:bg-gray-600 flex items-center gap-1'>
              clone<span><i className='text-[20px] cursor-pointer'><FaRegClone /></i></span></button>
             )}

              {!hideSave && (
                <i className="text-[20px] cursor-pointer" onClick={handleSave}><IoIosSave /></i>
              )}
              <i className="text-[20px] cursor-pointer" onClick={changeTheme}><MdLightMode /></i>
              <i className="text-[23px] cursor-pointer" onClick={() => { setIsExpanded(!isExpanded); }}><AiOutlineExpandAlt /></i>
            </div>
          </div>

          {tab === "html" ? (
            <Editor
              onMount={(editor) => (editorRef.current = editor)}
              onChange={(value) => {
                setHtmlCode(value || "");
              }}
              height="86vh"
              theme={isLightMode ? "vs-light" : "vs-dark"}
              language="html"
              value={htmlCode}
            />
          ) : tab === "css" ? (
            <Editor
              onMount={(editor) => (editorRef.current = editor)}
              onChange={(value) => {
                setCssCode(value || "");
              }}
              height="86vh"
              theme={isLightMode ? "vs-light" : "vs-dark"}
              language="css"
              value={cssCode}
            />
          ) : (
            <Editor
              onMount={(editor) => (editorRef.current = editor)}
              onChange={(value) => {
                setJsCode(value || "");
              }}
              height="86vh"
              theme={isLightMode ? "vs-light" : "vs-dark"}
              language="javascript"
              value={jsCode}
            />
          )}
        </div>
        





        {!isExpanded && (
          <div className="w-[50%] min-h-[86vh] flex flex-col bg-white text-black">
            <div className=" tabs flex justify-between items-center bg-[#1A1919] text-white px-4 py-2">
              <div className="flex gap-2">
                <button
                  className={` tab px-4 py-1 border border-gray-600 hover:bg-[#5b5d5e] ${rightTab === 'output' ? 'bg-gray-700' : 'bg-[#1E1E1E]'}`}
                  onClick={() => {
                    setRightTab('output');
                    // run();
                  }}>Output</button>
                <button className={` tab px-4 py-1 border border-gray-600 hover:bg-[#5b5d5e] 
                ${rightTab === 'console' ? 'bg-gray-700' : 'bg-[#1E1E1E]'}`}
                  onClick={() => {
                    setRightTab('console');
                    run();
                  }}>Console</button>
              </div>
             <div className="flex gap-4">
            <button className="px-4 py-1 border border-gray-600 hover:bg-[#5b5d5e] flex items-center gap-1" onClick={handleShare}> Share <span><IoShareSocial /></span>
        </button>
          <button className="px-4 py-1 border border-gray-600 hover:bg-[#5b5d5e]" 
          onClick={run}>Run</button>
          </div>
         </div>
            {rightTab === "output" ? (
              <iframe
                title="output"
                className="w-full flex-grow"
                srcDoc={outputSrcDoc}
                sandbox="allow-scripts"
              />
            ) : (
              <div className="overflow-auto h-full p-2">
                {consoleLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Editior;

