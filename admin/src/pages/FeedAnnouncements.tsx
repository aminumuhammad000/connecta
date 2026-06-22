import { useState } from 'react';
import toast from 'react-hot-toast';
import Icon from '../components/Icon';

// Note: Ensure your admin api proxy has a feedAPI.create method
// import { feedAPI } from '../services/api';

export default function FeedAnnouncements() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    emoji: '📢',
    imageUrl: '',
    videoUrl: '',
    audience: 'all'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      toast.error('Title and message body are required.');
      return;
    }
    setLoading(true);
    try {
      // Temporary token retrieval assumption for frontend:
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/feed/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'user_post',
          title: formData.title,
          body: formData.body,
          emoji: formData.emoji,
          imageUrl: formData.imageUrl || undefined,
          videoUrl: formData.videoUrl || undefined,
          targetAudience: formData.audience,
          actorName: 'Connecta Official',
          actorRole: 'admin'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to post announcement');

      toast.success('Announcement broadcasted to Feed successfully!');
      setFormData({ title: '', body: '', emoji: '📢', imageUrl: '', videoUrl: '', audience: 'all' });
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-light-primary dark:text-dark-primary">Feed Announcements</h1>
          <p className="text-text-light-secondary dark:text-dark-secondary mt-2">
            Broadcast official Connecta announcements directly to the mobile app Feed.
          </p>
        </div>

        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">Announcement Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary"
                  placeholder="e.g., Connecta Version 2.0 is Live!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">Emoji Badge</label>
                <input
                  type="text"
                  value={formData.emoji}
                  onChange={e => setFormData({...formData, emoji: e.target.value})}
                  className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary"
                  placeholder="📢"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">Message Body *</label>
              <textarea
                required
                rows={5}
                value={formData.body}
                onChange={e => setFormData({...formData, body: e.target.value})}
                className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary"
                placeholder="Write your announcement details here..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">Video URL (Optional)</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                  className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">Target Audience</label>
              <select
                value={formData.audience}
                onChange={e => setFormData({...formData, audience: e.target.value})}
                className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary"
              >
                <option value="all">Everyone</option>
                <option value="freelancers">Freelancers Only</option>
                <option value="clients">Clients Only</option>
              </select>
            </div>

            <div className="pt-4 border-t border-border-light dark:border-border-dark flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
              >
                {loading ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : <Icon name="campaign" size={20} />}
                Broadcast to Feed
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
