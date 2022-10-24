import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toastify from 'toastify-js'

export const Upload = () => {
  const [files, setFiles] = useState();
  const [redirect,setRedirect] = useState(false);

  const handleChange = e => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      console.log(e.target.result);
      setFiles(e.target.result);
    }; 
  };

  const setLocalStorage = () => {
    try {
      window.localStorage.setItem("Books",files)
      setRedirect(true)
    } catch (e) {
      console.error(e)
    }
  }
  //Redirect to the home page
  const navigate = useNavigate();
  React.useEffect(() => {
    if (redirect) {
      navigate('/');
    }
    Toastify({
      text: "All quotes copied to clipboard", 
      close: true,
      gravity: "top", 
      position: "left", 
      stopOnFocus: true, 
      duration: 3000
    }).showToast();
  });

  return (
    <div className="container mt-5">
      <div className="col">
        <h1 className="text-center mb-3">Upload Json File</h1>
        <p>Visualize and manage your readings data from <b>library.json</b> file inside your ReadEra .bak file</p>
        <input className="form-control form-control-lg" type="file" accept=".json" onChange={handleChange} />
        <button className="btn btn-lg btn-success mt-3" onClick={setLocalStorage}>Save library</button>
      </div>
    </div>
  )
}