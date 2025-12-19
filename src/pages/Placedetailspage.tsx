// src/pages/explore/PlaceDetailsPage.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Phone, 
  Globe, 
  Clock,
  Heart,
  Share2,
  Navigation,
  IndianRupee,
  Users,
  ArrowLeft,
  ExternalLink,
  Bookmark,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Place, Category } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface PlaceDetailsWithCategory extends Place {
  explore_categories?: Category;
  is_bookmarked?: boolean;
}

interface Review {
  id: string;
  user_id: string;
  place_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
}

export default function PlaceDetailsPage() {
  const navigate = useNavigate();
  const { placeId } = useParams<{ placeId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [place, setPlace] = useState<PlaceDetailsWithCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Get user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (placeId && user) {
      fetchPlaceDetails();
    }
  }, [placeId, user]);

  const fetchPlaceDetails = async () => {
    if (!placeId) return;
    
    setIsLoading(true);
    console.log('🔍 Fetching place details for:', placeId);
    
    try {
      const { data: placeData, error: placeError } = await supabase
        .from('explore_places')
        .select(`
          *,
          explore_categories (*)
        `)
        .eq('id', placeId)
        .single();

      console.log('Place data:', placeData);
      console.log('Place error:', placeError);

      if (placeError) throw placeError;

      if (placeData) {
        const placeWithBookmark = placeData as PlaceDetailsWithCategory;
        if (user?.id) {
          const { data: bookmark } = await supabase
            .from('user_bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('place_id', placeId)
            .single();

          placeWithBookmark.is_bookmarked = !!bookmark;
        }

        await supabase
          .from('explore_places')
          .update({ view_count: (placeData.view_count || 0) + 1 })
          .eq('id', placeId);

        setPlace(placeWithBookmark);
        console.log('✅ Place set:', placeData.name);
      }

      fetchReviews();
    } catch (error) {
      console.error('Error fetching place details:', error);
      setPlace(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!placeId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_reviews')
        .select('*')
        .eq('place_id', placeId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReviews(data || []);
      console.log('Reviews fetched:', data?.length || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleBookmark = async () => {
    if (!place || !user?.id) {
      alert('Please sign in to bookmark places');
      return;
    }

    try {
      if (place.is_bookmarked) {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('place_id', place.id);

        if (error) throw error;
        setPlace({ ...place, is_bookmarked: false });
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({
            user_id: user.id,
            place_id: place.id
          });

        if (error) throw error;
        setPlace({ ...place, is_bookmarked: true });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: place?.name,
          text: `Check out ${place?.name} on SplitXo!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleCreateExpense = () => {
    navigate('/expenses', { state: { place } });
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1CC29F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading place details...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <DashboardLayout user={user}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800 mb-2">Place not found</p>
            <Button onClick={() => navigate('/explore')} variant="link">
              Go back to explore
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Hero Section */}
        <div className="relative h-60 sm:h-80 md:h-96 lg:h-[500px] bg-gray-900 rounded-b-3xl overflow-hidden">
          <img
            src={place.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/explore')}
            className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-full hover:bg-white transition-colors shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
          </motion.button>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 z-20 flex gap-2 sm:gap-3">
            <Button
              size="icon"
              onClick={handleBookmark}
              className={`rounded-full shadow-lg p-2 sm:p-3 ${
                place.is_bookmarked
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-white/90 hover:bg-white text-gray-800'
              }`}
            >
              <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${place.is_bookmarked ? 'fill-current' : ''}`} />
            </Button>

            <Button
              size="icon"
              onClick={handleShare}
              className="bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg p-2 sm:p-3"
            >
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>

          {/* Category Badge */}
         {Array.isArray(place.gallery) && place.gallery.length > 0 && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 z-10"
  >
    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-2 rounded-xl max-w-full overflow-x-auto">
      {(() => {
        let images = place.gallery;
        
        // If gallery is a string, parse it as JSON
        if (typeof images === 'string') {
          try {
            images = JSON.parse(images);
          } catch (e) {
            console.error('Failed to parse gallery JSON:', e);
            return null;
          }
        }
        
        // Ensure it's an array
        if (!Array.isArray(images)) {
          return null;
        }
        
        return (
          <>
            {images.slice(0, 6).map(
              (img, index) => {
                // Handle different possible property names
                const imgObj = img as Record<string, any>;
                const imageUrl = imgObj.url || imgObj.image_url || imgObj.src || imgObj.link;
                
                if (!imageUrl) return null;
                
                return (
                  <div
                    key={index}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/20"
                  >
                    <img
                      src={imageUrl}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                );
              }
            )}
            {images.length > 6 && (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-black/40 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                +{images.length - 6}
              </div>
            )}
          </>
        );
      })()}
    </div>
  </motion.div>
)}
        </div>

        {/* Main Content Card */}
        <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <div className="max-w-full mx-auto">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-lg mb-6"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    {place.name}
                  </h1>
                  
                  {place.address && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base mb-3">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#1CC29F] flex-shrink-0" />
                      <span className="line-clamp-1">{place.city}, {place.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Badges */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center gap-2 bg-yellow-50 px-3 sm:px-4 py-2 rounded-full">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  <span className="font-bold text-sm sm:text-base text-gray-800">{place.rating}</span>
                  <span className="text-xs sm:text-sm text-gray-600">({place.review_count})</span>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 px-3 sm:px-4 py-2 rounded-full">
                  <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-[#1CC29F] flex-shrink-0" />
                  <span className="font-bold text-sm sm:text-base text-gray-800">{'₹'.repeat(place.price_level)}</span>
                </div>

                {place.is_open_now !== undefined && (
                  <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-semibold ${
                    place.is_open_now 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    {place.is_open_now ? 'Open Now' : 'Closed'}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Tabs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden mb-5 sm:mb-6"
            >
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-0 p-1 m-0">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm rounded-xl">Overview</TabsTrigger>
                  <TabsTrigger value="reviews" className="text-xs sm:text-sm rounded-xl">Reviews</TabsTrigger>
                  <TabsTrigger value="gallery" className="text-xs sm:text-sm rounded-xl">Gallery</TabsTrigger>
                </TabsList>

                <div className="p-5 sm:p-6 md:p-8">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6 mt-0">
                    {place.description && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">About</h3>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                          {place.description}
                        </p>
                      </div>
                    )}

                    {place.tags && place.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Features</h3>
                        <div className="flex flex-wrap gap-2">
                          {place.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="bg-gradient-to-br from-[#1CC29F]/10 to-[#15A886]/10 text-[#1CC29F] px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border border-[#1CC29F]/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {place.opening_hours && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Hours</h3>
                        <div className="space-y-2 bg-gray-50 p-4 rounded-2xl">
                          {Object.entries(place.opening_hours as Record<string, string>).map(([day, hours]) => (
                            <div key={day} className="flex justify-between text-sm">
                              <span className="text-gray-600 capitalize font-medium">{day}</span>
                              <span className="text-gray-800 font-semibold">{hours}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Reviews Tab */}
                  <TabsContent value="reviews" className="space-y-4 mt-0">
                    {reviews.length > 0 ? (
                      reviews.slice(0, 5).map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.review_text && (
                            <p className="text-gray-700 text-sm sm:text-base">{review.review_text}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-8 text-sm sm:text-base">
                        No reviews yet. Be the first to review!
                      </p>
                    )}
                  </TabsContent>

                  {/* Gallery Tab */}
                  <TabsContent value="gallery" className="mt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {place.gallery && Array.isArray(place.gallery) && place.gallery.length > 0 ? (
                        place.gallery.map((photo, i) => (
                          <div key={i} className="aspect-square rounded-2xl overflow-hidden">
                            <img
                              src={String(photo)}
                              alt={`${place.name} photo ${i + 1}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ))
                      ) : place.image_url ? (
                        <div className="col-span-2 sm:col-span-3 aspect-video rounded-2xl overflow-hidden">
                          <img
                            src={place.image_url}
                            alt={place.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <p className="col-span-2 sm:col-span-3 text-gray-600 text-center py-8 text-sm">
                          No photos available
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>

            {/* Contact & Action Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mt-6"
            >
              {/* Contact Details */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Contact</h3>

                <div className="space-y-4">
                  {place.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#1CC29F] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-800 font-semibold text-sm">Address</p>
                        <p className="text-gray-600 text-xs sm:text-sm">{place.address}, {place.city}</p>
                      </div>
                    </div>
                  )}

                  {place.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[#1CC29F] flex-shrink-0" />
                      <div>
                        <p className="text-gray-800 font-semibold text-sm">Phone</p>
                        <a href={`tel:${place.phone}`} className="text-[#1CC29F] hover:underline text-xs sm:text-sm font-medium">
                          {place.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {place.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-[#1CC29F] flex-shrink-0" />
                      <div>
                        <p className="text-gray-800 font-semibold text-sm">Website</p>
                        <a 
                          href={place.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#1CC29F] hover:underline text-xs sm:text-sm font-medium flex items-center gap-1"
                        >
                          Visit
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-[#1CC29F] to-[#15A886] rounded-3xl p-5 sm:p-6 shadow-lg text-white">
                <h3 className="text-lg sm:text-xl font-bold mb-4">Place Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white/10 px-3 sm:px-4 py-2 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm">Views</span>
                    </div>
                    <span className="font-bold text-sm">{place.view_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 px-3 sm:px-4 py-2 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm">Bookmarks</span>
                    </div>
                    <span className="font-bold text-sm">{place.bookmark_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 px-3 sm:px-4 py-2 rounded-xl">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm">Reviews</span>
                    </div>
                    <span className="font-bold text-sm">{place.review_count || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2 sm:space-y-3 mt-5 sm:mt-6"
            >
              <Button
                onClick={handleCreateExpense}
                className="w-full bg-gradient-to-r from-[#1CC29F] to-[#15A886] text-white hover:shadow-lg py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base font-semibold flex items-center justify-between px-4 sm:px-6"
              >
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Add Expense Here</span>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              <Button
                variant="outline"
                className="w-full border-2 border-[#1CC29F] text-[#1CC29F] hover:bg-[#1CC29F]/5 py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Get Directions</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}