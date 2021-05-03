const fs = require("fs");
const cors = require("cors");
const express = require("express");
const lineReader = require("line-reader");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb", extended: true }));

// Images folder is static and used as source for <img> tags
app.use("/images", express.static(__dirname + "/images"));

// Gets list of images available on server from txt file
app.post("/images", (req, res) => {
  let ret = [],
    empty = true;

  // Check if file is empty, if so send empty array
  fs.readFile("images.txt", (err, file) => {
    if (file.length == 0) res.send([]);
  });

  // Iterate line by line through file and parse by '-' delimiter
  lineReader.eachLine("images.txt", function(line, last) {
    let tmp = line.split("-");

    // Ensure permissions
    if (tmp[1] === "public" || tmp[2] == req.body.user) {
      ret.push({
        src: tmp[0],
        permission: tmp[1],
        user: tmp[2]
      });
    }
    // Send array of images sources back
    if (last) {
      res.send(ret);
    }
  });
});

// Function to accept and upload an image to the server
app.post("/uploadImages", (req, res) => {
  // Create stream and iterate img source arrays
  var stream = fs.createWriteStream("./images.txt", { flags: "a" });
  for (let i = 0; i < req.body.imgs.length; i++) {
    // Parse imgs (they come in as base64 data, this could be more robust)
    let fileName = (new Date().getTime() + i).toString();
    let ext = req.body.imgs[i]
      .split(";")[0]
      .split("/")
      .slice(-1)[0];
    let data = req.body.imgs[i].replace(/^data:image\/\w+;base64,/, "");

    // Write image file to server
    fs.writeFile(
      `./images/${fileName}.${ext}`,
      data,
      { encoding: "base64" },
      err => {
        if (err) {
          throw err;
        } else {
          // Write record to .txt file database
          stream.write(
            `\n${fileName}.${ext}-${req.body.permission}-${req.body.user}`
          );
        }
      }
    );
  }
  res.send("OK");
});

// Function to delete images from server
app.post("/deleteImages", (req, res) => {
  // Convert images to set
  let toDelete = new Set(req.body.toDelete);
  let reWrite = [];

  // Iterate text file and remove records if they are in toDelete set
  lineReader.eachLine("images.txt", function(line, last) {
    let tmp = line.split("-");

    // Keep track of new .txt file to rewrite again
    if (!toDelete.has(tmp[0])) {
      reWrite.push(line);

      // Remove file from server
    } else {
      fs.unlinkSync(`./images/${tmp[0]}`);
    }

    // Write .txt file records
    if (last) {
      fs.writeFileSync("./images.txt", reWrite.join("\n"), "utf-8");
    }
  });
  res.send("OK");
});

app.listen(3000, () => {
  console.log(`Listening at http://localhost:3000`);
});
