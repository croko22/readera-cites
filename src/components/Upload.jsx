import React, { useState } from 'react'
import  { useNavigate } from 'react-router-dom'

//Creo que deberia implementar ya git para separar la ver que funciona sin subir files de la oficial
//Bueno si que esta complejo eso de la redireccion luego de subir el archivo marea un poco lo de los states pero vamos poco a poco
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

         <div className="col">
          <h1 className="text-center">Upload Json</h1>
          <input className="form-control form-control-lg" type="file" onChange={handleChange} />
          <button className="btn btn-lg btn-success mt-1" onClick={setLocalStorage}>Save library</button>
          {/* PONER UN REDIRECT NC COMO FUNCIONA PERO LUEGO DEL UPLOAD REFIRIGIR | Luego de presionar el boton guardar en lib*/}
         </div>

         <div className="col"></div>
    </div>
  )
}