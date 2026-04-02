import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Eye } from 'lucide-react';

const FALLBACK_CARDS = [
  {
    id: 'fallback-1',
    name: 'Fardan Jabir Tareen',
    title: 'Head of IT',
    company: 'FTASM Services',
    mobile: '+971 50 123 4567',
    email: 'fardan@ftasmservices.com',
    industry: 'Information Technology',
    card_image_data: ''
  },
  {
    id: 'fallback-2',
    name: 'Shayaan Shakeel Moidin Udupi',
    title: 'Head of Music and Updates',
    company: 'FTASM Services',
    mobile: '+971 50 765 4321',
    email: 'shayaan@ftasmservices.com',
    industry: 'Media & Entertainment',
    card_image_data: ''
  }
];

const CardGallery = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await axios.get(`${API}/cards`);
      setCards(response.data.length > 0 ? response.data : FALLBACK_CARDS);
    } catch (error) {
      console.error('Failed to fetch cards, using fallback data');
      setCards(FALLBACK_CARDS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at top right, rgba(212, 175, 55, 0.1), transparent 50%)' }}></div>
        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6" style={{ color: '#D4AF37', fontFamily: 'Playfair Display, serif' }}>
              Business Card Gallery
            </h1>
            <p className="text-lg sm:text-xl mb-8" style={{ color: '#a0a0a0' }}>
              Professional business cards for FTASM Services team
            </p>
            <Button
              data-testid="admin-access-button"
              onClick={() => navigate('/admin/login')}
              style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)', color: '#000', fontWeight: '600' }}
            >
              <Lock className="w-4 h-4 mr-2" />
              Admin Access
            </Button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="text-center py-12">
            <p style={{ color: '#D4AF37' }}>Loading cards...</p>
          </div>
        ) : cards.length === 0 ? (
          <Card className="text-center py-12" style={{ background: 'rgba(26, 26, 26, 0.6)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <CardContent className="pt-6">
              <p style={{ color: '#a0a0a0' }}>No business cards available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card) => (
              <Card
                key={card.id}
                className="card-hover cursor-pointer group"
                style={{ background: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
                onClick={() => navigate(`/card/${card.id}`)}
                data-testid={`gallery-card-${card.id}`}
              >
                <CardContent className="p-6">
                  {card.card_image_data ? (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img
                        src={card.card_image_data}
                        alt={card.name}
                        className="w-full h-56 object-cover group-hover:scale-105"
                        style={{ transition: 'transform 0.3s' }}
                      />
                    </div>
                  ) : (
                    <div className="mb-4 h-56 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(244, 208, 63, 0.1) 100%)', border: '2px solid rgba(212, 175, 55, 0.3)' }}>
                      <p style={{ color: '#D4AF37', fontFamily: 'Playfair Display, serif', fontSize: '1.5rem' }}>{card.name}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold" style={{ color: '#D4AF37', fontFamily: 'Playfair Display, serif' }}>
                      {card.name}
                    </h3>
                    <p className="text-sm" style={{ color: '#a0a0a0' }}>{card.title}</p>
                    <p className="text-sm font-semibold" style={{ color: '#D4AF37' }}>{card.company}</p>
                  </div>
                  <div className="mt-4 flex items-center" style={{ color: '#D4AF37' }}>
                    <Eye className="w-4 h-4 mr-2" />
                    <span className="text-sm">Click to view details</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardGallery;