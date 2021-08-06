const port = process.env.port || 3000;
const http = require('http');
const app = require('./app.js');
const server = http.createServer(app);
server.listen(port)
console.log(`server listening @ port: ${port}`);