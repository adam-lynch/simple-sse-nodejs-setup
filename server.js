const http = require('http');
const msg = " - Simple SSE server - ";
const port = 5000;
let numConnections = 0;

// Create basic server
http.createServer(function (request, response) {
    console.log(request.url)

    if(request.url === '/redirect') {
        response.writeHead(307);
        response.write('Redirecting');
        response.end();
    }
    // answer only to event stream requests
    else if (request.headers.accept && request.headers.accept == 'text/event-stream') {
        
        // check if the resource is what we want
        // => http://domain.ext/sse
        if (/sse/gim.test(request.url)) {
            sendSSE(request, response);
        }
    }
    else {
        // if not just return that you are online and a string of text
        response.writeHead(200);
        response.write('Welcome to ' + msg + '@ :' + port);
        response.end();
    }
}).listen(port);

// Setup the SSE "service" :)
function sendSSE(request, response) {
    numConnections++;
    
    // Setup headers
    // For ease of use: example for enabled CORS
    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',

        // enabling CORS
        'Access-Control-Allow-Origin': "*",
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    });

    var id = (new Date()).toLocaleTimeString();

    // send first message
    constructSSE(response, id, 'First message' + ' ' + request.headers['user-agent']);
    
    // send message every second and a half
    setInterval(function () {
        constructSSE(response, id, {interval: new Date().toLocaleTimeString()});
    }, 1500);
}

// setup simple message
function constructSSE(response, id, data) {
    response.write('id: ' + id + '\n');
    // response.write('event: ' + 'add' + '\n');
    const obj = {msg: msg, port: port, data: data, numConnections: numConnections};
    response.write("data: " + JSON.stringify(obj) + '\n\n');
}