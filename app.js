const pathlib = require("path");

const port = 5500;
const filesDir = pathlib.join(__dirname, "files");
const outDir = pathlib.join(__dirname, "output");
const cleanDir = pathlib.join(__dirname, "clean");

const { exec } = require("child_process");
const { spawn } = require("child_process");
const { readdirSync, rmSync } = require("fs");
const uuidv4 = require("uuid/v4");

const express = require("express");
const multer = require("multer");
const cors = require("cors");

const app = express();
let modelName, originalname, processingStatus;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, filesDir);
  },
  filename: function (req, file, cb) {
    //* Getting the file Extension from the Original Name
    fileExt = file.originalname.split(".");
    originalname = fileExt[0].replace(/\W+/g, "_").toLowerCase();
    fileExt = fileExt[fileExt.length - 1];

    cb(null, `${originalname}-${uuidv4()}.${fileExt}`);
    originalname = `${originalname}.${fileExt}`;
    console.log("The Original Name is " + originalname);
  },
});

const upload = multer({ storage: storage });

app.use("/clean", express.static("clean"));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  })
);
app.post("/app", upload.single("inputImage"), (req, res) => {
  console.log("got a post request");
  if (!req.file) {
    res.status(400).send("No file was Uploaded");
  }
  modelName = req.body.modelName;
  console.log(modelName);
  console.log(originalname);
  pythonFile = pathlib.join(__dirname, `Restormer/${modelName}.py`);
  const pythonOutput = spawn("python", [
    "manage.py",
    "-m",
    modelName,
    "-i",
    filesDir,
    "-o",
    cleanDir,
    "-f",
    originalname,
  ]);

  pythonOutput.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  processingStatus = 1;
  pythonOutput.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
  });

  pythonOutput.on("error", (error) => {
    console.log(`error: ${error.message}`);
    processingStatus = 2;
  });

  pythonOutput.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    processingStatus = 0;
  });
  setTimeout(() => {
    res.status(200).send({ processingStatus, filename: originalname });
  }, 500);
  console.log(execSync(`cp -r --verbose ${filesDir}/ ${outDir}/ `));
  readdirSync(outDir).forEach((f) => rmSync(`${filesDir}/${f}`));
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`);
});
