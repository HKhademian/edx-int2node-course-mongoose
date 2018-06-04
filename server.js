const crypto = require('crypto')
const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectID = Schema.Types.ObjectId

mongoose.connect('mongodb://localhost/test')

const userSchema = Schema({
  // _id: ObjectID,
  name: String,
  posts: [{ type: ObjectID, ref: 'Post' }],
})
userSchema.virtual('postList')
  .get(function() {
    return Post.find({ writer: this.id })
  })

userSchema.post('save', async function() {
  console.log(`User ${this.id} saved at ${Date.now()}`)
})

const postSchema = Schema({
  // _id: ObjectID,
  writer: { type: ObjectID, ref: 'User' },
  title: String,
  text: String,
})
postSchema.post('save', async function() {
  console.log(`Post ${this.id} of writer ${this.writer.id} saved at ${Date.now()}`)
})

const Post = mongoose.model('Post', postSchema)
const User = mongoose.model('User', userSchema)

function* range(from, to) {
  for(let i=from; i<to; i++)
    yield i
}
// function* map(iterable, mapFunc) {
//   for (let x of iterable) 
//     yield mapFunc(x)
// }
// function* filter(iterable, filterFunc) {
//   for (let x of iterable)
//     if (filterFunc(x)) 
//       yield x
// }
(function() {
  const Generator = Object.getPrototypeOf(function* () {});
  
  Generator.prototype.map = function* (mapper, thisArg) {
    let index = 0
    for (const value of this)
      yield mapper.call(thisArg, value, index++)
  }

  Generator.prototype.filter = function* (filter, thisArg) {
    let index = 0
    for (let value of this)
      if (filter.call(thisArg, value, index++))
        yield val
  }
})()

async function generate() {
  let userCount = 10 + Math.round(25 * Math.random())
  await Promise.all(range(1, userCount).map(i => {
    let user = new User({ name: `User #${i}` })
    return user.save().then(user => {
      let postCount = 10 + Math.round(25 * Math.random())
      return Promise.all(range(1, postCount).map(j => {
        return new Post({
          title: `Post ${j+1} of user #${user.id}`,
          text: `Post #${j+1} long long text`,
          writer: user })
        .save()
      }))
    })
  }))
}

async function main() {
  if(await Post.count() <= 0)
    await generate()
  
  console.log('an User:', await User.findById('5b146c7451fd8605a4540e45').populate('posts'))
  console.log('a Post:', await Post.findOne().populate('writer'))

  //let user = await User.findById('5b146c7451fd8605a4540e45')
  //console.log('posts:', await user.posts)
}

main().then(process.exit).catch(console.error)