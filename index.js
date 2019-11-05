const url = require('url')
const http = require('http')
const https = require('https')
const fs = require('fs')
const iconv = require('iconv-lite')
const JSDOM = require("jsdom").JSDOM
const comparison = require('./comparison.json')

/**
 * 程序：
 * 1.书籍由自己设置（源/封面/介绍 等）
 * 2.每本书籍有不同的源 进入书籍页面自动使用第一个源或上次使用的源
 * 3.每个源的解析方式都不同 所以每个源都需要单独写解析
 * 4.每个源的书籍可使用单独的爬取程序将其每本书对应的网址和其相关资源
 * 页面组成部分：
 * 1.个人书架/书城/我的（暂定）
 * 2.点击书籍=》书籍介绍（书籍封面/介绍/加入书架/其他书籍推荐/全本缓存/阅读/目录）
 * 3.【书籍封面/介绍/加入书架/其他书籍推荐】使用自己的；【全本缓存/阅读/目录】使用对应源头爬取的
 */

/**
 * 爬取小说
 * @param name 书籍名称
 * @param masterStation 主站地址
 * @param address 书籍路径
 */
function crawl(name, masterStation, address) {
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
    const fullAddress = masterStation + address
    const protocol = url.parse(fullAddress).protocol
    let newHp
    switch (protocol) {
        case 'http:': {
            newHp = http
            break
        }
        case 'https:': {
            newHp = https
            break
        }
        default: break
    }
    newHp.get(fullAddress, function (res) {
        let chunks = []
        res.on('data', function (data) {
            chunks.push(data)
        })
        res.on('end', function () {
            const html = iconv.decode(Buffer.concat(chunks), 'gb2312')
            analysisHtml(masterStation, name, html)
        })
    }).on('error', function () {
        console.log('获取资源出错！')
    })
}

/** 分析HTML */
function analysisHtml(masterStation, name, html) {
    switch (masterStation) {
        case 'https://m.x23us.com/': {
            ddxssjbHtml(name, html)
            break
        }
        default: {
            console.log('没有获取到HTML')
            break
        }
    }
}

/** 顶点小说手机版 html解析 */
function ddxssjbHtml(name, html) {
    const document = new JSDOM(html).window.document
    if (document) {
        let list = []
        const htmlSplit = html.split('<li><span></span><a href="')
        for (let i = 1; i < htmlSplit.length; i++) {
            const hs = htmlSplit[i].split('">')
            const address = hs[0]
            const chapterName = hs[1].split('</a>')[0]
            list.push({ chapterName, address })
        }
        save(name, list)
    } else {
        console.log('document没有创建成功')
    }
}

/** 写入本地 */
function save(name, list) {
    if (!list || !list.length) return console.log('没有找到目录')
    const route = `${__dirname}/books/${name}`
    if (!fs.existsSync(route)) {
        fs.mkdir(route, { recursive: true }, (err) => {
            if (err) console.log(err)
            fs.writeFileSync(`${route}/list.json`, JSON.stringify(list), (error) => {
                if (error) console.log(error)
                console.log('爬取完成')
            })
        })
    } else {
        console.log('目录已存在')
    }
}

/** 读取本地书籍数据 */
function load(name, callBack) {
    const route = `${__dirname}/books/${name}`
    if (fs.existsSync(route)) {
        fs.readFile(`${route}/list.json`, {}, (error, data) => {
            if (error) console.log(error)
            if (callBack) callBack(data)
            console.log('读取完成')
        })
    } else {
        console.log('目录不存在')
    }
}

const argv = process.argv
if (argv[2] === 'crawl') {
    const cs = comparison[0]
    crawl(cs.books[0].bookName, cs.address, cs.otherAddress + cs.books[0].id)
} else if (argv[2] === 'load') {
    load(argv[3])
}
