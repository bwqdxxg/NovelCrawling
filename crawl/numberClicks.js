const fs = require('fs')
const { save } = require('./save')

/** 阅读量
 * @param {string} author 作者
 * @param {string} className 分类
 * @param {string} name 书名
 */
exports.api = { numberClicks, getNumberClicks }

function numberClicks(base) {
    const route = `${__dirname}/../books`
    const fullRoute = `${route}/numberClicks.json`
    let list = {}
    const { author, className, name, id } = base
    if (fs.existsSync(fullRoute)) list = fs.readFileSync(fullRoute).toString()
    if (list && Object.keys(list).length) list = JSON.parse(list)
    if (!list[className]) list = { [className]: [], ...list }
    const newList = list[className]
        .filter((v) => v.author === author && v.className === className && v.name === name && v.id === id)
    if (!newList || !newList.length) list[className] = [{ ...base, click: 1 }, ...list[className]]
    else newList[0].click++
    save(route, 'numberClicks.json', list, (success, msg) => {
        console.log(msg)
    })
}

function getNumberClicks(master) {
    const route = `${__dirname}/../books`
    const fullRoute = `${route}/numberClicks.json`
    let list = {}
    if (!fs.existsSync(fullRoute)) return list
    else {
        let returnList = {}
        list = fs.readFileSync(fullRoute).toString()
        if (!list) return list
        const newList = JSON.parse(list)
        const newListKeys = Object.keys(newList)
        for (let i = 0; i < newListKeys.length; i++) {
            const n = newList[newListKeys[i]]
            n.sort((a, b) => b.click - a.click)
            returnList[newListKeys[i]] = n
            for (let i2 = 0; i2 < n.length; i2++) {
                const introRoute = `${route}/${master}/${n[i2].name}/intro.json`
                if (fs.existsSync(introRoute)) {
                    const intro = fs.readFileSync(introRoute).toString()
                    const ri = returnList[newListKeys[i]][i2]
                    returnList[newListKeys[i]][i2] = { intro: { ...JSON.parse(intro) }, ...ri }
                }
            }
        }
        return returnList
    }
}
