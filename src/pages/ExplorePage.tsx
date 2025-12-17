// src/pages/explore/ExplorePage.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Search, 
  Compass, 
  TrendingUp, 
  Star, 
  Heart,
  Navigation,
  ChevronRight,
  MapPinned,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Category, Place } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ExplorePlaceWithCategory extends Place {
  explore_categories?: Category;
  distance?: number;
  is_bookmarked?: boolean;
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', name: 'All', slug: 'all', icon: '🔍', color: '#1CC29F', is_active: true, sort_order: 0, created_at: '', updated_at: '', description: null }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [places, setPlaces] = useState<ExplorePlaceWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);

  // Get user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  // Fetch categories from Supabase
  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  // Fetch places when filters change
  useEffect(() => {
    if (user) {
      fetchPlaces();
    }
  }, [selectedCategory, searchQuery, userLocation, user]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('explore_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data) {
        setCategories([
          { id: 'all', name: 'All', slug: 'all', icon: '🔍', color: '#1CC29F', is_active: true, sort_order: 0, created_at: '', updated_at: '', description: null },
          ...data
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPlaces = async () => {
    setIsLoading(true);
    console.log('🔍 Fetching places...');
    
    try {
      let query = supabase
        .from('explore_places')
        .select(`
          *,
          explore_categories (*)
        `)
        .eq('is_active', true);

      // Filter by category
      if (selectedCategory !== 'all') {
        const category = categories.find(c => c.slug === selectedCategory);
        if (category && category.id !== 'all') {
          query = query.eq('category_id', category.id);
        }
      }

      // Search filter
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }

      // Order by featured and rating
      query = query
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false })
        .limit(50);

      const { data, error } = await query;

      console.log('Query result:', { data, error, count: data?.length });

      if (error) throw error;

      // Calculate distance if user location is available
      let placesWithDistance: ExplorePlaceWithCategory[] = data || [];
      if (userLocation && data) {
        placesWithDistance = data.map(place => ({
          ...place,
          distance: place.latitude && place.longitude
            ? calculateDistance(
                userLocation.lat,
                userLocation.lng,
                place.latitude,
                place.longitude
              )
            : undefined
        }));
        placesWithDistance.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      }

      // Check bookmarks for current user
      if (user?.id && placesWithDistance.length > 0) {
        const { data: bookmarks } = await supabase
          .from('user_bookmarks')
          .select('place_id')
          .eq('user_id', user.id);

        const bookmarkedIds = new Set(bookmarks?.map(b => b.place_id) || []);
        
        placesWithDistance = placesWithDistance.map(place => ({
          ...place,
          is_bookmarked: bookmarkedIds.has(place.id)
        }));
      }

      setPlaces(placesWithDistance);
      console.log('✅ Places set:', placesWithDistance.length);
    } catch (error) {
      console.error('Error fetching places:', error);
      setPlaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const handleLocationDetect = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    }
  };

  const toggleBookmark = async (placeId: string) => {
    if (!user?.id) {
      alert('Please sign in to bookmark places');
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('place_id', placeId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;

        setPlaces(places.map(place => 
          place.id === placeId 
            ? { ...place, is_bookmarked: false }
            : place
        ));
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({
            user_id: user.id,
            place_id: placeId
          });

        if (error) throw error;

        setPlaces(places.map(place => 
          place.id === placeId 
            ? { ...place, is_bookmarked: true }
            : place
        ));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handlePlaceClick = (placeId: string) => {
    navigate(`/explore/${placeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1CC29F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Not Authenticated</h2>
          <p className="text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-[#1CC29F] to-[#15A886] px-6 py-12 md:px-12 rounded-b-[2rem] shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <Compass className="w-8 h-8 text-white" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Explore
              </h1>
            </div>
            <p className="text-white/90 text-lg mb-8 max-w-2xl">
              Discover amazing places, split expenses with friends, and make memories
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-xl p-4 max-w-4xl">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search restaurants, movies, destinations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1CC29F]"
                  />
                </div>

                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1CC29F]"
                  />
                </div>

                <Button
                  onClick={handleLocationDetect}
                  className="bg-[#1CC29F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#15A886]"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  <span className="hidden md:inline">Use Location</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 md:px-12">
          {/* Categories */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Categories</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`
                    relative p-4 rounded-2xl transition-all duration-300
                    ${selectedCategory === category.slug
                      ? 'bg-gradient-to-br from-[#1CC29F] to-[#15A886] text-white shadow-xl scale-105'
                      : 'bg-white text-gray-700 hover:shadow-lg hover:-translate-y-1'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">{category.icon}</span>
                    <span className="text-xs font-semibold text-center">
                      {category.name}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#1CC29F]" />
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCategory === 'all' ? 'All Places' : categories.find(c => c.slug === selectedCategory)?.name}
            </h2>
            <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-600">
              {places.length} found
            </span>
          </div>

          {/* Places Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No places found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place, index) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  index={index}
                  onBookmark={toggleBookmark}
                  onClick={handlePlaceClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Place Card Component
function PlaceCard({ 
  place, 
  index,
  onBookmark,
  onClick
}: { 
  place: ExplorePlaceWithCategory; 
  index: number;
  onBookmark: (id: string) => void;
  onClick: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick(place.id)}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={place.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'}
          alt={place.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
        />
        
        {place.is_featured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(place.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors shadow-lg ${
            place.is_bookmarked 
              ? 'bg-red-500 text-white' 
              : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${place.is_bookmarked ? 'fill-current' : ''}`} />
        </button>

        {place.distance && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 flex items-center gap-1">
            <MapPinned className="w-3 h-3" />
            {place.distance} km
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-800 hover:text-[#1CC29F] transition-colors">
            {place.name}
          </h3>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold text-sm text-gray-700">{place.rating}</span>
          </div>
        </div>

        {place.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {place.description}
          </p>
        )}

        <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
          {place.city && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{place.city}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="text-[#1CC29F] font-bold">
              {'₹'.repeat(place.price_level)}
            </span>
          </div>
          {place.review_count > 0 && (
            <span className="text-gray-400">
              {place.review_count} reviews
            </span>
          )}
        </div>

        {place.tags && place.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {place.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Button
          className="w-full bg-gradient-to-r from-[#1CC29F] to-[#15A886] text-white hover:shadow-lg"
        >
          View Details
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}