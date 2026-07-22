const http = require("http");
const server = http.createServer((req, res) => {
  res.end("it works");
});
server.listen(5000, () => console.log("Test server on 5000"));
