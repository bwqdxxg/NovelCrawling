/** 获取HTML */
const url = require('url')
const http = require('http')
const https = require('https')
const iconv = require('iconv-lite')

/**
 * 获取指定源的HTML
 * @param name 爬取对象名称
 * @param masterStation 主站地址
 * @param address 后续路径
 * @param {(err:string, html:string) => void} callBack 回调程序
 */
exports.getHtml = function (name, masterStation, address, callBack) {
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
    let isTimeout = false
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
    const timeOut = setTimeout(() => {
        isTimeout = true
        callBack(`获取${masterStation}：${name}资源超时！`)
    }, 5000)
    newHp.get(fullAddress, function (res) {
        if (timeOut) clearTimeout(timeOut)
        if (isTimeout) return
        let chunks = []
        res.on('data', function (data) {
            chunks.push(data)
        })
        res.on('end', function () {
            // 解决乱码问题
            const html = iconv.decode(Buffer.concat(chunks), 'gb2312')
            callBack(null, html)
        })
    }).on('error', function () {
        callBack('获取资源出错！')
    })
}
