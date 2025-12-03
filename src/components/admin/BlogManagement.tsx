'use client';

import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { BlogPost } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

    const handleDelete = async (id: number | string) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await deleteBlogPost(id);
            } catch (error) {
                console.error("Failed to delete post:", error);
                alert("Failed to delete post");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

        try {
            if (editingPost) {
                await updateBlogPost({ ...editingPost, ...postData });
            } else {
                await addBlogPost(postData);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save post:", error);
            alert("Failed to save post");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Blog & SEO</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage blog posts, news, and SEO meta content.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center px-6 py-3 bg-bel-blue text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Article
                </button>
            </div>

            {/* CMS Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {blogPosts.map(post => (
                    <div key={post.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col h-full group">
                        <div className="h-48 relative overflow-hidden bg-gray-100 dark:bg-slate-900">
                            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm text-gray-900 dark:text-white">
                                {post.category}
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3 line-clamp-2">{post.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-3">{post.excerpt}</p>

                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-100 dark:border-slate-700">
                                <span className="text-xs text-gray-400 font-medium">{post.date} by {post.author}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(post)} className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-xl transition-colors" title="Edit SEO & Content">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDelete(post.id)} className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-colors" title="Delete">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                {editingPost ? 'Edit Content' : 'New Content'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Title (H1)</label>
                                    <input name="title" defaultValue={editingPost?.title} required className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Slug (URL)</label>
                                    <input name="slug" defaultValue={editingPost?.slug} placeholder="auto-generated" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                    <input name="category" defaultValue={editingPost?.category} required className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Author</label>
                                    <input name="author" defaultValue={editingPost?.author || "Admin"} required className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
                                    <input name="imageUrl" defaultValue={editingPost?.imageUrl} required className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">SEO Meta Description / Excerpt</label>
                                <textarea name="excerpt" rows={2} defaultValue={editingPost?.excerpt} required className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                                <p className="text-xs text-gray-400 mt-2">Recommended: 150-160 characters for optimal Google visibility.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Main Content (HTML supported)</label>
                                <textarea name="content" rows={8} defaultValue={editingPost?.content} required className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none font-mono text-sm transition" />
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-8 py-3 bg-bel-blue text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all">
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
