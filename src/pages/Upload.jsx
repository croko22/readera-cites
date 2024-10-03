import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload } from "react-icons/fa";
import Toastify from "toastify-js";

export const Upload = () => {
  const [files, setFiles] = useState();
  const [books, setBooks] = useState();
  const [minCitations, setMinCitations] = useState(100); // New state for minimum citations
  const navigate = useNavigate();

  const handleChange = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      const data = JSON.parse(e.target.result).docs.filter(
        (book) => book.citations.length > minCitations // Use the dynamic value
      );
      setFiles(JSON.stringify(data));
      setBooks(data);
    };
  };

  const setLocalStorage = () => {
    if (!files) {
      Toastify({
        text: "No file selected!",
        position: "center",
        duration: 1500,
        style: { background: "linear-gradient(to right, #ff416c, #ff4b2b)" },
      }).showToast();
      return;
    }
    try {
      window.localStorage.setItem("Books", files);
      navigate("/");
      Toastify({
        text: "Loaded successfully!",
        duration: 1500,
        style: { background: "linear-gradient(to right, #00b09b, #96c93d)" },
      }).showToast();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container mt-3">
      <div className="row gap-3 align-items-center">
        <div className="col-sm">
          <h1>Welcome to ReadEra - Book Notes</h1>
          <p>
            In the ReadEra app, navigate to the <b>Backup & Restore</b> section
            and export a ReadEra backup file.
          </p>
          <img
            src="assets/img/bak-file.webp"
            alt="upload"
            className="img-fluid"
          />
          <p className="py-3">
            This will create a <b>.bak</b> file containing a{" "}
            <code>library.json</code> file that holds your ReadEra data.
          </p>
          <img
            src="assets/img/json-file.webp"
            alt="json"
            className="img-fluid"
          />
        </div>
        <div className="col-sm my-3">
          <h2 className="mt-2 mb-4">
            Upload your <code>library.json</code> file
          </h2>
          <p className="mb-3">
            Visualize and manage your reading data from the{" "}
            <code>library.json</code> file inside your ReadEra <code>.bak</code>{" "}
            file.
          </p>
          <div className="mb-3">
            <label htmlFor="citations" className="form-label">
              Minimum number of citations:
            </label>
            <input
              type="number"
              className="form-control"
              id="citations"
              value={minCitations}
              onChange={(e) => setMinCitations(Number(e.target.value))} // Update state on change
            />
          </div>
          <div className="d-flex gap-1 align-items-center">
            <input
              className="form-control form-control-lg"
              type="file"
              accept=".json"
              onChange={handleChange}
            />
            <button
              className="btn btn-lg btn-success"
              onClick={setLocalStorage}
              disabled={!files}
            >
              <FaUpload className="font-sm" />
            </button>

            {files && (
              <div>
                <span className="badge bg-success rounded-pill">
                  File loaded
                </span>
                {books && books.length} books
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
