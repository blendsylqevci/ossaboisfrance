import { getPayload } from 'payload'
import config from '../payload.config'

async function run() {
  try {
    console.log('Initializing Payload CMS...')
    const payload = await getPayload({ config })
    console.log('Payload initialized. Querying house categories...')
    const categories = await payload.find({
      collection: 'house-categories',
      locale: 'all',
    })
    console.log('Categories found:', JSON.stringify(categories, null, 2))
    process.exit(0)
  } catch (error) {
    console.error('Error connecting to database:', error)
    process.exit(1)
  }
}

run()
