const userId = "940977931025534976",
	statusCafeUser = "misha";
const LASTFM_API_KEY = "d51a838945262fe0a466c9d6f2952c60"; // Замените на ваш реальный API ключ Last.fm
const LASTFM_USERNAME = "yavamnespotify"; // Замените на ваш юзернейм Last.fm
let isInitialLoad = !0;

function openStatusCafeProfile() {
	window.open("https://status.cafe/users/misha", "_blank");
}
const PLACEHOLDER_IMAGE = "placeholder.png";

async function fetchDiscordActivity() {
	const t = document.getElementById("loading-spinner"),
		e = document.getElementById("user-info"),
		n = document.getElementById("activity-container"),
		a = document.getElementById("discord-widget");

	isInitialLoad &&
		((t.style.display = "block"),
		(e.style.display = "none"),
		(n.style.display = "none"));
	try {
		const t = await fetch(`https://api.lanyard.rest/v1/users/${userId}`),
			e = await t.json();
		if (e.success) {
			const t = e.data,
				s = `https://cdn.discordapp.com/avatars/${userId}/${t.discord_user.avatar}.png`,
				o = t.discord_user.username,
				i = (t.discord_status, t.activities);
			document.getElementById("avatar").src = s;
			const usernameElement = document.getElementById("username");
			usernameElement.textContent = o;
			usernameElement.style.cursor = "pointer";

			try {
				const t = await fetch(
					"https://status.cafe/users/misha/status.json",
				);
				if (!t.ok) throw new Error(`HTTP error! Status: ${t.status}`);
				const e = await t.json();
				if (e && e.content) {
					const t = `${e.author} ${e.face || ""}: ${e.content}`;
					document.getElementById("status-cafe").textContent = t;
				} else
					document.getElementById("status-cafe").textContent =
						"misha: No status";
			} catch (t) {
				console.error("Error fetching status.cafe data:", t),
					(document.getElementById("status-cafe").textContent =
						"misha: Status unavailable");
			}
			const c = i.find((t) => "Spotify" === t.name),
				d = i.find((t) => "foobar2000" === t.name),
				l = i.find((t) => 0 === t.type),
				m = c || d || l;
			if (m) {
				const {
					details: t,
					state: e,
					assets: s,
					timestamps: o,
					name: i,
				} = m;
				if (0 === m.type)
					if (
						((document.getElementById("activity-name").textContent =
							i || "Playing a game"),
						(document.getElementById(
							"activity-details",
						).textContent = t || ""),
						s?.large_image)
					) {
						const t = s.large_image.startsWith("mp:external/")
							? s.large_image.replace(
									"mp:external/",
									"https://media.discordapp.net/external/",
								)
							: `https://cdn.discordapp.com/app-assets/${m.application_id}/${s.large_image}.png`;
						(document.getElementById("activity-cover").src = t),
							(document.getElementById(
								"activity-cover",
							).style.display = "block");
					} else
						(document.getElementById("activity-cover").src =
							"placeholder.png"),
							(document.getElementById(
								"activity-cover",
							).style.display = "block");
				else {
					(document.getElementById("activity-name").textContent =
						t || ""),
						(document.getElementById(
							"activity-details",
						).textContent = e || "");
					let n = "";
					s?.large_image &&
						("Spotify" === m.name
							? (n = `https://i.scdn.co/image/${s.large_image.replace("spotify:", "")}`)
							: "foobar2000" === m.name &&
								(n = s.large_image.startsWith("mp:external/")
									? s.large_image.replace(
											"mp:external/",
											"https://media.discordapp.net/external/",
										)
									: `https://cdn.discordapp.com/app-assets/${m.application_id}/${s.large_image}.png`)),
						n
							? ((document.getElementById("activity-cover").src =
									n),
								(document.getElementById(
									"activity-cover",
								).style.display = "block"))
							: (document.getElementById(
									"activity-cover",
								).style.display = "none");
				}
				if (o && o.start && o.end) {
					const t = o.start,
						e = o.end,
						n = Date.now(),
						a = Math.min(100, ((n - t) / (e - t)) * 100);
					document.getElementById("progress-bar").style.width =
						`${a}%`;
					const s = (t) => {
							const e = Math.floor(t / 1e3);
							return `${Math.floor(e / 60)}:${String(e % 60).padStart(2, "0")}`;
						},
						i = n - t;
					document.getElementById("time-start").textContent = s(i);
					const c = e - t;
					(document.getElementById("time-end").textContent = s(c)),
						(document.getElementById(
							"progress-container",
						).style.display = "block"),
						(document.getElementById("time-info").style.display =
							"flex");
				} else
					(document.getElementById(
						"progress-container",
					).style.display = "none"),
						(document.getElementById("time-info").style.display =
							"none");
				a.classList.remove("no-activity"), (n.style.display = "block");
			} else
				(document.getElementById("activity-name").textContent = ""),
					(document.getElementById("activity-details").textContent =
						""),
					(document.getElementById("activity-cover").style.display =
						"none"),
					(document.getElementById(
						"progress-container",
					).style.display = "none"),
					(document.getElementById("time-info").style.display =
						"none"),
					a.classList.add("no-activity"),
					(n.style.display = "none");
			const r = i.find((t) => 4 === t.type);
			if (r && r.emoji) {
				const t = r.emoji.animated
					? `https://cdn.discordapp.com/emojis/${r.emoji.id}.gif`
					: `https://cdn.discordapp.com/emojis/${r.emoji.id}.png`;
				(document.getElementById("custom-status").src = t),
					(document.getElementById("custom-status").style.display =
						"block");
			} else
				document.getElementById("custom-status").style.display = "none";
			const avatarContainer = document.getElementById("avatar-container");
			avatarContainer.classList.remove(
				"online",
				"idle",
				"dnd",
				"offline",
			);
			switch (t.discord_status) {
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
		} else console.error("Failed to fetch data from Lanyard API");
	} catch (t) {
		console.error("Error fetching data:", t);
	} finally {
		isInitialLoad &&
			((t.style.display = "none"),
			(e.style.display = "block"),
			(isInitialLoad = !1));
	}
}

async function fetchLastFmActivity() {
    const lastActivityCover = document.getElementById("last-activity-cover");
    const lastTitle = document.getElementById("last-title");
    const lastArtist = document.getElementById("last-artist");
    const lastHoursAgo = document.getElementById("last-hours-ago");

    try {
        const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
        );
        const data = await response.json();

        if (data.recenttracks && data.recenttracks.track.length > 0) {
            const track = data.recenttracks.track[0];
            const artist = track.artist["#text"];
            const title = track.name;
            // Find the large image, or fall back to placeholder
            const imageUrl = track.image.find(img => img.size === "large")?.["#text"] || PLACEHOLDER_IMAGE;

            lastTitle.textContent = title;
            lastArtist.textContent = artist;
            lastActivityCover.src = imageUrl;

            if (track["@attr"] && track["@attr"].nowplaying === "true") {
                lastHoursAgo.textContent = "Now playing";
            } else if (track.date && track.date.uts) {
                const uts = parseInt(track.date.uts) * 1000; // Convert to milliseconds
                const now = Date.now();
                const diffMs = now - uts;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

                if (diffHours > 0) {
                    lastHoursAgo.textContent = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
                } else if (diffMinutes > 0) {
                    lastHoursAgo.textContent = `${diffMinutes} minute${diffMinutes === 1 ? 's' : ''} ago`;
                } else {
                    lastHoursAgo.textContent = "A few seconds ago";
                }
            } else {
                lastHoursAgo.textContent = ""; // Or a default message
            }
        } else {
            lastTitle.textContent = "No data on the last song";
            lastArtist.textContent = "";
            lastHoursAgo.textContent = "";
            lastActivityCover.src = PLACEHOLDER_IMAGE;
        }
    } catch (error) {
        console.error("Error fetching Last.fm activity:", error);
        lastTitle.textContent = "Loading error";
        lastArtist.textContent = "";
        lastHoursAgo.textContent = "";
        lastActivityCover.src = PLACEHOLDER_IMAGE;
    }
}


document.getElementById("username").addEventListener("click", () => {
	window.open(`https://discord.com/users/${userId}`, "_blank");
});

document
	.getElementById("status-cafe")
	.addEventListener("click", openStatusCafeProfile);

fetchDiscordActivity();
setInterval(fetchDiscordActivity, 1e3); // Update Discord activity every second

fetchLastFmActivity();
setInterval(fetchLastFmActivity, 60 * 1000); // Update Last.fm activity every minute (60 seconds)
