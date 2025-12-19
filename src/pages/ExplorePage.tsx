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
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-4 py-8 sm:px-6 md:px-12 md:py-12 rounded-2xl shadow-2xl mx-4 sm:mx-6 md:mx-0"
      >
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Compass className="w-6 h-6 sm:w-8 sm:h-8 text-white flex-shrink-0" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Explore
            </h1>
          </div>
          <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl">
            Discover amazing places, split expenses with friends, and make memories
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-[#1CC29F] text-sm sm:text-base"
                />
              </div>

              {/* Location and Button Row */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <Input
                    type="text"
                    placeholder="Location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-[#1CC29F] text-sm sm:text-base"
                  />
                </div>

                <Button
                  onClick={handleLocationDetect}
                  className="bg-[#1CC29F] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-[#15A886] transition-colors flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  <Navigation className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">Use Location</span>
                  <span className="sm:hidden">Location</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto ">
        
        {/* Categories Scroll */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 px-0">
            Categories
          </h2>

          <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-2 px-0 scroll-smooth">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedCategory(category.slug)}
                className={`
                  flex-shrink-0
                  w-20 h-20 sm:w-24 sm:h-24
                  rounded-full
                  p-3 sm:p-4
                  cursor-pointer
                  transition-all duration-300
                  ${
                    selectedCategory === category.slug
                      ? "bg-white shadow-xl scale-105"
                      : "bg-gray-100 shadow-md hover:shadow-lg hover:-translate-y-1"
                  }
                `}
              >
                <div className="flex flex-col items-center justify-center h-full gap-1 sm:gap-2">
                  {category.icon && category.icon.startsWith('http') ? (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '';
                      }}
                    />
                  ) : (
                    <span className="text-2xl sm:text-3xl">
                      {category.icon || ''}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-gray-700 text-center line-clamp-2">
                    {category.name}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Conditional Rendering: All vs Category View */}
        {selectedCategory === 'all' ? (
          // All Categories Sections
          <div className="space-y-8 sm:space-y-12">
            {categories.filter(c => c.id !== 'all').map((category) => {
              const categoryPlaces = getPlacesByCategory(category.slug);
              if (categoryPlaces.length === 0) return null;

              return (
                <div key={category.id}>
                  {/* Category Header */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div 
                      className="w-1 h-6 sm:h-8 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-800">
                      {category.name}
                    </h3>
                    <span className="bg-gray-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-gray-600 ml-auto">
                      {categoryPlaces.length}
                    </span>
                  </div>

                  {/* Category Places Grid */}
                  {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 animate-pulse">
                          <div className="w-full h-32 sm:h-40 md:h-48 bg-gray-200 rounded-lg sm:rounded-xl mb-3 sm:mb-4" />
                          <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2" />
                          <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                                      ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                      {categoryPlaces.slice(0, 4).map((place, index) => (
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

                  {categoryPlaces.length > 4 && (
                    <div className="text-center mt-4 sm:mt-6">
                      <Button
                        onClick={() => setSelectedCategory(category.slug)}
                        className="text-[#1CC29F] hover:text-[#15A886] font-semibold text-sm sm:text-base"
                        variant="ghost"
                      >
                        View All {category.name}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Single Category View
          <div>
            {/* Results Header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 flex-wrap">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#1CC29F] flex-shrink-0" />
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
                {categories.find(c => c.slug === selectedCategory)?.name}
              </h2>
              <span className="bg-gray-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-gray-600">
                {places.length} found
              </span>
            </div>

            {/* Places Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 animate-pulse">
                    <div className="w-full h-32 sm:h-40 md:h-48 bg-gray-200 rounded-lg sm:rounded-xl mb-3 sm:mb-4" />
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : places.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="text-5xl sm:text-6xl mb-4">🔍</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">No places found</h3>
                <p className="text-gray-600 text-sm sm:text-base">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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
      className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col"
    >
      {/* Image Section */}
      <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden flex-shrink-0">
        <img
          src={place.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'}
          alt={place.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
        />
        
        {place.is_featured && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(place.id);
          }}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full transition-colors shadow-lg ${
            place.is_bookmarked 
              ? 'bg-red-500 text-white' 
              : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${place.is_bookmarked ? 'fill-current' : ''}`} />
        </button>

        {place.distance && (
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs font-semibold text-gray-700 flex items-center gap-1">
            <MapPinned className="w-3 h-3 flex-shrink-0" />
            {place.distance} km
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
        {/* Title and Rating */}
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-800 hover:text-[#1CC29F] transition-colors line-clamp-2">
            {place.name}
          </h3>
          <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
            <span className="font-semibold text-xs sm:text-sm text-gray-700">{place.rating}</span>
          </div>
        </div>

        {/* Description */}
        {place.description && (
          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
            {place.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-500 flex-wrap">
          {place.city && (
            <div className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm">{place.city}</span>
            </div>
          )}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-[#1CC29F] font-bold text-xs sm:text-sm">
              {'₹'.repeat(place.price_level)}
            </span>
          </div>
          {place.review_count > 0 && (
            <span className="text-gray-400 text-xs">
              {place.review_count} reviews
            </span>
          )}
        </div>

        {/* Tags */}
        {place.tags && place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
            {place.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {place.tags.length > 2 && (
              <span className="text-gray-500 text-xs px-2 py-1">
                +{place.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Button */}
        <Button
          className="w-full bg-gradient-to-r from-[#1CC29F] to-[#15A886] text-white hover:shadow-lg text-sm sm:text-base py-2 sm:py-3 mt-auto"
        >
          View Details
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}