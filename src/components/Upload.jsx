import React, { useState } from 'react'
import  { useNavigate } from 'react-router-dom'

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

  const navigate = useNavigate();

  React.useEffect(() => {
    if (redirect) {
      navigate('/');
    }
  });

  return (
    <div className="container">
        <div className="col"></div>
        {/* Here is the main file administrator of the app*/}
         <div className="col">
          <h1 className="text-center">Upload Json</h1>
          <input className="form-control form-control-lg" type="file" onChange={handleChange} />
          <button className="btn btn-lg btn-success mt-1" onClick={setLocalStorage}>Save library</button>
         </div>
         <div className="col"></div>
    </div>
  )
}