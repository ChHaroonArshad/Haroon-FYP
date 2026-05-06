import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Palette, Heart, Shield, Users, TrendingUp, MessageCircle,
  Package, Star, Search, Upload, DollarSign, Truck,
  Award, Target, Eye, Lightbulb, Zap, Loader
} from 'lucide-react';
import Navbar     from './Navbar';
import Footer     from './Footer';
import { adminAPI } from '../services/api';

const VALUES = [
  { icon: Heart,     title: 'Community First', desc: 'Building a supportive ecosystem for artists and art lovers'      },
  { icon: Shield,    title: 'Trust & Security', desc: 'Secure transactions with admin verification and delivery tracking'},
  { icon: Target,    title: 'Local Focus',      desc: 'Empowering Pakistani artists and celebrating local talent'       },
  { icon: Lightbulb, title: 'Innovation',       desc: 'Bringing modern technology to traditional art commerce'          },
];

const BUYER_STEPS = [
  { step: 1, icon: Search,        title: 'Browse & Discover',   desc: 'Explore unique artworks from talented Pakistani artists',                   color: 'bg-blue-500'   },
  { step: 2, icon: MessageCircle, title: 'Connect with Artists', desc: 'Chat directly, negotiate prices, and request custom pieces',               color: 'bg-green-500'  },
  { step: 3, icon: DollarSign,    title: 'Secure Payment',       desc: 'Make peer-to-peer payments and share proof within the platform',           color: 'bg-purple-500' },
  { step: 4, icon: Truck,         title: 'Track Delivery',       desc: 'Monitor your artwork delivery with real-time tracking updates',            color: 'bg-orange-500' },
];

const SELLER_STEPS = [
  { step: 1, icon: Upload,     title: 'Create Profile',     desc: 'Set up your artist profile and showcase your portfolio',          color: 'bg-purple-500' },
  { step: 2, icon: Palette,    title: 'Upload Artworks',    desc: 'Add artworks with details, pricing, and high-quality images',     color: 'bg-pink-500'   },
  { step: 3, icon: Users,      title: 'Engage with Buyers', desc: 'Respond to inquiries, accept custom orders, build your audience', color: 'bg-blue-500'   },
  { step: 4, icon: TrendingUp, title: 'Grow Your Business', desc: 'Track sales, earnings, and analytics from your dashboard',        color: 'bg-green-500'  },
];

const FEATURES = [
  { icon: Shield,        title: 'Admin Verification', desc: 'All payments and artworks verified by our admin team'   },
  { icon: MessageCircle, title: 'Direct Chat',         desc: 'Real-time communication between buyers and sellers'    },
  { icon: Package,       title: 'Delivery Tracking',   desc: 'Location-based tracking from studio to doorstep'       },
  { icon: Star,          title: 'Reviews & Ratings',   desc: 'Build trust with transparent feedback system'          },
  { icon: Zap,           title: 'Live Sessions',        desc: 'Watch artists create and interact in real-time'        },
  { icon: Award,         title: 'Custom Orders',        desc: 'Request personalized artworks tailored to your needs'  },
];

const TEAM = [
  { name: 'Haroon Arshad', role: 'Project Lead',        gradient: 'from-purple-500 to-indigo-500' },
  { name: 'Usama Ifzal',   role: 'Full Stack Developer', gradient: 'from-blue-500 to-cyan-500'    },
  { name: 'Faran Naveed',  role: 'UI/UX Designer',       gradient: 'from-pink-500 to-rose-500'    },
];

