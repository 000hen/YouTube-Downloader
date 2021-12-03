window.addEventListener('load', e => {
    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        if (request.message === "download") {
            if (location.hostname === "music.youtube.com") {
                var url = new URL(location.href);
                switch (url.pathname) {
                    case "/watch":
                        sendMessage([location.href], "music");
                        break;
                    
                    case "/playlist":
                        var t = location.href;
                        if (url.searchParams.get("list") === "LM") {
                            var y = [];
                            
                            var doc = document.createElement("div");
                            doc.style.display = "flex";
                            doc.style.alignItems = "center";
                            doc.style.alignContent = "center";
                            doc.style.justifyContent = "center";
                            doc.style.width = "100vw";
                            doc.style.height = "100vh";
                            doc.style.position = "fixed";
                            doc.style.backgroundColor = "#000000e6";
                            doc.style.color = "#fff";
                            doc.style.zIndex = 300;
                            doc.style.top = 0;
                            doc.style.left = 0;

                            doc.innerHTML = "<h1 style='font-size: 60px;'>Getting The Favorite Songs...</h1>";

                            var l = document.body.appendChild(doc);
                            function p() {
                                return new Promise((reslove, reject) => {
                                    var body = document.body,
                                        html = document.documentElement;
                                    var height = Math.max(body.scrollHeight, body.offsetHeight,
                                        html.clientHeight, html.scrollHeight, html.offsetHeight);
                                    
                                    window.scrollTo({
                                        left: 0,
                                        top: height
                                    });
                                    
                                    if (document.getElementById("continuations").offsetHeight !== 0) {
                                        setTimeout(async () => reslove(await p()), 1200);
                                    } else if (document.getElementById("continuations").offsetHeight === 0) {
                                        document.querySelectorAll("ytmusic-responsive-list-item-renderer").forEach(e => {
                                            y.push(e.getElementsByClassName("yt-simple-endpoint style-scope yt-formatted-string")[0].href)
                                        });
                                        t = y;
                                        l.remove();
                                        reslove(true);
                                    }
                                });
                            }
                            await p();
                        }
                        sendMessage(t, "music");
                        break;
                }
            }

            if (location.hostname === "www.youtube.com") {
                var url = new URL(location.href);
                switch (url.pathname) {
                    case "/watch":
                        sendMessage([location.href], "video")
                        break;

                    case "/playlist":
                        sendMessage(location.href, "video")
                        break;
                }
            }

            function sendMessage(videos = [], type = "video") {
                try {
                    chrome.runtime.sendMessage({
                        videos: videos,
                        type: type
                    });
                } catch (e) {
                    console.log("[YouTube-Downloader] Cannot download video/song.")
                }
            }
        }
    });
})