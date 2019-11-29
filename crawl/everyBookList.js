/** 爬取所有书籍目录方法集 */
const fs = require('fs')
const { getHtml } = require('./getHtml').api
const { analysisHtml } = require('./analysisHtml')
const { save } = require('./save')

exports.api = { allBookList, crawlNovel }

/** 爬取allBooks中所有书籍的目录
 * @param index 递归数
 * @param {Array<{name:string, address:string, novelOtherAddress:string, classOtherAddress:string, classArr:Array<any>}>} comparisonIndex
 * @param {Array<{name:string, author:string, id:string, className:string, classId:string}>} list
 * @param {(msg:string) => void} callBack
 */
function allBookList(index, comparisonIndex, list, callBack) {
    const li = list[index]
    if (!li) callBack('书籍目录爬取写入完成！')
    else {
        crawlNovel(li.name, comparisonIndex.address, comparisonIndex.novelOtherAddress + li.id, 'list', (success, msg) => {
            if (success) console.log(`爬取并写入${li.name}成功,${success}`)
            else {
                const newDate = new Date()
                const date = `${newDate.getFullYear()}${newDate.getMonth()}${newDate.getDate()} ${newDate.getHours()}${newDate.getMinutes()}${newDate.getSeconds()}`
                const debug = `爬取${comparisonIndex.address}源并写入${li.name}失败`
                fs.appendFileSync(`${__dirname}/../debug.txt`, `${date}：${debug}\n`)
                console.log(debug)
            }
            allBookList(index + 1, comparisonIndex, list, callBack)
        })
    }
}

/**
 * 爬取小说目录/内容
 * @param name 书籍名称
 * @param masterStation 主站地址
 * @param address 书籍路径/ID
 * @param {'list' | 'content' | 'intro'} type 爬取类型
 * @param callBack 回调程序
 */
function crawlNovel(name, masterStation, address, type, callBack, isUpdata, notSave) {
    if (!isUpdata && fs.existsSync(`${__dirname}/../books/${masterStation.split('://')[1]}/${name}`)) callBack(`${name}已存在，跳过下一本`)
    else {
        getHtml(name, masterStation, address, (err, html) => {
            if (err) callBack(false, err)
            else {
                console.log(masterStation + '：' + name + ' 的HTML已获取完成，开始解析。。。')
                analysisHtml(masterStation, name, html, type, (err, name, data) => {
                    if (err) console.log(err)
                    else {
                        console.log(masterStation + '：' + name + ' 的HTML已解析完成！')
                        switch (type) {
                            case 'content': {
                                callBack(true, name, data)
                                break
                            }
                            case 'list': {
                                if (!notSave) {
                                    const route = `${__dirname}/../books/${masterStation.split('://')[1]}/${name}`
                                    save(route, 'list.json', data, (success, msg) => {
                                        callBack(success, msg, data)
                                    })
                                } else {
                                    callBack(true, name, data)
                                }
                                break
                            }
                            case 'intro': {
                                if (!notSave) {
                                    const route = `${__dirname}/../books/${masterStation.split('://')[1]}/${name}`
                                    save(route, 'intro.json', data, (success, msg) => {
                                        callBack(success, msg, data)
                                    })
                                } else {
                                    callBack(true, name, data)
                                }
                                break
                            }
                            default: break
                        }
                    }
                })
            }
        })
    }
}
