/** 方法名要与analysis.js配置文件里的方法名相同 */

/** 顶点小说手机版 html解析 */
exports.ddxssjbHtml = function (name, html, callBack) {
    let list = []
    const htmlSplit = html.split('<li><span></span><a href="')
    for (let i = 1; i < htmlSplit.length; i++) {
        const hs = htmlSplit[i].split('">')
        const address = hs[0]
        const chapterName = hs[1].split('</a>')[0]
        list.push({ chapterName, address })
    }
    callBack(null, name, list)
}