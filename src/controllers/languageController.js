const prisma = require('../config/database');

const getAllLanguages = async (req, res) => {
  try {
    const languages = await prisma.languages.findMany({
      include: {
        _count: { select: { courses: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    res.status(200).json({
      success: true,
      data: languages
    });
  } catch (error) {
    console.error('Get All Languages Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const getLanguageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const language = await prisma.languages.findUnique({
      where: { id: parseInt(id) },
      include: {
        courses: {
          include: {
            topic: true
          }
        },
        _count: { select: { courses: true } }
      }
    });
    
    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Language tidak ditemukan.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: language
    });
  } catch (error) {
    console.error('Get Language By Id Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const createLanguage = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name wajib diisi.'
      });
    }
    
    const existingLanguage = await prisma.languages.findUnique({
      where: { name }
    });
    
    if (existingLanguage) {
      return res.status(409).json({
        success: false,
        message: 'Language sudah ada.'
      });
    }
    
    const language = await prisma.languages.create({
      data: { name },
      include: {
        _count: { select: { courses: true } }
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Language berhasil dibuat.',
      data: language
    });
  } catch (error) {
    console.error('Create Language Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const existingLanguage = await prisma.languages.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingLanguage) {
      return res.status(404).json({
        success: false,
        message: 'Language tidak ditemukan.'
      });
    }
    
    if (name && name !== existingLanguage.name) {
      const nameExists = await prisma.languages.findUnique({ where: { name } });
      if (nameExists) {
        return res.status(409).json({
          success: false,
          message: 'Nama language sudah digunakan.'
        });
      }
    }
    
    const language = await prisma.languages.update({
      where: { id: parseInt(id) },
      data: { name },
      include: {
        _count: { select: { courses: true } }
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Language berhasil diupdate.',
      data: language
    });
  } catch (error) {
    console.error('Update Language Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingLanguage = await prisma.languages.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: { select: { courses: true } }
      }
    });
    
    if (!existingLanguage) {
      return res.status(404).json({
        success: false,
        message: 'Language tidak ditemukan.'
      });
    }
    
    if (existingLanguage._count.courses > 0) {
      return res.status(400).json({
        success: false,
        message: 'Language tidak bisa dihapus karena masih memiliki kursus.'
      });
    }
    
    await prisma.languages.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({
      success: true,
      message: 'Language berhasil dihapus.'
    });
  } catch (error) {
    console.error('Delete Language Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

module.exports = { getAllLanguages, getLanguageById, createLanguage, updateLanguage, deleteLanguage };