function dall(ref, title, filename) {
    return new Promise((resolve, reject) => {
        const fs = require('fs');
        const uuid = require('uuid');
        const cp = require('child_process');
        const ytdl = require('ytdl-core');
        // const readline = require("readline");
        const ffmpeg = require('./ffmpeg-static/index.js');
        // Global constants
        const tracker = {
            start: Date.now(),
            audio: {
                downloaded: 0,
                total: Infinity
            },
            video: {
                downloaded: 0,
                total: Infinity
            },
        };

        var videoID = uuid.v4();
        var audioID = uuid.v4();

        var vddone = false;
        var addone = false;

        // Get audio and video stream going
        const audio = ytdl(ref, {
            filter: 'audioonly',
            quality: 'highestaudio'
        })
            .on('progress', (_, downloaded, total) => {
                tracker.audio = {
                    downloaded,
                    total
                };
            });
        const video = ytdl(ref, {
            filter: 'videoonly',
            quality: 'highestvideo'
        })
            .on('progress', (_, downloaded, total) => {
                tracker.video = {
                    downloaded,
                    total
                };
            });
        
        var raudio = fs.createWriteStream(`temp/${videoID}`);
        var rvideo = fs.createWriteStream(`temp/${audioID}`);

        video.pipe(rvideo);
        audio.pipe(raudio);

        video.on('end', () => {
            rvideo.end();
            vddone = true;
        });

        audio.on('end', () => {
            raudio.end();
            addone = true;
        });

        var k = setInterval(() => {
            if (vddone && addone) {
                clearInterval(k);
                sff();
            }
        }, 500);

        // Get the progress bar going
        // const progressbar = setInterval(() => {
        //     readline.cursorTo(process.stdout, 0);
        //     const toMB = i => (i / 1024 / 1024).toFixed(2);

        //     process.stdout.write(`Audio | ${(tracker.audio.downloaded / tracker.audio.total * 100).toFixed(2)}% processed `);
        //     process.stdout.write(`(${toMB(tracker.audio.downloaded)}MB of ${toMB(tracker.audio.total)}MB).${' '.repeat(10)}\n`);

        //     process.stdout.write(`Video | ${(tracker.video.downloaded / tracker.video.total * 100).toFixed(2)}% processed `);
        //     process.stdout.write(`(${toMB(tracker.video.downloaded)}MB of ${toMB(tracker.video.total)}MB).${' '.repeat(10)}\n`);

        //     process.stdout.write(`running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(2)} Minutes.`);
        //     readline.moveCursor(process.stdout, 0, -2);
        // }, 1000);

        function sff() {

            console.log(`\x1b[33mStart making video and audio to "${title}"\x1b[0m`);

            // Start the ffmpeg child process
            const ffmpegProcess = cp.spawn(ffmpeg, [
                // Remove ffmpeg's console spamming
                '-loglevel', '0', '-hide_banner',
                "-i", `temp/${videoID}`, "-i", `temp/${audioID}`, "-map", "0:v?", "-map", "1:a?", "-c:v", "copy", "-shortest", `videos/${filename}.mp4`
            ]);
            ffmpegProcess.on('close', () => {
                console.log(`\x1b[32mDownloaded ${title}\x1b[0m`);
                fs.unlinkSync(`temp/${videoID}`);
                fs.unlinkSync(`temp/${audioID}`);
                resolve(true);
            });

            // ffmpeg's output
            // ffmpegProcess.stdout.on('data', data => {
            //     console.log(`\x1b[33m${data.toString()}\x1b[0m`);
            // });

            // ffmpegProcess.stderr.on('data', data => {
            //     console.log(`\x1b[31m${data.toString()}\x1b[0m`);
            // });
        }
    })
}

exports.dall = dall;