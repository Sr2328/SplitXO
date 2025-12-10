import { useEffect, useState } from 'react';
import { Receipt, Calendar, FileText, CheckCircle2, Loader2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Settlement {
  id: string;
  group_id: string;
  paid_by: string;
  paid_to: string;
  amount: number;
  notes: string | null;
  settled_at: string;
  payer?: {
    full_name: string | null;
    email: string | null;
  };
  receiver?: {
    full_name: string | null;
    email: string | null;
  };
}

function SettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setCurrentUser(user);

      const { data: settlementsData, error: fetchError } = await supabase
        .from('settlements')
        .select(`
          id,
          group_id,
          paid_by,
          paid_to,
          amount,
          notes,
          settled_at,
          created_at,
          receipt_url
        `)
        .or(`paid_by.eq.${user.id},paid_to.eq.${user.id}`)
        .order('settled_at', { ascending: false });
      
      if (fetchError) {
        console.error('Fetch error:', fetchError);
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      if (!settlementsData || settlementsData.length === 0) {
        setSettlements([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs from settlements
      const userIds = new Set<string>();
      settlementsData.forEach((s: any) => {
        userIds.add(s.paid_by);
        userIds.add(s.paid_to);
      });

      // Fetch user profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', Array.from(userIds));

      if (profilesError) {
        console.error('Profiles fetch error:', profilesError);
      }

      // Create a map of user profiles
      const profilesMap = new Map();
      (profilesData || []).forEach((profile: any) => {
        profilesMap.set(profile.user_id, profile);
      });

      // Process settlements with profile data
      const processedSettlements = settlementsData.map((s: any) => ({
        ...s,
        payer: profilesMap.get(s.paid_by) || { full_name: null, email: null },
        receiver: profilesMap.get(s.paid_to) || { full_name: null, email: null },
      }));

      setSettlements(processedSettlements);
    } catch (err: any) {
      console.error('Error fetching settlements:', err);
      setError(err.message || 'Failed to load settlements');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getAvatarColor = (userId: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-indigo-500',
    ];
    const index = (userId?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  // Calculate statistics
  const totalSettlements = settlements?.length || 0;
  const totalAmount = settlements?.reduce((sum, s) => sum + s.amount, 0) || 0;
  const youPaid = settlements?.filter(s => s.paid_by === currentUser?.id).reduce((sum, s) => sum + s.amount, 0) || 0;
  const youReceived = settlements?.filter(s => s.paid_to === currentUser?.id).reduce((sum, s) => sum + s.amount, 0) || 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-teal-100">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
            <p className="text-gray-600 text-lg">Loading settlements...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchSettlements}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Settlements</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Track and manage all your shared settlements</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Amount Card */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <CheckCircle2 className="w-6 h-6 text-white/60" />
          </div>
          <p className="text-white/80 text-sm font-medium mb-1">TOTAL SETTLED</p>
          <h2 className="text-3xl font-bold mb-1">{formatCurrency(totalAmount)}</h2>
          <p className="text-white/70 text-sm">{totalSettlements} Settlements</p>
        </div>

        {/* You Paid Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">YOU PAID</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(youPaid)}</h3>
          <p className="text-gray-500 text-sm">{settlements?.filter(s => s.paid_by === currentUser?.id).length} payments</p>
        </div>

        {/* You Received Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">YOU RECEIVED</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(youReceived)}</h3>
          <p className="text-gray-500 text-sm">{settlements?.filter(s => s.paid_to === currentUser?.id).length} received</p>
        </div>
      </div>

      {/* Settlements List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <span className="text-sm text-gray-500 font-medium">{totalSettlements} total</span>
          </div>
        </div>
        
        {settlements.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-100">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Settlements</h3>
            <p className="text-gray-500">Settlement records will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {settlements.map((settlement) => {
              const isPaid = settlement.paid_by === currentUser?.id;
              const otherPerson = isPaid ? settlement.receiver : settlement.payer;
              const otherUserId = isPaid ? settlement.paid_to : settlement.paid_by;
              
              return (
                <div key={settlement.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${getAvatarColor(otherUserId)}`}>
                      {getInitials(otherPerson?.full_name)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-gray-900 truncate">
                            {otherPerson?.full_name || 'Unknown User'}
                          </h4>
                          <p className="text-sm text-gray-500 font-medium">
                            {isPaid ? 'You paid' : 'Paid you'}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className={`text-lg font-bold ${isPaid ? 'text-red-600' : 'text-green-600'}`}>
                            {isPaid ? '-' : '+'}{formatCurrency(settlement.amount)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">{formatDate(settlement.settled_at)}</span>
                        </div>
                        <span>•</span>
                        <span>{formatTime(settlement.settled_at)}</span>
                        <div className="flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 font-medium">Settled</span>
                        </div>
                      </div>
                      
                      {settlement.notes && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="flex items-start space-x-2">
                            <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700 font-medium">{settlement.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SettlementsPage;