// listen for the form submission
document.getElementById("linkForm").addEventListener("submit", async function findChannel(event) {
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
      console.log("Success:", data);
      document.getElementById("result").innerHTML = data;
    } catch (error) {
      console.error("Request failed:", error);
    }
  });

const API_KEY = window.env.API_KEY;
