let matchesData = [];

// Function to get videoId dynamically from URL parameters          
function getVideoId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('videoId'); // No default fallback          
}

// Function to update match title          
function updateMatchTitle(title) {
    const matchTitle = document.getElementById('match-title');
    matchTitle.textContent = title;
}

// Initialize JWPlayer dynamically with videoId or M3U8          
function initializePlayer(videoId, m3u8, mp4, iframeUrl, title) {
    const playerContainer = document.getElementById('player');
    playerContainer.innerHTML = ''; // Clear previous content  

    if (videoId) {
        const videoUrl = `https://tvpull.careryun.com/live/ballbar_${videoId}.m3u8`; // Ganti dengan URL video yang benar          
        jwplayer("player").setup({
            file: videoUrl,
            image: "https://da.gd/5TAX", // Ganti dengan URL gambar yang benar          
            width: "100%",
            height: "100%"
        });
        jwplayer().on('error', function() {
            console.error('Error with videoId, switching to M3U8');
            initializePlayer(null, m3u8, mp4, iframeUrl, title);
        });
    } else if (m3u8) {
        jwplayer("player").setup({
            file: m3u8,
            image: "https://da.gd/5TAX", // Ganti dengan URL gambar yang benar          
            width: "100%",
            height: "100%"
        });
        jwplayer().on('error', function() {
            console.error('Error with M3U8, switching to MP4');
            initializePlayer(null, null, mp4, iframeUrl, title);
        });
    } else if (mp4) {
        jwplayer("player").setup({
            file: mp4,
            image: "https://da.gd/5TAX", // Ganti dengan URL gambar yang benar          
            width: "100%",
            height: "100%"
        });
        jwplayer().on('error', function() {
            console.error('Error with MP4, switching to iframe');
            initializePlayer(null, null, null, iframeUrl, title);
        });
    } else if (iframeUrl) {
        playerContainer.innerHTML = `  
                    <iframe src="${iframeUrl}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>  
                `;
    } else {
        playerContainer.innerHTML = '<p>Video not available.</p>';
    }
    updateMatchTitle(title);
    scrollToPlayer();
}

// Function to scroll to the player section          
function scrollToPlayer() {
    const playerCard = document.getElementById('player-card');
    playerCard.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Function to format date from YYYY-MM-DD to DD-Month-YYYY          
function formatDate(dateString) {
    const options = {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Load matches from JSON          
function loadMatches() {
    const matchesCategories = document.getElementById('matches-categories');
    fetch('https://wartakita.github.io/voli.github.io/Matches.json') // Ganti dengan URL file JSON Anda          
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            matchesData = data; // Simpan data JSON dalam variabel global          
            renderMatches(data);
        })
        .catch(error => {
            console.error('Error fetching matches:', error);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-danger';
            errorMessage.textContent = 'Failed to load matches. Please try again later.';
            matchesCategories.appendChild(errorMessage);
        });
}

// Search matches          
function searchMatches(query) {
    const filteredMatches = matchesData.filter(match => match.teams.toLowerCase().includes(query.toLowerCase()));
    renderMatches(filteredMatches);
}

// Filter matches by category          
function filterMatches(category) {
    const matchesCategories = document.getElementById('matches-categories');
    const categories = matchesCategories.querySelectorAll('.match-category');

    categories.forEach(categoryDiv => {
        if (category === 'all' || categoryDiv.id === `category-${category.toLowerCase().replace(/\s+/g, '-')}`) {
            categoryDiv.style.display = 'block';
        } else {
            categoryDiv.style.display = 'none';
        }
    });
}

// Render matches          
function renderMatches(matches) {
    const matchesCategories = document.getElementById('matches-categories');
    matchesCategories.innerHTML = '';
    const categories = {};
    matches.forEach(match => {
        if (!categories[match.category]) {
            categories[match.category] = [];
        }
        categories[match.category].push(match);
    });

    Object.keys(categories).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'match-category';
        categoryDiv.id = `category-${category.toLowerCase().replace(/\s+/g, '-')}`;

        const categoryTitle = document.createElement('h5');
        categoryTitle.textContent = category;
        categoryDiv.appendChild(categoryTitle);

        const categoryList = document.createElement('ul');
        categoryList.className = 'list-group';

        categories[category].forEach(match => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
            listItem.innerHTML = `          
                        <div>          
                            <strong>${match.teams}</strong><br>          
                            <small>${match.time} - ${formatDate(match.date)}</small>          
                        </div>          
                        <button class="btn btn-primary btn-sm watch-match" data-video-id="${match.videoId}" data-m3u8="${match.m3u8}" data-mp4="${match.mp4}" data-iframe-url="${match.iframeUrl}" data-title="${match.teams}">Watch</button>          
                    `;
            listItem.addEventListener('click', () => {
                initializePlayer(match.videoId, match.m3u8, match.mp4, match.iframeUrl, match.teams);
            });
            categoryList.appendChild(listItem);
        });

        categoryDiv.appendChild(categoryList);
        matchesCategories.appendChild(categoryDiv);
    });

    // Add event listeners to filter buttons          
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            filterMatches(button.getAttribute('data-category'));
        });
    });
}

// Initialize on DOMContentLoaded          
document.addEventListener('DOMContentLoaded', function() {
    const videoId = getVideoId();
    if (videoId) {
        fetch('https://wartakita.github.io/voli.github.io/Matches.json') // Ganti dengan URL file JSON Anda          
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                const match = data.find(m => m.videoId === videoId);
                if (match) {
                    initializePlayer(match.videoId, match.m3u8, match.mp4, match.iframeUrl, match.teams);
                } else {
                    console.error('Match not found for videoId:', videoId);
                }
            })
            .catch(error => {
                console.error('Error fetching matches:', error);
            });
    }
    loadMatches();

    // Search input event listener          
    document.getElementById('search-input').addEventListener('input', function() {
        const query = this.value;
        searchMatches(query);
    });

    // Watch match button event listener          
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('watch-match')) {
            const videoId = event.target.getAttribute('data-video-id');
            const m3u8 = event.target.getAttribute('data-m3u8');
            const mp4 = event.target.getAttribute('data-mp4');
            const iframeUrl = event.target.getAttribute('data-iframe-url');
            const title = event.target.getAttribute('data-title');
            initializePlayer(videoId, m3u8, mp4, iframeUrl, title);
        }
    });
});
