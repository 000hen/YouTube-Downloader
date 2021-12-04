const ytdl = require('ytdl-core');
const ytpl = require("ytpl");
const express = require('express');
require("./assents/ffmpeg-static/install.js");
const app = express();
const port = 1524;
const fs = require('fs');
const downloadProgessLimit = 10;

if (!fs.existsSync('temp')) {
    fs.mkdirSync('temp');
}

if (!fs.existsSync('videos')) {
    fs.mkdirSync('videos');
}

if (!fs.existsSync('songs')) {
    fs.mkdirSync('songs');
}

app.use(express.json());

app.post("/dwn", async (req, res) => {
    var nowdwn = 0;
    var done = 0;
    var unjson = req.body;
    if (typeof (unjson.videos) === "string") {
        var o = await ytpl(unjson.videos);
        unjson.videos = [];
        o.items.forEach(e => {
            unjson.videos.push(e.shortUrl);
        })
    }

    function download(url) {
        return new Promise(async (resolve, reject) => {
            var info = await ytdl.getBasicInfo(url);
            var title = info.player_response.videoDetails.title;
            var author = info.player_response.videoDetails.author;
            var toFilename = string => string.replace(/\n/g," ").replace(/[<>:"/\\|?*\x00-\x1F]| +$/g,"").replace(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/, x => x + "_");
            var wn = "";
            if (unjson.type === "video") wn = "(It will get longer because you're trying to download video)";
            console.log(`\x1b[33mDownloading ${title}, By ${author}... ${wn}\x1b[0m`);
            if (unjson.type === "video") {
                var a = require("./assents/download.js");
                resolve(await a.dall(url, title, toFilename(title)))
            } else {
                var file = fs.createWriteStream(`songs/${toFilename(title)}.mp3`);
                var stream = ytdl(url, { filter: "audioonly" });

                stream.on("data", data => {
                    file.write(data);
                })
                stream.on('end', () => {
                    file.end();
                    console.log(`\x1b[32mDownloaded ${title}\x1b[0m`);
                    resolve(true);
                });
                stream.on('error', err => {
                    console.log(`\x1b[31mDownload ${title} Failed: ${err}\x1b[0m`);
                    resolve(false);
                });
            }


        });
    }

    var p = 0;

    function dwn() {
        var dsl = downloadProgessLimit;
        if (unjson.type === "video") dsl = Math.floor(downloadProgessLimit / 2);
        if (nowdwn !== dsl) {
            download(unjson.videos[p]).then(e => {
                nowdwn--;
                done++;
            });
            nowdwn++;
            p += 1;
        }

        if (p !== unjson.videos.length && done + 1 !== unjson.videos.length) {
            setTimeout(dwn, 500)
        }
    }
    dwn();

    res.json({code: 0, message: "Check your console!"});
});

app.listen(port, () => {
    // console.log(`yds app listening at http://localhost:${port}`)
})