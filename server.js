const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");

const port = process.env.PORT || 8080;
const whitelist = [`http://localhost:${port}`];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  if (pathname === "/chatbot") {
    const query = querystring.parse(parsedUrl.query);
    const question = query.question;

    // Set CORS headers
    const origin = req.headers.origin;
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
      res.setHeader("Access-Control-Allow-Methods", "GET");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    // Handle chatbot requests
    if (question) {
      const answer = `You asked: ${question}. Here's your answer!`;
      res.end(JSON.stringify({ answer }));
    } else {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "Bad request" }));
    }
  } else {
    let filePath = path.join(__dirname, pathname);
    console.log(`Serving file: ${filePath}`);

    // Check if pathname is a directory
    if (fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    const extname = path.extname(filePath);

    // Handle static file requests
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code == "ENOENT") {
          // File not found
          res.statusCode = 404;
          res.end(`File not found: ${pathname}`);
        } else {
          // Server error
          res.statusCode = 500;
          res.end(`Server error: ${err.code}`);
        }
      } else {
        // Success
        res.setHeader("Content-type", getContentType(extname));
        res.end(content);
      }
    });
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

function getContentType(extname) {
  switch (extname) {
    case ".html":
      return "text/html";
    case ".css":
      return "text/css";
    case ".js":
      return "text/javascript";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".jpg":
      return "image/jpg";
    case ".jpeg":
      return "image/jpeg";
    case ".wav":
      return "audio/wav";
    default:
      return "text/plain";
  }
}
