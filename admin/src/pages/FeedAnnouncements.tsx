import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Icon from '../components/Icon';
import { feedAPI } from '../services/api';

export default function FeedAnnouncements() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    emoji: '📢',
    imageUrl: '',
    videoUrl: '',
    audience: 'all'
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await feedAPI.getAll({ limit: 50 });
      if (res.success) {
        setPosts(res.data || []);
      }
    } catch (error: any) {
      toast.error('Failed to load feed posts');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ title: '', body: '', emoji: '📢', imageUrl: '', videoUrl: '', audience: 'all' });
    setModalOpen(true);
  };

  const openEditModal = (post: any) => {
    setEditingId(post._id);
    setFormData({
      title: post.title || '',
      body: post.body || '',
      emoji: post.emoji || '📢',
      imageUrl: post.imageUrl || '',
      videoUrl: post.videoUrl || '',
      audience: post.targetAudience || 'all'
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feed post?')) return;
    try {
      const res = await feedAPI.delete(id);
      if (res.success) {
        toast.success('Post deleted');
        fetchPosts();
      }
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      toast.error('Title and message body are required.');
      return;
    }
    
    try {
      const payload = {
        type: 'user_post',
        title: formData.title,
        body: formData.body,
        emoji: formData.emoji,
        imageUrl: formData.imageUrl || undefined,
        videoUrl: formData.videoUrl || undefined,
        targetAudience: formData.audience,
        actorName: 'Connecta Official',
        actorRole: 'admin'
      };

      if (editingId) {
        await feedAPI.update(editingId, payload);
        toast.success('Announcement updated successfully!');
      } else {
        await feedAPI.create(payload);
        toast.success('Announcement broadcasted effectively!');
      }
      
      setModalOpen(false);
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-light-primary dark:text-dark-primary">Feed Management</h1>
            <p className="text-sm text-text-light-secondary dark:text-dark-secondary mt-1">Manage public and targeted platform announcements.</p>
          </div>
          <button onClick={openCreateModal} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 flex items-center gap-2">
            <Icon name="add" size={20} />
            Create Post
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center text-primary">
              <Icon name="sync" size={32} className="animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center text-text-light-secondary dark:text-dark-secondary">
              <Icon name="campaign" size={48} className="mx-auto mb-3 opacity-50" />
              <p>No feed posts found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-background-light dark:bg-background-dark/50 border-b border-border-light dark:border-border-dark">
                  <tr>
                    <th className="px-5 py-3 font-medium">Post Title</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Audience</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {posts.map(post => (
                    <tr key={post._id} className="hover:bg-background-light/50 dark:hover:bg-background-dark/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{post.emoji || '📢'}</span>
                          <span className="font-semibold">{post.title || 'Untitled Post'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-text-light-secondary dark:text-dark-secondary">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-medium uppercase">{post.type}</span>
                      </td>
                      <td className="px-5 py-4 capitalize text-sm">{post.targetAudience}</td>
                      <td className="px-5 py-4 text-text-light-secondary dark:text-dark-secondary text-xs">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(post)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg">
                            <Icon name="edit" size={18} />
                          </button>
                          <button onClick={() => handleDelete(post._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                            <Icon name="delete" size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card-light dark:bg-card-dark w-full max-w-2xl rounded-2xl shadow-xl border border-border-light dark:border-border-dark overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border-light dark:border-border-dark">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Announcement' : 'New Announcement'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-background-light dark:hover:bg-background-dark rounded-lg">
                <Icon name="close" size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="feed-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-1.5">Announcement Title *</label>
                    <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm" placeholder="e.g., Connecta Version 2.0 is Live!" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Emoji</label>
                    <input type="text" value={formData.emoji} onChange={e => setFormData({...formData, emoji: e.target.value})} className="w-full px-3 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm text-center" placeholder="📢" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Message Body *</label>
                  <textarea required rows={4} value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} className="w-full px-3 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm resize-none" placeholder="Write your announcement details here..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Image URL (Optional)</label>
                    <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full px-3 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Video URL (Optional)</label>
                    <input type="url" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} className="w-full px-3 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm" placeholder="https://youtube.com/..." />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Target Audience</label>
                  <select value={formData.audience} onChange={e => setFormData({...formData, audience: e.target.value})} className="w-full px-3 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm">
                    <option value="all">Everyone</option>
                    <option value="freelancers">Freelancers Only</option>
                    <option value="clients">Clients Only</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-border-light dark:border-border-dark flex justify-end gap-3 bg-background-light dark:bg-background-dark/30">
              <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2 hover:bg-border-light dark:hover:bg-border-dark rounded-lg font-medium transition-colors">Cancel</button>
              <button type="submit" form="feed-form" className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors">
                {editingId ? 'Save Changes' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
