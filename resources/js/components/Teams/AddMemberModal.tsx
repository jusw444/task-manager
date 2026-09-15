import { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { AvailableUser, AddMemberFormData } from '@/types/team';
import { debounce } from 'lodash';

interface AddMemberModalProps {
    teamId: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newMember: AvailableUser) => void;
}

export default function AddMemberModal({ 
    teamId, 
    isOpen, 
    onClose, 
    onSuccess 
}: AddMemberModalProps) {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<AvailableUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<AvailableUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<AddMemberFormData>({
        user_id: null,
        role: 'member',
    });

    // Load all available users when modal opens
    const loadAllUsers = async () => {
        if (hasLoadedOnce) return; // Don't reload if already loaded
        
        setIsLoading(true);
        try {
            const response = await fetch(
                route('teams.available-users', teamId) + '?limit=50'
            );
            const result = await response.json();
            setUsers(result);
            setHasLoadedOnce(true);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced search function
    const searchUsersRef = useRef(
        debounce(async (query: string) => {
            if (!query.trim()) {
                // If search is empty, reload all users
                await loadAllUsers();
                setIsDropdownOpen(true);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(
                    route('teams.available-users', teamId) + `?search=${encodeURIComponent(query)}`
                );
                const result = await response.json();
                setUsers(result);
                setIsDropdownOpen(result.length > 0);
                setHighlightedIndex(-1);
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300)
    );

    // Cleanup debounce
    useEffect(() => {
        const debouncedFn = searchUsersRef.current;
        return () => {
            debouncedFn.cancel();
        };
    }, []);

    // Load users when modal opens
    useEffect(() => {
        if (isOpen) {
            loadAllUsers();
        }
    }, [isOpen]);

    // Trigger search on input change
    useEffect(() => {
        if (search) {
            searchUsersRef.current(search);
        } else {
            // When search is empty, show all users
            loadAllUsers();
            setIsDropdownOpen(true);
        }
    }, [search]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset form on close
    useEffect(() => {
        if (!isOpen) {
            reset();
            setSearch('');
            setSelectedUser(null);
            setUsers([]);
            setIsDropdownOpen(false);
            setHighlightedIndex(-1);
            setHasLoadedOnce(false);
        }
    }, [isOpen, reset]);

    // Auto-focus and show dropdown on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
                // Show dropdown after focus
                if (users.length > 0) {
                    setIsDropdownOpen(true);
                }
            }, 150);
        }
    }, [isOpen, users.length]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isDropdownOpen || users.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev + 1) % users.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev - 1 + users.length) % users.length);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < users.length) {
                    handleSelectUser(users[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsDropdownOpen(false);
                break;
        }
    };

    const handleSelectUser = (user: AvailableUser) => {
        setSelectedUser(user);
        setData('user_id', user.id);
        setSearch(user.name);
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('teams.members.store', teamId), {
            onSuccess: () => {
                if (selectedUser) {
                    onSuccess(selectedUser);
                }
                onClose();
            },
        });
    };

    // Handle input focus to show dropdown
    const handleFocus = () => {
        if (users.length > 0 && !selectedUser) {
            setIsDropdownOpen(true);
        } else if (users.length === 0 && !isLoading) {
            loadAllUsers();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop with blur */}
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal with glassmorphism */}
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="relative w-full max-w-md rounded-2xl bg-white/95 dark:bg-gray-800/95 shadow-2xl backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
                    <div className="px-6 pt-6 pb-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Add Team Member
                            </h3>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* User search with dropdown */}
                            <div ref={dropdownRef}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Search User
                                </label>
                                <div className="relative mt-1">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onFocus={handleFocus}
                                        className={`
                                            block w-full rounded-xl border-2 shadow-sm transition-all
                                            bg-white dark:bg-gray-900
                                            text-gray-900 dark:text-gray-100
                                            border-gray-300 dark:border-gray-600
                                            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                                            ${selectedUser ? 'pr-10 border-green-400 dark:border-green-500' : ''}
                                            disabled:opacity-60 disabled:cursor-not-allowed
                                        `}
                                        placeholder="Search by name or email..."
                                        disabled={processing}
                                        autoComplete="off"
                                    />
                                    
                                    {/* Clear button */}
                                    {selectedUser && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedUser(null);
                                                setData('user_id', null);
                                                setSearch('');
                                                inputRef.current?.focus();
                                                loadAllUsers();
                                                setIsDropdownOpen(true);
                                            }}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}

                                    {/* Loading spinner */}
                                    {isLoading && (
                                        <div className="absolute right-3 top-2.5">
                                            <div className="w-5 h-5 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                                        </div>
                                    )}

                                    {/* Dropdown - Always visible when dropdown is open */}
                                    {isDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 divide-y divide-gray-100 dark:divide-gray-700">
                                            {users.length > 0 ? (
                                                users.map((user, index) => (
                                                    <button
                                                        key={user.id}
                                                        type="button"
                                                        onClick={() => handleSelectUser(user)}
                                                        className={`
                                                            w-full px-4 py-3 text-left transition-colors
                                                            hover:bg-gray-50 dark:hover:bg-gray-700/50
                                                            focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700/50
                                                            ${highlightedIndex === index ? 'bg-gray-50 dark:bg-gray-700/50' : ''}
                                                            ${selectedUser?.id === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                                                        `}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                    {user.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                                    {user.email}
                                                                </div>
                                                            </div>
                                                            {selectedUser?.id === user.id && (
                                                                <svg className="w-5 h-5 ml-2 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                                    {isLoading ? 'Loading...' : 'No users available'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {errors.user_id && (
                                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                                        {errors.user_id}
                                    </p>
                                )}
                                
                                {/* Selected user indicator */}
                                {selectedUser && (
                                    <p className="mt-1.5 text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Selected: {selectedUser.name} ({selectedUser.email})
                                    </p>
                                )}
                            </div>

                            {/* Role selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Role
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value as 'admin' | 'member')}
                                    className="mt-1 block w-full rounded-xl border-2 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-60"
                                    disabled={processing}
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Admins can manage team settings and members.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !selectedUser}
                                    className={`
                                        px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all
                                        ${processing || !selectedUser
                                            ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed opacity-70'
                                            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                        }
                                    `}
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Adding...
                                        </span>
                                    ) : (
                                        'Add Member'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}