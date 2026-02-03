'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { characterAPI } from '@/lib/api/characters';
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    User,
    Crown,
    Search,
    Filter,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function AdminCharactersPage() {
    const router = useRouter();
    const [characters, setCharacters] = useState([]);
    const [filteredCharacters, setFilteredCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        fetchCharacters();
    }, []);

    useEffect(() => {
        filterCharacters();
    }, [searchQuery, categoryFilter, characters]);

    const fetchCharacters = async () => {
        try {
            setLoading(true);
            const data = await characterAPI.getAllCharacters();
            setCharacters(data);
            setFilteredCharacters(data);
        } catch (error) {
            console.error('Error fetching characters:', error);
            toast.error('Failed to load characters');
        } finally {
            setLoading(false);
        }
    };

    const filterCharacters = () => {
        let filtered = characters;

        if (searchQuery.trim()) {
            filtered = filtered.filter(char =>
                char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                char.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(char => char.category === categoryFilter);
        }

        setFilteredCharacters(filtered);
    };

    const handleDelete = async (id, name) => {
        const confirmed = window.confirm(
            `⚠️ Delete "${name}"?\n\nThis will permanently delete the character and all related data.\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setDeleteLoading(id);
            await characterAPI.deleteCharacter(id);
            setCharacters(prev => prev.filter(char => char._id !== id));
            toast.success(`"${name}" deleted successfully`);
        } catch (error) {
            console.error('Error deleting character:', error);
            toast.error(error.response?.data?.message || 'Failed to delete character');
        } finally {
            setDeleteLoading(null);
        }
    };

    const categories = ['all', ...new Set(characters.map(c => c.category).filter(Boolean))];
    const premiumCount = characters.filter(c => c.isPremium).length;
    const freeCount = characters.length - premiumCount;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-rose-600 mx-auto" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading characters...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 shadow-lg">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Manage Characters
                            </h1>
                        </div>
                        <div className="flex items-center gap-4 ml-1">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {characters.length} Total
                            </span>
                            {premiumCount > 0 && (
                                <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Crown size={14} />
                                    {premiumCount} Pro
                                </span>
                            )}
                            {freeCount > 0 && (
                                <span className="text-sm text-blue-600 dark:text-blue-400">
                                    {freeCount} Free
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/admin/characters/create')}
                        className="group w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        <span>Create Character</span>
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <div className="relative sm:w-64">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">All Categories</option>
                            {categories.filter(c => c !== 'all').map(cat => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Active Filters */}
                {(searchQuery || categoryFilter !== 'all') && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Filters:</span>
                        {searchQuery && (
                            <span className="px-3 py-1 bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 rounded-lg text-sm">
                                "{searchQuery}"
                            </span>
                        )}
                        {categoryFilter !== 'all' && (
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm">
                                {categoryFilter}
                            </span>
                        )}
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setCategoryFilter('all');
                            }}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 underline"
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {/* Characters Grid */}
                {filteredCharacters.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                            <User className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                            No characters found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {searchQuery || categoryFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Create your first character to get started'}
                        </p>
                        {!searchQuery && categoryFilter === 'all' && (
                            <button
                                onClick={() => router.push('/admin/characters/create')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                            >
                                <Plus size={20} />
                                <span>Create Character</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCharacters.map((character) => (
                            <div
                                key={character._id}
                                className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-rose-500 dark:hover:border-rose-500 hover:shadow-xl transition-all"
                            >
                                {/* Image */}
                                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                                    {character.image || character.avatar ? (
                                        <Image
                                            src={character.image || character.avatar}
                                            alt={character.name}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <User className="w-16 h-16 text-gray-400" />
                                        </div>
                                    )}

                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                                        {character.category && (
                                            <span className="px-2 py-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-gray-900 dark:text-white rounded-lg text-xs font-semibold shadow-sm">
                                                {character.category}
                                            </span>
                                        )}
                                        {character.isPremium && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold shadow-sm">
                                                <Crown size={12} />
                                                Pro
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4 space-y-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                                            {character.name}
                                        </h3>
                                        {character.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                                {character.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Voice */}
                                    {character.voice && (
                                        <span className="inline-block px-3 py-1 bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-medium">
                                            {character.voice}
                                        </span>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => router.push(`/admin/characters/edit/${character._id}`)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium"
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(character._id, character.name)}
                                            disabled={deleteLoading === character._id}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium disabled:opacity-50"
                                        >
                                            {deleteLoading === character._id ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <>
                                                    <Trash2 size={16} />
                                                    Delete
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
