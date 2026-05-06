import React, { useState } from 'react';
import { Calendar, Award, Users, BookOpen, MapPin, Clock, ChevronRight, Ticket } from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader from './BuyerHeader';

const EventsNews = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState('all');

  const events = [
    { id:1, type:'event',       title:'Karachi Art Festival 2025',           description:'The biggest art exhibition of the year featuring over 100 Pakistani artists.',              image:'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800', date:'Jan 20–25, 2025', location:'Karachi Expo Center',      price:500,   featured:true,  organizer:'Pakistan Arts Council',  attendees:2500 },
    { id:2, type:'competition', title:'Young Artist Competition 2025',        description:'Calling all artists under 25! Submit your best work for a chance to win PKR 50,000.',    image:'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800', date:'Deadline: Feb 15', location:'All Pakistan (Online)',     prize:50000, featured:true,  organizer:'ArtBazaar'             },
    { id:3, type:'workshop',    title:'Watercolor Techniques Workshop',       description:'Learn advanced watercolor techniques from master artist Ayesha Khan.',                    image:'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', date:'Jan 18, 2025',     location:'National Art Gallery, ISB', price:2500,  featured:false, organizer:'Ayesha Khan Studio',   attendees:45, capacity:50 },
    { id:4, type:'news',        title:'Pakistani Artist Wins International Award', description:"Hassan Ali's abstract piece \"Urban Dreams\" won the prestigious Asian Art Award 2024.", image:'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', date:'Dec 10, 2024',    location:null,                       featured:false, organizer:'ArtBazaar News', readTime:'3 min' },
    { id:5, type:'event',       title:'Lahore Art Week 2025',                 description:'A week-long celebration of Pakistani art with exhibitions, talks and live performances.',  image:'https://images.unsplash.com/photo-1578926078640-e4f4a2e4b576?w=800', date:'Feb 5–11, 2025',   location:'Alhamra Cultural Complex',  price:300,   featured:false, organizer:'Lahore Arts Council',  attendees:1800 },
    { id:6, type:'workshop',    title:'Oil Painting Masterclass',             description:'Intensive 2-day workshop covering glazing, impasto and texture techniques.',              image:'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=800', date:'Jan 25–26, 2025',  location:'ArtBazaar Studio, Karachi', price:5000,  featured:false, organizer:'Studio Art Pak',       attendees:20, capacity:25 },
  ];

  const tabs = [
    { id:'all',          label:'All'          },
    { id:'event',        label:'Events'       },
    { id:'workshop',     label:'Workshops'    },
    { id:'competition',  label:'Competitions' },
    { id:'news',         label:'News'         },
  ];

  const iconMap = { event: Calendar, competition: Award, workshop: Users, news: BookOpen };
  const colorMap = { event:'purple', competition:'amber', workshop:'blue', news:'green' };
  const badgeColor = { purple:'bg-purple-100 text-purple-700', amber:'bg-amber-100 text-amber-700', blue:'bg-blue-100 text-blue-700', green:'bg-green-100 text-green-700' };

  const filtered = tab === 'all' ? events : events.filter(e => e.type === tab);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader onMenuClick={() => setSidebarOpen(true)} title="Events & News" subtitle="Discover what's happening" />

        <main className="p-4 md:p-6 space-y-5">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                  tab === t.id ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                }`}>{t.label}
              </button>
            ))}
          </div>

          {/* Featured card */}
          {tab === 'all' && (() => {
            const featured = events.find(e => e.featured);
            if (!featured) return null;
            const Icon = iconMap[featured.type];
            const col = colorMap[featured.type];
            return (
              <div className="relative rounded-2xl overflow-hidden shadow-xl h-56 md:h-72">
                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold mb-2 ${badgeColor[col]}`}>
                    <Icon className="w-3.5 h-3.5" />{featured.type.charAt(0).toUpperCase() + featured.type.slice(1)}
                  </span>
                  <h2 className="text-xl md:text-2xl font-black mb-1">{featured.title}</h2>
                  <p className="text-white/80 text-sm mb-3 line-clamp-1">{featured.description}</p>
                  <div className="flex items-center gap-3 text-xs text-white/80 flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{featured.date}</span>
                    {featured.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{featured.location}</span>}
                    {featured.price !== undefined && <span className="flex items-center gap-1"><Ticket className="w-3.5 h-3.5" />PKR {featured.price}</span>}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.filter(e => !(tab === 'all' && e.featured)).map(item => {
              const Icon = iconMap[item.type];
              const col = colorMap[item.type];
              return (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group">
                  <div className="relative overflow-hidden h-40">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <span className={`absolute top-2 left-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${badgeColor[col]}`}>
                      <Icon className="w-3.5 h-3.5" />{item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">{item.description}</p>
                    <div className="space-y-1 mb-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-purple-400" />{item.date}</div>
                      {item.location && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-purple-400" />{item.location}</div>}
                      {item.attendees && <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-purple-400" />{item.attendees}{item.capacity ? ` / ${item.capacity}` : ''} attendees</div>}
                    </div>
                    <div className="flex items-center justify-between">
                      {item.price !== undefined ? (
                        <span className="font-bold text-purple-600 text-sm">{item.price === 0 ? 'Free Entry' : `PKR ${item.price.toLocaleString()}`}</span>
                      ) : item.prize ? (
                        <span className="font-bold text-amber-600 text-sm">Prize: PKR {item.prize.toLocaleString()}</span>
                      ) : (
                        <span className="text-xs text-gray-400">{item.readTime} read</span>
                      )}
                      <button className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition flex items-center gap-1">
                        {item.type === 'news' ? 'Read More' : 'Register'} <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EventsNews;