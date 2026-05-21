import { getPayload } from 'payload'
import config from '../payload.config'

async function run() {
  try {
    console.log('Initializing Payload CMS...')
    const payload = await getPayload({ config })
    console.log('Payload initialized. Querying house 33...')
    try {
      const house = await payload.findByID({
        collection: 'houses',
        id: 33,
      })
      console.log('House 33 found:', house.title);
    } catch (e: any) {
      console.log('House 33 fetch failed:', e.message);
    }

    console.log('Querying orders referencing house 33...')
    const orders = await payload.find({
      collection: 'orders',
      where: {
        house: {
          equals: 33,
        }
      }
    })
    console.log('Orders found:', orders.totalDocs);
    orders.docs.forEach((d: any) => {
      console.log(`- Order ID: ${d.id}, Customer: ${d.customerName}, Email: ${d.customerEmail}`);
    })

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

run()
