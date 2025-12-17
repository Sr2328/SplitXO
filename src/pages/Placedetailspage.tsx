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
  DollarSign,
  Users,
  ArrowLeft,
  ExternalLink,
  Bookmark,
  MessageSquare,
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
      // Fetch place details
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
        // Check if bookmarked
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

        // Increment view count
        await supabase
          .from('explore_places')
          .update({ view_count: (placeData.view_count || 0) + 1 })
          .eq('id', placeId);

        setPlace(placeWithBookmark);
        console.log('✅ Place set:', placeData.name);
      }

      // Fetch reviews
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
        {/* Hero Section */}
        <div className="relative h-[400px] bg-gray-900">
          <div className="absolute inset-0">
            <img
              src={place.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
              alt={place.name}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/explore')}
            className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors shadow-lg"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </motion.button>

          <div className="absolute top-6 right-6 z-20 flex gap-3">
            <Button
              size="icon"
              onClick={handleBookmark}
              className={`rounded-full shadow-lg ${
                place.is_bookmarked
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-white/90 hover:bg-white text-gray-800'
              }`}
            >
              <Heart className={`w-6 h-6 ${place.is_bookmarked ? 'fill-current' : ''}`} />
            </Button>

            <Button
              size="icon"
              onClick={handleShare}
              className="bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg"
            >
              <Share2 className="w-6 h-6" />
            </Button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {place.explore_categories && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">{place.explore_categories.icon}</span>
                    <span className="text-white/90 font-semibold">{place.explore_categories.name}</span>
                  </div>
                )}

                <h1 className="text-5xl font-bold text-white mb-4">{place.name}</h1>

                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{place.rating}</span>
                    <span className="text-sm">({place.review_count} reviews)</span>
                  </div>

                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-bold">{'₹'.repeat(place.price_level)}</span>
                  </div>

                  {place.is_open_now !== undefined && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      place.is_open_now 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">
                        {place.is_open_now ? 'Open Now' : 'Closed'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                      <TabsTrigger value="photos">Photos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-6">
                      {place.description && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-3">About</h3>
                          <p className="text-gray-600 leading-relaxed">{place.description}</p>
                        </div>
                      )}

                      {place.tags && place.tags.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-3">Features</h3>
                          <div className="flex flex-wrap gap-2">
                            {place.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {place.opening_hours && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-3">Hours</h3>
                          <div className="space-y-2">
                            {Object.entries(place.opening_hours as Record<string, string>).map(([day, hours]) => (
                              <div key={day} className="flex justify-between text-sm">
                                <span className="text-gray-600 capitalize">{day}</span>
                                <span className="text-gray-800 font-medium">{hours}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="reviews" className="space-y-4 mt-6">
                      {reviews.length > 0 ? (
                        reviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-200 pb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {review.review_text && (
                              <p className="text-gray-700">{review.review_text}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 text-center py-8">
                          No reviews yet. Be the first to review!
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="photos" className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                      {place.gallery && Array.isArray(place.gallery) && place.gallery.length > 0 ? (
                        place.gallery.map((photo, i) => (
                          <div key={i} className="aspect-square rounded-xl overflow-hidden">
                            <img
                              src={String(photo)}
                              alt={`${place.name} photo ${i + 1}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ))
                      ) : place.image_url ? (
                        <div className="col-span-3 aspect-video rounded-xl overflow-hidden">
                          <img
                            src={place.image_url}
                            alt={place.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <p className="col-span-3 text-gray-600 text-center py-8">
                          No photos available
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Contact</h3>

                  {place.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#1CC29F] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-800 font-medium">Address</p>
                        <p className="text-gray-600 text-sm">{place.address}, {place.city}</p>
                      </div>
                    </div>
                  )}

                  {place.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[#1CC29F]" />
                      <div>
                        <p className="text-gray-800 font-medium">Phone</p>
                        <a href={`tel:${place.phone}`} className="text-[#1CC29F] hover:underline text-sm">
                          {place.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {place.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-[#1CC29F]" />
                      <div>
                        <p className="text-gray-800 font-medium">Website</p>
                        <a 
                          href={place.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#1CC29F] hover:underline text-sm flex items-center gap-1"
                        >
                          Visit Website
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={handleCreateExpense}
                  className="w-full bg-gradient-to-r from-[#1CC29F] to-[#15A886] text-white hover:shadow-lg"
                  size="lg"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Add Expense Here
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-2 border-[#1CC29F] text-[#1CC29F] hover:bg-[#1CC29F] hover:text-white"
                  size="lg"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  Get Directions
                </Button>
              </div>

              <Card className="bg-gradient-to-br from-[#1CC29F] to-[#15A886] text-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">Place Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <span>Views</span>
                      </div>
                      <span className="font-bold">{place.view_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-5 h-5" />
                        <span>Bookmarks</span>
                      </div>
                      <span className="font-bold">{place.bookmark_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        <span>Reviews</span>
                      </div>
                      <span className="font-bold">{place.review_count || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}