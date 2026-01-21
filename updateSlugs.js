const mongoose = require('mongoose');
const slugify = require('slugify');
const Blog = require('./models/BlogModel');

mongoose.connect('mongodb://localhost:27017/digitaltriumph')
  .then(async () => {
    const blogs = await Blog.find();
    for (let blog of blogs) {
      blog.slug = slugify(blog.title, { lower: true, strict: true });
       blog.categorySlug = slugify(blog.categories, { lower: true, strict: true });
      await blog.save();
      console.log(`Updated slug for: ${blog.title}`);
    }
    console.log('All slugs updated');
    process.exit();
  })
  .catch(err => console.error(err));
