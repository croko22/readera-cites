import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaEye, FaFileImport, FaCheckCircle } from "react-icons/fa";
import Toastify from "toastify-js";
import { unzipSync } from "fflate";
import { setBooks, getSettings } from "../lib/booksStorage";
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

// Utility functions
const validateJsonFile = (file) => {
  if (!file) return { valid: false, error: "No file provided" };
  const lowerName = file.name.toLowerCase();
  if (!ACCEPTED_FILE_TYPES.some((ext) => lowerName.endsWith(ext))) {
    return { valid: false, error: "Please upload a .json or .bak file!" };
  }
  return { valid: true };
};

const parseLibraryFile = (fileContent) => {
  try {
    const parsed = JSON.parse(fileContent);
    if (!parsed.docs || !Array.isArray(parsed.docs)) {
      throw new Error("Invalid library format");
    }
    return { data: parsed.docs, error: null };
  } catch (error) {
    console.error("Error parsing JSON file:", error);
    return { data: null, error: "Invalid file format!" };
  }
};

const getLibraryJsonFromBak = async (file) => {
  const buffer = await file.arrayBuffer();
  const unzipped = unzipSync(new Uint8Array(buffer));

  const entryKey = Object.keys(unzipped).find((key) =>
    key.toLowerCase().endsWith("library.json")
  );

  if (!entryKey) {
    throw new Error("library.json not found inside .bak");
  }

  return new TextDecoder("utf-8").decode(unzipped[entryKey]);
};

