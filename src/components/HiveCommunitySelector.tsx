import { useEffect, useState } from 'react';
import { BiCheck, BiCheckCircle, BiPlus, BiSearch } from 'react-icons/bi';

interface HiveCommunity {
    name: string;
    title: string;
    about?: string;
    subscribers?: number;
    isSubscribed: boolean;
}

interface HiveCommunitySelectorProps {
    selectedCommunity: string | null;
    onSelectCommunity: (community: string | null) => void;
    username: string;
}

export default function HiveCommunitySelector({ 
    selectedCommunity, 
    onSelectCommunity,
    username
}: HiveCommunitySelectorProps) {
    const [communities, setCommunities] = useState<HiveCommunity[]>([]);
    const [subscribedCommunities, setSubscribedCommunities] = useState<HiveCommunity[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAllCommunities, setShowAllCommunities] = useState(false);

    // Fetch subscribed communities on mount
    useEffect(() => {
        if (username) {
            fetchSubscribedCommunities();
        }
    }, [username]);

    const fetchSubscribedCommunities = async () => {
        setIsLoading(true);
        try {
            // Call to Hive API to get user's subscribed communities
            const response = await fetch(`https://api.hive.blog/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "jsonrpc": "2.0",
                    "method": "bridge.list_all_subscriptions",
                    "params": { "account": username },
                    "id": 1
                })
            });
            
            const data = await response.json();
            if (data.result) {
                // Format the result into our HiveCommunity type
                const subscribedCommunitiesData = data.result.map((community: any) => ({
                    name: community[0], // community name like 'hive-123456'
                    title: community[1] || community[0], // display name or fallback to internal name
                    isSubscribed: true
                }));
                
                setSubscribedCommunities(subscribedCommunitiesData);
            }
        } catch (error) {
            console.error('Error fetching subscribed communities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const searchCommunities = async () => {
        if (!searchTerm || searchTerm.length < 2) return;
        
        setIsLoading(true);
        try {
            // Call to Hive API to search for communities
            const response = await fetch(`https://api.hive.blog/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "jsonrpc": "2.0",
                    "method": "bridge.list_communities",
                    "params": { "last": "", "limit": 20, "query": searchTerm },
                    "id": 1
                })
            });
            
            const data = await response.json();
            if (data.result) {
                // Map results to our type, checking if user is subscribed
                const communityResults = data.result.map((community: any) => ({
                    name: community.name,
                    title: community.title,
                    about: community.about,
                    subscribers: community.subscribers,
                    isSubscribed: subscribedCommunities.some(
                        sub => sub.name === community.name
                    )
                }));
                
                setCommunities(communityResults);
                setShowAllCommunities(true);
            }
        } catch (error) {
            console.error('Error searching communities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubscribe = async (communityName: string) => {
        if (!username) {
            alert('Please login first to subscribe to communities');
            return;
        }

        try {
            // Using Hive Keychain to subscribe/unsubscribe
            const isAlreadySubscribed = subscribedCommunities.some(
                community => community.name === communityName
            );

            const keychain = window.hive_keychain;
            if (!keychain) {
                alert('Hive Keychain extension is required');
                return;
            }

            const community = isAlreadySubscribed
                ? subscribedCommunities.find(c => c.name === communityName)
                : communities.find(c => c.name === communityName);
                
            if (!community) return;

            // Create operation for subscribe/unsubscribe
            const operation = [
                isAlreadySubscribed ? 'unsubscribe' : 'subscribe',
                {
                    community: communityName
                }
            ];
            
            keychain.requestCustomJson(
                username,
                'community',
                'Posting',
                JSON.stringify(operation),
                isAlreadySubscribed ? 'Unsubscribe from community' : 'Subscribe to community',
                (response: any) => {
                    if (response.success) {
                        if (isAlreadySubscribed) {
                            // Remove from subscribed list
                            setSubscribedCommunities(prevState =>
                                prevState.filter(c => c.name !== communityName)
                            );
                            
                            // Update the all communities list
                            setCommunities(prevCommunities =>
                                prevCommunities.map(c =>
                                    c.name === communityName
                                        ? { ...c, isSubscribed: false }
                                        : c
                                )
                            );
                        } else {
                            // Add to subscribed list
                            setSubscribedCommunities(prevState => [
                                ...prevState,
                                { ...community, isSubscribed: true }
                            ]);
                            
                            // Update the all communities list
                            setCommunities(prevCommunities =>
                                prevCommunities.map(c =>
                                    c.name === communityName
                                        ? { ...c, isSubscribed: true }
                                        : c
                                )
                            );
                        }
                    } else {
                        alert(`Failed to ${isAlreadySubscribed ? 'unsubscribe from' : 'subscribe to'} community: ${response.message}`);
                    }
                }
            );
        } catch (error) {
            console.error('Error subscribing to community:', error);
            alert('Failed to update subscription');
        }
    };

    const handleSelectCommunity = (communityName: string | null) => {
        onSelectCommunity(communityName);
        
        // Shows visual feedback for a few seconds
        if (communityName) {
            const selectedCommunityData = [...communities, ...subscribedCommunities].find(c => c.name === communityName);
            if (selectedCommunityData) {
                // Displays a temporary notification
                const notificationElement = document.createElement('div');
                notificationElement.className = 'fixed top-4 right-4 z-[10000] bg-[#E31337] text-white px-4 py-3 rounded-lg shadow-lg flex items-center';
                notificationElement.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>Selected community: <strong>${selectedCommunityData.title || communityName}</strong></span>
                `;
                document.body.appendChild(notificationElement);
                
                // Removes the notification after 3 seconds
                setTimeout(() => {
                    notificationElement.classList.add('fade-out');
                    setTimeout(() => {
                        document.body.removeChild(notificationElement);
                    }, 300);
                }, 3000);
                
                // Adds a fade-out animation style
                const style = document.createElement('style');
                style.innerHTML = `
                    .fade-out {
                        opacity: 0;
                        transition: opacity 0.3s;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    };

    const renderCommunityItem = (community: HiveCommunity) => (
        <div 
            key={community.name} 
            className={`flex items-center justify-between p-3 border-b border-gray-700 hover:bg-gray-800/50 transition-colors ${
                selectedCommunity === community.name ? 'bg-gray-800/70' : ''
            }`}
        >
            <div 
                className="flex flex-col flex-1 cursor-pointer"
                onClick={() => handleSelectCommunity(community.name)}
            >
                <div className="flex items-center">
                    {selectedCommunity === community.name && (
                        <BiCheckCircle className="text-[#E31337] mr-1.5" size={16} />
                    )}
                    <span className={`text-sm font-medium ${selectedCommunity === community.name ? 'text-[#E31337]' : 'text-white'}`}>
                        {community.title || community.name}
                    </span>
                </div>
                <div className="text-xs text-gray-400">
                    {community.subscribers ? `${community.subscribers} subscribers` : ''}
                </div>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe(community.name);
                }}
                className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                title={community.isSubscribed ? "Unsubscribe" : "Subscribe"}
            >
                {community.isSubscribed ? (
                    <BiCheck className="text-green-500" size={20} />
                ) : (
                    <BiPlus className="text-white" size={20} />
                )}
            </button>
        </div>
    );

    return (
        <div className="bg-[#1E2028] rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-3 border-b border-gray-700">
                <h3 className="text-base font-medium text-white mb-2">Select Community</h3>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search communities..."
                            className="w-full px-3 py-2 pr-10 text-sm border text-white border-gray-600 rounded-lg bg-gray-800/50 focus:outline-none focus:ring-1 focus:ring-[#E31337] focus:border-transparent"
                            onKeyDown={(e) => e.key === 'Enter' && searchCommunities()}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <BiSearch className="text-gray-400" />
                        </div>
                    </div>
                    <button
                        onClick={searchCommunities}
                        className="px-3 py-2 text-sm font-medium rounded-lg transition-colors bg-[#E31337] text-white hover:bg-[#c11230]"
                    >
                        Search
                    </button>
                </div>
                <div className="flex items-center mt-3">
                    <div
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer border ${
                            selectedCommunity === null 
                                ? 'bg-[#E31337]/10 text-[#E31337] border-[#E31337]' 
                                : 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                        onClick={() => {
                            handleSelectCommunity(null);
                            setShowAllCommunities(false);
                        }}
                    >
                        <div className="flex items-center gap-2">
                            {selectedCommunity === null && (
                                <BiCheckCircle className="text-[#E31337]" size={18} />
                            )}
                            <span>Personal Blog</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAllCommunities(!showAllCommunities)}
                        className={`ml-2 px-3 py-1 text-xs font-medium rounded-full transition-colors 
                            ${showAllCommunities 
                                ? 'bg-[#E31337] text-white' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        {showAllCommunities ? 'My Communities' : 'All Communities'}
                    </button>
                </div>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E31337]"></div>
                        <span className="ml-3 text-sm text-gray-400">Loading...</span>
                    </div>
                ) : (
                    <>
                        {showAllCommunities ? (
                            communities.length > 0 ? (
                                communities.map(renderCommunityItem)
                            ) : (
                                <div className="p-4 text-sm text-gray-400 text-center">
                                    {searchTerm ? 'No communities found. Try another search term.' : 'Search for communities above.'}
                                </div>
                            )
                        ) : (
                            subscribedCommunities.length > 0 ? (
                                subscribedCommunities.map(renderCommunityItem)
                            ) : (
                                <div className="p-4 text-sm text-gray-400 text-center">
                                    You haven&apos;t subscribed to any communities yet.
                                </div>
                            )
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 