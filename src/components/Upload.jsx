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
      //Notification of loaded files
      Toastify({
        text: "All data loaded succesfully!", 
        position: "top-left", 
        duration: 1500,
        style: {background: "linear-gradient(to right, #00b09b, #96c93d)"}
      }).showToast();
    }
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