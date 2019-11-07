/** 方法名要与analysis.js配置文件里的方法名相同 */

/** 顶点小说手机版 html解析
 * @param name 书籍名称
 * @param html
 * @param {'list'|'content'} type 爬取类型
 * @param {(err:string, name:string, data) => void} callBack 内容回调
 */
exports.ddxssjbHtml = function (name, html, type, callBack) {
    switch (type) {
        case 'content': {
            const content = html.split('<div class="txt" id="txt">')[1].split('</div>')[0]
            callBack(null, name, content)
            break
        }
        case 'list': {
            let list = []
            const htmlSplit = html.split('<li><span></span><a href="')
            for (let i = 1; i < htmlSplit.length; i++) {
                const hs = htmlSplit[i].split('">')
                const address = hs[0]
                const chapterName = hs[1].split('</a>')[0]
                list.push({ chapterName, address })
            }
            callBack(null, name, list)
            break
        }
        default: {
            callBack('没有对应类型的解析');
        }
    }
}