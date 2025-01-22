# Email Builder Backend

This is the backend of an email builder application. It provides APIs for managing email templates, uploading images, and rendering email content.

## Features

- **Email Template Management**: Create, update, and fetch email templates from MongoDB.
- **Image Uploads**: Upload images to Cloudinary for use in email templates.
- **Email Rendering**: Render and download email templates as HTML files.

## Project Structure
```
backend/
├── config/                
│   ├── cloudinary.js     
│   ├── db.js           
├── controllers/        
│   └── emailController.js
├── models/              
│   └── emailTemplate.js
├── routes/              
│   └── emailRoutes.js
├── templates/           
│   └── layout.html
├── uploads/            
├── utils/              
│   └── templateProcessor.js
├── .env               
├── .gitignore         
├── package.json       
├── server.js          
├── vercel.json    
```

## Getting Started

### Prerequisites
- Node.js
- MongoDB
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add:
```
MONGO_URI=<your-mongodb-connection-string>
CLOUDINARY_URL=<your-cloudinary-url>
```

4. Start the development server:
```bash
npm run dev
```

5. For production:
```bash
npm start
```

## API Endpoints

### GET /getEmailLayout
Fetches the base email layout.

### POST /uploadImage
Uploads an image to Cloudinary.
- Request Body: `FormData` with an image file.

### POST /uploadEmailConfig
Saves an email template to the database.

### GET /renderAndDownloadTemplate/:id
Renders and downloads an email template as an HTML file.

### GET /getEmailConfig/:id
Fetches a saved email template by its ID.

### PUT /updateEmailConfig/:id
Updates an existing email template.

## Deployment

This project is ready to be deployed on **Vercel**. Ensure your environment variables are configured in the Vercel dashboard.

1. Deploy using the Vercel CLI:
```bash
vercel
```

2. Alternatively, push the code to a GitHub repository and link it to Vercel.

## Contributing
Feel free to open issues or submit pull requests to improve the project.
