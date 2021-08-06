const port = process.env.PORT || 5000;
const http = require('http');
const app = require('./app.js');
const server = http.createServer(app);
server.listen(port)
console.log(`server listening @ port: ${port}`);
