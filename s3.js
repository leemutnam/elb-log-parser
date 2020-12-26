const path = require('path')
const fs = require('fs')
const AWS = require('aws-sdk')
const config = require('./config.json')

AWS.config.update({ accessKeyId: config.awsKey, secretAccessKey: config.awsSecret })

const params = {
  Bucket: config.bucketName,
  Prefix: config.prefix
}

const s3 = new AWS.S3()

const localPath = path.resolve(config.localPath)

// 다운로드 경로가 있는지 체크
if (!fs.existsSync(localPath)) {
  fs.mkdirSync(localPath)
}

// 버켓에 있는 객체들 가져오기
s3.listObjects(params, async (err, data) => {
  if (err) {
    console.log('===== ERROR: listObjects =====')
    console.log(err)
    return
  }

  if (!data.Contents.length) return console.log('===== EMPTY =====')

  // 가져온 객체의 파라미터 생성
  const params = await data.Contents.map(fileObj => {
    return {
      Bucket: config.bucketName,
      Key: fileObj.Key
    }
  })

  // 파라미터 정보로 파일 다운로드 하기
  for ([index, param] of params.entries()) {
    const tempFileName = path.join(localPath, `${index}.zip`)
    const tempFileDownload = fs.createWriteStream(tempFileName)

    s3.getObject(param).createReadStream().pipe(tempFileDownload)
  }
})
