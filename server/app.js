const fs = require("fs");
const cors = require("cors");
const express = require("express");
const lineReader = require("line-reader");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb", extended: true }));

app.get("/images", (req, res) => {
  let ret = [];

  lineReader.eachLine("images.txt", function(line, last) {
    let tmp = line.split("-");
    ret.push({
      src: tmp[0]
    });
    if (last) {
      res.send(ret);
    }
  });
});

app.post("/uploadImages", (req, res) => {
  var stream = fs.createWriteStream("./images.txt", { flags: "a" });
  for (let i = 0; i < req.body.imgs.length; i++) {
    let fileName = (new Date().getTime() + i).toString();
    let ext = req.body.imgs[i]
      .split(";")[0]
      .split("/")
      .slice(-1)[0];
    let data = req.body.imgs[i].replace(/^data:image\/\w+;base64,/, "");
    fs.writeFile(
      `./images/${fileName}.${ext}`,
      data,
      { encoding: "base64" },
      err => {
        if (err) {
          throw err;
        } else {
          stream.write(`${fileName}.${ext}-${req.body.permission}\n`);
        }
      }
    );
  }
  res.send("OK");
});

app.use("/images", express.static(__dirname + "/images"));

app.listen(3000, () => {
  console.log(`Listening at http://localhost:3000`);
});
