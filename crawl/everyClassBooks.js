/** 爬取所有分类下书籍列表的方法集 */
const fs = require('fs')
const { getHtml } = require('./getHtml').api
const { analysisHtml } = require('./analysisHtml')
const comparison = require('../comparison.json')

exports.api = { masterStationClassBooks, everyClassBooks, classBooks }

/** 爬取每个源每个分类下的所有书籍列表
 * @param index 源/递归数
 * @param {(err:string, comparisonIndex, list) => void} callBack
 */
function masterStationClassBooks(index, callBack) {
    const comparisonIndex = comparison[index]
    if (!comparisonIndex) return callBack('爬取完成！')
    everyClassBooks(0, comparisonIndex, [], (err, list) => {
        if (err) {
            const debug = `爬取每个分类下书籍列表：${comparisonIndex.address}源失败，错误：${err}，寻找下一个爬取源`
            const newDate = new Date()
            const date = `${newDate.getFullYear()}${newDate.getMonth()}${newDate.getDate()} ${newDate.getHours()}${newDate.getMinutes()}${newDate.getSeconds()}`
            fs.appendFileSync(`${__dirname}/../debug.txt`, `${date}：${debug}\n`)
            console.log(debug)
        } else {
            callBack(null, comparisonIndex, list)
            console.log(`爬取${comparisonIndex.address}源完成，开始寻找下一个爬取源`)
        }
        masterStationClassBooks(index + 1, callBack)
    })
}


/** 爬取指定源每个分类下的所有书籍列表
 * @param index 分类/递归数
 * @param {Array<{name:string, address:string, novelOtherAddress:string, classOtherAddress:string, classArr:Array<any>}>} comparisonIndex
 * @param list 最终将返回的列表
 * @param {(err:string, list) => void} callBack
 */
function everyClassBooks(index, comparisonIndex, list, callBack) {
    const ci = comparisonIndex.classArr[index]
    if (!ci) callBack(null, list)
    else {
        classBooks(1, comparisonIndex.address, ci, comparisonIndex.address + comparisonIndex.classOtherAddress, [], (err, data) => {
            if (err) callBack(err)
            else {
                const newlist = [...list, ...data]
                everyClassBooks(index + 1, comparisonIndex, newlist, callBack)
            }
        })
    }
}

/** 爬取指定分类下所有书籍列表
 * @param index 页数/递归数
 * @param masterStation 源（爬取的主站地址）
 * @param {{"name": string, "id": string, "other": string, "lastOther": string, "maxPage": number}} comparisonClass
 * @param fullAddress 链接地址 如：https://xxx.com/class/
 * @param list 最终将返回的列表
 * @param {(err:string, list) => void} callBack
 */
function classBooks(index, masterStation, comparisonClass, fullAddress, list, callBack) {
    if (index > comparisonClass.maxPage) callBack(null, list)
    else {
        const address = comparisonClass.id + comparisonClass.other + index + comparisonClass.lastOther
        getHtml(`${comparisonClass.name} 第${index}页`, fullAddress, address, (err, html) => {
            if (err) {
                callBack(err)
                classBooks(index + 1, masterStation, comparisonClass, fullAddress, list, callBack)
            } else {
                analysisHtml(masterStation, comparisonClass.name, html, 'class', (err, name, data) => {
                    if (err) callBack(name + err)
                    else {
                        const newlist = [...list, ...data]
                        classBooks(index + 1, masterStation, comparisonClass, fullAddress, newlist, callBack)
                    }
                })
            }
        })
    }
}
