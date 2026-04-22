const prisma = require('../config/database');

const getAllCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      topic_id,
      language_id,
      level,
      min_price,
      max_price,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { short_description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (topic_id) where.topic_id = parseInt(topic_id);
    if (language_id) where.language_id = parseInt(language_id);
    if (level) where.level = level.toUpperCase();
    
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price.gte = parseFloat(min_price);
      if (max_price) where.price.lte = parseFloat(max_price);
    }
    
    const orderBy = {};
    const validSortFields = ['created_at', 'updated_at', 'title', 'price'];
    if (validSortFields.includes(sort_by)) {
      orderBy[sort_by] = sort_order.toLowerCase() === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.created_at = 'desc';
    }
    
    const [courses, total] = await Promise.all([
      prisma.courses.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy,
        include: {
          topic: { select: { id: true, name: true } },
          language: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } }
        }
      }),
      prisma.courses.count({ where })
    ]);
    
    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get All Courses Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await prisma.courses.findUnique({
      where: { id: parseInt(id) },
      include: {
        topic: true,
        language: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course tidak ditemukan.'
      });
    }
    
    const discountedPrice = course.price * (1 - course.discount_rate / 100);
    
    res.status(200).json({
      success: true,
      data: {
        ...course,
        discounted_price: parseFloat(discountedPrice.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get Course By Id Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const createCourse = async (req, res) => {
  try {
    const {
      topic_id,
      language_id,
      title,
      description,
      short_description,
      price,
      discount_rate,
      thumbnail_url,
      level
    } = req.body;
    
    const requiredFields = ['topic_id', 'language_id', 'title', 'description', 
                           'short_description', 'price', 'discount_rate', 
                           'thumbnail_url', 'level'];
    
    for (const field of requiredFields) {
      if (!req.body[field] && req.body[field] !== 0) {
        return res.status(400).json({
          success: false,
          message: `${field} wajib diisi.`
        });
      }
    }
    
    const validLevels = ['ALL_LEVEL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCE'];
    if (!validLevels.includes(level.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Level harus salah satu dari: ${validLevels.join(', ')}`
      });
    }
    
    const topicExists = await prisma.topics.findUnique({
      where: { id: topic_id }
    });
    if (!topicExists) {
      return res.status(404).json({
        success: false,
        message: 'Topic tidak ditemukan.'
      });
    }
    
    const languageExists = await prisma.languages.findUnique({
      where: { id: language_id }
    });
    if (!languageExists) {
      return res.status(404).json({
        success: false,
        message: 'Language tidak ditemukan.'
      });
    }
    
    const course = await prisma.courses.create({
      data: {
        topic_id,
        language_id,
        created_by_id: req.user.id,
        title,
        description,
        short_description,
        price: parseFloat(price),
        discount_rate: parseFloat(discount_rate),
        thumbnail_url,
        level: level.toUpperCase()
      },
      include: {
        topic: { select: { id: true, name: true } },
        language: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } }
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Course berhasil dibuat.',
      data: course
    });
  } catch (error) {
    console.error('Create Course Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      topic_id,
      language_id,
      title,
      description,
      short_description,
      price,
      discount_rate,
      thumbnail_url,
      level
    } = req.body;
    
    const existingCourse = await prisma.courses.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course tidak ditemukan.'
      });
    }
    
    if (level) {
      const validLevels = ['ALL_LEVEL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCE'];
      if (!validLevels.includes(level.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: `Level harus salah satu dari: ${validLevels.join(', ')}`
        });
      }
    }
    
    if (topic_id) {
      const topicExists = await prisma.topics.findUnique({
        where: { id: topic_id }
      });
      if (!topicExists) {
        return res.status(404).json({
          success: false,
          message: 'Topic tidak ditemukan.'
        });
      }
    }
    
    if (language_id) {
      const languageExists = await prisma.languages.findUnique({
        where: { id: language_id }
      });
      if (!languageExists) {
        return res.status(404).json({
          success: false,
          message: 'Language tidak ditemukan.'
        });
      }
    }
    
    const course = await prisma.courses.update({
      where: { id: parseInt(id) },
      data: {
        topic_id,
        language_id,
        title,
        description,
        short_description,
        price: price ? parseFloat(price) : undefined,
        discount_rate: discount_rate ? parseFloat(discount_rate) : undefined,
        thumbnail_url,
        level: level ? level.toUpperCase() : undefined
      },
      include: {
        topic: { select: { id: true, name: true } },
        language: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } }
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Course berhasil diupdate.',
      data: course
    });
  } catch (error) {
    console.error('Update Course Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingCourse = await prisma.courses.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course tidak ditemukan.'
      });
    }
    
    await prisma.courses.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({
      success: true,
      message: 'Course berhasil dihapus.'
    });
  } catch (error) {
    console.error('Delete Course Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };