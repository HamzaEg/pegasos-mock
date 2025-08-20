import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const FILES_DIR = path.join(__dirname, "mock-files");

// 🔑 Fake Auth middleware
app.use((req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth || auth !== "Bearer fake-token-123") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// 🆕 Helper: Recursively collect files
function walkDir(dir, fileList = [], basePath = "") {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const relPath = path.join(basePath, file); // relative path for API

    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      // recurse into folder
      walkDir(fullPath, fileList, relPath);
    } else {
      const ext = path.extname(file).toLowerCase();
      let type = "Other";
      if (ext === ".pdf") type = "PDF";
      if (ext === ".docx" || ext === ".doc") type = "Word";
      if (ext === ".dcm") type = "DICOM";

      fileList.push({
        id: fileList.length + 1,
        documentName: file,
        type,
        url: `/files/${relPath.replace(/\\/g, "/")}`, // always forward slashes
        folder: basePath || null, // keep folder info
        lastUpdated: stats.mtime.toISOString().split("T")[0],
      });
    }
  });

  return fileList;
}

// 🆕 Dynamic file + folder listing
app.get("/api/files", (req, res) => {
  try {
    const fileList = walkDir(FILES_DIR);
    res.json(fileList);
  } catch (err) {
    console.error("Error reading files:", err);
    res.status(500).json({ error: "Failed to read files" });
  }
});

// 📥 Serve files (with subfolders supported)
app.use("/files", express.static(FILES_DIR));

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`Pegasos Mock API running at http://localhost:${PORT}`)
);
