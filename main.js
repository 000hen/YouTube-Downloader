const ytdl = require('ytdl-core');
const ytpl = require("ytpl");
const express = require('express');
require("./assents/ffmpeg-static/install.js");
const app = express();
const port = 1524;
const fs = require('fs');
const downloadProgessLimit = 10;
const uuid = require('uuid');
const child_process = require('child_process');

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
    var errVds = [];
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
            console.log(`\x1b[33mDownloading ${title}, By ${author}...\x1b[0m`);
            if (unjson.type === "video") {
                var a = require("./assents/download.js");
                resolve(await a.dall(url, title, toFilename(title)))
            } else {
                var id = uuid.v4();
                // var file = fs.createWriteStream(`songs/${toFilename(title)}.mp3`);
                var file = fs.createWriteStream(`temp/${id}`);
                var stream = ytdl(url, { filter: "audioonly" });

                stream.on("data", data => {
                    file.write(data);
                })
                stream.on('end', () => {
                    file.end();
                    console.log(`\x1b[33mConverting ${title} from WebM to MP3...\x1b[0m`);
                    child_process.execSync(`ffmpeg -y -loglevel 0 -hide_banner -i "temp/${id}" -acodec libmp3lame -ab 128k -ar 44100 -ac 2 "songs/${toFilename(title)}.mp3"`);
                    fs.unlinkSync(`temp/${id}`);
                    console.log(`\x1b[32mDownloaded ${title}\x1b[0m`);
                    resolve(true);
                });
                stream.on('error', err => {
                    file.end();
                    fs.unlinkSync(`songs/${toFilename(title)}.mp3`);
                    console.log(`\x1b[31mDownload ${title} Failed: ${err}\x1b[0m`);
                    if (errVds.findIndex(e => e === url) === -1) {
                        unjson.videos.push(url);
                    }
                    errVds.push(url);
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