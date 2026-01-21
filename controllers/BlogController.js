const createHttpError = require('http-errors');
const Blog = require('../models/BlogModel');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const slugify = require('slugify');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}



const blogs = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image required' });
    }
    const blog = new Blog({
      title: req.body.title,
      content: req.body.content,
      // author: req.body.author,
      categories: req.body.categories,
      slug: slugify(req.body.title, { lower: true, strict: true }),
      categorySlug: slugify(req.body.categories, { lower: true, strict: true }),
      image: `/uploads/${req.file.originalname}`,
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const blogAll = async (req, res) => {
  try {
    const blogsPost = await Blog.find().sort({ createdAt: -1 });
    res.json(blogsPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const blogUpadte = async (req, res, next) => {
  try {
    const updateData = {
      ...req.body,

    };
    if (req.file) {
      updateData.image = `/uploads/${req.file.originalname}`;
    }
    const updateBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updateBlog);
  } catch (err) {
    next(err);
  }
}

const blogDelete = async (req, res, next) => {
  try {
    await Blog.findByIdAndDelete(
      req.params.id,
    );
    res.json({ success: true, message: "Blog deleted" });

  } catch (error) {
    next(error);
  }
}

const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};
const getBlogBySlug = async (req, res, next) => {
  try {
    const { category, slug } = req.params;

    // Use stored categorySlug instead of recalculating
    const blog = await Blog.findOne({
      categorySlug: { $regex: new RegExp(`^${category}$`, 'i') },
      slug: { $regex: new RegExp(`^${slug}$`, 'i') }
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    next(err);
  }
};




module.exports = { blogAll, blogs, blogUpadte, blogDelete, getBlogBySlug, getBlogById }