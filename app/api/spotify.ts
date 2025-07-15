const clientId = "1586d326bf87450b94cc5d2dbec16f17"; // Replace with your client id
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const playlistId = "37vVbInEzfnXJQjVuU7bAZ"

if (!code) {
    redirectToAuthCodeFlow(clientId)
} else {
    const accessToken = await getAccessToken(clientId, code);
    const playlists = await fetchPlaylistByID(accessToken, playlistId);
    populatePlaylistTracks(playlists);
}

export async function redirectToAuthCodeFlow(clientId: string) {
    const verifier = generateCodeVerifier(128); // generates a randome string for this session
    const challenge = await generateCodeChallenge(verifier); // a hashed version of the verifier, this uses SHA-256

    localStorage.setItem("verifier", verifier); // stores the verifier for later use during the roke nexchange

    const params = new URLSearchParams(); // creates a new query string for the authorization URL
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://127.0.0.1:5173/callback"); // adds in the OAuth2 parameters 
    params.append("scope", "user-read-private user-read-email playlist-read-private playlist-read-collaborative");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}


export async function getAccessToken(clientId: string, code: string): Promise<string> {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://127.0.0.1:5173/callback");
    params.append("code_verifier", verifier!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}
/*
async function fetchPlaylists(token: string): Promise<any> {
    const result = await fetch("https://api.spotify.com/v1/me/playlists", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    return await result.json();
}

function populatePlaylists(playlist: any) {
    const playlistContainer = document.getElementById("playlistContainer");
    playlistContainer!.innerHTML="";

    playlist.items.forEach((playlist: any) => {
        const div = document.createElement("div");
        div.className = "playlist";

        const name = document.createElement("h3");
        name.innerText = playlist.name;
        div.appendChild(name);

        if ( playlist.images[0]){
            const img = new Image(200, 200);
            img.src = playlist.images[0].url;
            div.appendChild(img);
        }

        const link = document.createElement("a");
        link.href = playlist.external_urls.spotify;
        link.innerText = "Open in Spotify";
        link.target= "_blank";
        div.appendChild(link);

        playlistContainer!.appendChild(div);

    });
}
    */
   async function fetchPlaylistByID( token: string, playlistId: string): Promise<any>{
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`,
        {   method: "GET",
            headers: {
            Authorization: `Bearer ${token}` }
        });
        return await response.json();
    }
   

    function populatePlaylistTracks(playlist: any) {

        const container = document.getElementById("playlistContainer");
        if (!container) return;
        container.innerHTML = "";


        const header = document.createElement("div");
        header.innerHTML = `
        <h2>${playlist.name}</h2>
        ${playlist.images[0] ? `<img src="${playlist.images[0].url}"
        alt="playlist cover" width ="200">` :""} 
        <p>${playlist.description || ""}</p> `;

            container.appendChild(header);

            const list =document.createElement("ol");
            playlist.tracks.items.forEach((item: any) => {
                const track = item.track;
                if(!track) return;
                
                const li = document.createElement("li");
                li.innerHTML = `
                    ${track.album.images[0] ? `<br><img 
                    src = "${track.album.images[0].url}" 
                    alt = "Album cover" width="180">` : ""}<br>
                    <strong>${track.name}</strong><br>
                    ${track.artists.map((a: any)=> a.name).join(",")}<br>
                    ${track.album.name}
                    
                `;
                list.appendChild(li);
            });
            container.appendChild(list);

    }