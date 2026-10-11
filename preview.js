/* Optional local preview server. Upload only index.html, styles.css, app.js and rules.js to S3. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const allowed = new Set(['index.html','styles.css','app.js','rules.js']);
const types = {'.html':'text/html','.htm':'text/html','.js':'text/javascript','.css':'text/css'};
const server = http.createServer((req,res) => {
  let relative;
  try {relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '') || 'index.html';}
  catch {res.writeHead(400);res.end('Bad request');return;}
  const target=path.resolve(root,relative);
  if ((!allowed.has(relative) && !relative.startsWith('all-books-simple/')) || !target.startsWith(root+path.sep)) {
    res.writeHead(404);res.end('Not found');return;
  }
  fs.readFile(target,(error,data)=>{
    if(error){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':`${types[path.extname(target)] || 'application/octet-stream'}; charset=utf-8`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(data);
  });
});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
