import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload } from "react-icons/fa";
import Toastify from "toastify-js";
import { Button, ListGroup, Modal } from "react-bootstrap";

export const Upload = () => {
  const [originalBooks, setOriginalBooks] = useState();
  const [minCitations, setMinCitations] = useState(100);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const filteredBooks = useMemo(() => {
    return (
      originalBooks?.filter((book) => book.citations.length > minCitations) ||
      []
    );
  }, [originalBooks, minCitations]);

  const handleChange = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result).docs;
        setOriginalBooks(data);
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        Toastify({
          text: "Invalid file format!",
          position: "center",
          duration: 1500,
          style: { background: "linear-gradient(to right, #ff416c, #ff4b2b)" },
        }).showToast();
      }
    };
  };

  const setLocalStorage = () => {
    if (!originalBooks) {
      Toastify({
        text: "No file selected!",
        position: "center",
        duration: 1500,
        style: { background: "linear-gradient(to right, #ff416c, #ff4b2b)" },
      }).showToast();
      return;
    }

    try {
      window.localStorage.setItem("Books", JSON.stringify(filteredBooks));
      navigate("/");
      Toastify({
        text: "Loaded successfully!",
        duration: 1500,
        style: { background: "linear-gradient(to right, #00b09b, #96c93d)" },
      }).showToast();
    } catch (e) {
      console.error("LocalStorage error:", e);
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
          </p>{" "}
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

          <div className="mb-3">
            <label htmlFor="citations" className="form-label">
              Minimum number of citations:
            </label>
            <input
              type="number"
              className="form-control"
              id="citations"
              value={minCitations}
              onChange={(e) => setMinCitations(Number(e.target.value))}
            />
            <div className="d-flex gap-2 mt-2 flex-wrap">
              {[10, 50, 100, 200].map((value) => (
                <button
                  key={value}
                  className={`btn btn-sm ${
                    minCitations === value
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setMinCitations(value)}
                >
                  {value}
                </button>
              ))}
            </div>
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
              disabled={!originalBooks}
            >
              <FaUpload className="font-sm" />
            </button>
          </div>

          {originalBooks && (
            <div className="d-flex flex-column gap-2 mt-3">
              <div className="d-flex align-items-center gap-2 mt-2">
                <span className="badge bg-success rounded-pill">
                  File loaded
                </span>
                <p className="mb-0">
                  {filteredBooks.length > 0
                    ? `${filteredBooks.length} ${
                        filteredBooks.length === 1 ? "book" : "books"
                      }`
                    : "No books available"}
                </p>
              </div>
              <Button variant="success" onClick={() => setShowModal(true)}>
                Preview Books
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Preview Books</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {filteredBooks.map((book, index) => (
              <ListGroup.Item
                key={index}
                className="d-flex align-items-center justify-content-between"
              >
                <strong>
                  {book.data.doc_file_name_title.length > 70
                    ? `${book.data.doc_file_name_title.slice(0, 70)}...`
                    : book.data.doc_file_name_title}
                </strong>
                <span>{book.citations.length} citations</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={setLocalStorage}
            disabled={!originalBooks}
          >
            Load Books
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
