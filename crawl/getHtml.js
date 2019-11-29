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
exports.getHtml = function (name, masterStation, address, callBack, ranks) {
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
    if (!ranks) ranks = 0
    if (ranks >= 3) return callBack(`重复请求已达${ranks}次，跳过`)
    let isTimeout = 0 // 0：初始 | 1：超时 | 2：成功
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
    console.log('开始爬取 ' + fullAddress + '：' + name)
    newHp.get(fullAddress, function (res) {
        if (isTimeout === 1) return
        else isTimeout = 2
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
    setTimeout(() => {
        if (isTimeout === 2) return
        else {
            isTimeout = 1
            this.getHtml(name, masterStation, address, (err, html) => {
                console.log('err：', err, ranks);
                callBack(err)
            }, ranks + 1)
        }
    }, 10000)
}
