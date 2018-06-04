const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/test')

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  writer: { type: String, required: true, default: 'Hossain Khademian' },
  published: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, required: true, default: Date.now },
})
const Book = mongoose.model('Book', bookSchema)

let book = new Book({
  title: `Book #${Math.round(1000 * Math.random())}`,
  writer: 'Saeed',
})
console.log(book.isNew)
book.save((err, res) => {
  if(err) {
    console.error('save: ', err)
    return process.exit(1)
  }
  console.log('Saved: ', res)
  console.log(book.isNew)
  
  Book.find({writer: /Sa/}, (err, res) => {
    if(err) {
      console.error('findOne: ', err)
      return process.exit(1)
    }
    console.log('found: ', res)

    Book.findOneAndRemove({title: /#1/}).then(res => {
      console.log('remove: ', res)      
      process.exit(0)
    }).catch(err => {
      process.error('remove:', err)
    })
  })
})