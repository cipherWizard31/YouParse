// listen for the form submission
document
  .getElementById("linkForm")
  .addEventListener("submit", async function findChannel(event) {
    event.preventDefault();

    const link = document.getElementById("channelLink").value;
    const cleanURL = link.trim();

    // try out different types of links and get the channel (temp it to the link)
    let queryParam = "";

    // Case 1: Standard Handle Link
    if (cleanURL.includes("/@")) {
      const handle = cleanURL.split("/@")[1].split("/")[0];
      queryParam = `forHandle=${handle}`;
    }
    // Case 2: Direct Channel ID Link
    else if (cleanURL.includes("/channel/")) {
      const channelId = cleanURL.split("/channel/")[1].split("/")[0];
      queryParam = `id=${channelId}`;
    }
    // Case 3: Legacy custom URL fallback
    else if (cleanURL.includes("/c/")) {
      const legacyName = cleanURL.split("/c/")[1].split("/")[0];
      return await fallbackSearchQuery(legacyName);
    } else {
      throw new Error("Invalid or unsupported YouTube link format.");
    }

    // add the channel to the api req
    const apiLinkFormat = `https://www.googleapis.com/youtube/v3/channels?${queryParam}&key=${API_KEY}&part=snippet,statistics`;

    // send the api req
    try {
      const response = await fetch(apiLinkFormat);

      // Always check for HTTP errors (like 404 or 500)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        document.getElementById(
          "result"
        ).innerHTML = `<p style="color: red;">No channel found.</p>`;
        return;
      }

      // Extract the first channel from the items array
      const channel = data.items[0];

      // display results
    const name = channel.snippet.title;
    const description =channel.snippet.description || "No description available.";
    const avatarUrl = channel.snippet.thumbnails.high.url;

    // Convert raw string numbers into readable, comma-separated numbers
    const subscribers = parseInt(channel.statistics.subscriberCount).toLocaleString();
    const totalViews = parseInt(channel.statistics.viewCount).toLocaleString();
    const videoCount = parseInt(channel.statistics.videoCount).toLocaleString();

    document.getElementById('result').innerHTML = `
  <div class="channel-card" style="border: 1px solid #ccc; padding: 20px; border-radius: 8px; max-width: 400px; font-family: sans-serif;">
    <img src="${avatarUrl}" alt="${name}" style="width: 100px; height: 100px; border-radius: 50%; display: block; margin: 0 auto 15px;">
    <h2 style="text-align: center; margin: 0 0 10px 0;">${name}</h2>
    
    <div style="display: flex; justify-content: space-around; margin-bottom: 15px; border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 10px 0;">
      <div style="text-align: center;"><strong>${subscribers}</strong><br><span style="font-size: 12px; color: #666;">Subs</span></div>
      <div style="text-align: center;"><strong>${totalViews}</strong><br><span style="font-size: 12px; color: #666;">Views</span></div>
      <div style="text-align: center;"><strong>${videoCount}</strong><br><span style="font-size: 12px; color: #666;">Videos</span></div>
    </div>
    
    <p style="font-size: 14px; color: #333; line-height: 1.4; max-height: 100px; overflow-y: auto;">${description}</p>
  </div>
`;
    } catch (error) {
      console.error("Request failed:", error);
    }


  });

const API_KEY = window.env.API_KEY;
