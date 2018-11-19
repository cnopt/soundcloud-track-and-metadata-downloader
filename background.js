"use strict";

function downloadFile(a, b) {
    chrome.downloads.download({
        url: a,
        filename: b + ".mp3"
    })
}
var downloadSubDir = "soundcloud-archive/";
chrome.runtime.onInstalled.addListener(function(a) {}), chrome.runtime.onMessage.addListener(function(a, b, c) {
    if (b.tab) {
        var d = "";
        if (a.fileDownload) {
            a.fileDownload.plName && (d = a.fileDownload.plName + "/");
            var e = downloadSubDir + d + a.fileDownload.fileName.trim();
            console.log("a filedownload url");
            console.log(a.fileDownload.url);
            downloadFile(a.fileDownload.url, e);
        }
    }
});
