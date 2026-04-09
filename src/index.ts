import 'dotenv/config'
import app from './config/express'

const PORT = process.env.PORT || 3000

if (process.env.NODE_ENV === "dev") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export default app;
