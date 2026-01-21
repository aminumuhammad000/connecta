import React from 'react';
import { Quote } from 'lucide-react';

const FeedBack = () => {
  const reviews = [
    {
      text: "Connecta changed how I freelance. The 'Collabo' workspace is a game changer for remote teams. It feels like we are in the same room!",
      name: "Emily R.",
      role: "Product Designer",
      img: "https://i.pravatar.cc/150?u=e"
    },
    {
      text: "Finally, a platform that doesn't just treat us like numbers. The community vibe and AI matching are spot on. Highly recommended!",
      name: "David K.",
      role: "Frontend Dev",
      img: "https://i.pravatar.cc/150?u=f"
    },
    {
      text: "I hired a full dev team in 24 hours using Connecta AI. The quality of talent here is unmatched compared to other platforms.",
      name: "Sarah M.",
      role: "Startup Founder",
      img: "https://i.pravatar.cc/150?u=g"
    }
  ];

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block p-3 rounded-full bg-orange-100 mb-4 animate-bounce">
            <Quote className="w-6 h-6 text-[#FD6730] fill-current" />
          </div>
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Feedback from <span className="text-[#FD6730]">Clients</span>
          </h2>
          <p className="text-gray-500">See what the universe is saying about us.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 relative hover:-translate-y-2 transition-transform duration-300">
              {/* Cartoon-style speech bubble triangle */}
              <div className="absolute -bottom-4 left-10 w-8 h-8 bg-white rotate-45 border-r border-b border-gray-100"></div>

              <p className="text-gray-600 mb-6 leading-relaxed italic">"{r.text}"</p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                <img src={r.img} alt={r.name} className="w-12 h-12 rounded-full border-2 border-orange-100" />
                <div>
                  <h5 className="font-bold text-gray-900">{r.name}</h5>
                  <p className="text-xs text-[#FD6730] font-bold uppercase tracking-wider">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeedBack;
