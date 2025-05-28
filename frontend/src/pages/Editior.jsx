import React, { useEffect, useState } from 'react';
import EditiorNavbar from '../components/EditorNavbar';
import Editor from '@monaco-editor/react';
import { MdLightMode } from 'react-icons/md';
import { AiOutlineExpandAlt } from "react-icons/ai";
import { api_base_url } from '../helper';
import { useParams } from 'react-router-dom';

const Editior = () => {
  const [tab, setTab] = useState("html");
  const [isLightMode, setIsLightMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [htmlCode, setHtmlCode] = useState("<h1>Hello world</h1>");
  const [cssCode, setCssCode] = useState("body { background-color: #f4f4f4; }");
  const [jsCode, setJsCode] = useState("// some comment");
  const [rightTab, setRightTab] = useState("output");
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [outputSrcDoc, setOutputSrcDoc] = useState("");


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

const run = () => {
  setConsoleLogs([]); 
  const html = htmlCode;
  const css = `<style>${cssCode}</style>`;
  const js = `
    <script>
      (function(){
        const originalLog = console.log;
        console.log = function(...args) {
          window.parent.postMessage({ type: "console", data: args.join(" ") }, "*");
          originalLog.apply(console, args);
        };
        ${jsCode}
      })();
    </script>`;

  const combinedCode = html + css + js;

  setOutputSrcDoc(combinedCode);
};

  useEffect(() => {
    setTimeout(() => {
      run();
    }, 200);
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
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
          if (data.success) {
            alert("Project saved successfully");
          } else {
            alert("Something went wrong");
          }
        })
        .catch((err) => {
          console.error("Error saving project:", err);
          alert("Failed to save project. Please try again.");
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

  return (
    <>
      <EditiorNavbar />
      <div className="flex">
        <div className={`left w-[${isExpanded ? "100%" : "50%"}]`}>
          <div className="tabs flex items-center justify-between gap-2 w-full bg-[#1A1919] h-[50px] px-[40px]">
            <div className="tabs flex items-center gap-2">
              <div onClick={() => setTab("html")} className={`tab cursor-pointer p-[6px] px-[10px] text-[15px] 
                ${tab === "html" ? "bg-gray-600" : "bg-[#1E1E1E] hover:bg-gray-600"}`}>HTML</div>
              <div onClick={() => setTab("css")} className={`tab cursor-pointer p-[6px] px-[10px] text-[15px] 
                ${tab === "css" ? "bg-gray-600" : "bg-[#1E1E1E] hover:bg-gray-600"}`}>CSS</div>
              <div onClick={() => setTab("js")} className={`tab cursor-pointer p-[6px] px-[10px] text-[15px] 
                ${tab === "js" ? "bg-gray-600" : "bg-[#1E1E1E] hover:bg-gray-600"}`}>JavaScript</div>
            </div>
            <div className="flex items-center gap-2">
              <i className="text-[20px] cursor-pointer" onClick={changeTheme}><MdLightMode /></i>
              <i className="text-[20px] cursor-pointer" onClick={() => { setIsExpanded(!isExpanded); }}><AiOutlineExpandAlt /></i>
            </div>
          </div>

          {tab === "html" ? (
            <Editor
              onChange={(value) => {
                setHtmlCode(value || "");
                run();
              }}
              height="86vh"
              theme={isLightMode ? "vs-light" : "vs-dark"}
              language="html"
              value={htmlCode}
            />
          ) : tab === "css" ? (
            <Editor
              onChange={(value) => {
                setCssCode(value || "");
                run();
              }}
              height="86vh"
              theme={isLightMode ? "vs-light" : "vs-dark"}
              language="css"
              value={cssCode}
            />
          ) : (
            <Editor
              onChange={(value) => {
                setJsCode(value || "");
                run();
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
      <div className="flex justify-between items-center bg-[#1A1919] text-white px-4 py-2">
       <div className="flex gap-2">
       <button
        className={`px-4 py-1 border border-gray-600 hover:bg-[#5b5d5e] ${rightTab === 'output' ? 'bg-gray-700' : 'bg-[#1E1E1E]'}`}
        onClick={() => {
          setRightTab('output');
          run();
        }}>Output</button>
      <button className={`px-4 py-1 border border-gray-600 hover:bg-[#5b5d5e] ${rightTab === 'console' ? 'bg-gray-700' : 'bg-[#1E1E1E]'}`}
        onClick={() => {
          setRightTab('console');
        }} >Console</button>
    </div>
    <button className="px-3 py-1 border border-gray-600 hover:bg-[#5b5d5e]" onClick={run}>Run</button>
  </div>
  
  {rightTab === 'output' ? (
    <iframe
      className="w-full flex-1 bg-white text-black"
      title="output"
      srcDoc={outputSrcDoc}
    />
  ) : (
    <div className="p-4 overflow-y-auto flex-1 text-sm font-mono">
      {consoleLogs.length === 0 ? (
        <div>No console output yet.</div>
      ) : (
        consoleLogs.map((log, idx) => <div key={idx}>{log}</div>)
      )}
    </div>
     )}
    </div>

 )}
      </div>
    </>
  );
};

export default Editior;
