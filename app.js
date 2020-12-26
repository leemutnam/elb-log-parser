const path = require('path')
const fs = require('fs')
const parser = require('alb-log-parser')
const fns = require('date-fns')
const zlib = require('zlib')
const config = require('./config.json')

const localPath = path.resolve(config.localPath)

// 로컬 디렉토리의 파일 읽기
fs.readdirSync(localPath).forEach((file, index) => {
  if (file.indexOf('.zip') > 0) {
    // 압축 풀기
    const zipFile = path.join(localPath, file)
    const logFile = path.join(localPath, `${index}.log`)

    const fileContents = fs.createReadStream(zipFile)
    const writeStream = fs.createWriteStream(logFile)
    const unzip = zlib.createGunzip()
    fileContents.pipe(unzip).pipe(writeStream)

    // .zip 파일 제거
    fs.unlink(zipFile, (err) => {
      if (err) {
        console.log('===== ERROR: unlink =====')
        console.log(err)
      }
    })
  }

  if (file.indexOf('.log') > 0) {
    // 파일 읽기
    const logFilePath = path.join(localPath, file)
    const data = fs.readFileSync(logFilePath, { encoding: 'utf-8' })

    // 원하는 처리 로직 작성하는 곳!!
    data.split('\n').forEach(logText => {
      if (!logText.length) return

      try {
        // 한국 시간 추가
        const log = JSON.parse(JSON.stringify(parser(logText)))
        log.date = fns.addHours(fns.parseISO(log.timestamp), 9)

      } catch (error) {
        // 로그 형식이 맞지 않아 파싱이 안되는 경우가 존재
        console.log(logText)
      }
    })
  }
})
