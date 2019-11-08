const express = require('express')
const app = express()

// 设置跨域访问
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8")
    next()
})

// 传前端的数据
const infor = [
    {
        name: 'jay',
        age: 20,
        sex: '男',
        hobby: 'basketball'
    },
    {
        name: '贼好玩',
        age: 23,
        sex: '女',
        hobby: 'shopping'
    },
    {
        name: '高渐离',
        age: 24,
        sex: '男',
        hobby: 'music'
    },
    {
        name: '小红',
        age: 28,
        sex: '男',
        hobby: 'game'
    },
    {
        name: 'Tony',
        age: 24,
        sex: '男',
        hobby: 'no'
    },
]

// 配置接口api
app.get('/api', function (req, res) { res.status(200), res.json(infor) })

// 配置服务端口
const server = app.listen(3002, function () {
    const host = server.address().address
    const port = server.address().port
    console.log('listen at http://%s:%s', host, port)
})
