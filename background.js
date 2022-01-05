function listener(details) {
  let filter = browser.webRequest.filterResponseData(details.requestId);
  let decoder = new TextDecoder("utf-8");

  filter.ondata = event => {
    let str = decoder.decode(event.data, { stream: true });
    let data = JSON.parse(str);

    let filename = data.d.Presentation.Title + ".mp4";

    let url = data.d.Presentation.Streams[0].VideoUrls.reduce(
      (filtered, stream) => {
        if (stream.MimeType === "video/mp4") filtered.push(stream.Location);
        return filtered;
      }
      , []);

    if (url.length === 0) {
      return; // no MP4 video found
    } else {
      url = url[0];
    }

    browser.downloads.download({ url, filename, saveAs: true });
  };
}

browser.webRequest.onBeforeRequest.addListener(
  listener,
  // filters
  { urls: ["https://*/Mediasite/PlayerService/PlayerService.svc/json/GetPlayerOptions"] },
  // extra info spec
  ["blocking"]
);

