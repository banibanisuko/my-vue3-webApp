import express from 'express'
import mysql from 'mysql'
import cors from 'cors'

const app = express()
app.use(cors())

const db = mysql.createConnection({
  host: 'mysql3101.db.sakura.ne.jp',
  user: 'yellowokapi2',
  password: 'Qawsedrftftgy5249',
  database: 'yellowokapi2_mamemochimi',
})

// MySQLに接続
db.connect(err => {
  if (err) {
    console.error('MySQL connection error: ' + err.stack)
    return
  }
  console.log('Connected to MySQL as ID ' + db.threadId)
})

// プロフィールデータを取得するエンドポイント
app.get('/api/profiles', (req, res) => {
  db.query('SELECT * FROM profile', (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    res.json(results) // JSON形式で結果を返す
  })
})

// サーバーを起動
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
