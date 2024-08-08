import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const port = 8080

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})