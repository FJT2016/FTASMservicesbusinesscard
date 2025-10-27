import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, LogOut, Eye, Upload } from 'lucide-react';

const AdminDashboard = ({ onLogout }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    mobile: '',
    email: '',
    industry: '',
    card_image_data: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await axios.get(`${API}/cards`);
      setCards(response.data);
    } catch (error) {
      toast.error('Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, card_image_data: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCard) {
        await axios.put(`${API}/cards/${editingCard.id}`, formData);
        toast.success('Card updated successfully!');
      } else {
        await axios.post(`${API}/cards`, formData);
        toast.success('Card created successfully!');
      }
      
      setDialogOpen(false);
      resetForm();
      fetchCards();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save card');
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      title: card.title,
      company: card.company,
      mobile: card.mobile,
      email: card.email,
      industry: card.industry,
      card_image_data: card.card_image_data
    });
    setDialogOpen(true);
  };

  const handleDelete = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await axios.delete(`${API}/cards/${cardId}`);
        toast.success('Card deleted successfully!');
        fetchCards();
      } catch (error) {
        toast.error('Failed to delete card');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      company: '',
      mobile: '',
      email: '',
      industry: '',
      card_image_data: ''
    });
    setEditingCard(null);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#D4AF37', fontFamily: 'Playfair Display, serif' }}>
              Admin Dashboard
            </h1>
            <p className="text-gray-400">Manage business cards</p>
          </div>
          <div className="flex gap-3">
            <Button
              data-testid="view-gallery-button"
              variant="outline"
              onClick={() => navigate('/')}
              style={{ borderColor: '#D4AF37', color: '#D4AF37' }}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Gallery
            </Button>
            <Button
              data-testid="logout-button"
              variant="outline"
              onClick={handleLogout}
              style={{ borderColor: '#D4AF37', color: '#D4AF37' }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Add Card Button */}
        <div className="mb-6">
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button
                data-testid="add-card-button"
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)', color: '#000', fontWeight: '600' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" style={{ background: '#1a1a1a', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              <DialogHeader>
                <DialogTitle style={{ color: '#D4AF37' }}>
                  {editingCard ? 'Edit Business Card' : 'Add New Business Card'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label style={{ color: '#D4AF37' }}>Full Name</Label>
                    <Input
                      data-testid="card-name-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      style={{ background: 'rgba(10, 10, 10, 0.5)', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#e0e0e0' }}
                    />
                  </div>
                  <div>
                    <Label style={{ color: '#D4AF37' }}>Job Title</Label>
                    <Input
                      data-testid="card-title-input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      style={{ background: 'rgba(10, 10, 10, 0.5)', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#e0e0e0' }}
                    />
                  </div>
                  <div>
                    <Label style={{ color: '#D4AF37' }}>Company</Label>
                    <Input
                      data-testid="card-company-input"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                      style={{ background: 'rgba(10, 10, 10, 0.5)', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#e0e0e0' }}
                    />
                  </div>
                  <div>
                    <Label style={{ color: '#D4AF37' }}>Mobile</Label>
                    <Input
                      data-testid="card-mobile-input"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      required
                      style={{ background: 'rgba(10, 10, 10, 0.5)', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#e0e0e0' }}
                    />
                  </div>
                  <div>
                    <Label style={{ color: '#D4AF37' }}>Email</Label>
                    <Input
                      data-testid="card-email-input"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      style={{ background: 'rgba(10, 10, 10, 0.5)', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#e0e0e0' }}
                    />
                  </div>
                  <div>
                    <Label style={{ color: '#D4AF37' }}>Industry</Label>
                    <Input
                      data-testid="card-industry-input"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      required
                      style={{ background: 'rgba(10, 10, 10, 0.5)', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#e0e0e0' }}
                    />
                  </div>
                </div>
                <div>
                  <Label style={{ color: '#D4AF37' }}>Card Image</Label>
                  <div className="mt-2">
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer" style={{ borderColor: 'rgba(212, 175, 55, 0.3)' }}>
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 mb-2" style={{ color: '#D4AF37' }} />
                        <p className="text-sm" style={{ color: '#a0a0a0' }}>Click to upload card image</p>
                      </div>
                      <input
                        data-testid="card-image-input"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  {formData.card_image_data && (
                    <img src={formData.card_image_data} alt="Preview" className="mt-4 max-h-40 rounded" />
                  )}
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    data-testid="cancel-button"
                    type="button"
                    variant="outline"
                    onClick={() => { setDialogOpen(false); resetForm(); }}
                    style={{ borderColor: '#D4AF37', color: '#D4AF37' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    data-testid="save-card-button"
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)', color: '#000', fontWeight: '600' }}
                  >
                    {editingCard ? 'Update Card' : 'Create Card'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p style={{ color: '#D4AF37' }}>Loading cards...</p>
          </div>
        ) : cards.length === 0 ? (
          <Card className="text-center py-12" style={{ background: 'rgba(26, 26, 26, 0.6)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <CardContent>
              <p style={{ color: '#a0a0a0' }}>No business cards yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Card
                key={card.id}
                className="card-hover"
                style={{ background: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
                data-testid={`card-item-${card.id}`}
              >
                <CardHeader>
                  <CardTitle style={{ color: '#D4AF37', fontSize: '1.25rem' }}>{card.name}</CardTitle>
                  <p className="text-sm" style={{ color: '#a0a0a0' }}>{card.title}</p>
                </CardHeader>
                <CardContent>
                  {card.card_image_data && (
                    <img
                      src={card.card_image_data}
                      alt={card.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="space-y-1 text-sm mb-4" style={{ color: '#e0e0e0' }}>
                    <p><strong style={{ color: '#D4AF37' }}>Company:</strong> {card.company}</p>
                    <p><strong style={{ color: '#D4AF37' }}>Mobile:</strong> {card.mobile}</p>
                    <p><strong style={{ color: '#D4AF37' }}>Email:</strong> {card.email}</p>
                    <p><strong style={{ color: '#D4AF37' }}>Industry:</strong> {card.industry}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      data-testid={`edit-card-${card.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(card)}
                      style={{ borderColor: '#D4AF37', color: '#D4AF37', flex: 1 }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      data-testid={`delete-card-${card.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(card.id)}
                      style={{ borderColor: '#ef4444', color: '#ef4444', flex: 1 }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
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

export default AdminDashboard;