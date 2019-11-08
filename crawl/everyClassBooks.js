/** 爬取所有分类下书籍列表的方法集 */
const { getHtml } = require('./getHtml')
const { analysisHtml } = require('./analysisHtml')
const comparison = require('./comparison.json')

exports.api = { masterStationClassBooks, everyClassBooks, classBooks }

/** 爬取每个源每个分类下的所有书籍列表
 * @param index 分类/递归数
 * @param {Array<{"name": string, "id": string, "other": string, "maxPage": number}>} comparisonClassArr
 * @param list 最终将返回的列表
 * @param {(err:string, comparisonIndex, list) => void} callBack
 */
function masterStationClassBooks(index, callBack) {
    const comparisonIndex = comparison[index]
    if (!comparisonIndex) return callBack('爬取完成！')
    everyClassBooks(0, comparisonIndex, [], (err, list) => {
        if (err) {
            console.log(`爬取${comparisonIndex.address}源失败，错误：${err}，开始寻找下一个爬取源`)
        } else {
            callBack(null, comparisonIndex, list)
            console.log(`爬取${comparisonIndex.address}源完成，开始寻找下一个爬取源`)
        }
        masterStationClassBooks(index + 1, callBack)
    })
}


/** 爬取指定源每个分类下的所有书籍列表
 * @param index 分类/递归数
 * @param {Array<{name:string, address:string, novelOtherAddress:string, classOtherAddress:string, classArr:Array<any>}>} comparisonClassArr
 * @param list 最终将返回的列表
 * @param {(err:string, list) => void} callBack
 */
function everyClassBooks(index, comparisonClassArr, list, callBack) {
    const ci = comparisonClassArr[index]
    if (!ci) return callBack(null, list)
    classBooks(1, ci, address + ci.classOtherAddress, [], (err, list) => {
        if (err) callBack(err)
        else {
            const newlist = [...list, ...data]
            everyClassBooks(index + 1, comparisonClassArr, newlist, callBack)
        }
    })
}

/** 爬取指定分类下所有书籍列表
 * @param index 页数/递归数
 * @param {{"name": string, "id": string, "other": string, "maxPage": number}} comparisonClass
 * @param fullAddress 链接地址 如：https://xxx.com/class/
 * @param list 最终将返回的列表
 * @param {(err:string, list) => void} callBack
 */
function classBooks(index, comparisonClass, fullAddress, list, callBack) {
    if (index > comparisonClass) return callBack(null, list)
    getHtml(comparisonClass.name, fullAddress, comparisonClass.id + comparisonClass.other + index, (err, html) => {
        if (err) callBack(err)
        else {
            analysisHtml(masterStation, name, html, 'class', (err, name, data) => {
                if (err) callBack(name + err)
                else {
                    const newlist = [...list, ...data]
                    classBooks(index + 1, comparisonClass, fullAddress, newlist, callBack)
                }
            })
        }
    })
}
