# Business Card Manager

A professional business card management system with digital download capabilities, QR code sharing, and wallet integration placeholders.

## Features

### 🎴 Business Card Gallery
- Beautiful card gallery with luxury gold/black theme
- View all company business cards in one place
- Click on any card to see full details

### 📥 Download Options
- **PDF**: Download business card as PDF document
- **Image**: Download as PNG image for easy sharing
- **vCard**: Save contact information directly to phone contacts
- **QR Code**: Generate QR code for mobile sharing

### 💼 Digital Wallet (Coming Soon)
- **Apple Wallet**: Placeholder for Apple Wallet integration (requires Apple Developer credentials)
- **Google Wallet**: Placeholder for Google Wallet integration (requires Google Cloud credentials)

### 🔐 Admin Panel
- Password-protected admin access
- Add, edit, and delete business cards
- Upload custom card images
- Manage card details (name, title, company, contact info)

## Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **PDF Generation**: ReportLab
- **Image Processing**: Pillow
- **QR Codes**: python-qrcode

## Getting Started

### Access the App
- **Public Gallery**: https://wallet-cardhub.preview.emergentagent.com
- **Admin Panel**: https://wallet-cardhub.preview.emergentagent.com/admin/login

### Default Admin Credentials
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login for security!

## Usage Guide

### For Users (Employees)
1. Visit the public gallery to view all business cards
2. Click on your card to see details
3. Download your card in your preferred format:
   - **PDF**: For printing or email attachments
   - **Image**: For social media or digital sharing
   - **vCard**: To add to your phone contacts
   - **QR Code**: For quick mobile sharing

### For Admins
1. Go to `/admin/login` and enter your password
2. Click "Add New Card" to create a new business card
3. Fill in all details:
   - Full Name
   - Job Title
   - Company Name
   - Mobile Number
   - Email Address
   - Industry/Service Type
   - Upload card image (your custom design)
4. Edit or delete existing cards as needed

## API Endpoints

### Public Endpoints
- `GET /api/cards` - Get all business cards
- `GET /api/cards/{card_id}` - Get specific card
- `GET /api/cards/{card_id}/download/pdf` - Download as PDF
- `GET /api/cards/{card_id}/download/image` - Download as image
- `GET /api/cards/{card_id}/download/vcard` - Download vCard
- `GET /api/cards/{card_id}/qrcode` - Get QR code

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `POST /api/cards` - Create new card
- `PUT /api/cards/{card_id}` - Update card
- `DELETE /api/cards/{card_id}` - Delete card

## Current Cards

The system currently has 2 business cards:

1. **Fardan Jabir Tareen** - Head of IT
2. **Shayaan Shakeel Moidin Udupi** - Head of Music and Updates

## Future Enhancements

### Apple Wallet Integration
To enable Apple Wallet integration, you'll need:
- Apple Developer Account ($99/year)
- Pass Type ID
- Certificates and signing keys

### Google Wallet Integration
To enable Google Wallet integration, you'll need:
- Google Cloud Project
- Google Wallet API enabled
- Service account credentials

## Design Theme

The app uses a luxury business card aesthetic:
- **Colors**: Gold (#D4AF37) on dark background (#0a0a0a)
- **Typography**: Playfair Display (headings), Inter (body)
- **Style**: Professional, elegant, high-end

## Security Notes

1. Change the default admin password immediately
2. Admin authentication uses session storage
3. All API calls use HTTPS in production
4. Password is hashed using bcrypt

## Support

For issues or questions about adding the third business card or any other features, contact the development team.
