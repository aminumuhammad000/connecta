import React, { useState } from 'react';
import { Check, Star, Zap, Shield, Crown, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: "Explorer",
      price: "₦0",
      period: "/mo",
      description: "For new cadets starting their journey.",
      icon: Zap,
      color: "bg-blue-50 text-blue-500",
      features: ["3 Project Bids", "Basic Profile", "Community Support"],
      button: "Start Free",
      popular: false
    },
    {
      name: "Commander",
      price: billingCycle === 'monthly' ? "₦2,500" : "₦25,000",
      period: billingCycle === 'monthly' ? "/mo" : "/yr",
      description: "For pros ready to conquer the universe.",
      icon: Rocket,
      color: "bg-[#FD6730] text-white",
      features: ["Unlimited Bids", "Verified Badge 🛡️", "Priority AI Matching", "0% Service Fees", "Analytics Dashboard"],
      button: "Go Pro",
      popular: true
    },
    {
      name: "Galaxy Fleet",
      price: billingCycle === 'monthly' ? "₦5,000" : "₦50,000",
      period: billingCycle === 'monthly' ? "/mo" : "/yr",
      description: "For agencies scaling their empire.",
      icon: Crown,
      color: "bg-purple-50 text-purple-600",
      features: ["10 Team Seats", "Collabo Workspace+", "Dedicated Manager", "API Access"],
      button: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section className="py-32 bg-white relative overflow-hidden" id="pricing">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          {/* Header Removed as per request */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative rounded-[2.5rem] p-8 ${plan.popular ? 'bg-gray-900 text-white shadow-2xl shadow-orange-500/20 scale-105 border-4 border-[#FD6730]' : 'bg-white border-2 border-gray-100 shadow-xl shadow-gray-200/50'}`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#FD6730] text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                  <Crown className="w-4 h-4 fill-current" />
                  MOST POPULAR
                </div>
              )}

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${plan.popular ? 'bg-none bg-gradient-to-br from-[#FD6730] to-[#FF8F6B]' : plan.color}`}>
                <plan.icon className={`w-7 h-7 ${plan.popular ? 'text-white' : ''}`} />
              </div>

              <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>

              <div className="flex items-baseline gap-1 mb-8">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={plan.price}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`text-5xl font-black ${plan.popular ? 'text-white' : 'text-gray-900'}`}
                  >
                    {plan.price}
                  </motion.span>
                </AnimatePresence>
                <span className={`text-lg font-medium ${plan.popular ? 'text-gray-500' : 'text-gray-400'}`}>{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-[#FD6730]/20' : 'bg-green-100'}`}>
                      <Check className={`w-3 h-3 ${plan.popular ? 'text-[#FD6730]' : 'text-green-600'}`} />
                    </div>
                    <span className={`font-medium ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${plan.popular
                ? 'bg-[#FD6730] text-white hover:bg-[#e05625] shadow-lg shadow-orange-500/25'
                : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                }`}>
                {plan.button}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            All payments are secured by Paystack & Stripe.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
