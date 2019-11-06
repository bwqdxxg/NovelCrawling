const url = require('url')
const http = require('http')
const https = require('https')
const iconv = require('iconv-lite')

const { save } = require('./save')
const analysisHtmlMethods = require('./analysisHtml')
const { analysisConfig } = require('../analysis')

/**
 * 爬取小说
 * @param name 书籍名称
 * @param masterStation 主站地址
 * @param address 书籍路径
 */
exports.crawlNovel = function (name, masterStation, address) {
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
    console.log('开始爬取 ' + masterStation + '：' + name)
    newHp.get(fullAddress, function (res) {
        let chunks = []
        res.on('data', function (data) {
            chunks.push(data)
        })
        res.on('end', function () {
            // 解决乱码问题
            const html = iconv.decode(Buffer.concat(chunks), 'gb2312')
            console.log(masterStation + '：' + name + ' 的HTML已获取完成，开始解析。。。')
            analysisHtml(masterStation, name, html)
        })
    }).on('error', function () {
        console.log('获取资源出错！')
    })
}

/** 分析HTML */
function analysisHtml(masterStation, name, html) {
    let existence = false
    for (let i = 0; i < analysisConfig.length; i++) {
        const agi = analysisConfig[i]
        if (agi.address === masterStation) {
            existence = true
            if (analysisHtmlMethods[agi.methodName]) {
                analysisHtmlMethods[agi.methodName](name, html, (err, name, list) => {
                    if (err) console.log(err)
                    else {
                        console.log(masterStation + '：' + name + ' 的HTML已解析完成，准备存入本地。。。')
                        save(masterStation.split('://')[1], name, list)
                    }
                })
            } else {
                console.log('分析HTML方法报错：没有对应的爬取方法')
            }
            break
        }
    }
    if (!existence) console.log('分析HTML方法报错：没有对应的爬取地址')
}