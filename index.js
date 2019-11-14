const crawlApi = require('./crawl').api
const { readNovel } = require('./load')

/**
 * 程序：
 * 1.所有书籍由服务器上的node程序定时爬取所有配置源所得，并存于服务器上（不爬取书本内容）
 * 2.进入书籍目录或内容页面，根据当前使用源在服务器上查找并返回目录或内容（进入书籍页面自动使用第一个源或上次使用的源）
 * 3.服务器只存全部书籍的ID，目录或章节的内容临时爬取后返回
 * 4.手动缓存指定源的书籍，是将当前爬取的文本内容或目录内容发往手机并调用手机API存储于指定文件夹内
 * 4.1.读取缓存，是读取缓存的目录或内容文件
 * 5.每个源的解析方式都不同，所以每个源都有单独的解析模块
 * 6.每周或半月重新爬取一次，将本地没有的对应源的书籍ID信息爬取下来
 * 页面组成部分：
 * 1.个人书架/书城/我的（暂定）
 * 2.点击书籍=》书籍介绍（书籍封面/介绍/加入书架/其他书籍推荐/全本缓存/阅读/目录）
 * 3.【书籍封面/介绍/加入书架/其他书籍推荐】使用自己的；【全本缓存/阅读/目录】使用对应源头爬取的
 */

function masterStationClassBooksMethods() {
    crawlApi.masterStationClassBooksMethods((msg, comparisonIndex, data) => {
        if (msg) console.log(msg)
    })
}

function masterStationClassBooksMethods() {
    crawlApi.masterStationClassBooksMethods((msg) => {
        console.log(msg)
    })
}

function allBookList() {
    const comparison = require('./comparison.json')
    const list = require('./books/m.x23us.com/allBooks.json')
    crawlApi.allBookList(0, comparison[0], list, (msg) => console.log(msg))
}

function crawl(name, masterStation, address, type, isUpdata, noSave) {
    crawl.crawlNovel(name, masterStation, address, type, (success, name, data) => {
        if (!success) console.log('爬取失败')
    }, isUpdata, noSave)
}

function read(name, masterStation, callBack) {
    readNovel(name, masterStation, (err, data) => {
        if (err) {
            console.log(err)
            callBack()
        } else callBack(data)
    })
}

// const argv = process.argv
// const cs = comparison[0]
// if (argv[2] === 'crawl') {
//     crawl('仙逆', cs.address, cs.otherAddress + '0/352/10299759.html', 'content')
// } else if (argv[2] === 'load') {
//     read(argv[3], cs.address)
// }
