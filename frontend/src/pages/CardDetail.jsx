import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Download, QrCode, ArrowLeft, Smartphone, FileText, Image as ImageIcon, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const FALLBACK_CARDS = {
  'fallback-1': {
    id: 'fallback-1',
    name: 'Fardan Jabir Tareen',
    title: 'Head of IT',
    company: 'FTASM Services',
    mobile: '+971 50 123 4567',
    email: 'fardan@ftasmservices.com',
    industry: 'Information Technology',
    card_image_data: ''
  },
  'fallback-2': {
    id: 'fallback-2',
    name: 'Shayaan Shakeel Moidin Udupi',
    title: 'Head of Music and Updates',
    company: 'FTASM Services',
    mobile: '+971 50 765 4321',
    email: 'shayaan@ftasmservices.com',
    industry: 'Media & Entertainment',
    card_image_data: ''
  }
};

const CardDetail = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    fetchCard();
  }, [cardId]);

  const fetchCard = async () => {
    try {
      const response = await axios.get(`${API}/cards/${cardId}`);
      setCard(response.data);
      setQrCodeUrl(`${API}/cards/${cardId}/qrcode`);
    } catch (error) {
      if (FALLBACK_CARDS[cardId]) {
        setCard(FALLBACK_CARDS[cardId]);
      } else {
        toast.error('Failed to fetch card details');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get(`${API}/cards/${cardId}/download/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${card.name.replace(/ /g, '_')}_card.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleDownloadImage = async () => {
    try {
      const response = await axios.get(`${API}/cards/${cardId}/download/image`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${card.name.replace(/ /g, '_')}_card.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Image downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const handleDownloadVCard = async () => {
    try {
      const response = await axios.get(`${API}/cards/${cardId}/download/vcard`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${card.name.replace(/ /g, '_')}.vcf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('vCard downloaded! Add to your contacts.');
    } catch (error) {
      toast.error('Failed to download vCard');
    }
  };

  const handleAppleWallet = () => {
    toast.info('Apple Wallet integration coming soon! Requires Apple Developer credentials.');
  };

  const handleGoogleWallet = () => {
    toast.info('Google Wallet integration coming soon! Requires Google Cloud credentials.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
        <p style={{ color: '#D4AF37' }}>Loading card...</p>
      </div>
    );
  }

  if (!card) {
    return null;
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          data-testid="back-button"
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
          style={{ color: '#D4AF37' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Gallery
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card Preview */}
          <div>
            <Card style={{ background: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              <CardContent className="p-6">
                {card.card_image_data ? (
                  <img
                    src={card.card_image_data}
                    alt={card.name}
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 rounded-lg flex flex-col items-center justify-center p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(244, 208, 63, 0.1) 100%)', border: '3px solid rgba(212, 175, 55, 0.3)' }}>
                    <h2 className="text-3xl font-bold mb-2" style={{ color: '#D4AF37', fontFamily: 'Playfair Display, serif' }}>
                      {card.name}
                    </h2>
                    <p className="text-lg mb-4" style={{ color: '#a0a0a0' }}>{card.title}</p>
                    <p className="text-xl font-semibold" style={{ color: '#D4AF37' }}>{card.company}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Card Details & Actions */}
          <div className="space-y-6">
            {/* Details */}
            <Card style={{ background: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: '#D4AF37', fontFamily: 'Playfair Display, serif' }}>
                    {card.name}
                  </h2>
                  <p className="text-lg" style={{ color: '#a0a0a0' }}>{card.title}</p>
                </div>
                <div className="space-y-2" style={{ color: '#e0e0e0' }}>
                  <p><strong style={{ color: '#D4AF37' }}>Company:</strong> {card.company}</p>
                  <p><strong style={{ color: '#D4AF37' }}>Mobile:</strong> {card.mobile}</p>
                  <p><strong style={{ color: '#D4AF37' }}>Email:</strong> {card.email}</p>
                  <p><strong style={{ color: '#D4AF37' }}>Industry:</strong> {card.industry}</p>
                </div>
              </CardContent>
            </Card>

            {/* Download Options */}
            <Card style={{ background: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4" style={{ color: '#D4AF37', fontFamily: 'Playfair Display, serif' }}>
                  Download Options
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    data-testid="download-pdf-button"
                    onClick={handleDownloadPDF}
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)', color: '#000', fontWeight: '600' }}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    data-testid="download-image-button"
                    onClick={handleDownloadImage}
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)', color: '#000', fontWeight: '600' }}
                    className="w-full"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Image
                  </Button>
                  <Button
                    data-testid="download-vcard-button"
                    onClick={handleDownloadVCard}
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)', color: '#000', fontWeight: '600' }}
                    className="w-full"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    vCard
                  </Button>
                  <Button
                    data-testid="show-qr-button"
                    onClick={() => setQrDialogOpen(true)}
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)', color: '#000', fontWeight: '600' }}
                    className="w-full"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Options (Coming Soon) */}
            <Card style={{ background: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4" style={{ color: '#D4AF37', fontFamily: 'Playfair Display, serif' }}>
                  Digital Wallet
                </h3>
                <div className="space-y-3">
                  <Button
                    data-testid="apple-wallet-button"
                    onClick={handleAppleWallet}
                    variant="outline"
                    className="w-full"
                    style={{ borderColor: '#D4AF37', color: '#D4AF37' }}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Add to Apple Wallet (Coming Soon)
                  </Button>
                  <Button
                    data-testid="google-wallet-button"
                    onClick={handleGoogleWallet}
                    variant="outline"
                    className="w-full"
                    style={{ borderColor: '#D4AF37', color: '#D4AF37' }}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Add to Google Wallet (Coming Soon)
                  </Button>
                </div>
                <p className="text-xs mt-4" style={{ color: '#808080' }}>
                  * Wallet integrations require Apple Developer and Google Cloud credentials
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent style={{ background: '#1a1a1a', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#D4AF37' }}>QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-64 h-64 rounded-lg"
              style={{ border: '2px solid rgba(212, 175, 55, 0.3)' }}
            />
            <p className="text-center text-sm" style={{ color: '#a0a0a0' }}>
              Scan this QR code to view the business card on your mobile device
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CardDetail;