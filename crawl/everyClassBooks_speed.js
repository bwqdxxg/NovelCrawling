/** 爬取所有分类下书籍列表的方法集 */
const fs = require('fs')
const { getHtml } = require('./getHtml')
const { analysisHtml } = require('./analysisHtml')
const comparison = require('../comparison.json')

exports.api = { masterStationClassBooks, everyClassBooks, classBooks }

/** 爬取每个源每个分类下的所有书籍列表
 * @param index 源/递归数
 * @param {(err:string, comparisonIndex, list) => void} callBack
 */
function masterStationClassBooks(index, callBack) {
    const comparisonIndex = comparison[index]
    if (!comparisonIndex) callBack('爬取完成！')
    else {
        everyClassBooks(0, comparisonIndex, (err, list) => {
            if (err) {
                const debug = `爬取${comparisonIndex.address}源失败，错误：${err}，开始寻找下一个爬取源`
                fs.appendFileSync(`${__dirname}/../debug.txt`, `${new Date()}：${debug}\n`)
                console.log(debug)
            } else {
                callBack(null, comparisonIndex, list)
                console.log(`爬取${comparisonIndex.address}源完成，开始寻找下一个爬取源`)
            }
            masterStationClassBooks(index + 1, callBack)
        })
    }
}


/** 爬取指定源每个分类下的所有书籍列表
 * @param index 分类/递归数
 * @param {Array<{name:string, address:string, novelOtherAddress:string, classOtherAddress:string, classArr:Array<any>}>} comparisonIndex
 * @param {(err:string, list) => void} callBack
 */
let everyClassBooksList = { list: [], num: 0 } // 用于返回数据的临时存储空间
function everyClassBooks(index, comparisonIndex, callBack) {
    const ci = comparisonIndex.classArr[index]
    // 根据分类创建对应的临时存储空间
    if (index === 0) {
        everyClassBooksList[`${comparisonIndex.address}classArr${comparisonIndex.classArr[index]}`] = { list: [], num: 0 }
    }
    classBooks(1, comparisonIndex.address, ci, comparisonIndex.address + comparisonIndex.classOtherAddress, (err, data) => {
        everyClassBooksList[`${comparisonIndex.address}classArr${comparisonIndex.classArr[index]}`].num++
        if (err) callBack(err)
        else {
            // 组合每个分类的所有列表
            everyClassBooksList[`${comparisonIndex.address}classArr${comparisonIndex.classArr[index]}`].list = [...everyClassBooksList[`${comparisonIndex.address}classArr${comparisonIndex.classArr[index]}`].list, ...data]
            // 返回的分类数等于请求的分类数 就代表该源已经完成所有分类的数据爬取
            if (!comparisonIndex.classArr[everyClassBooksList[`${comparisonIndex.address}classArr${comparisonIndex.classArr[index]}`].num]) {
                // 返回数据
                callBack(null, everyClassBooksList[`${comparisonIndex.address}classArr${comparisonIndex.classArr[index]}`].list)
                // 删除完成的临时存储空间
                delete everyClassBooksList[`${comparisonIndex.address}classArr${comparisonIndex.classArr[index]}`]
            }
        }
    })
    if (comparisonIndex.classArr[index + 1]) everyClassBooks(index + 1, comparisonIndex, callBack)
}

/** 爬取指定分类下所有书籍列表
 * @param index 页数/递归数
 * @param masterStation 源（爬取的主站地址）
 * @param {{"name": string, "id": string, "other": string, "lastOther": string, "maxPage": number}} comparisonClass
 * @param fullAddress 链接地址 如：https://xxx.com/class/
 * @param {(err:string, list) => void} callBack
 */
let classBooksList = {} // 用于返回数据的临时存储空间
function classBooks(index, masterStation, comparisonClass, fullAddress, callBack) {
    // 根据分类创建对应的临时存储空间
    if (index === 1) {
        classBooksList[`${masterStation + comparisonClass.id}`] = { list: [], num: 0 }
    }
    // 后续完整路径
    const address = comparisonClass.id + comparisonClass.other + index + comparisonClass.lastOther
    // 请求HTML
    getHtml(`${comparisonClass.name} 第${index}页`, fullAddress, address, (err, html) => {
        classBooksList[`${masterStation + comparisonClass.id}`].num++
        if (err) callBack(err)
        else {
            // 分析HTML
            analysisHtml(masterStation, comparisonClass.name, html, 'class', (err, name, data) => {
                if (err) callBack(name + err)
                else {
                    // 组合该分类下每页的数据列表
                    classBooksList[`${masterStation + comparisonClass.id}`].list = [...classBooksList[`${masterStation + comparisonClass.id}`].list, ...data]
                    // 返回的页数总和大于等于分类的最大页数 就代表已经完成该源该分类下所有页的数据爬取
                    if (classBooksList[`${masterStation + comparisonClass.id}`].num >= comparisonClass.maxPage) {
                        // 返回数据
                        callBack(null, classBooksList[`${masterStation + comparisonClass.id}`].list)
                        // 删除完成的临时存储空间
                        delete classBooksList[`${masterStation + comparisonClass.id}`]
                    }
                }
            })
        }
    })
    if (index < comparisonClass.maxPage) classBooks(index + 1, masterStation, comparisonClass, fullAddress, callBack)
}

masterStationClassBooks(0, (msg) => console.log(msg))