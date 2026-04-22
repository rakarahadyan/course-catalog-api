const prisma = require('../config/database');

const getAllTopics = async (req, res) => {
  try {
    const topics = await prisma.topics.findMany({
      include: {
        children: true,
        _count: { select: { courses: true } }
      },
      where: { parent_id: null },
      orderBy: { name: 'asc' }
    });
    
    res.status(200).json({
      success: true,
      data: topics
    });
  } catch (error) {
    console.error('Get All Topics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const getTopicById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const topic = await prisma.topics.findUnique({
      where: { id: parseInt(id) },
      include: {
        parent: true,
        children: true,
        courses: {
          include: {
            topic: true,
            language: true
          }
        },
        _count: { select: { courses: true } }
      }
    });
    
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic tidak ditemukan.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: topic
    });
  } catch (error) {
    console.error('Get Topic By Id Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const createTopic = async (req, res) => {
  try {
    const { name, description, parent_id } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name wajib diisi.'
      });
    }
    
    if (parent_id) {
      const parentExists = await prisma.topics.findUnique({
        where: { id: parent_id }
      });
      if (!parentExists) {
        return res.status(404).json({
          success: false,
          message: 'Parent topic tidak ditemukan.'
        });
      }
    }
    
    const topic = await prisma.topics.create({
      data: { name, description, parent_id },
      include: {
        parent: true,
        _count: { select: { courses: true } }
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Topic berhasil dibuat.',
      data: topic
    });
  } catch (error) {
    console.error('Create Topic Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parent_id } = req.body;
    
    const existingTopic = await prisma.topics.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingTopic) {
      return res.status(404).json({
        success: false,
        message: 'Topic tidak ditemukan.'
      });
    }
    
    if (parent_id) {
      const parentExists = await prisma.topics.findUnique({
        where: { id: parent_id }
      });
      if (!parentExists) {
        return res.status(404).json({
          success: false,
          message: 'Parent topic tidak ditemukan.'
        });
      }
    }
    
    const topic = await prisma.topics.update({
      where: { id: parseInt(id) },
      data: { name, description, parent_id },
      include: {
        parent: true,
        _count: { select: { courses: true } }
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Topic berhasil diupdate.',
      data: topic
    });
  } catch (error) {
    console.error('Update Topic Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingTopic = await prisma.topics.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: { select: { courses: true, children: true } }
      }
    });
    
    if (!existingTopic) {
      return res.status(404).json({
        success: false,
        message: 'Topic tidak ditemukan.'
      });
    }
    
    if (existingTopic._count.courses > 0) {
      return res.status(400).json({
        success: false,
        message: 'Topic tidak bisa dihapus karena masih memiliki kursus.'
      });
    }
    
    if (existingTopic._count.children > 0) {
      return res.status(400).json({
        success: false,
        message: 'Topic tidak bisa dihapus karena masih memiliki sub-topic.'
      });
    }
    
    await prisma.topics.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({
      success: true,
      message: 'Topic berhasil dihapus.'
    });
  } catch (error) {
    console.error('Delete Topic Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

module.exports = { getAllTopics, getTopicById, createTopic, updateTopic, deleteTopic };