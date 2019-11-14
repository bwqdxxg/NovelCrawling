var http = require('http');
// url 做路径解析
var url = require('url');
// fs 读写文件
var fs = require('fs');
// node 服务
var server = http.createServer();
// 获取html相对路径
var htmlDir = __dirname + '/';

// 处理url请求的数据
function sendData(file, req, res) {
    fs.readFile(file, function (err, data) {
        if (err) {
            res.writeHead(404, {
                'content-type': 'text/html'
            });
            res.write('<h1>404<h1/>');
            res.end();
        } else {
            res.writeHead(200, {
                'content-type': 'text/html'
            });
            res.write(data);
            res.end();
        }
    });
}
// 监听服务开启
server.on('listening', function () {
    console.log('listen..');
});
server.on('request', function (req, res) {
    // 获取url后面的路径
    var urlStr = url.parse(req.url);
    console.log(urlStr.pathname);
    switch (urlStr.pathname) {
        case '/':
            // 首页
            sendData(htmlDir + 'index.html', req, res);
            break;
        case '/bookList':
            // 首页
            sendData(htmlDir + 'bookList.html', req, res);
            break;
        case '/book':
            // 首页
            sendData(htmlDir + 'book.html', req, res);
            break;
        case '/content':
            // 首页
            sendData(htmlDir + 'content.html', req, res);
            break;
        default:
            sendData(htmlDir + 'error.html', req, res);
            break;
    }
});
server.listen(3000, 'localhost');