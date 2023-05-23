const pathlib = require("path");

const port = 5500;
const filesDir = pathlib.join(__dirname, "files");
const outDir = pathlib.join(__dirname, "output");

const { exec } = require("child_process");
const { spawn } = require("child_process");
const { readdirSync, rmSync } = require("fs");
const uuidv4 = require("uuid/v4");

const express = require("express");
const multer = require("multer");
const cors = require("cors");

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, filesDir);
  },
  filename: function (req, file, cb) {
    //* Getting the file Extension from the Original Name
    fileExt = file.originalname.split(".");
    fileExt = fileExt[fileExt.length - 1];

    cb(null, `${file.fieldname}-${uuidv4()}.${fileExt}`);
  },
});

const upload = multer({ storage: storage });

let modelName, originalname, processingStatus;

app.use("/clean", express.static("output"));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  })
);
app.get("/app", (req, res) => {
  res.send({ processingStatus });
});
app.post("/app", upload.single("inputImage"), (req, res) => {
  console.log("got a post request");
  if (!req.file) {
    res.status(400).send("No file was Uploaded");
  }
  modelName = req.body.modelName;
  originalname = req.file.originalname;
  console.log(modelName);
  console.log(originalname);
  pythonFile = pathlib.join(__dirname, `Restormer/${modelName}.py`);
  // const pythonOutput = spawn("python", [
  //   "manage.py",
  //   "-m",
  //   modelName,
  //   "-i",
  //   "files",
  //   "-o",
  //   "clean",
  // ]);
  const pythonOutput = spawn("python", ["--version"]);

  pythonOutput.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
    readdirSync(filesDir).forEach((f) => rmSync(`${filesDir}/${f}`));
  });

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
  // console.log(execSync(`cp -r --verbose ${filesDir}/ ${outDir}/ `));
  // console.log(execSync(`rm -rf output/ `));
  // readdirSync(outDir).forEach((f) => rmSync(`${outDir}/${f}`));
  processingStatus = 1;
  res.status(200).send({ processingStatus });
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`);
});
