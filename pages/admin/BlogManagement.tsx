
import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { BlogPost } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const BlogManagement: React.FC = () => {
    const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    const handleAddNew = () => {
        setEditingPost(null);
        setIsModalOpen(true);
    };

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if(window.confirm("Are you sure you want to delete this post?")) {
            deleteBlogPost(id);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const title = formData.get('title') as string;
        // Auto-generate slug from title if not provided or just simplify title
        const slug = (formData.get('slug') as string) || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        
        const postData = {
            slug,
            title,
            excerpt: formData.get('excerpt') as string,
            content: formData.get('content') as string,
            author: formData.get('author') as string,
            imageUrl: formData.get('imageUrl') as string,
            category: formData.get('category') as string,
        };

        if (editingPost) {
            updateBlogPost({ ...editingPost, ...postData });
        } else {
            addBlogPost(postData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">CMS & SEO Management</h2>
                    <p className="text-gray-500 text-sm">Manage blog posts, news, and SEO meta content.</p>
                </div>
                <button 
                    onClick={handleAddNew}
                    className="flex items-center px-4 py-2 bg-electric-indigo text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Article
                </button>
            </div>

            {/* CMS Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {blogPosts.map(post => (
                    <div key={post.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                        <div className="h-48 relative overflow-hidden bg-gray-100">
                            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                                {post.category}
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                            
                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                <span className="text-xs text-gray-400">{post.date} by {post.author}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(post)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit SEO & Content">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDelete(post.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingPost ? 'Edit Content' : 'New Content'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Title (H1)</label>
                                    <input name="title" defaultValue={editingPost?.title} required className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-electric-indigo outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Slug (URL)</label>
                                    <input name="slug" defaultValue={editingPost?.slug} placeholder="auto-generated" className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-electric-indigo outline-none bg-gray-50" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                    <input name="category" defaultValue={editingPost?.category} required className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-electric-indigo outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Author</label>
                                    <input name="author" defaultValue={editingPost?.author || "Admin"} required className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-electric-indigo outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                                    <input name="imageUrl" defaultValue={editingPost?.imageUrl} required className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-electric-indigo outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">SEO Meta Description / Excerpt</label>
                                <textarea name="excerpt" rows={2} defaultValue={editingPost?.excerpt} required className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-electric-indigo outline-none" />
                                <p className="text-xs text-gray-400 mt-1">Recommended: 150-160 characters for optimal Google visibility.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Main Content (HTML supported)</label>
                                <textarea name="content" rows={8} defaultValue={editingPost?.content} required className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-electric-indigo outline-none font-mono text-sm" />
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-8 py-3 bg-electric-indigo text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
                                    {editingPost ? 'Update Article' : 'Publish Article'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogManagement;
