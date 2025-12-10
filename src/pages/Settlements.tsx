import { useEffect, useState } from 'react';
import { Receipt, ArrowLeft, Calendar, FileText, CheckCircle2, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
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

      const { data: settlementsData, error: fetchError } = await supabase
        .from('settlements')
        .select(`
          *,
          payer:profiles!settlements_paid_by_fkey(full_name, email),
          receiver:profiles!settlements_paid_to_fkey(full_name, email)
        `)
        .or(`paid_by.eq.${user.id},paid_to.eq.${user.id}`)
        .order('settled_at', { ascending: false });
      
      if (fetchError) {
        console.error('Fetch error:', fetchError);
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      // Process settlements to handle array responses
      const processedSettlements = (settlementsData || []).map((s: any) => ({
        ...s,
        payer: Array.isArray(s.payer) ? s.payer[0] : s.payer,
        receiver: Array.isArray(s.receiver) ? s.receiver[0] : s.receiver,
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
      return `Today - ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday - ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
    
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
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

  const getAvatarColor = (name: string | null | undefined) => {
    const colors = [
      'bg-emerald-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-teal-500',
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  // Calculate statistics
  const totalSettlements = settlements?.length || 0;
  const totalAmount = settlements?.reduce((sum, s) => sum + s.amount, 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading settlements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Settlements</h3>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchSettlements}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-4 sm:px-6 lg:px-8 pt-8 pb-32">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-12">
            <button 
              onClick={() => window.history.back()}
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Settlements</h1>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-100 text-sm font-medium">Total Settlements</span>
                <Receipt className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="text-4xl font-bold">{totalSettlements}</div>
              <p className="text-emerald-100 text-xs mt-1">transactions recorded</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-100 text-sm font-medium">Total Amount</span>
                <TrendingUp className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="text-4xl font-bold">{formatCurrency(totalAmount)}</div>
              <p className="text-emerald-100 text-xs mt-1">settled between users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settlements List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Settlement History</h2>
              <p className="text-sm text-gray-500 mt-1">All payment settlements between users</p>
            </div>
          </div>
          
          {!settlements || settlements.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Settlements Yet</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Settlement records will appear here once payments are made between group members.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {settlements.map((settlement: Settlement) => {
                const payerName = settlement.payer?.full_name || 'Unknown User';
                const payerEmail = settlement.payer?.email || '';
                const receiverName = settlement.receiver?.full_name || 'Unknown User';
                const receiverEmail = settlement.receiver?.email || '';
                
                return (
                  <div 
                    key={settlement.id}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      {/* Payer Avatar */}
                      <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${getAvatarColor(payerName)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {getInitials(payerName)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900 text-base truncate">
                                {payerName}
                              </h3>
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Settled</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{payerEmail}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="font-medium">paid to</span>
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-lg ${getAvatarColor(receiverName)} flex items-center justify-center text-white text-xs font-bold`}>
                                  {getInitials(receiverName)}
                                </div>
                                <span className="font-semibold text-gray-900">{receiverName}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Amount Badge */}
                          <div className="flex-shrink-0 text-right">
                            <div className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-md">
                              <TrendingUp className="w-4 h-4" />
                              {formatCurrency(settlement.amount)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Date */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{formatDate(settlement.settled_at)}</span>
                          </div>
                        </div>
                        
                        {/* Notes */}
                        {settlement.notes && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-3">
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-amber-900 font-medium mb-1">Note</p>
                                <p className="text-sm text-amber-800">{settlement.notes}</p>
                              </div>
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

      {/* Bottom Spacing */}
      <div className="h-8"></div>
    </div>
  );
}

export default SettlementsPage;