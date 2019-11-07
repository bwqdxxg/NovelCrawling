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
 * @param {'list'|'content'} type 爬取类型
 * @param callBack 回调程序
 */
exports.crawlNovel = function (name, masterStation, address, type, callBack) {
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
            analysisHtml(masterStation, name, html, type, (err, name, data) => {
                if (err) console.log(err)
                else {
                    console.log(masterStation + '：' + name + ' 的HTML已解析完成！')
                    switch (type) {
                        case 'content': {
                            callBack(true, name, data)
                            break
                        }
                        case 'list': {
                            save(masterStation.split('://')[1], name, data, (success, msg) => {
                                console.log(msg)
                                callBack(success)
                            })
                            break
                        }
                        default: break
                    }
                }
            })
        })
    }).on('error', function () {
        console.log('获取资源出错！')
    })
}

/** 分析HTML
 * @param masterStation 主站地址
 * @param name 书籍名称
 * @param html
 * @param {'list'|'content'} type 爬取类型
 * @param {(err:string, name:string, data) => void} callBack
 */
function analysisHtml(masterStation, name, html, type, callBack) {
    let existence = false
    for (let i = 0; i < analysisConfig.length; i++) {
        const agi = analysisConfig[i]
        if (agi.address === masterStation) {
            existence = true
            if (analysisHtmlMethods[agi.methodName]) {
                analysisHtmlMethods[agi.methodName](name, html, type, (err, name, data) => {
                    callBack(err, name, data)
                })
            } else {
                callBack('分析HTML方法报错：没有对应的爬取方法')
            }
            break
        }
    }
    if (!existence) callBack('分析HTML方法报错：没有对应的爬取地址')
}
