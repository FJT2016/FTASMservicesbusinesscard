from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Response
from fastapi.responses import StreamingResponse, FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import io
import base64

# PDF and Image generation
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image, ImageDraw, ImageFont
import qrcode

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Admin password hash (default: "admin123" - user should change this)
DEFAULT_ADMIN_PASSWORD = "admin123"

# Models
class BusinessCard(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    title: str
    company: str
    mobile: str
    email: str
    industry: str
    card_image_data: str  # base64 encoded image
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BusinessCardCreate(BaseModel):
    name: str
    title: str
    company: str
    mobile: str
    email: str
    industry: str
    card_image_data: str

class BusinessCardUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    industry: Optional[str] = None
    card_image_data: Optional[str] = None

class AdminLogin(BaseModel):
    password: str

class AdminResponse(BaseModel):
    success: bool
    message: str

# Helper Functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def generate_qr_code(data: str) -> bytes:
    """Generate QR code image"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return buffer.getvalue()

def generate_vcard(card: dict) -> str:
    """Generate vCard format for contact"""
    vcard = f"""BEGIN:VCARD
VERSION:3.0
FN:{card['name']}
ORG:{card['company']}
TITLE:{card['title']}
TEL;TYPE=CELL:{card['mobile']}
EMAIL:{card['email']}
NOTE:{card['industry']}
END:VCARD"""
    return vcard

def create_card_pdf(card: dict) -> bytes:
    """Generate PDF of business card"""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Card dimensions (standard business card: 3.5" x 2")
    card_width = 3.5 * inch
    card_height = 2 * inch
    x = (width - card_width) / 2
    y = height - card_height - 2*inch
    
    # Draw card background
    c.setFillColorRGB(0.1, 0.1, 0.1)  # Dark background
    c.rect(x, y, card_width, card_height, fill=1, stroke=0)
    
    # Draw gold border
    c.setStrokeColorRGB(0.8, 0.7, 0.2)  # Gold color
    c.setLineWidth(3)
    c.rect(x + 10, y + 10, card_width - 20, card_height - 20, fill=0, stroke=1)
    
    # Add text
    c.setFillColorRGB(0.8, 0.7, 0.2)  # Gold text
    
    # Name
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width/2, y + card_height - 40, card['name'])
    
    # Title
    c.setFont("Helvetica", 10)
    c.drawCentredString(width/2, y + card_height - 60, card['title'])
    
    # Company
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width/2, y + card_height - 90, card['company'])
    
    # Contact info
    c.setFont("Helvetica", 8)
    c.drawString(x + 30, y + 40, f"Mobile: {card['mobile']}")
    c.drawString(x + 30, y + 28, f"Email: {card['email']}")
    c.drawString(x + card_width - 150, y + 28, f"Industry: {card['industry']}")
    
    c.save()
    buffer.seek(0)
    return buffer.getvalue()

def create_card_image(card: dict) -> bytes:
    """Generate PNG image of business card"""
    # Create image with business card dimensions
    width, height = 1050, 600  # 3.5" x 2" at 300 DPI
    img = Image.new('RGB', (width, height), color=(25, 25, 25))
    draw = ImageDraw.Draw(img)
    
    # Draw gold border
    border_color = (204, 178, 51)  # Gold
    border_width = 8
    draw.rectangle(
        [(border_width, border_width), (width - border_width, height - border_width)],
        outline=border_color,
        width=border_width
    )
    
    # Add text (using default font)
    try:
        name_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
        company_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 42)
        contact_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
    except:
        name_font = title_font = company_font = contact_font = ImageFont.load_default()
    
    text_color = (204, 178, 51)  # Gold
    
    # Name
    draw.text((width/2, 100), card['name'], fill=text_color, font=name_font, anchor="mm")
    
    # Title
    draw.text((width/2, 170), card['title'], fill=text_color, font=title_font, anchor="mm")
    
    # Company
    draw.text((width/2, 280), card['company'], fill=text_color, font=company_font, anchor="mm")
    
    # Contact info
    draw.text((80, 480), f"Mobile: {card['mobile']}", fill=text_color, font=contact_font)
    draw.text((80, 520), f"Email: {card['email']}", fill=text_color, font=contact_font)
    draw.text((width - 300, 520), f"Industry: {card['industry']}", fill=text_color, font=contact_font)
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return buffer.getvalue()

# Routes
@api_router.get("/")
async def root():
    return {"message": "Business Card Manager API"}

# Admin routes
@api_router.post("/admin/login", response_model=AdminResponse)
async def admin_login(login: AdminLogin):
    """Simple password-based admin login"""
    admin_doc = await db.admin.find_one({"type": "credentials"})
    
    if not admin_doc:
        # First time setup - create admin with default password
        hashed = hash_password(DEFAULT_ADMIN_PASSWORD)
        await db.admin.insert_one({"type": "credentials", "password_hash": hashed})
        admin_doc = {"password_hash": hashed}
    
    if verify_password(login.password, admin_doc['password_hash']):
        return AdminResponse(success=True, message="Login successful")
    else:
        raise HTTPException(status_code=401, detail="Invalid password")

@api_router.post("/admin/change-password", response_model=AdminResponse)
async def change_admin_password(old_password: str = Form(...), new_password: str = Form(...)):
    """Change admin password"""
    admin_doc = await db.admin.find_one({"type": "credentials"})
    
    if not admin_doc or not verify_password(old_password, admin_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid old password")
    
    new_hash = hash_password(new_password)
    await db.admin.update_one(
        {"type": "credentials"},
        {"$set": {"password_hash": new_hash}}
    )
    
    return AdminResponse(success=True, message="Password changed successfully")

# Business Card CRUD
@api_router.post("/cards", response_model=BusinessCard)
async def create_card(card_data: BusinessCardCreate):
    """Create a new business card"""
    card = BusinessCard(**card_data.model_dump())
    doc = card.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.business_cards.insert_one(doc)
    return card

@api_router.get("/cards", response_model=List[BusinessCard])
async def get_all_cards():
    """Get all business cards"""
    cards = await db.business_cards.find({}, {"_id": 0}).to_list(1000)
    
    for card in cards:
        if isinstance(card['created_at'], str):
            card['created_at'] = datetime.fromisoformat(card['created_at'])
    
    return cards

@api_router.get("/cards/{card_id}", response_model=BusinessCard)
async def get_card(card_id: str):
    """Get a specific business card"""
    card = await db.business_cards.find_one({"id": card_id}, {"_id": 0})
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    if isinstance(card['created_at'], str):
        card['created_at'] = datetime.fromisoformat(card['created_at'])
    
    return card

@api_router.put("/cards/{card_id}", response_model=BusinessCard)
async def update_card(card_id: str, card_update: BusinessCardUpdate):
    """Update a business card"""
    card = await db.business_cards.find_one({"id": card_id}, {"_id": 0})
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    update_data = {k: v for k, v in card_update.model_dump().items() if v is not None}
    
    if update_data:
        await db.business_cards.update_one(
            {"id": card_id},
            {"$set": update_data}
        )
    
    updated_card = await db.business_cards.find_one({"id": card_id}, {"_id": 0})
    if isinstance(updated_card['created_at'], str):
        updated_card['created_at'] = datetime.fromisoformat(updated_card['created_at'])
    
    return updated_card

@api_router.delete("/cards/{card_id}")
async def delete_card(card_id: str):
    """Delete a business card"""
    result = await db.business_cards.delete_one({"id": card_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Card not found")
    
    return {"message": "Card deleted successfully"}

# Download endpoints
@api_router.get("/cards/{card_id}/download/pdf")
async def download_pdf(card_id: str):
    """Download card as PDF"""
    card = await db.business_cards.find_one({"id": card_id}, {"_id": 0})
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    pdf_bytes = create_card_pdf(card)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={card['name'].replace(' ', '_')}_card.pdf"}
    )

@api_router.get("/cards/{card_id}/download/image")
async def download_image(card_id: str):
    """Download card as PNG image"""
    card = await db.business_cards.find_one({"id": card_id}, {"_id": 0})
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # If card has image data, use it; otherwise generate
    if card.get('card_image_data'):
        # Return the stored image
        image_data = base64.b64decode(card['card_image_data'].split(',')[1] if ',' in card['card_image_data'] else card['card_image_data'])
        return Response(
            content=image_data,
            media_type="image/png",
            headers={"Content-Disposition": f"attachment; filename={card['name'].replace(' ', '_')}_card.png"}
        )
    else:
        # Generate image
        image_bytes = create_card_image(card)
        return Response(
            content=image_bytes,
            media_type="image/png",
            headers={"Content-Disposition": f"attachment; filename={card['name'].replace(' ', '_')}_card.png"}
        )

@api_router.get("/cards/{card_id}/download/vcard")
async def download_vcard(card_id: str):
    """Download card as vCard"""
    card = await db.business_cards.find_one({"id": card_id}, {"_id": 0})
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    vcard_data = generate_vcard(card)
    
    return Response(
        content=vcard_data,
        media_type="text/vcard",
        headers={"Content-Disposition": f"attachment; filename={card['name'].replace(' ', '_')}.vcf"}
    )

@api_router.get("/cards/{card_id}/qrcode")
async def get_qrcode(card_id: str):
    """Generate QR code for card"""
    card = await db.business_cards.find_one({"id": card_id}, {"_id": 0})
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # QR code will link to the card detail page
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    qr_data = f"{frontend_url}/card/{card_id}"
    
    qr_bytes = generate_qr_code(qr_data)
    
    return Response(
        content=qr_bytes,
        media_type="image/png"
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()