export default function AboutAndHowItWorks() {
  const [activePage, setActivePage] = useState('about');
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(d => setStats(d.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: Users,   num: stats ? `${stats.totalArtists}+`  : '…', label: 'Artists'  },
    { icon: Palette, num: stats ? `${stats.totalArtworks}+` : '…', label: 'Artworks' },
    { icon: Star,    num: stats ? `${stats.totalOrders}+`   : '…', label: 'Sales'    },
    { icon: Award,   num: '4.8/5',                                  label: 'Rating'   },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero with tabs */}
      <div className="bg-gradient-to-br from-purple-800 via-purple-700 to-blue-700 pt-12 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            {activePage === 'about' ? 'About ArtBazaar' : 'How It Works'}
          </h1>
          <p className="text-white/80 text-base md:text-xl max-w-2xl mx-auto mb-8">
            {activePage === 'about'
              ? "Pakistan's first dedicated digital marketplace connecting artists and art enthusiasts nationwide."
              : 'Simple steps to start buying or selling art on ArtBazaar'
            }
          </p>
          <div className="inline-flex bg-white/10 rounded-2xl p-1 gap-1">
            <button
              onClick={() => setActivePage('about')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition ${
                activePage === 'about' ? 'bg-white text-purple-700 shadow' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => setActivePage('how-it-works')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition ${
                activePage === 'how-it-works' ? 'bg-white text-purple-700 shadow' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              How It Works
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      {activePage === 'about' && (
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-7xl mx-auto space-y-16">

            <div className="max-w-3xl mx-auto text-center">
              <p className="text-purple-600 font-semibold text-sm mb-1 uppercase tracking-wider">Our Purpose</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-5">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                To empower Pakistani artists by providing a secure, transparent, and user-friendly platform where
                they can showcase their talent, connect with buyers, and build sustainable careers. We are bridging
                the gap between traditional art commerce and modern technology.
              </p>
            </div>

            {/* Real stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {statCards.map((s, i) => (
                <div key={i} className="text-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <s.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                    {loading ? <Loader className="w-5 h-5 animate-spin mx-auto text-purple-400" /> : s.num}
                  </div>
                  <div className="text-gray-500 text-sm">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
              <div>
                <p className="text-purple-600 font-semibold text-sm mb-1 uppercase tracking-wider">Background</p>
                <h2 className="text-3xl font-black text-gray-900 mb-5">Our Story</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>ArtBazaar was born from a simple observation: Pakistani artists lacked a dedicated platform to showcase and sell their work online. While international platforms existed, they were not tailored to local needs — from payment methods to shipping logistics.</p>
                  <p>As a team of developers and designers passionate about both technology and art, we decided to create a solution. We spent months understanding the challenges faced by local artists and buyers, and built ArtBazaar to address every pain point.</p>
                  <p>Today, we are proud to support hundreds of artists across Pakistan, helping them reach audiences they never could before.</p>
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-100 to-blue-100 h-72 flex items-center justify-center">
                <div className="text-center">
                  <Palette className="w-20 h-20 text-purple-400 mx-auto mb-3" />
                  <p className="text-purple-600 font-bold text-lg">ArtBazaar</p>
                  <p className="text-purple-400 text-sm">Pakistan's Art Marketplace</p>
                </div>
              </div>
            </div>

            <div>
              <div className="text-center mb-10">
                <p className="text-purple-600 font-semibold text-sm mb-1 uppercase tracking-wider">Principles</p>
                <h2 className="text-3xl font-black text-gray-900">Our Values</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {VALUES.map((v, i) => (
                  <div key={i} className="text-center p-6 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all group">
                    <div className="w-14 h-14 bg-purple-100 group-hover:bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                      <v.icon className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Team — real names, gradient avatars */}
            <div>
              <div className="text-center mb-10">
                <p className="text-purple-600 font-semibold text-sm mb-1 uppercase tracking-wider">People</p>
                <h2 className="text-3xl font-black text-gray-900">Meet the Team</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {TEAM.map((m, i) => (
                  <div key={i} className="text-center">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white font-black text-3xl mx-auto mb-3 shadow-lg`}>
                      {m.name.charAt(0)}
                    </div>
                    <h3 className="font-bold text-gray-900">{m.name}</h3>
                    <p className="text-purple-600 text-sm font-medium">{m.role}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      )}

      {/* How It Works */}
      {activePage === 'how-it-works' && (
        <>
          <section className="py-16 md:py-20 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-purple-600 font-semibold text-sm mb-1 uppercase tracking-wider">Buyers</p>
                <h2 className="text-3xl font-black text-gray-900 mb-3">For Buyers</h2>
                <p className="text-gray-600">Discover and purchase unique artworks in 4 simple steps</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {BUYER_STEPS.map(s => (
                  <div key={s.step} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100">
                    <div className={`${s.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg mb-4`}>
                      {s.step}
                    </div>
                    <s.icon className="w-8 h-8 text-purple-600 mb-3" />
                    <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 md:py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-purple-600 font-semibold text-sm mb-1 uppercase tracking-wider">Artists</p>
                <h2 className="text-3xl font-black text-gray-900 mb-3">For Artists</h2>
                <p className="text-gray-600">Start selling your art and grow your business in 4 steps</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {SELLER_STEPS.map(s => (
                  <div key={s.step} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border-2 border-gray-100 hover:border-purple-200">
                    <div className={`${s.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg mb-4`}>
                      {s.step}
                    </div>
                    <s.icon className="w-8 h-8 text-purple-600 mb-3" />
                    <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-purple-50 to-blue-50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-purple-600 font-semibold text-sm mb-1 uppercase tracking-wider">Features</p>
                <h2 className="text-3xl font-black text-gray-900 mb-3">Platform Features</h2>
                <p className="text-gray-600">Everything you need for seamless art commerce</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {FEATURES.map((f, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 flex gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-purple-700 to-blue-700 mt-auto">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3">Ready to Get Started?</h2>
          <p className="text-white/80 text-base md:text-lg mb-8">Join thousands of artists and art lovers on ArtBazaar</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup">
              <button className="w-full sm:w-auto px-8 py-3.5 bg-white text-purple-700 rounded-2xl font-bold hover:bg-gray-100 transition shadow-xl">
                Sign Up as Buyer
              </button>
            </Link>
            <Link to="/signup">
              <button className="w-full sm:w-auto px-8 py-3.5 bg-white/15 backdrop-blur-sm text-white rounded-2xl font-bold hover:bg-white/25 transition border border-white/30">
                Join as Artist
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}