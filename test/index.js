var express = require('express');
var app = express();

// 设置跨域访问
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8")
    next()
})

app.use(express.static('public'));


app.get('/', function (req, res) {
    res.type('html');
    res.sendFile(__dirname + "/" + "index.html");
});

app.get('/bookList', function (req, res) {
    res.type('html');
    res.sendFile(__dirname + "/" + "bookList.html");
});

app.get('/book', function (req, res) {
    res.type('html');
    res.sendFile(__dirname + "/" + "book.html");
});

app.get('/content', function (req, res) {
    res.type('html');
    res.sendFile(__dirname + "/" + "content.html");
});

var server = app.listen(3000)