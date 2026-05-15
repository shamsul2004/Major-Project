import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Loading from '../../components/student/Loading';
import { useClerk, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FiHome, FiUsers, FiBookOpen, FiShoppingBag, FiMenu, FiX, FiLogOut, FiDollarSign, FiDatabase } from 'react-icons/fi';

const lineChartData = [
  { name: 'Jan', revenue: 4000, users: 2400 },
  { name: 'Feb', revenue: 3000, users: 1398 },
  { name: 'Mar', revenue: 2000, users: 9800 },
  { name: 'Apr', revenue: 2780, users: 3908 },
  { name: 'May', revenue: 1890, users: 4800 },
  { name: 'Jun', revenue: 2390, users: 3800 },
  { name: 'Jul', revenue: 3490, users: 4300 },
];

const barChartData = [
  { name: 'Web Dev', students: 4000 },
  { name: 'Data Sci', students: 3000 },
  { name: 'Design', students: 2000 },
  { name: 'Marketing', students: 2780 },
];

const pieChartData = [
  { name: 'Completed', value: 400 },
  { name: 'In Progress', value: 300 },
  { name: 'Not Started', value: 300 },
];
const COLORS = ['#6366f1', '#a855f7', '#ec4899'];

const AdminDashboardIframe = () => {
  const { isAdmin, userData, backendUrl, getToken, currency } = useContext(AppContext);
  const navigate = useNavigate();
  const { openSignIn, signOut } = useClerk();
  const { isLoaded, isSignedIn } = useUser();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setDashboardStats(data.dashboardData);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin]);

  if (!isLoaded || (isSignedIn && userData === null)) {
    return <Loading />;
  }

  if (!isSignedIn) {
    openSignIn();
    navigate('/');
    return null;
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <FiHome className="w-5 h-5" /> },
    { id: 'database', label: 'Database (AdminJS)', icon: <FiDatabase className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800 selection:bg-indigo-100">
      
      {/* SIDEBAR */}
      <aside 
        className={`fixed md:relative z-50 h-full flex flex-col bg-white/80 backdrop-blur-xl border-r border-indigo-50/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isSidebarOpen ? 'w-72 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-indigo-50">
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
              L
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 whitespace-nowrap">
              Learnify Admin
            </span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors hidden md:block"
          >
            <FiMenu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          <p className={`text-xs font-semibold text-slate-400 mb-4 px-2 uppercase tracking-wider transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            Menu
          </p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-3 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <div className={`${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`}>
                {item.icon}
              </div>
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                {item.label}
              </span>
              {activeTab === item.id && isSidebarOpen && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-600" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-50">
          <button
            onClick={() => {
              signOut();
              navigate('/');
            }}
            className={`w-full flex items-center gap-4 px-3 py-3.5 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group ${!isSidebarOpen && 'justify-center'}`}
          >
            <FiLogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
        {/* HEADER */}
        <header className="h-20 bg-white/60 backdrop-blur-xl border-b border-indigo-50 flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 md:hidden"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-600">System Online</span>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md transition-all duration-300"
            >
              Back to Site
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-auto p-6 lg:p-10">
          {activeTab === 'overview' ? (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Total Users', value: dashboardStats?.totalUsers || '0', increase: '+12%', icon: <FiUsers />, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
                  { title: 'Total Revenue', value: `${currency}${dashboardStats?.totalRevenue?.toFixed(2) || '0.00'}`, increase: '+18%', icon: <FiDollarSign />, color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20' },
                  { title: 'Active Courses', value: dashboardStats?.totalCourses || '0', increase: '+5%', icon: <FiBookOpen />, color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' },
                  { title: 'Total Orders', value: dashboardStats?.totalOrders || '0', increase: '+24%', icon: <FiShoppingBag />, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/20' },
                ].map((card, i) => (
                  <div key={i} className="relative group overflow-hidden rounded-3xl bg-white border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center text-xl shadow-lg ${card.shadow} transform group-hover:rotate-6 transition-transform duration-300`}>
                        {card.icon}
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                        {card.increase}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-slate-500 text-sm font-medium mb-1">{card.title}</h3>
                      <p className="text-3xl font-bold text-slate-800 tracking-tight">{card.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CHARTS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LINE CHART */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Revenue Overview</h3>
                      <p className="text-sm text-slate-500">Monthly revenue vs user growth</p>
                    </div>
                    <button className="px-4 py-1.5 rounded-full bg-slate-50 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">
                      This Year
                    </button>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardStats?.lineChartData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={10} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                          cursor={{stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '5 5'}}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#6366f1" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6, stroke: '#6366f1', strokeWidth: 2, fill: '#fff'}} />
                        <Line yAxisId="right" type="monotone" dataKey="users" name="Active Users" stroke="#a855f7" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6, stroke: '#a855f7', strokeWidth: 2, fill: '#fff'}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* PIE CHART */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Course Completion</h3>
                    <p className="text-sm text-slate-500">Student progress status</p>
                  </div>
                  <div className="flex-1 h-[250px] w-full flex items-center justify-center mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          itemStyle={{ color: '#334155' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-2">
                    {pieChartData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-xs font-medium text-slate-600">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BAR CHART */}
                <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                   <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Enrollments by Category</h3>
                      <p className="text-sm text-slate-500">Most popular course categories</p>
                    </div>
                  </div>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardStats?.barChartData || []} margin={{ top: 5, right: 0, bottom: 5, left: 0 }} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                        <Tooltip 
                           cursor={{fill: '#f8fafc'}}
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="students" name="Students" radius={[6, 6, 6, 6]}>
                          {barChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
               <iframe
                src="/admin-panel"
                title="AdminJS Panel"
                className="w-full h-full border-0"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardIframe;
