const userId = "940977931025534976",
    statusCafeUser = "misha";
const LASTFM_API_KEY = "d51a838945262fe0a466c9d6f2952c60"; 
const LASTFM_USERNAME = "yavamnespotify"; 
let isInitialLoadDiscord = true;
let isInitialLoadLastFm = true;
const PLACEHOLDER_IMAGE = "placeholder.png";

function openStatusCafeProfile() {
    window.open("https://status.cafe/users/misha", "_blank");
}


function updateUTCTime() {
    const now = new Date();
    
    
    const utcOffset = 9 * 60 * 60 * 1000;
    const utc9Time = new Date(now.getTime() + utcOffset);
    
    
    const hours = utc9Time.getUTCHours().toString().padStart(2, '0');
    const minutes = utc9Time.getUTCMinutes().toString().padStart(2, '0');
    const seconds = utc9Time.getUTCSeconds().toString().padStart(2, '0');
    
    document.getElementById('utc-time').textContent = `${hours}:${minutes}:${seconds}`;
}


updateUTCTime();
setInterval(updateUTCTime, 1000);

async function fetchDiscordActivity() {
    const spinner = document.getElementById("loading-spinner"),
        userInfo = document.getElementById("user-info"),
        activityContainer = document.getElementById("activity-container"),
        widget = document.getElementById("discord-widget");

    if (isInitialLoadDiscord) {
        spinner.style.display = "block";
        userInfo.style.display = "none";
        activityContainer.style.display = "none";
    }

    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        const data = await response.json();
        
        if (data.success) {
            const userData = data.data,
                avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${userData.discord_user.avatar}.png`,
                username = userData.discord_user.username;
            
            document.getElementById("avatar").src = avatarUrl;
            const usernameElement = document.getElementById("username");
            usernameElement.textContent = username;
            usernameElement.style.cursor = "pointer";

            try {
                const statusResponse = await fetch("https://status.cafe/users/misha/status.json");
                if (!statusResponse.ok) throw new Error(`HTTP error! Status: ${statusResponse.status}`);
                const statusData = await statusResponse.json();
                
                const statusElement = document.getElementById("status-cafe");
                const statusContent = statusElement.querySelector(".truncate");
                const statusTooltip = statusElement.querySelector(".tooltiptext");
                
                if (statusData && statusData.content) {
                    const statusText = `${statusData.author} ${statusData.face || ""}: ${statusData.content}`;
                    statusContent.innerHTML = `<span class="author">${statusData.author} ${statusData.face || ""}</span>: <span class="status-text">${statusData.content}</span>`;
                    if (statusTooltip) statusTooltip.textContent = statusText;
                } else {
                    const defaultText = "misha: No status";
                    statusContent.innerHTML = `<span class="author">misha</span>: <span class="status-text">No status</span>`;
                    if (statusTooltip) statusTooltip.textContent = defaultText;
                }
            } catch (error) {
                console.error("Error fetching status.cafe data:", error);
                const statusElement = document.getElementById("status-cafe");
                const statusContent = statusElement.querySelector(".truncate");
                const statusTooltip = statusElement.querySelector(".tooltiptext");
                const errorText = "misha: Status unavailable";
                statusContent.innerHTML = `<span class="author">misha</span>: <span class="status-text">Status unavailable</span>`;
                if (statusTooltip) statusTooltip.textContent = errorText;
            }

            const spotifyActivity = userData.activities.find(a => a.name === "Spotify");
            const foobarActivity = userData.activities.find(a => a.name === "foobar2000");
            const gameActivity = userData.activities.find(a => a.type === 0);
            const currentActivity = spotifyActivity || foobarActivity || gameActivity;

            if (currentActivity) {
                const { details, state, assets, timestamps, name } = currentActivity;
                
                if (currentActivity.type === 0) {
                    document.getElementById("activity-name").textContent = name || "Playing a game";
                    document.getElementById("activity-details").textContent = details || "";
                    
                    if (assets?.large_image) {
                        const imageUrl = assets.large_image.startsWith("mp:external/")
                            ? assets.large_image.replace("mp:external/", "https://media.discordapp.net/external/")
                            : `https://cdn.discordapp.com/app-assets/${currentActivity.application_id}/${assets.large_image}.png`;
                        
                        document.getElementById("activity-cover").src = imageUrl;
                        document.getElementById("activity-cover").style.display = "block";
                    } else {
                        document.getElementById("activity-cover").src = PLACEHOLDER_IMAGE;
                        document.getElementById("activity-cover").style.display = "block";
                    }
                } else {
                    document.getElementById("activity-name").textContent = details || "";
                    document.getElementById("activity-details").textContent = state || "";
                    
                    let imageUrl = "";
                    if (assets?.large_image) {
                        if (currentActivity.name === "Spotify") {
                            imageUrl = `https://i.scdn.co/image/${assets.large_image.replace("spotify:", "")}`;
                        } else if (currentActivity.name === "foobar2000") {
                            imageUrl = assets.large_image.startsWith("mp:external/")
                                ? assets.large_image.replace("mp:external/", "https://media.discordapp.net/external/")
                                : `https://cdn.discordapp.com/app-assets/${currentActivity.application_id}/${assets.large_image}.png`;
                        }
                    }
                    
                    if (imageUrl) {
                        document.getElementById("activity-cover").src = imageUrl;
                        document.getElementById("activity-cover").style.display = "block";
                    } else {
                        document.getElementById("activity-cover").style.display = "none";
                    }
                }

                if (timestamps && timestamps.start && timestamps.end) {
                    const start = timestamps.start;
                    const end = timestamps.end;
                    const now = Date.now();
                    const progress = Math.min(100, ((now - start) / (end - start)) * 100);
                    
                    document.getElementById("progress-bar").style.width = `${progress}%`;
                    
                    const formatTime = (timestamp) => {
                        const seconds = Math.floor(timestamp / 1000);
                        return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
                    };
                    
                    const elapsed = now - start;
                    document.getElementById("time-start").textContent = formatTime(elapsed);
                    
                    const total = end - start;
                    document.getElementById("time-end").textContent = formatTime(total);
                    
                    document.getElementById("progress-container").style.display = "block";
                    document.getElementById("time-info").style.display = "flex";
                } else {
                    document.getElementById("progress-container").style.display = "none";
                    document.getElementById("time-info").style.display = "none";
                }
                
                widget.classList.remove("no-activity");
                activityContainer.style.display = "block";
            } else {
                document.getElementById("activity-name").textContent = "";
                document.getElementById("activity-details").textContent = "";
                document.getElementById("activity-cover").style.display = "none";
                document.getElementById("progress-container").style.display = "none";
                document.getElementById("time-info").style.display = "none";
                widget.classList.add("no-activity");
                activityContainer.style.display = "none";
            }

            const customStatus = userData.activities.find(a => a.type === 4);
            if (customStatus && customStatus.emoji) {
                const emojiUrl = customStatus.emoji.animated
                    ? `https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.gif`
                    : `https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.png`;
                
                document.getElementById("custom-status").src = emojiUrl;
                document.getElementById("custom-status").style.display = "block";
            } else {
                document.getElementById("custom-status").style.display = "none";
            }

            const avatarContainer = document.getElementById("avatar-container");
            avatarContainer.classList.remove("online", "idle", "dnd", "offline");
            
            switch (userData.discord_status) {
                case "online":
                    avatarContainer.classList.add("online");
                    break;
                case "idle":
                    avatarContainer.classList.add("idle");
                    break;
                case "dnd":
                    avatarContainer.classList.add("dnd");
                    break;
                default:
                    avatarContainer.classList.add("offline");
            }
        } else {
            console.error("Failed to fetch data from Lanyard API");
        }
    } catch (error) {
        console.error("Error fetching Discord data:", error);
    } finally {
        if (isInitialLoadDiscord) {
            spinner.style.display = "none";
            userInfo.style.display = "block";
            isInitialLoadDiscord = false;
        }
    }
}

