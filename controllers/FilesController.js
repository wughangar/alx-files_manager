const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const FilesController = {
  postUpload: async (req, res) => {
    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing or invalid type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    try {
      if (parentId !== 0) {
        const parentFile = await dbClient.getFileById(parentId);
        if (!parentFile || parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent not found or not a folder' });
        }
      }

      const fileObject = {
        userId: req.user.id,
        name,
        type,
        parentId,
        isPublic,
      };

      if (type === 'folder') {
        const newFolder = await dbClient.createFile(fileObject);
        return res.status(201).json(newFolder);
      } else {
        const fileExtension = data.substring(data.indexOf('/') + 1, data.indexOf(';base64'));
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `${FOLDER_PATH}/${fileName}`;

        const fileBuffer = Buffer.from(data, 'base64');
        fs.writeFileSync(filePath, fileBuffer);

        fileObject.localPath = filePath;

        const newFile = await dbClient.createFile(fileObject);
        return res.status(201).json(newFile);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

module.exports = FilesController;
