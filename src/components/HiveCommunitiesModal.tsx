'use client';

import { useEffect, useRef, useState } from 'react';
import { BiCheckCircle, BiEdit, BiPlus, BiSearch, BiX } from 'react-icons/bi';

interface HiveCommunity {
    name: string;
    title: string;
    about?: string;
    subscribers?: number;
    isSubscribed: boolean;
}

interface HiveCommunitiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    onSelectCommunity: (communityName: string) => void;
}

interface Notification {
    message: string;
    type: 'success' | 'error';
    id: number;
}

export default function HiveCommunitiesModal({ 
    isOpen, 
    onClose, 
    username, 
    onSelectCommunity 
}: HiveCommunitiesModalProps) {
    const [activeTab, setActiveTab] = useState<'subscribed' | 'discover'>('subscribed');
    const [subscribedCommunities, setSubscribedCommunities] = useState<HiveCommunity[]>([]);
    const [discoverableCommunities, setDiscoverableCommunities] = useState<HiveCommunity[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const notificationCounter = useRef(0);

    useEffect(() => {
        if (isOpen && username) {
            fetchSubscribedCommunities();
        }
    }, [isOpen, username]);

    const fetchSubscribedCommunities = async () => {
        setIsLoading(true);
        try {
            console.log('Fetching subscribed communities for user:', username);
            const response = await fetch(`https://api.hive.blog/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'bridge.list_all_subscriptions',
                    params: { account: username },
                    id: 1
                })
            });

            const data = await response.json();
            console.log('Subscribed communities API response:', data);
            
            if (data.result) {
                // Format community data, ensuring community names are strings and have hive- prefix if needed
                const communities = data.result.map((comm: any) => {
                    // Make sure name is a string, not a number
                    let name = typeof comm[0] === 'string' ? comm[0] : String(comm[0]);
                    
                    // Ensure the community name has the hive- prefix if needed
                    if (name && !name.startsWith('hive-')) {
                        name = `hive-${name}`;
                    }
                    
                    const title = comm[1] || name;
                    
                    console.log(`Subscribed community: name=${name}, title=${title}`);
                    
                    return {
                        name,
                        title,
                        isSubscribed: true
                    };
                });
                
                console.log('Processed subscribed communities:', communities);
                setSubscribedCommunities(communities);
            } else {
                console.error('Error fetching subscribed communities:', data);
            }
        } catch (error) {
            console.error('Error fetching subscribed communities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to normalize community names for comparison
    const normalizeCommunityName = (name: string) => {
        return name.startsWith('hive-') ? name : `hive-${name}`;
    };

    // Helper function to check if a user is subscribed to a community, handling different name formats
    const isSubscribedToCommunity = (communityName: string, subscribedList: HiveCommunity[]) => {
        const normalizedName = normalizeCommunityName(communityName);
        return subscribedList.some(comm => 
            normalizeCommunityName(comm.name) === normalizedName
        );
    };

    const searchCommunities = async () => {
        if (!searchQuery.trim()) {
            // Se a busca estiver vazia, buscar todas as comunidades em tendência
            fetchTrendingCommunities();
            return;
        }
        setIsSearching(true);
        try {
            console.log('Searching communities with query:', searchQuery);
            const response = await fetch(`https://api.hive.blog/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'bridge.list_communities',
                    params: { 
                        sort: 'rank', 
                        query: searchQuery, 
                        limit: 50 
                    },
                    id: 1
                })
            });

            const data = await response.json();
            console.log('Search communities API response:', data);
            
            if (data.result) {
                console.log('Raw search results:', data.result);
                
                // Ensure data.result is treated as an array of communities
                const results = Array.isArray(data.result) ? data.result : Object.values(data.result);
                
                const communities = results.map((community: any) => {
                    // Extract the community name correctly, ensuring it has hive- prefix 
                    const communityName = community.name || (community.id ? `hive-${community.id}` : null);
                    
                    if (!communityName) {
                        console.error('Could not determine community name from:', community);
                        return null;
                    }
                    
                    // Check if user is subscribed using the normalized comparison
                    const isAlreadySubscribed = isSubscribedToCommunity(communityName, subscribedCommunities);
                    
                    console.log(`Community: name=${communityName}, title=${community.title}, subscribed=${isAlreadySubscribed}`);
                    
                    return {
                        name: communityName,
                        title: community.title || communityName,
                        about: community.about,
                        subscribers: community.subscribers,
                        isSubscribed: isAlreadySubscribed
                    };
                }).filter(Boolean); // Remove any null entries
                
                console.log('Processed search results:', communities);
                setDiscoverableCommunities(communities);
            } else {
                console.error('Error searching communities:', data);
            }
        } catch (error) {
            console.error('Error searching communities:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const fetchTrendingCommunities = async () => {
        setIsSearching(true);
        try {
            console.log('Fetching trending communities');
            const response = await fetch(`https://api.hive.blog/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'bridge.list_communities',
                    params: { 
                        sort: 'rank', 
                        limit: 50 
                    },
                    id: 1
                })
            });

            const data = await response.json();
            console.log('Trending communities API response:', data);
            
            if (data.result) {
                console.log('Raw trending communities data:', data.result);
                
                // Ensure data.result is treated as an array of communities
                const results = Array.isArray(data.result) ? data.result : Object.values(data.result);
                
                const communities = results.map((community: any) => {
                    // Extract the community name correctly, ensuring it has hive- prefix
                    const communityName = community.name || (community.id ? `hive-${community.id}` : null);
                    
                    if (!communityName) {
                        console.error('Could not determine community name from:', community);
                        return null;
                    }
                    
                    // Check if user is subscribed using the normalized comparison
                    const isAlreadySubscribed = isSubscribedToCommunity(communityName, subscribedCommunities);
                    
                    console.log(`Community: name=${communityName}, title=${community.title}, subscribed=${isAlreadySubscribed}`);
                    
                    return {
                        name: communityName,
                        title: community.title || communityName,
                        about: community.about,
                        subscribers: community.subscribers,
                        isSubscribed: isAlreadySubscribed
                    };
                }).filter(Boolean); // Remove any null entries
                
                console.log('Processed trending communities:', communities);
                setDiscoverableCommunities(communities);
            } else {
                console.error('Error fetching trending communities:', data);
            }
        } catch (error) {
            console.error('Error fetching trending communities:', error);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'discover' && discoverableCommunities.length === 0) {
            fetchTrendingCommunities();
        }
    }, [activeTab]);

    // Add an effect to reload communities when the user switches to the subscribed communities tab
    useEffect(() => {
        if (activeTab === 'subscribed' && username) {
            console.log('Updating list of subscribed communities when switching tabs');
            fetchSubscribedCommunities();
        }
    }, [activeTab, username]);

    const handleSubscribe = async (communityName: string) => {
        if (!username) {
            addNotification('Please login first to subscribe to communities', 'error');
            return;
        }

        console.log('Attempting to subscribe to community:', communityName);
        setIsSubscribing(true);
        try {
            // Using Hive Keychain to subscribe
            const keychain = (window as any).hive_keychain;
            if (!keychain) {
                addNotification('Hive Keychain extension is required', 'error');
                setIsSubscribing(false);
                return;
            }

            const communityToAdd = discoverableCommunities.find(comm => comm.name === communityName);
            if (!communityToAdd) {
                console.error('Community not found in discovery list:', communityName);
                addNotification('Community not found in discovery list', 'error');
                setIsSubscribing(false);
                return;
            }

            console.log('Comunidade para inscrição:', communityToAdd);

            // Ensure the community name is in the correct format (hive-XXXXX)
            const formattedCommunityName = communityName.startsWith('hive-') 
                ? communityName 
                : `hive-${communityName}`;

            console.log('Nome formatado para inscrição:', formattedCommunityName);

            // Create operation for subscribe
            const operation = [
                'subscribe',
                {
                    community: formattedCommunityName
                }
            ];
            
            console.log('Enviando operação de inscrição:', operation);
            
            keychain.requestCustomJson(
                username,
                'community',
                'Posting',
                JSON.stringify(operation),
                'Subscribe to community',
                async (response: any) => {
                    console.log('Keychain response:', response);
                    if (response.success) {
                        console.log('Successfully subscribed to community');
                        
                        // Refresh the subscribed communities list from the API to ensure accuracy
                        try {
                            const refreshResponse = await fetch(`https://api.hive.blog/`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    jsonrpc: '2.0',
                                    method: 'bridge.list_all_subscriptions',
                                    params: { account: username },
                                    id: 1
                                })
                            });

                            const refreshData = await refreshResponse.json();
                            
                            if (refreshData.result) {
                                // Format community data
                                const communities = refreshData.result.map((comm: any) => {
                                    // Make sure we're using properly formatted community names
                                    let name = comm[0];
                                    if (name && !name.startsWith('hive-')) {
                                        name = `hive-${name}`;
                                    }
                                    return {
                                        name,
                                        title: comm[1] || name,
                                        isSubscribed: true
                                    };
                                });
                                
                                console.log('Refreshed subscribed communities:', communities);
                                setSubscribedCommunities(communities);
                                
                                // Also update the discoverable communities list
                                setDiscoverableCommunities(prevCommunities =>
                                    prevCommunities.map(comm =>
                                        comm.name === communityName
                                            ? { ...comm, isSubscribed: true }
                                            : comm
                                    )
                                );
                                
                                // Show a success message
                                addNotification(`You have successfully subscribed to the community ${communityToAdd.title || communityName}`, 'success');
                                
                                // Switch to the "My Communities" tab to show the new subscription
                                setActiveTab('subscribed');
                            } else {
                                console.error('Error refreshing subscribed communities:', refreshData);
                                
                                // Fall back to optimistic updates if refresh fails
                                const updatedDiscoverableCommunities = discoverableCommunities.map(comm => 
                                    comm.name === communityName ? { ...comm, isSubscribed: true } : comm
                                );
                                
                                setDiscoverableCommunities(updatedDiscoverableCommunities);
                                setSubscribedCommunities(prev => [...prev, {...communityToAdd, isSubscribed: true}]);
                                
                                // Still switch to the "My Communities" tab even with optimistic update
                                setActiveTab('subscribed');
                            }
                        } catch (refreshError) {
                            console.error('Error refreshing subscribed communities:', refreshError);
                            
                            // Fall back to optimistic updates if refresh fails
                            const updatedDiscoverableCommunities = discoverableCommunities.map(comm => 
                                comm.name === communityName ? { ...comm, isSubscribed: true } : comm
                            );
                            
                            setDiscoverableCommunities(updatedDiscoverableCommunities);
                            setSubscribedCommunities(prev => [...prev, {...communityToAdd, isSubscribed: true}]);
                            
                            // Still switch to the "My Communities" tab even with error
                            setActiveTab('subscribed');
                        }
                    } else {
                        console.error('Failed to subscribe to community:', response.message);
                        addNotification(`Failed to subscribe to community: ${response.message}`, 'error');
                    }
                    setIsSubscribing(false);
                }
            );
        } catch (error) {
            console.error('Error subscribing to community:', error);
            addNotification('Failed to subscribe to community', 'error');
            setIsSubscribing(false);
        }
    };

    const handleUnsubscribe = async (communityName: string) => {
        if (!username) {
            addNotification('Please login first to unsubscribe from communities', 'error');
            return;
        }
        
        console.log('Attempting to unsubscribe from community:', communityName);
        setIsSubscribing(true);
        try {
            // Using Hive Keychain to unsubscribe
            const keychain = (window as any).hive_keychain;
            if (!keychain) {
                addNotification('Hive Keychain extension is required', 'error');
                setIsSubscribing(false);
                return;
            }

            // Ensure the community name is in the correct format (hive-XXXXX)
            const formattedCommunityName = communityName.startsWith('hive-') 
                ? communityName 
                : `hive-${communityName}`;

            console.log('Formatted community name for unsubscription:', formattedCommunityName);

            // Create operation for unsubscribe
            const operation = [
                'unsubscribe',
                {
                    community: formattedCommunityName
                }
            ];
            
            console.log('Sending unsubscribe operation:', operation);
            
            keychain.requestCustomJson(
                username,
                'community',
                'Posting',
                JSON.stringify(operation),
                'Unsubscribe from community',
                async (response: any) => {
                    console.log('Keychain response:', response);
                    if (response.success) {
                        console.log('Successfully unsubscribed from community');
                        
                        // Refresh the subscribed communities list from the API to ensure accuracy
                        try {
                            const refreshResponse = await fetch(`https://api.hive.blog/`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    jsonrpc: '2.0',
                                    method: 'bridge.list_all_subscriptions',
                                    params: { account: username },
                                    id: 1
                                })
                            });

                            const refreshData = await refreshResponse.json();
                            
                            if (refreshData.result) {
                                // Format community data
                                const communities = refreshData.result.map((comm: any) => {
                                    // Make sure we're using properly formatted community names
                                    let name = comm[0];
                                    if (name && !name.startsWith('hive-')) {
                                        name = `hive-${name}`;
                                    }
                                    return {
                                        name,
                                        title: comm[1] || name,
                                        isSubscribed: true
                                    };
                                });
                                
                                console.log('Refreshed subscribed communities:', communities);
                                setSubscribedCommunities(communities);
                                
                                // Also update the discoverable communities list
                                setDiscoverableCommunities(prevCommunities =>
                                    prevCommunities.map(comm =>
                                        comm.name === communityName
                                            ? { ...comm, isSubscribed: false }
                                            : comm
                                    )
                                );
                                
                                // Mostrar mensagem de sucesso
                                addNotification(`Você cancelou sua inscrição na comunidade com sucesso`, 'success');
                            } else {
                                console.error('Error refreshing subscribed communities:', refreshData);
                                
                                // Fall back to optimistic updates
                                const updatedSubscribedCommunities = subscribedCommunities.filter(
                                    comm => comm.name !== communityName
                                );
                                
                                setSubscribedCommunities(updatedSubscribedCommunities);
                                
                                const updatedDiscoverableCommunities = discoverableCommunities.map(comm => 
                                    comm.name === communityName ? { ...comm, isSubscribed: false } : comm
                                );
                                
                                setDiscoverableCommunities(updatedDiscoverableCommunities);
                            }
                        } catch (refreshError) {
                            console.error('Error refreshing subscribed communities:', refreshError);
                            
                            // Fall back to optimistic updates
                            const updatedSubscribedCommunities = subscribedCommunities.filter(
                                comm => comm.name !== communityName
                            );
                            
                            setSubscribedCommunities(updatedSubscribedCommunities);
                            
                            const updatedDiscoverableCommunities = discoverableCommunities.map(comm => 
                                comm.name === communityName ? { ...comm, isSubscribed: false } : comm
                            );
                            
                            setDiscoverableCommunities(updatedDiscoverableCommunities);
                        }
                    } else {
                        console.error('Failed to unsubscribe from community:', response.message);
                        addNotification(`Failed to unsubscribe from community: ${response.message}`, 'error');
                    }
                    setIsSubscribing(false);
                }
            );
        } catch (error) {
            console.error('Error unsubscribing from community:', error);
            addNotification('Failed to unsubscribe from community', 'error');
            setIsSubscribing(false);
        }
    };

    const handleCreatePost = (communityName: string) => {
        console.log('Creating post in community:', communityName);
        
        // If it's not the personal blog and doesn't start with hive-, format it
        const formattedCommunityName = communityName && !communityName.startsWith('hive-') 
            ? `hive-${communityName}` 
            : communityName;
        
        console.log('Formatted community name for post creation:', formattedCommunityName);
        onSelectCommunity(formattedCommunityName);
        onClose();
    };

    // Function to log all community data for debugging
  
   

    // Function to add a notification
    const addNotification = (message: string, type: 'success' | 'error') => {
        const id = notificationCounter.current++;
        setNotifications(prev => [...prev, { message, type, id }]);
        
        // Remove the notification after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(notif => notif.id !== id));
        }, 5000);
    };

    // Add animation style for notifications
    useEffect(() => {
        // Add animation styles to the head
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .notification-animate-in {
                animation: fadeIn 0.3s ease-in-out;
            }
        `;
        document.head.appendChild(style);

        // Clean up when the component is unmounted
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-start md:items-center justify-center overflow-y-auto">
            {/* Sistema de notificações */}
            <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2">
                {notifications.map(notification => (
                    <div 
                        key={notification.id}
                        className={`px-4 py-3 rounded-lg shadow-lg flex items-center notification-animate-in ${
                            notification.type === 'success' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-red-600 text-white'
                        }`}
                    >
                        {notification.type === 'success' ? (
                            <BiCheckCircle className="mr-2" size={20} />
                        ) : (
                            <BiX className="mr-2" size={20} />
                        )}
                        <span>{notification.message}</span>
                        <button 
                            className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors" 
                            onClick={() => setNotifications(prev => 
                                prev.filter(n => n.id !== notification.id)
                            )}
                        >
                            <BiX size={18} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-[#1E2028] dark:bg-[#1E2028] w-full max-w-[800px] rounded-xl overflow-hidden shadow-xl my-2 mx-2">
                <div className="min-h-[60vh] md:min-h-0 md:max-h-[80vh] flex flex-col w-full">
                    {/* Header */}
                    <header className="sticky top-0 z-10 flex-none bg-[#1E2028] dark:bg-[#1E2028] border-b border-gray-800 dark:border-gray-800">
                        <div className="w-full px-3 md:px-4">
                            <div className="flex justify-between items-center h-14">
                                <h1 className="text-xl font-bold text-white dark:text-white">
                                    Categorias
                                </h1>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    aria-label="Close"
                                >
                                    <BiX size={24} className="text-gray-700 dark:text-white hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Tab Navigation */}
                    <div className="bg-gray-900 dark:bg-gray-900 border-b border-gray-800 dark:border-gray-800">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('subscribed')}
                                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                                    activeTab === 'subscribed'
                                        ? 'text-white dark:text-white border-b-2 border-[#E31337] dark:border-[#E31337] bg-gray-800/50 dark:bg-gray-800/50'
                                        : 'text-gray-400 dark:text-gray-400 hover:text-white dark:hover:text-white hover:bg-gray-800/30 dark:hover:bg-gray-800/30'
                                }`}
                            >
                                Minhas Categorias
                            </button>
                            <button
                                onClick={() => setActiveTab('discover')}
                                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                                    activeTab === 'discover'
                                        ? 'text-white dark:text-white border-b-2 border-[#E31337] dark:border-[#E31337] bg-gray-800/50 dark:bg-gray-800/50'
                                        : 'text-gray-400 dark:text-gray-400 hover:text-white dark:hover:text-white hover:bg-gray-800/30 dark:hover:bg-gray-800/30'
                                }`}
                            >
                                Descobrir Categorias
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto p-4">
                        {/* Personal Blog Button */}
                        <div className="mb-6">
                            <button 
                                onClick={() => {
                                    console.log('Creating post in personal blog');
                                    handleCreatePost('');  // Empty string for personal blog
                                }} 
                                className="button primary flex items-center gap-2"
                            >
                                <BiEdit size={20} />
                                Criar Post Sem Categoria
                            </button>
                        </div>

                        {/* Subscribed Communities Tab */}
                        {activeTab === 'subscribed' && (
                            isLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E31337] dark:border-[#E31337]"></div>
                                    <span className="ml-3 text-gray-400 dark:text-gray-400">Carregando suas categorias...</span>
                                </div>
                            ) : (
                                <>
                                    {subscribedCommunities.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {subscribedCommunities.map(community => (
                                                <div 
                                                    key={community.name} 
                                                    className="border border-gray-700 dark:border-gray-700 rounded-lg p-4 bg-gray-800/50 dark:bg-gray-800/50 shadow-sm"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-lg font-medium text-white dark:text-white">{community.title}</h3>
                                                        <button
                                                            onClick={() => {
                                                                console.log('Unsubscribe button clicked for (from subscribed list):', community.name);
                                                                handleUnsubscribe(community.name);
                                                            }}
                                                            className="text-gray-300 dark:text-gray-300 bg-gray-700/50 dark:bg-gray-700/50 hover:bg-red-900/30 dark:hover:bg-red-900/30 hover:text-red-400 dark:hover:text-red-400 transition-colors p-1.5 rounded-md"
                                                            title="Cancelar inscrição"
                                                            disabled={isSubscribing}
                                                        >
                                                            <span className="flex items-center gap-1 text-xs font-medium">
                                                                <BiX size={16} className="text-red-400 dark:text-red-400" />
                                                                Sair
                                                            </span>
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            console.log('Create post button clicked for (from subscribed list):', community.name);
                                                            handleCreatePost(community.name);
                                                        }} 
                                                        className="w-full bg-[#E31337] dark:bg-[#E31337] hover:bg-[#c11230] dark:hover:bg-[#c11230] text-white dark:text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                                                    >
                                                        <BiEdit size={18} />
                                                        Criar Post Nesta Categoria
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 bg-gray-800 dark:bg-gray-800 rounded-lg">
                                            <p className="text-gray-400 dark:text-gray-400 mb-4">
                                                Você ainda não se inscreveu em nenhuma categoria.
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                                Categorias que você se inscrever aparecerão aqui.
                                            </p>
                                            <button
                                                onClick={() => setActiveTab('discover')}
                                                className="mt-4 bg-gray-700 dark:bg-gray-700 hover:bg-gray-600 dark:hover:bg-gray-600 text-white dark:text-white px-4 py-2 rounded-lg transition-colors"
                                            >
                                                Descobrir Categorias
                                            </button>
                                        </div>
                                    )}
                                </>
                            )
                        )}

                        {/* Discover Communities Tab */}
                        {activeTab === 'discover' && (
                            <>
                                {/* Search Bar */}
                                <div className="flex mb-6">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Buscar categorias..."
                                            className="w-full bg-gray-800 dark:bg-gray-800 text-white dark:text-white border border-gray-700 dark:border-gray-700 rounded-l-lg py-2 px-4 pl-10 focus:outline-none focus:ring-1 focus:ring-[#E31337] dark:focus:ring-[#E31337] focus:border-[#E31337] dark:focus:border-[#E31337]"
                                            onKeyDown={(e) => e.key === 'Enter' && searchCommunities()}
                                        />
                                        <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400" size={20} />
                                    </div>
                                    <button
                                        onClick={searchCommunities}
                                        className="bg-[#E31337] dark:bg-[#E31337] hover:bg-[#c11230] dark:hover:bg-[#c11230] text-white dark:text-white px-4 py-2 rounded-r-lg font-medium transition-colors"
                                        disabled={isSearching}
                                    >
                                        Buscar
                                    </button>
                                </div>

                                {isSearching ? (
                                    <div className="flex items-center justify-center p-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E31337] dark:border-[#E31337]"></div>
                                        <span className="ml-3 text-gray-400 dark:text-gray-400">Buscando categorias...</span>
                                    </div>
                                ) : (
                                    <>
                                        {discoverableCommunities.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {discoverableCommunities.map(community => (
                                                    <div 
                                                        key={community.name} 
                                                        className="border border-gray-700 dark:border-gray-700 rounded-lg p-4 bg-gray-800/50 dark:bg-gray-800/50 shadow-sm"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className="text-lg font-medium text-white dark:text-white">{community.title}</h3>
                                                            {community.isSubscribed ? (
                                                                <button
                                                                    onClick={() => {
                                                                        console.log('Unsubscribe button clicked for:', community.name);
                                                                        handleUnsubscribe(community.name);
                                                                    }}
                                                                    className="text-gray-300 dark:text-gray-300 bg-gray-700/50 dark:bg-gray-700/50 hover:bg-red-900/30 dark:hover:bg-red-900/30 hover:text-red-400 dark:hover:text-red-400 transition-colors p-1.5 rounded-md"
                                                                    title="Cancelar inscrição"
                                                                    disabled={isSubscribing}
                                                                >
                                                                    <span className="flex items-center gap-1 text-xs font-medium">
                                                                        <BiX size={16} className="text-red-400 dark:text-red-400" />
                                                                        Sair
                                                                    </span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        console.log('Subscribe button clicked for:', community.name);
                                                                        handleSubscribe(community.name);
                                                                    }}
                                                                    className="text-gray-300 dark:text-gray-300 bg-gray-700/50 dark:bg-gray-700/50 hover:bg-green-900/30 dark:hover:bg-green-900/30 hover:text-green-400 dark:hover:text-green-400 transition-colors p-1.5 rounded-md"
                                                                    title="Join"
                                                                    disabled={isSubscribing}
                                                                >
                                                                    <span className="flex items-center gap-1 text-xs font-medium">
                                                                        <BiPlus size={16} className="text-green-400 dark:text-green-400" />
                                                                        Entrar
                                                                    </span>
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div>
                                                        </div>
                                                        {community.subscribers && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                                                                {community.subscribers} {community.subscribers === 1 ? 'member' : 'members'}
                                                            </p>
                                                        )}
                                                        {community.about && (
                                                            <p className="text-sm text-gray-300 dark:text-gray-300 mb-4 line-clamp-2">
                                                                {community.about}
                                                            </p>
                                                        )}
                                                        {community.isSubscribed && (
                                                            <button 
                                                                onClick={() => {
                                                                    console.log('Create post button clicked for:', community.name);
                                                                    handleCreatePost(community.name);
                                                                }} 
                                                                className="w-full bg-[#E31337] dark:bg-[#E31337] hover:bg-[#c11230] dark:hover:bg-[#c11230] text-white dark:text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                                                            >
                                                                <BiEdit size={18} />
                                                                Criar Post Nesta Categoria
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : searchQuery ? (
                                            <div className="text-center p-8 bg-gray-800 dark:bg-gray-800 rounded-lg">
                                                <p className="text-gray-400 dark:text-gray-400">
                                                    Nenhuma categoria encontrada para &quot;{searchQuery}&quot;.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center p-8 bg-gray-800 dark:bg-gray-800 rounded-lg">
                                                <p className="text-gray-400 dark:text-gray-400">
                                                    Use a busca acima para encontrar categorias.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
} 