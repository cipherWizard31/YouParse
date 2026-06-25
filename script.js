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
    <div class="channel-card w-full max-w-[400px] border border-[#3f3f3f] bg-[#212121] py-6 px-4 font-sans text-center">
      <!-- Avatar -->
      <img src="${avatarUrl}" alt="${name}" class="w-24 h-24 mx-auto mb-5 object-cover rounded-full">
      
      <!-- Title -->
      <h2 class="text-xl font-bold tracking-wide text-[#f1f1f1] mb-4">${name}</h2>
      
      <!-- Stats Row -->
      <div class="flex justify-around border-y border-[#3f3f3f] py-4 mb-4">
        <div>
          <strong class="text-base font-bold text-[#f1f1f1] block mb-0.5">${subscribers}</strong>
          <span class="text-xs text-[#aaa] tracking-wider uppercase">Subs</span>
        </div>
        <div>
          <strong class="text-base font-bold text-[#f1f1f1] block mb-0.5">${totalViews}</strong>
          <span class="text-xs text-[#aaa] tracking-wider uppercase">Views</span>
        </div>
        <div>
          <strong class="text-base font-bold text-[#f1f1f1] block mb-0.5">${videoCount}</strong>
          <span class="text-xs text-[#aaa] tracking-wider uppercase">Videos</span>
        </div>
      </div>
      
      <!-- Description -->
      <p class="text-sm text-[#aaa] leading-relaxed tracking-normal text-left px-2 max-h-[100px] overflow-hidden">${description}</p>
    </div>
  `;
  

  
    } catch (error) {
      console.error("Request failed:", error);
    }


  });

const API_KEY = window.env.API_KEY;
