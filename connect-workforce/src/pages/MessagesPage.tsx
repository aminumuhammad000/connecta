import React from 'react';
import { MessageSquare, Globe, ArrowUpRight } from 'lucide-react';

export const MessagesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Workforce Messages</h1>
        <p className="text-xs text-gray-500 font-medium">Direct messaging with team members via Connecta real-time messaging.</p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xs text-center max-w-lg mx-auto space-y-4 my-8">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-primary flex items-center justify-center mx-auto font-bold">
          <MessageSquare className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Connecta Real-Time Chat Connected</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Messages sent to workers appear instantly in their Connecta Web chat and Connecta Mobile notifications.
        </p>

        <a
          href="https://myconnecta.ng"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/20 transition-all"
        >
          <Globe className="w-4 h-4" />
          <span>Open Connecta Messenger</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
