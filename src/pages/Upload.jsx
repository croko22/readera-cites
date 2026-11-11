import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaEye, FaFileImport, FaCheckCircle } from "react-icons/fa";
import Toastify from "toastify-js";
import { setBooks, getSettings } from "../lib/booksStorage";
import { getBookTitle } from "../lib/readeraVocab";
import { isSupportedFile, extractBooks, filterBooksWithCitations, getBackupMetadata } from "../lib/readEraIntake";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

// Constants
const CITATION_PRESETS = [0, 10, 50, 100, 200];
const ACCEPTED_FILE_TYPES = [".json", ".bak"];

// Toast configurations
const TOAST_CONFIG = {
  position: "center",
  duration: 1500,
};

const showToast = (text, isSuccess = true) => {
  Toastify({
    ...TOAST_CONFIG,
    text,
    style: {
      background: isSuccess ? "#F59E0B" : "#ef4444",
      "--toast-duration": `${TOAST_CONFIG.duration / 1000}s`,
    },
  }).showToast();
};

export const Upload = () => {
  const [originalBooks, setOriginalBooks] = useState(null);
  const [minCitations, setMinCitations] = useState(100);
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [operation, setOperation] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [warnings, setWarnings] = useState([]);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const navigationTimerRef = useRef(null);
  const isBusy = operation !== "idle";
  const operationMessage = operation === "reading" ? "Reading backup..."
    : operation === "saving" ? "Saving library..."
    : operation === "saved" ? "Library saved. Opening your library..." : "";

  // Load default filter from settings on mount
  useEffect(() => {
    mountedRef.current = true;
    getSettings().then((s) => {
      if (mountedRef.current) setMinCitations(s.defaultFilter);
    }).catch(() => {
      // Keep the default threshold if settings cannot be read.
    });
    return () => {
      mountedRef.current = false;
      clearTimeout(navigationTimerRef.current);
    };
  }, []);

  // Memoized filtered books based on citation threshold
  const filteredBooks = useMemo(() => {
    if (!originalBooks) return [];
    return filterBooksWithCitations(originalBooks, minCitations);
  }, [originalBooks, minCitations]);

  // Process uploaded file
  const processFile = useCallback((file) => {
    if (busyRef.current) return;
    setErrorMessage("");
    if (!isSupportedFile(file)) {
      setErrorMessage("Please upload a .json or .bak file!");
      showToast("Please upload a .json or .bak file!", false);
      return;
    }

    busyRef.current = true;
    setOperation("reading");
    setWarnings([]);
    setFileName(file.name);

    const load = async () => {
      try {
        const { books, warnings } = await extractBooks(file);
        if (!mountedRef.current) return;
        setOriginalBooks(books);
        setWarnings(warnings);

        if (warnings.length > 0) {
          warnings.forEach((w) => showToast(w, true));
        }

        showToast("File loaded successfully!");
      } catch (error) {
        if (!mountedRef.current) return;
        console.error("Error loading file:", error);
        const message = error?.message === "library.json not found inside .bak"
          ? "Could not find library data in this backup"
          : error?.message || "Invalid file format!";
        setErrorMessage(`${message}. Choose a valid ReadEra backup and try again.`);
        showToast(message, false);
        setFileName("");
        setOriginalBooks(null);
      } finally {
        busyRef.current = false;
        if (mountedRef.current) setOperation("idle");
      }
    };

    void load();
  }, []);

  // File input change handler
  const handleChange = useCallback((e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) processFile(file);
  }, [processFile]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleClickUpload = useCallback(() => {
    if (busyRef.current) return;
    fileInputRef.current?.click();
  }, []);

  // Persist through the storage boundary before navigating.
  const loadLibrary = useCallback(() => {
    if (busyRef.current) return;
    if (!originalBooks) {
      setErrorMessage("No file selected! Choose a ReadEra backup first.");
      showToast("No file selected!", false);
      return;
    }

    if (filteredBooks.length === 0) {
      setErrorMessage("No books match the citation criteria! Lower the minimum citations to include more books.");
      showToast("No books match the citation criteria!", false);
      return;
    }

    busyRef.current = true;
    setOperation("saving");
    setErrorMessage("");
    const persist = async () => {
      try {
        await setBooks(filteredBooks);
        if (!mountedRef.current) return;
        setOperation("saved");
        showToast("Library loaded successfully!");
        navigationTimerRef.current = setTimeout(() => navigate("/"), 500);
      } catch (error) {
        if (!mountedRef.current) return;
        console.error("Storage error:", error);
        busyRef.current = false;
        setOperation("idle");
        setErrorMessage("Failed to save library. Your backup is still ready. Try loading it again.");
        showToast("Failed to save library", false);
      }
    };

    void persist();
  }, [originalBooks, filteredBooks, navigate]);

  return (
    <div className="container mx-auto px-4 py-7">
      <div className="grid items-start gap-7 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Import flow</p>
          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Welcome to ReadEra - Book Notes</h1>
          <p className="mb-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            In the ReadEra app, navigate to the <b className="text-foreground">Backup & Restore</b> section
            and export a ReadEra backup file.
          </p>
          <img
            src="assets/img/bak-file.webp"
            alt="ReadEra backup screen showing the Backup and Restore option"
            className="panel mb-4 w-full rounded-xl border-border"
          />
          <p className="py-3 leading-relaxed text-muted-foreground">
            Upload the <b className="text-foreground">.bak</b> file directly. Both older and newer ReadEra backup formats are supported.
            {" "}You can also upload an older <code className="bg-secondary px-2 py-1 rounded text-primary border border-border">library.json</code> file.
          </p>
          <img
            src="assets/img/json-file.webp"
            alt="Example library.json file exported from ReadEra"
            className="panel w-full rounded-xl border-border"
          />
        </div>

        <div className="panel space-y-6 rounded-2xl border-border p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Upload your{" "}
            <code className="bg-secondary px-2 py-1 rounded text-sm text-primary border border-border">library.json</code>
            {" "}or{" "}
            <code className="bg-secondary px-2 py-1 rounded text-sm text-primary border border-border">.bak</code>
            {" "}file
          </h2>

          {/* Drag and Drop Zone */}
          <button
            type="button"
            disabled={isBusy}
            aria-busy={operation === "reading"}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClickUpload}
            className={`w-full rounded-xl border-2 border-dashed p-8 text-center transition-[transform,border-color,background-color,box-shadow] duration-300 ${
              isDragging
                ? "border-primary bg-primary/10"
                : originalBooks
                ? "border-primary/50 bg-primary/5"
                : "border-border bg-secondary/40 hover:border-ring/60 hover:bg-secondary/60"
            }`}
            aria-label={
              originalBooks
                ? "Upload a different library file"
                : "Upload a ReadEra library file"
            }
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES.join(",")}
              onChange={handleChange}
              disabled={isBusy}
              aria-label="Upload library file"
              className="hidden"
            />
            
            {originalBooks ? (
              <div className="space-y-3">
                 <FaCheckCircle className="mx-auto text-5xl text-primary" />
                <div>
                  <p className="text-lg font-semibold text-primary">File uploaded successfully!</p>
                  <p className="text-sm text-muted-foreground mt-1">{fileName}</p>
                  <p className="text-xs text-muted-foreground mt-2">Click to upload a different file</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <FaFileImport className="mx-auto text-5xl text-muted-foreground/70" />
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    Drag & Drop your library.json or .bak file here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
                </div>
              </div>
            )}
          </button>

          <p role="status" aria-atomic="true" className="text-sm text-secondary-foreground">
            {operationMessage}
          </p>
          {errorMessage && (
            <p role="alert" className="break-words rounded-lg border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          )}
          {warnings.length > 0 && (
            <ul aria-label="Backup warnings" className="space-y-1 break-words text-sm text-amber-200">
              {warnings.map((warning, index) => <li key={index}>{warning}</li>)}
            </ul>
          )}

          {/* Citation Filter */}
          <div>
            <Label htmlFor="citations" className="mb-2 text-sm font-semibold text-secondary-foreground">
              Minimum citations per book:
            </Label>
            <Input
              type="number"
              id="citations"
              disabled={isBusy}
              value={minCitations}
              onChange={(e) => setMinCitations(Number(e.target.value))}
              className="mb-3 bg-secondary border-border text-foreground focus:border-ring focus:ring-ring/30"
            />
            <div className="flex gap-2 flex-wrap">
              {CITATION_PRESETS.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  disabled={isBusy}
                  variant={minCitations === value ? "default" : "outline"}
                  onClick={() => setMinCitations(value)}
                 className={minCitations === value ? "border border-primary" : ""}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>

          {/* File Info and Actions */}
          {originalBooks && (
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Books with {minCitations}+ citations</p>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredBooks.length}
                  </p>
                </div>
                 <Button
                  variant="outline"
                  onClick={() => setShowModal(true)}
                  disabled={isBusy}
                  className="gap-2 border-border text-secondary-foreground hover:border-ring/50 hover:bg-secondary/80"
                >
                  <FaEye />
                  Preview
                </Button>
              </div>

                <Button
                  className="motion-lift w-full gap-2 border border-primary py-6 text-lg font-semibold"
                  onClick={loadLibrary}
                  disabled={isBusy}
                >
                <FaUpload />
                Load Library
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto border-border bg-popover">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">Preview Books</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Books that will be loaded with {minCitations}+ citations
            </DialogDescription>
          </DialogHeader>
          <p role="status" aria-atomic="true" className="text-sm text-secondary-foreground">{operationMessage}</p>
          {errorMessage && <p role="alert" className="break-words text-sm text-red-200">{errorMessage}</p>}
          
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {filteredBooks.map((book, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-3 rounded-lg border border-border p-4 transition-colors duration-200 hover:bg-secondary/40"
              >
                <strong className="min-w-0 flex-1 text-balance text-foreground [overflow-wrap:anywhere]">
                  {getBookTitle(book)}
                </strong>
                <span className="shrink-0 rounded-full border border-border bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">{book.citations.length} citations</span>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="border-border text-secondary-foreground hover:bg-secondary">
              Close
            </Button>
            <Button
              className="border border-primary font-medium"
              onClick={loadLibrary}
              disabled={!originalBooks || isBusy}
            >
              Load Books
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
