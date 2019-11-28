const fs = require('fs')
const { save } = require('./save')

/** 阅读量
 * @param {string} author 作者
 * @param {string} className 分类
 * @param {string} name 书名
 */
exports.api = { numberClicks }

function numberClicks(author, className, name) {
    const route = `${__dirname}/../books`
    const fullRoute = `${route}/numberClicks.json`
    let list
    if (fs.existsSync(fullRoute)) list = fs.readFileSync(fullRoute).toString()
    if (list) list = JSON.parse(list)
    else list = {}
    const an = `${author}@${className}@${name}`
    if (!list[an]) list[an] = { class: className, author, name, click: 1 }
    else list[an].click++
    save(route, 'numberClicks.json', list, (success, msg) => {
        console.log(msg)
    })
}