export const Upload = () => {
  const [originalBooks, setOriginalBooks] = useState(null);
  const [minCitations, setMinCitations] = useState(100);
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Load default filter from settings on mount
  useEffect(() => {
    getSettings().then((s) => setMinCitations(s.defaultFilter));
  }, []);

  // Memoized filtered books based on citation threshold
  const filteredBooks = useMemo(() => {
    if (!originalBooks) return [];
    return originalBooks.filter((book) => book.citations.length > minCitations);
  }, [originalBooks, minCitations]);

  // Process uploaded file
  const processFile = useCallback((file) => {
    const validation = validateJsonFile(file);
    if (!validation.valid) {
      showToast(validation.error, false);
      return;
    }

    setFileName(file.name);
    const lowerName = file.name.toLowerCase();

    const load = async () => {
      try {
        const content = lowerName.endsWith(".bak")
          ? await getLibraryJsonFromBak(file)
          : await file.text();

        const { data, error } = parseLibraryFile(content);

        if (error) {
          showToast(error, false);
          setFileName("");
          setOriginalBooks(null);
          return;
        }

        setOriginalBooks(data);
        showToast("File loaded successfully!");
      } catch (error) {
        console.error("Error loading file:", error);
        showToast("Could not extract library.json from this backup", false);
        setFileName("");
        setOriginalBooks(null);
      }
    };

    void load();
  }, []);

  // File input change handler
  const handleChange = useCallback((e) => {
    const file = e.target.files?.[0];
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
    fileInputRef.current?.click();
  }, []);

  // Load books to localStorage and navigate
  const loadLibrary = useCallback(() => {
    if (!originalBooks) {
      showToast("No file selected!", false);
      return;
    }

    if (filteredBooks.length === 0) {
      showToast("No books match the citation criteria!", false);
      return;
    }

    const persist = async () => {
      try {
        await setBooks(filteredBooks);
        showToast("Library loaded successfully!");
        setTimeout(() => navigate("/"), 500);
      } catch (error) {
        console.error("Storage error:", error);
        showToast("Failed to save library", false);
      }
    };

    void persist();
  }, [originalBooks, filteredBooks, navigate]);

  return (
    <div className="container mx-auto px-4 py-7">
      <div className="grid items-start gap-7 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-300/80">Import Flow</p>
          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">Welcome to ReadEra - Book Notes</h1>
          <p className="mb-4 text-base leading-relaxed text-slate-400 sm:text-lg">
            In the ReadEra app, navigate to the <b className="text-slate-200">Backup & Restore</b> section
            and export a ReadEra backup file.
          </p>
          <img
            src="assets/img/bak-file.webp"
            alt="upload"
            className="panel mb-4 w-full rounded-xl border-white/15"
          />
          <p className="py-3 leading-relaxed text-slate-400">
            This will create a <b className="text-slate-200">.bak</b> file containing a{" "}
            <code className="bg-white/5 px-2 py-1 rounded text-amber-400 border border-white/10">library.json</code> file that holds your ReadEra data.
            {" "}You can upload either one here.
          </p>
          <img
            src="assets/img/json-file.webp"
            alt="json"
            className="panel w-full rounded-xl border-white/15"
          />
        </div>

        <div className="panel space-y-6 rounded-2xl border-white/15 p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
            Upload your{" "}
            <code className="bg-white/5 px-2 py-1 rounded text-sm text-amber-400 border border-white/10">library.json</code>
            {" "}or{" "}
            <code className="bg-white/5 px-2 py-1 rounded text-sm text-amber-400 border border-white/10">.bak</code>
            {" "}file
          </h2>

          {/* Drag and Drop Zone */}
          <button
            type="button"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClickUpload}
            className={`w-full rounded-xl border-2 border-dashed p-8 text-center transition-[transform,border-color,background-color,box-shadow] duration-300 ${
              isDragging
                ? "border-amber-400 bg-amber-400/14 shadow-[0_0_40px_rgba(245,158,11,0.28)]"
                : originalBooks
                ? "border-amber-400/50 bg-amber-400/8"
                : "border-white/10 bg-white/5 hover:border-amber-400/50 hover:bg-amber-400/8"
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
              className="hidden"
            />
            
            {originalBooks ? (
              <div className="space-y-3">
                 <FaCheckCircle className="mx-auto text-5xl text-amber-400 drop-shadow-[0_0_14px_rgba(245,158,11,0.56)]" />
                <div>
                  <p className="text-lg font-semibold text-amber-400">File uploaded successfully!</p>
                  <p className="text-sm text-slate-400 mt-1">{fileName}</p>
                  <p className="text-xs text-slate-500 mt-2">Click to upload a different file</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <FaFileImport className="mx-auto text-5xl text-slate-600" />
                <div>
                  <p className="text-lg font-semibold text-slate-200">
                    Drag & Drop your library.json or .bak file here
                  </p>
                  <p className="text-sm text-slate-500 mt-1">or click to browse files</p>
                </div>
              </div>
            )}
          </button>

          {/* Citation Filter */}
          <div>
            <Label htmlFor="citations" className="mb-2 text-sm font-semibold text-slate-300">
              Minimum citations per book:
            </Label>
            <Input
              type="number"
              id="citations"
              value={minCitations}
              onChange={(e) => setMinCitations(Number(e.target.value))}
              className="mb-3 bg-white/5 border-white/10 text-slate-100 focus:border-amber-500/50 focus:ring-amber-500/20"
            />
            <div className="flex gap-2 flex-wrap">
              {CITATION_PRESETS.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={minCitations === value ? "default" : "outline"}
                  onClick={() => setMinCitations(value)}
                 className={minCitations === value ? "border border-amber-300/40 bg-[linear-gradient(130deg,rgba(245,158,11,0.95),rgba(249,115,22,0.9))] text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.35)]" : "border-white/10 text-slate-300 hover:bg-amber-400/10 hover:border-amber-400/50 hover:text-amber-300"}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>

          {/* File Info and Actions */}
          {originalBooks && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="text-sm text-slate-400">Books with {minCitations}+ citations</p>
                  <p className="text-2xl font-bold text-slate-100">
                    {filteredBooks.length}
                  </p>
                </div>
                 <Button
                  variant="outline"
                  onClick={() => setShowModal(true)}
                  className="gap-2 border-white/10 text-slate-300 hover:bg-amber-400/10 hover:border-amber-400/50 hover:text-amber-300"
                >
                  <FaEye />
                  Preview
                </Button>
              </div>

                <Button
                  className="motion-lift w-full gap-2 border border-amber-300/45 bg-[linear-gradient(130deg,rgba(245,158,11,0.95),rgba(249,115,22,0.9))] py-6 text-lg font-semibold text-slate-900 hover:brightness-105"
                  onClick={loadLibrary}
                >
                <FaUpload />
                Load Library
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto border-white/10 bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-100">Preview Books</DialogTitle>
            <DialogDescription className="text-slate-400">
              Books that will be loaded with {minCitations}+ citations
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {filteredBooks.map((book, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/20 transition-all duration-200"
              >
                <strong className="flex-1 truncate pr-4 text-slate-200">
                  {book.data.doc_file_name_title.length > 70
                    ? `${book.data.doc_file_name_title.slice(0, 70)}...`
                    : book.data.doc_file_name_title}
                </strong>
                <span className="text-sm font-medium text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">{book.citations.length} citations</span>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="border-white/10 text-slate-300 hover:bg-white/5">
              Close
            </Button>
            <Button
              className="border border-amber-300/45 bg-[linear-gradient(130deg,rgba(245,158,11,0.95),rgba(249,115,22,0.9))] text-slate-900 font-medium transition-all hover:brightness-105 hover:shadow-[0_0_24px_rgba(245,158,11,0.42)]"
              onClick={loadLibrary}
              disabled={!originalBooks}
            >
              Load Books
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
