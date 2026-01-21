const express = require('express');
const router = express.Router();

const {
  blogAll,
  blogs,
  blogUpadte,
  blogDelete,
  getBlogBySlug,
  getBlogById
} = require('../controllers/BlogController');

const upload = require('../middleware/upload');

/* ✅ MOST SPECIFIC FIRST */
router.get('/blogs/:category/:slug', getBlogBySlug);

/* Collection */
router.get('/blogs', blogAll);

/* Single by ID */
router.get('/blogs/:id', getBlogById);

router.post('/blogs', upload.single('image'), blogs);
router.put('/blogs/:id', upload.single('image'), blogUpadte);
router.delete('/blogs/:id', blogDelete);

module.exports = router;
