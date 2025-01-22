import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import EmailTemplate from '../models/emailTemplate.js';
import processTemplate from '../utils/templateProcessor.js';
import cloudinary from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const emailController = {
  // Get email layout
  getEmailLayout: async (req, res) => {
    try {
      const layoutPath = path.join(__dirname, '../templates/layout.html');
      const layout = await fs.readFile(layoutPath, 'utf8');
      res.json({ layout });
    } catch (error) {
      console.error('Error fetching layout:', error.message);
      res.status(500).json({ error: `Error fetching layout: ${error.message}` });
    }
  },


  getEmailById: async (req, res) => {
    try {
      const { id } = req.params;
      const emailTemplate = await EmailTemplate.findById(id);
  
      if (!emailTemplate) {
        return res.status(404).json({ error: 'Email template not found' });
      }
  
      res.status(200).json({ message: 'Email template fetched successfully', data: emailTemplate });
    } catch (error) {
      console.error('Error fetching email template:', error.message);
      res.status(500).json({ error: 'Error fetching email template' });
    }
  },
  
  
  // updateEmailById: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const { title, content, images, styles } = req.body;
  
  //     // Update the entry in the database
  //     const updatedTemplate = await EmailTemplate.findByIdAndUpdate(
  //       id,
  //       { title, content, images, styles },
  //       { new: true, runValidators: true } // Return the updated document and validate schema
  //     );
  
  //     if (!updatedTemplate) {
  //       return res.status(404).json({ error: 'Email template not found' });
  //     }
  
  //     res.status(200).json({ message: 'Email template updated successfully', data: updatedTemplate });
  //   } catch (error) {
  //     console.error('Error updating email template:', error.message);
  //     res.status(500).json({ error: 'Error updating email template' });
  //   }
  // },
  

  // Upload image to Cloudinary
  
  renderAndDownloadTemplate: async (req, res) => {
    try {
      const { id } = req.params;
      const template = await EmailTemplate.findById(id);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Process the template with actual data
      const renderedHtml = processTemplate(template);
      
      // Send the rendered HTML
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="email-template-${id}.html"`);
      res.send(renderedHtml);
    } catch (error) {
      console.error('Error rendering template:', error);
      res.status(500).json({ error: 'Error rendering template' });
    }
  },

  updateEmailById: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, images, styles } = req.body;

      // Get the existing template to preserve the layout
      const existingTemplate = await EmailTemplate.findById(id);
      if (!existingTemplate) {
        return res.status(404).json({ error: 'Email template not found' });
      }

      // Update the template
      const updatedTemplate = await EmailTemplate.findByIdAndUpdate(
        id,
        {
          title,
          content,
          images,
          styles,
          layout: existingTemplate.layout // Preserve the original layout
        },
        { new: true, runValidators: true }
      );

      res.status(200).json({ 
        message: 'Email template updated successfully', 
        data: updatedTemplate 
      });
    } catch (error) {
      console.error('Error updating email template:', error);
      res.status(500).json({ error: 'Error updating email template' });
    }
  },

  
  uploadImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'email-builder'
      });

      // Delete temporary file
      await fs.unlink(req.file.path);

      res.json({
        url: result.secure_url,
        public_id: result.public_id
      });
    } catch (error) {
      res.status(500).json({ error: 'Error uploading image' });
    }
  },

  // Save email configuration
  uploadEmailConfig: async (req, res) => {
    try {
      const { title, content, images, styles } = req.body;
      console.log(title, content, images, styles);

      // Convert content array to JSON string
      // const serializedContent = JSON.stringify(content);
      
      // Get the base layout
      const layoutPath = path.join(__dirname, '../templates/layout.html');
      const layout = await fs.readFile(layoutPath, 'utf8');

      const emailTemplate = new EmailTemplate({
        title,
        content,
        images,
        styles,
        layout
      });

      await emailTemplate.save();
      res.json({ message: 'Email template saved successfully', id: emailTemplate._id });
    } catch (error) {
      console.error('Error saving email template:', error.message);
      res.status(500).json({ error: 'Error saving email template' });
    }
  },

};

export default emailController;
