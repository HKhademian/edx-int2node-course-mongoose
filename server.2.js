const crypto = require('crypto')
const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectID = Schema.Types.ObjectID

const gravatarBase = 'https://secure.gravatar.com/avatar/'

mongoose.connect('mongodb://localhost/test')

const writerSchema = Schema({
  _id: false,
  name: { type: String, required: true },
  email: { type: String, required: true },
})

writerSchema.virtual('avatar')
  .get(function() {
    if(!this.email) return undefined
    const email = this.email.trim().toLowerCase()
    const hash = crypto.createHash('md5').update(email).digest('hex')
    return gravatarBase + hash
  })


const bookSchema = Schema({
  title: { type: String, required: true },
  writer: {
    type: writerSchema,
    required: true,
    default: () => ({ name: 'Hossain Khademian', email: 'hco@post.com' }),
  },
  published: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, required: true, default: Date.now },
  sellCount: { type: Number, required: true, default: 0 },
})

bookSchema.method({
  async buy(count, customer) {
    console.log(`Sell ${count} Books (${this.title}) to ${customer}`)
    this.sellCount += count
    return await this.save()
  },
  async refund(customer) {
    console.log(`Refund Book (${this.title}) from ${customer}`)
    this.sellCount--
    return await this.save()
  },
})
bookSchema.static({
  async getZeroSells() {
    return await []
  },
  async getBookSellById(id) {
    return (await this.findById(id)).sellCount
  },
})

bookSchema.pre('save', async function() {
  await console.log(`${this.id} is saving at ${Date.now()}!`)
})
bookSchema.post('save', async function() {
  await console.log(`${this.id} is saved at ${Date.now()}!`)
})

const Book = mongoose.model('Book', bookSchema)

async function main() {
  // let book1 = new Book({title: 'How to write NodeJS', writer: 'Hossain Khademian'})
  let book1 = new Book({ title: 'How to write NodeJS' })
  console.log('save book1:',
  await book1.save())

  console.log('javad buy 10 book1:',
  await book1.buy(10, 'Javad'))

  console.log('goli buy 3 book1:',
  await book1.buy(3, 'Goli'))

  console.log('soolmaz buy 5 book1:',
  await book1.buy(5, 'Soolmaz'))
  
 
  console.log('goli refund book1:',
  await book1.refund('Goli'))

  console.log('book1 sells',
  await Book.getBookSellById(book1.id))

  console.log('writer avatar: ', book1.writer.avatar)
}

main().then(process.exit).catch(console.error)