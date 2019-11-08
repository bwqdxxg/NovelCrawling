const { save } = require('./save')
const { masterStationClassBooks, everyClassBooks, classBooks } = require('./everyClassBooks').api
const { allBookList, crawlNovel } = require('./everyBookList').api

// exports.api = { integration, masterStationClassBooksMethods, allBooksSaveLocalhost, crawlNovel, everyClassBooks, classBooks }

/** 爬取每个分类下所有书记列表=>爬取每个书籍的目录 */
function integration() {
    masterStationClassBooksMethods((msg, comparisonIndex, data) => {
        if (msg) console.log(msg)
        allBooksSaveLocalhost(comparisonIndex, data, (message) => {
            console.log(message)
        })
    })
}

/** 爬取每个分类下所有书籍列表 并存入到对应源文件夹的allBooks.json */
function masterStationClassBooksMethods(callBack) {
    masterStationClassBooks(0, (err, comparisonIndex, list) => {
        if (err) {
            callBack('全部分类下的所有书籍列表爬取完成！')
        } else {
            callBack(null, comparisonIndex, list)
            const route = `${__dirname}/../books/${comparisonIndex.address.split('://')[1]}`
            save(route, 'allBooks.json', list, (success, msg) => {
                console.log(msg)
            })
        }
    })
}

/** 爬取指定源和allBooks中所有书籍的目录到本地 */
function allBooksSaveLocalhost(comparisonIndex, list, callBack) {
    allBookList(0, comparisonIndex, list, (msg) => callBack(msg))
}

const fs = require('fs')
console.log(fs.existsSync('C:\\Users\\黑白\\Desktop\\test project\\GitHub\\NovelCrawling\\crawl/../books/m.x23us.com/'))
fs.unlinkSync('C:\\Users\\黑白\\Desktop\\test project\\GitHub\\NovelCrawling\\crawl/../books/m.x23us.com')

// masterStationClassBooksMethods((msg, comparisonIndex, data) => {
//     console.log(msg, comparisonIndex ? comparisonIndex.address : 'c', data ? data.slice(0, 20) : 'd')
// })