async function fetchLastFmActivity() {
    const lastActivityCover = document.getElementById("last-activity-cover");
    const lastTitle = document.getElementById("last-title");
    const lastArtist = document.getElementById("last-artist");
    const lastHoursAgo = document.getElementById("last-hours-ago");
    const lastFmSpinner = document.getElementById("lastfm-loading-spinner");
    const lastPlayedInfo = document.getElementById("last-played-info");
    const lastPlayedWidget = document.querySelector(".last-played");

    if (isInitialLoadLastFm) {
        lastPlayedWidget.classList.add("loading");
        lastFmSpinner.style.display = "block";
        lastActivityCover.style.display = "none";
        lastPlayedInfo.style.display = "none";
    }

    try {
        const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
        );
        const data = await response.json();

        if (data.recenttracks && data.recenttracks.track.length > 0) {
            const track = data.recenttracks.track[0];
            const artist = track.artist["#text"];
            const title = track.name;
            
            const imageUrl = track.image.find(img => img.size === "large")?.["#text"] || PLACEHOLDER_IMAGE;

            lastTitle.textContent = title;
            lastArtist.textContent = artist;
            lastActivityCover.src = imageUrl;

            const titleTooltip = lastTitle.parentElement.querySelector('.tooltiptext');
            const artistTooltip = lastArtist.parentElement.querySelector('.tooltiptext');
            
            if (titleTooltip) titleTooltip.textContent = title;
            if (artistTooltip) artistTooltip.textContent = artist;

            if (track["@attr"] && track["@attr"].nowplaying === "true") {
                lastHoursAgo.textContent = "Now playing";
            } else if (track.date && track.date.uts) {
                const uts = parseInt(track.date.uts) * 1000; 
                const now = Date.now();
                const diffMs = now - uts;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

                if (diffHours > 0) {
                    lastHoursAgo.textContent = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
                } else if (diffMinutes > 0) {
                    lastHoursAgo.textContent = `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
                } else {
                    lastHoursAgo.textContent = "A few seconds ago";
                }
            } else {
                lastHoursAgo.textContent = ""; 
            }
            lastActivityCover.style.display = "block";
            lastPlayedInfo.style.display = "flex";
        } else {
            lastTitle.textContent = "No data on the last song";
            lastArtist.textContent = "";
            lastHoursAgo.textContent = "";
            lastActivityCover.src = PLACEHOLDER_IMAGE;
            lastActivityCover.style.display = "block";
            lastPlayedInfo.style.display = "flex";
        }
    } catch (error) {
        console.error("Error fetching Last.fm activity:", error);
        lastTitle.textContent = "Loading error";
        lastArtist.textContent = "";
        lastHoursAgo.textContent = "";
        lastActivityCover.src = PLACEHOLDER_IMAGE;
        lastActivityCover.style.display = "block";
        lastPlayedInfo.style.display = "flex";
    } finally {
        if (isInitialLoadLastFm) {
            lastFmSpinner.style.display = "none";
            lastPlayedWidget.classList.remove("loading");
            isInitialLoadLastFm = false;
        }
    }
}

document.getElementById("username").addEventListener("click", () => {
    window.open(`https://discord.com/users/${userId}`, "_blank");
});

document.getElementById("status-cafe").addEventListener("click", openStatusCafeProfile);

fetchDiscordActivity();
setInterval(fetchDiscordActivity, 1000); 

fetchLastFmActivity();
setInterval(fetchLastFmActivity, 60000);
