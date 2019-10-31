const url = require('url')
const http = require('http')
const https = require('https')
const fs = require('fs')
const iconv = require('iconv-lite');
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

function start(type, address) {
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
    const protocol = url.parse(address).protocol
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
    newHp.get(address, function (res) {
        let chunks = []
        res.on('data', function (data) {
            chunks.push(data)
        })
        res.on('end', function () {
            const html = iconv.decode(Buffer.concat(chunks), 'gb2312')
            analysisHtml(type, html)
        })
    }).on('error', function () {
        console.log('获取资源出错！')
    })
}

/** 分析HTML */
function analysisHtml(type, html) {
    switch (type) {
        case 'https://www.xbiqugexsw.com/': {
            xbiqugeHtml(html)
            break
        }
        case 'https://m.x23us.com/': {
            ddxssjbHtml(html)
            break
        }
        default: {
            console.log('没有获取到HTML');
            break
        }
    }
}

/** 顶点小说手机版 html解析 */
function ddxssjbHtml(html) {
    const document = new JSDOM(html).window.document
    if (document) {
        const list = document.getElementsByClassName('chapter')
        if (list && list.length) {
            fs.writeFile('./data.json', list[0].querySelectorAll('li')[0].innerHTML, (err) => {
                if (err) console.log(err)
            })
            console.log(list[0].querySelectorAll('li')[0].innerHTML)

        } else {
            console.log('目录列表获取出现问题')
        }
    } else {
        console.log('document没有创建成功')
    }
}

/** 新笔趣阁 html解析 */
function xbiqugeHtml(html) {
    const document = new JSDOM(html).window.document
    if (document) {
        const list = document.querySelector('#list')
        if (list) {
            console.log(list.querySelectorAll('dl>dd')[0].textContent)
        } else {
            console.log('目录列表获取出现问题')
        }
    } else {
        console.log('document没有创建成功')
    }
}

start(comparison[1].address,
    comparison[1].address + comparison[1].otherAddress + comparison[1].books[0].id)