/** 分析HTML方法集（方法名要与analysis.js配置文件里的方法名相同） */
const { analysisConfig } = require('../analysis')

const analysisHtmlMethods = { ddxssjbHtml }

/** 分析HTML
 * @param masterStation 主站地址
 * @param name 书籍名称
 * @param html
 * @param {'allClass' | 'classMaxPage' | 'class' | 'list' | 'content'} type 爬取类型
 * @param {(err:string, name:string, data) => void} callBack
 */
exports.analysisHtml = function (masterStation, name, html, type, callBack) {
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


/** 顶点小说手机版 html解析
 * @param name 书籍/分类名称
 * @param html
 * @param {'allClass' | 'classMaxPage' | 'class' | 'list' | 'content'} type 爬取类型
 * @param {(err:string, name:string, data) => void} callBack 内容回调
 */
function ddxssjbHtml(name, html, type, callBack) {
    switch (type) {
        // 分类下文章列表
        case 'class': {
            let list = []
            const htmlSplit = html.split('<p class="line"><a href="/html/')
            const classId = html.split('state "><a href="/class/')[1].split('_')[0] // 分类ID
            for (let i = 1; i < htmlSplit.length; i++) {
                const hs = htmlSplit[i].split('" class="blue">')
                const address = hs[0] // id
                const chapterName = hs[1].split('</a>')[0] // 书名
                const author = hs[1].split('<a href="/author/')[1].split('">')[0] // 作者
                list.push({ name: chapterName, id: address, author, className: name, classId })
            }
            callBack(null, name, list)
            break
        }
        // 文章内容
        case 'content': {
            const content = html.split('<div class="txt" id="txt">')[1].split('</div>')[0]
            callBack(null, name, content)
            break
        }
        // 文章目录
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
