const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          _count: { select: { courses: true } }
        },
        orderBy: { id: 'asc' }
      }),
      prisma.users.count({ where })
    ]);
    
    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.users.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        courses: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get User By Id Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, dan password wajib diisi.'
      });
    }
    
    if (role && !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role harus USER atau ADMIN.'
      });
    }
    
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar.'
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER'
      },
      select: { id: true, name: true, email: true, role: true }
    });
    
    res.status(201).json({
      success: true,
      message: 'User berhasil dibuat.',
      data: user
    });
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }
    
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.users.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah digunakan oleh user lain.'
        });
      }
    }
    
    if (role && !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role harus USER atau ADMIN.'
      });
    }
    
    const user = await prisma.users.update({
      where: { id: parseInt(id) },
      data: { name, email, role },
      select: { id: true, name: true, email: true, role: true }
    });
    
    res.status(200).json({
      success: true,
      message: 'User berhasil diupdate.',
      data: user
    });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }
    
    await prisma.users.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({
      success: true,
      message: 'User berhasil dihapus.'
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };