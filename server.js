import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// 🔑 Fake Auth middleware
app.use((req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth || auth !== "Bearer fake-token-123") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// 📂 Mock file metadata endpoint
app.get("/api/files", (req, res) => {
  res.json([
    { id: 1, documentName: "Discharge_Summary.pdf", type: "PDF", url: "/files/Discharge_Summary.pdf", lastUpdated: '1.01.25' },
    { id: 2, documentName: "Lab_Report.docx", type: "Word", url: "/files/Lab_Report.docx", lastUpdated: '9.02.25' },
    { id: 4, documentName: "Chest_XRay.dcm", type: "DICOM", url: "/files/Chest_XRay.dcm", lastUpdated: '8.03.25'},
    { id: 5, documentName: "MAGNETOM Vida, 3T.dcm", type: "DICOM", url: "/files/MAGNETOM Vida, 3T.dcm", lastUpdated: '12.04.24'},
    { id: 6, documentName: "MAGNETOM Altea, 1.5T.dcm", type: "DICOM", url: "/files/MAGNETOM Altea, 1.5T.dcm", lastUpdated: '12.04.24'}
  ]);
});

// 📥 Serve actual files
app.use("/files", express.static(path.join(__dirname, "mock-files")));

const PORT = 4000;
app.listen(PORT, () => console.log(`Pegasos Mock API running at http://localhost:${PORT}`));
