import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Search, 
  Star, 
  Heart,
  ChevronRight,
  MapPinned,
  TrendingUp,
  ShoppingBag,
  Filter
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
    { id: 'all', name: 'All', slug: 'all', icon: '', color: '#1CC29F', is_active: true, sort_order: 0, created_at: '', updated_at: '', description: null }
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
          { id: 'all', name: 'All', slug: 'all', icon: '', color: '#1CC29F', is_active: true, sort_order: 0, created_at: '', updated_at: '', description: null },
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

  const getPlacesByCategory = (categorySlug: string) => {
    if (categorySlug === 'all') return places;
    const categoryId = categories.find(c => c.slug === categorySlug)?.id;
    return places.filter(place => place.category_id === categoryId);
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
      <div className="min-h-screen bg-gray-50 pb-8">
        {/* Header Section - Rounded with Shadow */}
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-3xl shadow-2xl mx-4 sm:mx-6 lg:mx-8 mt-6 mb-8">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-white text-base sm:text-lg font-semibold">Explore</p>
                  <button 
                    onClick={handleLocationDetect}
                    className="flex items-center gap-1 text-white/90 font-medium text-xs sm:text-sm hover:text-white transition-colors"
                  >
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="max-w-[120px] sm:max-w-[200px] truncate">
                      {location || 'Detect location'}
                    </span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="relative text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs">
                    0
                  </span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder="Search for places, activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white text-gray-800 text-sm sm:text-base border-0 focus:ring-2 focus:ring-white/50 shadow-lg"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 rounded-lg sm:rounded-xl hover:bg-emerald-600 transition-colors">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories Section */}
          <div className="mb-8">
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap lg:flex-nowrap gap-3 sm:gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`flex flex-col items-center gap-2 transition-all duration-300 ${
                    selectedCategory === category.slug ? 'scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div 
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-md transition-all duration-300 ${
                      selectedCategory === category.slug 
                        ? 'bg-white shadow-xl' 
                        : 'bg-white/80 hover:shadow-lg'
                    }`}
                    style={{
                      borderBottom: selectedCategory === category.slug 
                        ? `4px solid ${category.color}` 
                        : 'none'
                    }}
                  >
                    {category.icon && category.icon.startsWith('http') ? (
                      <img
                        src={category.icon}
                        alt={category.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-2xl sm:text-3xl">{category.icon || '📍'}</span>
                    )}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium text-center line-clamp-2 px-1 ${
                    selectedCategory === category.slug 
                      ? 'text-gray-900 font-semibold' 
                      : 'text-gray-600'
                  }`}>
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Promotional Banner - Rounded with Shadow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                Fresh Deals, Fresh Adventures! 🎉
              </h2>
              <p className="text-white/90 text-sm sm:text-base mb-4">
                Discover amazing places and create unforgettable memories
              </p>
              <Button className="bg-white text-emerald-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg">
                EXPLORE NOW
              </Button>
            </div>
          </motion.div>

          {/* Conditional Rendering */}
          {selectedCategory === 'all' ? (
            // All Categories View
            <div className="space-y-10">
              {categories.filter(c => c.id !== 'all').map((category) => {
                const categoryPlaces = getPlacesByCategory(category.slug);
                if (categoryPlaces.length === 0) return null;

                return (
                  <div key={category.id}>
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-1 h-8 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                          {category.name} For You
                        </h3>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedCategory(category.slug)}
                        className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm sm:text-base flex items-center gap-1 hover:bg-transparent"
                      >
                        See all
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Horizontal Scroll Grid */}
                    {isLoading ? (
                      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="bg-white rounded-2xl p-4 animate-pulse w-72 sm:w-80 flex-shrink-0 shadow-md">
                            <div className="w-full h-48 bg-gray-200 rounded-xl mb-4" />
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {categoryPlaces.slice(0, 6).map((place, index) => (
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
                );
              })}

              {places.length === 0 && !isLoading && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    No places found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or check back later
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Single Category View
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {categories.find(c => c.slug === selectedCategory)?.name}
                  </h2>
                  <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-600 font-medium">
                    {places.length} found
                  </span>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 animate-pulse shadow-md">
                      <div className="w-full h-48 bg-gray-200 rounded-xl mb-4" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : places.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    No places found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-40 sm:h-48 overflow-hidden flex-shrink-0">
        <img
          src={place.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'}
          alt={place.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
        />
        
        {place.is_featured && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-lg">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(place.id);
          }}
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-full transition-all duration-300 shadow-lg ${
            place.is_bookmarked 
              ? 'bg-red-500 text-white scale-110' 
              : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white hover:scale-110'
          }`}
        >
          <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${place.is_bookmarked ? 'fill-current' : ''}`} />
        </button>

        {place.distance && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-white/95 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-gray-700 flex items-center gap-1 shadow-md">
            <MapPinned className="w-3 h-3" />
            {place.distance} km
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        {/* Title & Rating */}
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-2 flex-1">
            {place.name}
          </h3>
          {place.rating && (
            <div className="flex items-center gap-0.5 sm:gap-1 bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg flex-shrink-0">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-emerald-500 text-emerald-500" />
              <span className="font-bold text-xs sm:text-sm text-gray-900">{place.rating}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {place.description && (
          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 flex-grow">
            {place.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs sm:text-sm mb-2 sm:mb-3">
          {place.city && (
            <div className="flex items-center gap-1 text-gray-500 min-w-0 flex-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{place.city}</span>
            </div>
          )}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {place.price_level && place.price_level > 0 && (
              <span className="text-emerald-600 font-bold text-xs sm:text-sm">
                {'₹'.repeat(place.price_level)}
              </span>
            )}
            {place.review_count > 0 && (
              <span className="text-gray-400 text-[10px] sm:text-xs">
                ({place.review_count})
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {place.tags && place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3">
            {place.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {place.tags.length > 2 && (
              <span className="text-gray-500 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1">
                +{place.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* View Details Button */}
        <Button
          className="w-full bg-gradient-to-r from-[#1CC29F] to-[#15A886] text-white hover:shadow-lg text-xs sm:text-sm py-2 sm:py-2.5 mt-auto"
          onClick={(e) => {
            e.stopPropagation();
            onClick(place.id);
          }}
        >
          View Details
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}