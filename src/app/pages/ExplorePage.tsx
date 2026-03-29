import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, TrendingUp, TrendingDown, Filter, Heart, MessageCircle, Grid3x3, Sparkles, BookOpen, Award, ChevronRight, CheckCircle2, Plus, ThumbsDown, UserPlus, UserCheck, Shield, Lightbulb, Target, TrendingUpIcon, DollarSign, BarChart3, Zap, Lock } from 'lucide-react';
import { mockStocks, Stock } from '../data/mockStocks';
import { StockDetailModal } from '../components/StockDetailModal';
import { CreatePostModal } from '../components/CreatePostModal';
import { CommentsModal } from '../components/CommentsModal';
import { motion, AnimatePresence } from 'motion/react';
import { useGamification } from '../contexts/GamificationContext';
import { useSocial, Post } from '../contexts/SocialContext';
import { useAuth } from '../contexts/AuthContext';
import { topics } from '../data/learnTopics';
import { investmentGoals, aiRecommendations } from '../data/investmentPlans';
import basketMascot from 'figma:asset/cb8ffba2d07206d23ccab0368bab9721827c20ae.png';

interface ExplorePageProps {
  watchlist: Stock[];
  passed: Stock[];
  onAddToWatchlist: (stock: Stock) => void;
}

export function ExplorePage({ watchlist, passed, onAddToWatchlist }: ExplorePageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [detailModalStock, setDetailModalStock] = useState<Stock | null>(null);
  const [viewMode, setViewMode] = useState<'feed' | 'grid' | 'learn' | 'plan'>('feed');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; content: string; timestamp: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  
  const { data } = useGamification();
  const { user } = useAuth();
  const {
    posts,
    createPost,
    toggleLike,
    toggleDislike,
    addComment,
    toggleCommentLike,
    toggleCommentDislike,
    getPostComments,
    suggestedUsers,
    toggleFollow,
    isFollowing
  } = useSocial();

  // Get unique sectors
  const sectors = useMemo(() => {
    const sectorSet = new Set(mockStocks.map(stock => stock.sector));
    return ['All', ...Array.from(sectorSet)];
  }, []);

  // Filter stocks based on search and sector
  const filteredStocks = useMemo(() => {
    return mockStocks.filter(stock => {
      const matchesSearch = 
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSector = selectedSector === 'All' || stock.sector === selectedSector;
      
      return matchesSearch && matchesSector;
    });
  }, [searchQuery, selectedSector]);

  // Filter posts based on search
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    
    return posts.filter(post =>
      post.stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.caption.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, posts]);

  const handleStockClick = (stock: Stock) => {
    setDetailModalStock(stock);
  };

  const handleCreatePost = (stock: Stock, caption: string, sentiment: 'bullish' | 'bearish' | 'neutral') => {
    createPost(stock, caption, sentiment);
  };

  const handleCommentsClick = (post: Post) => {
    setSelectedPost(post);
    setIsCommentsOpen(true);
  };

  const handleAddComment = (content: string) => {
    if (selectedPost) {
      addComment(selectedPost.id, content);
    }
  };

  const handleSendAIMessage = (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAITyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = getAIResponse(message, data);
      const aiMessage = {
        role: 'ai' as const,
        content: aiResponses,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, aiMessage]);
      setIsAITyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const getAIResponse = (userMessage: string, userData: typeof data): string => {
    const msg = userMessage.toLowerCase();
    
    // Investment plan questions
    if (msg.includes('plan') || msg.includes('strategy') || msg.includes('invest')) {
      if (msg.includes('beginner') || msg.includes('start')) {
        return "Great question! 🌱 For beginners, I recommend the **Emergency Fund Builder** plan. It's perfect for starting your investment journey. You'll learn to:\n\n• Build a 3-6 month safety net\n• Open your first high-yield savings account\n• Set up automated savings\n• Understand basic budgeting\n\nThis plan takes 1-2 months and will earn you **150 XP**! Would you like me to break down the steps?";
      } else if (msg.includes('retirement') || msg.includes('401k') || msg.includes('pension')) {
        return "Excellent thinking ahead! 🎯 The **Retirement Planning** strategy is perfect for you. Here's what we'll cover:\n\n• Calculate your retirement needs\n• Maximize 401(k) matching\n• Understand IRA options\n• Create a diversified portfolio\n• Plan catch-up contributions\n\nThis is an advanced plan (requires 600 XP) that takes 3-4 months. Currently, you have **" + userData.xp + " XP**. " + (userData.xp >= 600 ? "You're ready to start! 🎉" : "Keep learning to unlock this plan!");
      } else if (msg.includes('dividend') || msg.includes('passive income')) {
        return "Smart choice! 💰 The **Dividend Income Strategy** is all about passive income. Here's the breakdown:\n\n• Research dividend aristocrats\n• Build a dividend portfolio\n• Understand DRIP programs\n• Calculate dividend yield\n• Track income growth\n\nThis intermediate plan (400 XP required) takes 2-3 months. You currently have **" + userData.xp + " XP**. " + (userData.xp >= 400 ? "You can start now!" : "Complete more lessons first!");
      } else {
        return "I can help you find the perfect investment plan! 🚀 Based on your current level (**Level " + userData.level + "**, " + userData.xp + " XP), I recommend:\n\n" + 
          (userData.xp < 200 ? "📚 **Emergency Fund Builder** - Start with the basics\n💡 **Risk Assessment Beginner** - Learn your risk tolerance" :
           userData.xp < 600 ? "📈 **Index Fund Investing** - Build a diversified portfolio\n💵 **Dividend Income Strategy** - Generate passive income" :
           "🎯 **Retirement Planning** - Long-term wealth building\n⚡ **Growth Stock Picker** - Advanced strategies") +
          "\n\nWhat type of plan interests you most?";
      }
    }
    
    // Personalized plan questions
    if (msg.includes('personalized') || msg.includes('custom') || msg.includes('my goals')) {
      return "I'd love to create a personalized plan for you! 🎨 Let me gather some info:\n\n📊 Your current progress:\n• Level: " + userData.level + "\n• XP: " + userData.xp + "\n• Completed lessons: " + userData.lessonProgress.filter(p => p.completed).length + "/" + topics.length + "\n\n💭 To customize your plan, tell me:\n1. What's your investment goal? (retirement, passive income, wealth building)\n2. What's your timeline? (short, medium, long-term)\n3. How much can you invest monthly?\n\nShare your goals and I'll design a perfect plan! ✨";
    }
    
    // XP and progress questions
    if (msg.includes('xp') || msg.includes('level') || msg.includes('progress')) {
      const nextLevelXP = userData.level * 100;
      const xpNeeded = nextLevelXP - userData.xp;
      return "Let's check your progress! 📊\n\n🏆 **Current Stats:**\n• Level: " + userData.level + "\n• Total XP: " + userData.xp + "\n• Next level: " + xpNeeded + " XP needed\n\n📚 **Learning Progress:**\n• Completed: " + userData.lessonProgress.filter(p => p.completed).length + "/" + topics.length + " lessons\n• Avg Score: " + (userData.lessonProgress.length > 0 ? Math.round(userData.lessonProgress.reduce((sum, p) => sum + (p.score || 0), 0) / userData.lessonProgress.length) : 0) + "%\n\n💪 **Quick ways to earn XP:**\n• Complete a lesson: +50 XP\n• Ace a quiz: +100 XP\n• Daily login: +10 XP\n\nKeep up the great work! 🌟";
    }
    
    // Risk tolerance questions
    if (msg.includes('risk') || msg.includes('safe') || msg.includes('aggressive')) {
      return "Understanding your risk tolerance is crucial! 🎯 Based on your experience level (Level " + userData.level + "), here's my assessment:\n\n" +
        (userData.level < 5 ? "**Conservative Approach** 🛡️\n• Focus on low-risk index funds\n• Build emergency fund first\n• Learn fundamentals before trading\n• Diversification is key!" :
         userData.level < 10 ? "**Balanced Approach** ⚖️\n• Mix of index funds & individual stocks\n• 70% stable, 30% growth\n• Start exploring dividend stocks\n• Consider bond allocation" :
         "**Growth-Oriented** 🚀\n• Higher risk, higher reward\n• Growth stocks & emerging markets\n• Options strategies (if experienced)\n• Active portfolio management") +
        "\n\nWant to take a risk assessment quiz to find your perfect balance?";
    }
    
    // Stock recommendations
    if (msg.includes('stock') || msg.includes('buy') || msg.includes('recommend')) {
      return "I can help with stock research! 📈 However, I'm an educational AI, not a financial advisor. Here's how I can help:\n\n✅ **What I can do:**\n• Teach you stock analysis\n• Explain company fundamentals\n• Show you research tools\n• Guide your learning\n\n❌ **What I can't do:**\n• Give specific buy/sell advice\n• Predict market movements\n• Guarantee returns\n\n💡 **Try this instead:**\n• Complete the 'Stock Analysis' lesson\n• Learn to read financial statements\n• Practice with paper trading\n\nWould you like to start a lesson on stock research?";
    }
    
    // General help
    if (msg.includes('help') || msg.includes('how') || msg.includes('what can you')) {
      return "Hi! Baggio here, your investment buddy! 🤖✨ Here's what I can help with:\n\n💡 **Investment Planning:**\n• Create personalized plans\n• Recommend learning paths\n• Track your progress\n\n📚 **Education:**\n• Answer finance questions\n• Explain investment concepts\n• Guide through lessons\n\n🎯 **Goal Setting:**\n• Define investment goals\n• Build actionable steps\n• Celebrate milestones\n\nJust ask me anything like:\n• \"Create a personalized plan for me\"\n• \"What's my progress?\"\n• \"Help me understand risk\"\n\nWhat would you like to know? 😊";
    }
    
    // Greeting
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return "Hey there! 👋😊 Baggio's so glad you're here! I'm here to help you achieve your financial goals.\n\nYou're currently at **Level " + userData.level + "** with **" + userData.xp + " XP** - that's awesome! 🎉\n\nWhat would you like to work on today? I can help you:\n• Build a personalized investment plan 📊\n• Answer questions about investing 💡\n• Track your learning progress 📈\n• Find the perfect strategy for your goals 🎯";
    }
    
    // Default response
    return "That's a great question! 🤔 Baggio wants to give you the best answer possible. Could you be more specific? \n\nYou can ask me about:\n• Investment plans and strategies 📊\n• Your progress and XP 🏆\n• Risk tolerance 🎯\n• Learning recommendations 📚\n• Goal setting 💰\n\nWhat would you like to know more about?";
  };

  return (
    <div className="px-3 sm:px-4 py-3 sm:py-4 pb-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Explore</h1>
        <p className="text-slate-400 text-sm sm:text-base font-medium">Discover trending stocks & community insights</p>
      </div>

      {/* View Mode Tabs */}
      <div className="mb-4 flex gap-2 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/30">
        <button
          onClick={() => setViewMode('feed')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
            viewMode === 'feed'
              ? 'bg-[#2C3863] text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">For You</span>
          <span className="sm:hidden">Feed</span>
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
            viewMode === 'grid'
              ? 'bg-[#2C3863] text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
          }`}
        >
          <Grid3x3 className="w-3.5 h-3.5" />
          <span>Browse</span>
        </button>
        <button
          onClick={() => setViewMode('learn')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
            viewMode === 'learn'
              ? 'bg-[#2C3863] text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Learn</span>
        </button>
        <button
          onClick={() => setViewMode('plan')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
            viewMode === 'plan'
              ? 'bg-[#2C3863] text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Plan</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={viewMode === 'feed' ? 'Search posts...' : viewMode === 'grid' ? 'Search stocks...' : 'Search lessons...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2C3863] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Sector Filter Tabs - Only show in grid mode */}
      {viewMode === 'grid' && (
        <div className="mb-5 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2">
            {sectors.map((sector) => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                  selectedSector === sector
                    ? 'bg-[#2C3863] text-white shadow-lg shadow-[#2C3863]/30'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'feed' ? (
          <motion.div
            key="feed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* For You Feed */}
            {/* People to Follow Section */}
            {!searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h2 className="text-white font-bold text-lg mb-3">People to Follow</h2>
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-3 pb-2">
                    {suggestedUsers.map((suggestedUser, index) => (
                      <motion.div
                        key={suggestedUser.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex-shrink-0 w-40 bg-gradient-to-br from-slate-800/60 to-slate-800/40 rounded-2xl p-4 border border-slate-700/50 hover:border-[#2C3863]/50 transition-all"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-3">
                            <img
                              src={suggestedUser.avatar}
                              alt={suggestedUser.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-slate-700"
                            />
                            {suggestedUser.verified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#2C3863] rounded-full flex items-center justify-center border-2 border-slate-800">
                                <Shield className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-white font-bold text-sm mb-0.5 truncate w-full">
                            {suggestedUser.name}
                          </h3>
                          <p className="text-slate-400 text-xs mb-2 truncate w-full">
                            {suggestedUser.username}
                          </p>
                          <p className="text-slate-500 text-xs mb-3 line-clamp-2 h-8">
                            {suggestedUser.bio}
                          </p>
                          <p className="text-slate-400 text-xs mb-3">
                            {suggestedUser.followers >= 1000 ? `${(suggestedUser.followers / 1000).toFixed(0)}K` : suggestedUser.followers} followers
                          </p>
                          <button
                            onClick={() => toggleFollow(suggestedUser.id)}
                            className={`w-full py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                              isFollowing(suggestedUser.id)
                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                : 'bg-[#2C3863] text-white hover:bg-[#3d4a7d]'
                            }`}
                          >
                            {isFollowing(suggestedUser.id) ? (
                              <span className="flex items-center justify-center gap-1">
                                <UserCheck className="w-3 h-3" />
                                Following
                              </span>
                            ) : (
                              <span className="flex items-center justify-center gap-1">
                                <UserPlus className="w-3 h-3" />
                                Follow
                              </span>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-medium text-sm sm:text-base">No posts found</p>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">Try a different search or create a post!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-[#2C3863]/50 transition-all duration-300"
                  >
                    {/* Post Header */}
                    <div className="p-4 flex items-center gap-3">
                      <img
                        src={post.user.avatar}
                        alt={post.user.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-bold text-sm truncate">
                            {post.user.name}
                          </span>
                          {post.user.verified && (
                            <svg className="w-4 h-4 text-[#2C3863]" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs">{post.user.username}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400 text-xs">{post.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Card */}
                    <div
                      onClick={() => handleStockClick(post.stock)}
                      className="mx-4 mb-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-[#2C3863]/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-bold text-lg">{post.stock.symbol}</span>
                            <span
                              className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                post.stock.change >= 0
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {post.stock.change >= 0 ? '+' : ''}
                              {post.stock.changePercent.toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs">{post.stock.name}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold text-xl">
                            ${post.stock.price.toFixed(2)}
                          </div>
                          <div className={`text-xs font-semibold ${
                            post.stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {post.stock.change >= 0 ? '+' : ''}${post.stock.change.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Caption */}
                    <div className="px-4 pb-3">
                      <p className="text-slate-200 text-sm leading-relaxed">
                        {post.caption}
                      </p>
                    </div>

                    {/* Sentiment Badge */}
                    <div className="px-4 pb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          post.sentiment === 'bullish'
                            ? 'bg-green-500/20 text-green-400'
                            : post.sentiment === 'bearish'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {post.sentiment === 'bullish' && <TrendingUp className="w-3 h-3" />}
                        {post.sentiment === 'bearish' && <TrendingDown className="w-3 h-3" />}
                        {post.sentiment.charAt(0).toUpperCase() + post.sentiment.slice(1)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="px-4 pb-4 flex items-center gap-6">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-2 transition-colors group ${
                          user && post.likedBy.includes(user.email)
                            ? 'text-red-400'
                            : 'text-slate-400 hover:text-red-400'
                        }`}
                      >
                        <Heart
                          className={`w-5 h-5 group-hover:scale-110 transition-transform ${
                            user && post.likedBy.includes(user.email) ? 'fill-current' : ''
                          }`}
                        />
                        <span className="text-sm font-semibold">{post.likes.toLocaleString()}</span>
                      </button>
                      <button
                        onClick={() => toggleDislike(post.id)}
                        className={`flex items-center gap-2 transition-colors group ${
                          user && post.dislikedBy.includes(user.email)
                            ? 'text-blue-400'
                            : 'text-slate-400 hover:text-blue-400'
                        }`}
                      >
                        <ThumbsDown
                          className={`w-5 h-5 group-hover:scale-110 transition-transform ${
                            user && post.dislikedBy.includes(user.email) ? 'fill-current' : ''
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleCommentsClick(post)}
                        className="flex items-center gap-2 text-slate-400 hover:text-[#2C3863] transition-colors group"
                      >
                        <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-semibold">{post.comments.toLocaleString()}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Results count */}
            <div className="mb-3 flex items-center justify-between">
              <p className="text-slate-400 text-sm font-medium">
                {filteredStocks.length} {filteredStocks.length === 1 ? 'stock' : 'stocks'}
              </p>
            </div>

            {/* Stock Grid - Instagram style */}
            <AnimatePresence mode="popLayout">
              {filteredStocks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 sm:py-16 bg-slate-800/30 rounded-2xl border border-slate-700/50"
                >
                  <Filter className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium text-sm sm:text-base">No stocks found</p>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">Try adjusting your filters</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {filteredStocks.map((stock, index) => (
                    <motion.div
                      key={stock.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        delay: index * 0.03,
                        duration: 0.3,
                        layout: { duration: 0.3 }
                      }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleStockClick(stock)}
                      className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 rounded-2xl p-4 border border-slate-700/50 hover:border-[#2C3863]/50 transition-all duration-300 cursor-pointer relative overflow-hidden group aspect-square flex flex-col justify-between"
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2C3863]/0 to-[#2C3863]/0 group-hover:from-[#2C3863]/10 group-hover:to-[#2C3863]/5 transition-all duration-500 rounded-2xl" />
                      
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        {/* Top section */}
                        <div>
                          {/* Symbol and change badge */}
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg sm:text-xl font-bold text-white truncate flex-1 mr-2">
                              {stock.symbol}
                            </h3>
                            <div
                              className={`px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all duration-300 group-hover:scale-105 ${
                                stock.change >= 0
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {stock.change >= 0 ? (
                                <TrendingUp className="w-3 h-3 inline" />
                              ) : (
                                <TrendingDown className="w-3 h-3 inline" />
                              )}
                            </div>
                          </div>

                          {/* Company name */}
                          <p className="text-slate-400 text-xs truncate mb-3 font-medium">
                            {stock.name}
                          </p>
                        </div>

                        {/* Bottom section */}
                        <div>
                          {/* Price */}
                          <div className="mb-2">
                            <span className="text-2xl sm:text-3xl font-extrabold text-white block">
                              ${stock.price.toFixed(2)}
                            </span>
                            <span
                              className={`text-xs font-bold ${
                                stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {stock.change >= 0 ? '+' : ''}
                              {stock.changePercent.toFixed(2)}%
                            </span>
                          </div>

                          {/* Sector tag */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500 bg-slate-700/50 px-2 py-1 rounded-lg truncate">
                              {stock.sector}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : viewMode === 'learn' ? (
          <motion.div
            key="learn"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Learn Content - Topic Overview */}
            <div className="pb-6">
              {/* Header with mascot */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-1">
                    <p className="text-slate-400 text-sm">Master stock market basics & earn XP</p>
                  </div>
                  {/* Cute Basket Mascot */}
                  <motion.div
                    animate={{ 
                      y: [0, -12, 0],
                    }}
                    transition={{ 
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-20 h-20 flex-shrink-0 relative"
                  >
                    <motion.img 
                      src={basketMascot} 
                      alt="Stockr Learning Buddy" 
                      className="w-full h-full object-contain drop-shadow-2xl"
                      animate={{
                        rotate: [0, -3, 3, -3, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    />
                    {/* Sparkle effects */}
                    <motion.div
                      className="absolute -top-1 -right-1 text-xl"
                      animate={{
                        scale: [0, 1, 0],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      ✨
                    </motion.div>
                    <motion.div
                      className="absolute -bottom-1 -left-1 text-lg"
                      animate={{
                        scale: [0, 1, 0],
                        rotate: [0, -180, -360],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.8
                      }}
                    >
                      💡
                    </motion.div>
                  </motion.div>
                </div>

                {/* Friendly tip */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-4"
                >
                  <div className="flex gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-purple-100 text-sm font-medium mb-1">Hey there, investor! 🎓</p>
                      <p className="text-purple-200/80 text-xs leading-relaxed">
                        Complete lessons to earn XP and unlock achievements. Each topic has flashcards and a quiz!
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Progress Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 gap-3 mb-6"
              >
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-400 text-xs">Completed</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {data.lessonProgress.filter(p => p.completed).length}/{topics.length}
                  </div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-warning" />
                    <span className="text-slate-400 text-xs">Avg Score</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {data.lessonProgress.length > 0
                      ? Math.round(
                          data.lessonProgress.reduce((sum, p) => sum + (p.score || 0), 0) /
                            data.lessonProgress.length
                        )
                      : 0}%
                  </div>
                </div>
              </motion.div>

              {/* Topic Cards */}
              <div className="space-y-3">
                {topics.map((topic, index) => {
                  const progress = data.lessonProgress.find(p => p.topicId === topic.id);
                  return (
                    <motion.a
                      key={topic.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href="/learn"
                      className="block w-full bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50 rounded-xl p-4 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2C3863] to-[#1f2847] flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
                          {topic.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold">{topic.title}</h3>
                            {progress?.completed && (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                          <p className="text-slate-400 text-xs mb-2">{topic.description}</p>
                          {progress?.completed && (
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-green-400 font-medium">
                                Score: {progress.score}%
                              </div>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="plan"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Plan Content - Investment Strategy */}
            <div className="pb-6">
              {/* Header with mascot */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-1">
                    <p className="text-slate-400 text-sm">AI-powered investment plans tailored to your goals</p>
                  </div>
                  {/* Cute Basket Mascot - AI Version - CLICKABLE */}
                  <motion.button
                    onClick={() => setIsAIChatOpen(!isAIChatOpen)}
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 flex-shrink-0 relative cursor-pointer group"
                  >
                    {/* Pulsing glow ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-30"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    <motion.img 
                      src={basketMascot} 
                      alt="Click me to chat!" 
                      className="w-full h-full object-contain drop-shadow-2xl relative z-10"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    
                    {/* Chat indicator badge */}
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg z-20"
                      animate={{
                        scale: [1, 1.15, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                    
                    {/* AI Sparkle effects */}
                    <motion.div
                      className="absolute -top-1 -left-1 text-xl z-10"
                      animate={{
                        scale: [0, 1.2, 0],
                        rotate: [0, 90, 180],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      🌟
                    </motion.div>
                    <motion.div
                      className="absolute -bottom-1 -left-1 text-lg z-10"
                      animate={{
                        scale: [0, 1, 0],
                        y: [0, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    >
                      🎯
                    </motion.div>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white text-xs py-1 px-2 rounded-lg pointer-events-none">
                      Chat with Baggio! 💬
                    </div>
                  </motion.button>
                </div>

                {/* Baggio's Suggestion */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4"
                >
                  <div className="flex gap-3">
                    <Lightbulb className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-purple-100 text-sm font-medium mb-1">Baggio's Suggestion 💡</p>
                      <p className="text-purple-200/80 text-xs leading-relaxed">
                        {data.xp < 200 
                          ? aiRecommendations.beginner.message
                          : data.xp < 600 
                          ? aiRecommendations.intermediate.message
                          : aiRecommendations.advanced.message
                        }
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Chat with Baggio CTA */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => setIsAIChatOpen(true)}
                  className="mt-3 w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/40 rounded-xl p-3 transition-all group"
                >
                  <div className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4 text-purple-300 group-hover:scale-110 transition-transform" />
                    <span className="text-purple-200 text-sm font-semibold">Chat with Baggio</span>
                    <motion.div
                      animate={{
                        x: [0, 3, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ChevronRight className="w-4 h-4 text-purple-300" />
                    </motion.div>
                  </div>
                </motion.button>
              </motion.div>

              {/* Your Level & XP */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 gap-3 mb-6"
              >
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-warning" />
                    <span className="text-slate-400 text-xs">Current XP</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {data.xp}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Level {data.level}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-400 text-xs">Plans Available</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {investmentGoals.filter(goal => data.xp >= goal.requiredXP).length}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">of {investmentGoals.length} total</div>
                </div>
              </motion.div>

              {/* Investment Goal Cards */}
              <div className="space-y-3">
                {investmentGoals.map((goal, index) => {
                  const isLocked = data.xp < goal.requiredXP;
                  const completedSteps = goal.steps.filter(s => s.completed).length;
                  const totalSteps = goal.steps.length;
                  const progressPercent = (completedSteps / totalSteps) * 100;
                  
                  return (
                    <motion.button
                      key={goal.id}
                      onClick={() => !isLocked && navigate(`/plan/${goal.id}`)}
                      disabled={isLocked}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={!isLocked ? { scale: 1.02 } : {}}
                      whileTap={!isLocked ? { scale: 0.98 } : {}}
                      className={`w-full bg-slate-800/50 border rounded-xl p-4 transition-all relative overflow-hidden text-left ${
                        isLocked 
                          ? 'border-slate-700/30 opacity-60' 
                          : 'border-slate-700/50 hover:bg-slate-800/70 cursor-pointer hover:border-purple-500/50'
                      }`}
                    >
                      {/* Glow effect for unlocked plans */}
                      {!isLocked && (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 hover:from-purple-500/5 hover:to-pink-500/5 transition-all duration-500 rounded-xl" />
                      )}
                      
                      <div className="relative z-10">
                        <div className="flex items-start gap-4 mb-3">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl flex-shrink-0 shadow-lg ${
                            isLocked 
                              ? 'from-slate-700 to-slate-800' 
                              : goal.difficulty === 'beginner'
                              ? 'from-green-600 to-emerald-700'
                              : goal.difficulty === 'intermediate'
                              ? 'from-blue-600 to-indigo-700'
                              : 'from-purple-600 to-pink-700'
                          }`}>
                            {isLocked ? '🔒' : goal.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-white font-semibold">{goal.title}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                goal.difficulty === 'beginner'
                                  ? 'bg-green-500/20 text-green-400'
                                  : goal.difficulty === 'intermediate'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-purple-500/20 text-purple-400'
                              }`}>
                                {goal.difficulty}
                              </span>
                              {isLocked && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-700/50 text-slate-400 flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  {goal.requiredXP} XP
                                </span>
                              )}
                            </div>
                            <p className="text-slate-400 text-xs mb-2">{goal.description}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                ⏱️ {goal.timeframe}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                📝 {totalSteps} steps
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {!isLocked && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-400">Progress</span>
                              <span className="text-xs font-semibold text-slate-300">
                                {completedSteps}/{totalSteps}
                              </span>
                            </div>
                            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                                className={`h-full rounded-full ${
                                  goal.difficulty === 'beginner'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                    : goal.difficulty === 'intermediate'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                                }`}
                              />
                            </div>
                          </div>
                        )}

                        {/* Action Steps Preview (first 3) */}
                        {!isLocked && (
                          <div className="space-y-2">
                            {goal.steps.slice(0, 3).map((step, stepIndex) => (
                              <div
                                key={step.id}
                                className="flex items-center gap-2 text-xs"
                              >
                                <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                                  step.completed 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-slate-700/50 text-slate-500'
                                }`}>
                                  {step.completed ? '✓' : stepIndex + 1}
                                </div>
                                <span className={`flex-1 ${
                                  step.completed ? 'text-slate-500 line-through' : 'text-slate-300'
                                }`}>
                                  {step.title}
                                </span>
                                <span className="text-warning font-semibold">
                                  +{step.xpReward} XP
                                </span>
                              </div>
                            ))}
                            {totalSteps > 3 && (
                              <div className="text-xs text-slate-500 text-center pt-1">
                                +{totalSteps - 3} more steps
                              </div>
                            )}
                          </div>
                        )}

                        {/* Locked Message */}
                        {isLocked && (
                          <div className="text-center py-2">
                            <p className="text-xs text-slate-500">
                              Complete more lessons and earn {goal.requiredXP - data.xp} more XP to unlock
                            </p>
                          </div>
                        )}

                        {/* CTA Button */}
                        {!isLocked && (
                          <div className="mt-4">
                            <button className={`w-full py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                              goal.difficulty === 'beginner'
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/20'
                                : goal.difficulty === 'intermediate'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/20'
                            }`}>
                              {completedSteps === 0 ? 'Start Plan' : completedSteps === totalSteps ? 'Completed! 🎉' : 'Continue Plan'}
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}\n                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button - Only show in feed mode */}
      {viewMode === 'feed' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCreatePostOpen(true)}
          className="fixed bottom-24 sm:bottom-28 right-4 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-[#2C3863] hover:bg-[#3d4a7d] rounded-full shadow-2xl shadow-[#2C3863]/50 flex items-center justify-center z-40 transition-colors"
        >
          <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </motion.button>
      )}

      {/* Floating AI Chat Button - Only show in plan mode */}
      {viewMode === 'plan' && !isAIChatOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAIChatOpen(true)}
          className="fixed bottom-24 sm:bottom-28 right-4 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full shadow-2xl shadow-purple-500/50 flex items-center justify-center z-40 transition-all group"
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
          {/* Pulsing ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-400"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.button>
      )}

      {/* Stock Detail Modal */}
      {detailModalStock && (
        <StockDetailModal
          stock={detailModalStock}
          isOpen={!!detailModalStock}
          onClose={() => setDetailModalStock(null)}
        />
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmit={handleCreatePost}
      />

      {/* Comments Modal */}
      {selectedPost && (
        <CommentsModal
          isOpen={isCommentsOpen}
          onClose={() => {
            setIsCommentsOpen(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
          comments={getPostComments(selectedPost.id)}
          onAddComment={handleAddComment}
          onToggleCommentLike={toggleCommentLike}
          onToggleCommentDislike={toggleCommentDislike}
        />
      )}

      {/* AI Chat Modal - Only show in plan mode */}
      <AnimatePresence>
        {isAIChatOpen && viewMode === 'plan' && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAIChatOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            />
            
            {/* Chat Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-4 bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 sm:w-[460px] sm:h-[600px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-2 border-purple-500/50 shadow-2xl shadow-purple-500/30 z-[101] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center gap-3">
                <motion.img 
                  src={basketMascot} 
                  alt="Baggio" 
                  className="w-12 h-12 object-contain drop-shadow-lg"
                  animate={{
                    rotate: [0, -5, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">AI Investment Buddy</h3>
                  <p className="text-purple-100 text-xs">Ask me anything about investing! 🚀</p>
                </div>
                <button
                  onClick={() => setIsAIChatOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <span className="text-white text-xl">×</span>
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-6xl mb-4"
                    >
                      👋
                    </motion.div>
                    <h4 className="text-white font-bold text-lg mb-2">Hi {user?.name || 'there'}!</h4>
                    <p className="text-slate-400 text-sm mb-4 px-4">
                      I'm your personal AI investment assistant. I can help you:
                    </p>
                    <div className="space-y-2 text-left max-w-xs mx-auto">
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <p className="text-purple-300 text-sm">💡 Create personalized investment plans</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <p className="text-purple-300 text-sm">📊 Track your progress & XP</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <p className="text-purple-300 text-sm">🎯 Answer investment questions</p>
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs mt-4 px-4">
                      Try asking: "Create a personalized plan for me"
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {chatMessages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'ai' && (
                          <img 
                            src={basketMascot} 
                            alt="AI" 
                            className="w-8 h-8 object-contain flex-shrink-0"
                          />
                        )}
                        <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                          <div
                            className={`rounded-2xl px-4 py-3 ${
                              message.role === 'user'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'bg-slate-800/70 border border-slate-700/50 text-slate-200'
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                          </div>
                          <p className={`text-xs text-slate-500 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                            {message.timestamp}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {isAITyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2"
                      >
                        <img 
                          src={basketMascot} 
                          alt="AI" 
                          className="w-8 h-8 object-contain flex-shrink-0"
                        />
                        <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl px-4 py-3">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                              className="w-2 h-2 bg-purple-400 rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                              className="w-2 h-2 bg-purple-400 rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                              className="w-2 h-2 bg-purple-400 rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAIMessage(chatInput);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me about investing..."
                    className="flex-1 bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    disabled={isAITyping}
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!chatInput.trim() || isAITyping}
                    className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl text-white font-bold text-sm transition-all shadow-lg"
                  >
                    Send
                  </motion.button>
                </form>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  AI responses are for educational purposes only
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom scrollbar hide styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}