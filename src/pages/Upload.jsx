import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toastify from "toastify-js";

export const Upload = () => {
  const [files, setFiles] = useState();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      const data = JSON.parse(e.target.result).docs.filter(
        (book) => book.citations.length > 10
      );
      setFiles(JSON.stringify(data));
    };
  };

  const setLocalStorage = () => {
    try {
      window.localStorage.setItem("Books", files);
      //* Toast of success
      navigate("/");
      Toastify({
        text: "Loaded succesfully!",
        position: "top-left",
        duration: 1500,
        style: { background: "linear-gradient(to right, #00b09b, #96c93d)" },
      }).showToast();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="container row align-items-center justify-content-center
    mt-3"
    >
      <div className="col-sm">
        <h1>Hi</h1>
        <p>
          In the ReadEra app, go to the Backup and restore section and export a
          security copy ReadEra backup file.
        </p>
        <img
          src="../../docs/img/bak file.jpg"
          alt="upload"
          className="img-fluid"
        />
        <p>
          This will create a .bak file, inside which is a file called
          library.json that contains your books data.
        </p>
        <img
          src="../../docs/img/json file.png"
          alt="json"
          className="img-fluid"
        />
      </div>
      <div className="col-sm">
        <h1 className="text-center mb-3">Upload Json File</h1>
        <p>
          Visualize and manage your readings data from <b>library.json</b> file
          inside your ReadEra .bak file
        </p>
        <input
          className="form-control form-control-lg"
          type="file"
          accept=".json"
          onChange={handleChange}
        />
        <button
          className="btn btn-lg btn-success mt-3 mb-3"
          onClick={setLocalStorage}
        >
          Save library
        </button>
      </div>
    </div>
  );
};
