
function getFile(a, b) {
    chrome.runtime.sendMessage({
        fileDownload: {
            url: a,
            fileName: b,
            plName: playListName
        }
    })
}

function addDownloadButton(a) {
    var b = $(a);
    if (!($("button.extDownloadPlaylist").length > 0 || b.find("button.extDownload").length > 0)) {
        if (b.find(".listenDetails__trackList").length > 0) return void addDownloadPlaylistButton();
        if (0 == b.find(".sc-button-download").length) {
            var c = b.find("div.soundActions > div.sc-button-group").eq(0);
            if (0 != $(c).closest('div[role="group"].playlist').length) return;
            if (0 != $(c).children('[title="Like Playlist"]').length || 0 != $(c).children('[title="Report Playlist"]').length || 0 != $(c).children('[title="Liked Playlist"]').length || 0 != $(c).children('[title="Repost Playlist"]').length) return void addDownloadPlaylistButton();
            if (0 == c.length || $(c).find("button").length < 1) return void b.arrive("div.sound__soundActions > div.sc-button-group", function() {
                setTimeout(function() {
                    addDownloadButton(a)
                }, btnDelay)
            });
            var d = b.find("div.sc-button-group").hasClass("sc-button-group-medium") ? "sc-button-medium" : "sc-button-small";
            if (b.find(".listenDetails__trackList").length > 0) return void addDownloadPlaylistButton();
            c.append("<button class='extDownload sc-button sc-button-download " + d + " sc-button-responsive'>Download </button>");
            var e = b.find(".soundTitle__title").eq(0);
            f = b.is(".single") || !e.attr("href") ? document.location.href : "https://soundcloud.com" + e.attr("href");
            var g = f.split("/"),
                h = g.pop(),
                i = "",
                j = "https://api.soundcloud.com/resolve.json?url=" + escape(f) + "&client_id=" + ext.ids.clientId;
            "s-" == h.substr(0, 2) && (i = h, j = j + "&secret_token=" + i), downloadFilename = "", e.text.length > 1 ? downloadFilename = getCompatName(e.text()) : downloadFilename = getCompatName(b.parent().find(".soundTitle__title > span").eq(0).text());

            username = getCompatName(b.parent().find(".soundTitle__username").eq(0).text());
            genre = getCompatName(b.find(".fullHero__info .sc-tag").eq(0).text());

            var k = b.find("button.extDownload").eq(0),
                l = $(k);
            l.attr("fileName", downloadFilename),
            l.attr("username", username),
            l.attr("genre", genre),
            l.on("click", {
                reqUrl: j
            }, downloadClick)
        }
    }
}

function addDownloadPlaylistButton() {
    if ($(".extDownloadPlaylist").length > 0) return void console.log("playlist download button already exists");
    console.log("adding playlist download button");
    var a = $(".l-listen-wrapper div.soundActions > div.sc-button-group").eq(0),
        b = $("div.sc-button-group").hasClass("sc-button-group-medium") ? "sc-button-medium" : "sc-button-small";
    a.append("<button class='extDownloadPlaylist sc-button sc-button-download " + b + " sc-button-responsive' title='Download Playlist'>Download </button>");
    var c = $(".extDownloadPlaylist");
    c.on("click", downloadPlaylist)
}

function downloadPlaylist() {
    $.ajax({
        statusCode: {
            404: playlistDownloadError
        },
        url: "https://api.soundcloud.com/resolve.json?url=" + escape(window.location.href) + "&client_id=" + ext.ids.clientId2
    }).done(gotPlaylistInfo)
}

function playlistDownloadError() {
    alert("Set this playlist to public to download it.")
}

function gotPlaylistInfo(a) {
    playListName = getCompatName(a.title);
    for (var b = a.tracks, c = 0; c < b.length; c++) {
        var d = b[c].user.permalink + " - " + b[c].title;
        d = getCompatName(d), secondGetter(b[c].id, d)
    }
}

function getCompatName(a) {
    var b = /\n|\  |\!|\#|\%|\{|\}|\\|\<|\>|\$|\'|\"|\||\=|\`|\~|\+|\:|\@|\?|\*/g,
        c = a.trim().replace(b, "").replace(/\//g, "-");
    return c
}

function isTypedArray(obj) {
  return !!obj && obj.byteLength !== undefined;
}

function secondGetter(s, a, b) {
    $.ajax({
        url: "https://api.soundcloud.com/i1/tracks/" + a + "/streams?client_id=" + ext.ids.clientId
    }).done(function(a) {

                ///////////////////////////////////////////////////////
                const xhr = new XMLHttpRequest();
                xhr.open('GET', a.http_mp3_128_url, true);
                xhr.responseType = 'arraybuffer';
                xhr.onload = function () {
                  console.log("tag function: loaded mp3");

                    if (xhr.status === 200) {
                        const arrayBuffer = xhr.response;

                        if (s.artwork_url) {
                          var artworkUrl = s.artwork_url.replace("large", "t500x500");
                        } else {
                          var artworkUrl = s.user.avatar_url.replace("large", "t500x500");
                        }

                        xhr2 = new XMLHttpRequest();

                        xhr2.open('GET', artworkUrl, true);
                        xhr2.responseType = 'arraybuffer';
                        xhr2.onerror = function() {
                          debug_requests(artworkUrl + '///' + xhr.statusText);
                        };
                        xhr2.onload = function() {
                          console.log("tag function: loaded cover image");
                          coverArrayBuffer = xhr2.response;
                        if(isTypedArray(arrayBuffer)) {
                          const writer = new ID3Writer(arrayBuffer);
                          writer.setFrame('TIT2', s.title)
                            .setFrame('TPE1', [s.user.username])
                            .setFrame('TALB', s.title)
                            .setFrame('TYER', s.release_year)
                            .setFrame('TCON', [s.genre])

                            if (isTypedArray(coverArrayBuffer)) {
                              writer.setFrame('APIC', {
                                type: 3,
                                data: coverArrayBuffer,
                                description: 'cover'
                              });
                            }

                          writer.addTag();
                          blob = writer.getBlob();
                          blobUrl = writer.getURL();
                          var fuckingblob = writer.getBlob();
                          var fuckingurl = URL.createObjectURL(fuckingblob); // need to rebuild the blob, otherwise network error ????

                          getFile(fuckingurl, s.title);
                          writer.revokeURL();

                        }


                      }
                      xhr2.send();

                    } else {
                        console.error(xhr.statusText + ' (' + xhr.status + ')');
                    }
                  };
                xhr.send();

                ///////////////////////////////////////////////////////

    })
}


function downloadClick(a) {
    playListName = "";
    var b = this;
    $.ajax({
        url: a.data.reqUrl
    }).done(function(a) {
        a.id && (trackId = a.id.toString(), secondGetter(a, trackId, $(b).attr("fileName")))
    })
}


function getOptions() {
    chrome.storage.sync.get("qrEnable", function(a) {
        void 0 == a.qrEnable && (a.qrEnable = !0, chrome.storage.sync.set({
            qrEnable: !0
        })), qrEnabled = a.qrEnable
    })
}

function removeExistingButtons() {
    var a = [];
    a = $("a.sc-button-download"), a.length > 0 && a.remove()
}

var manu, btnDelay = 5,
    playListName = "";
    ext = {
    ids: {
        clientId: "a3e059563d7fd3372b49b37f00a00bcf",
        clientId2: "b45b1aa10f1ac2941910a7f0d10f8e28"
    }
};

$(function() {
    chrome.storage.onChanged.addListener(getOptions), getOptions(), $(".sound").each(function(a, b) {
        setTimeout(function() {
            addDownloadButton(b)
        }, btnDelay)
    }), $(".listenDetails__trackList").length > 0 && addDownloadPlaylistButton(), $(document).arrive(".listenDetails__trackList", function() {
        addDownloadPlaylistButton()
    }), menu = $("<div class='ext-con-menu'><div></div></div>"), $("body").append(menu), $("#content").each(function(a, b) {
        setTimeout(function() {
            addDownloadButton(b)
        }, btnDelay)
    }), $(document).arrive("a.sc-button-download", function() {
        $(this).remove()
    }), removeExistingButtons(), $(document).arrive(".sound", function() {
        var a = this;
        setTimeout(function() {
            addDownloadButton(a)
        }, btnDelay), $(".sound").bind("DOMNodeRemoved", function(b) {
            $(b.target).find("canvas.g-box-full.sceneLayer") && setTimeout(function() {
                addDownloadButton(a)
            }, btnDelay)
        })
    }), $(document).arrive("div.l-listen-engagement", function() {
        var a = this;
        setTimeout(function() {
            addDownloadButton(a)
        }, btnDelay), $(".sound").bind("DOMNodeRemoved", function(b) {
            $(b.target).find("canvas.g-box-full.sceneLayer") && setTimeout(function() {
                addDownloadButton(a)
            }, btnDelay)
        })
    }), $(document).bind("DOMNodeRemoved", function(a) {
        $("#content").each(function(a, b) {
            setTimeout(function() {
                addDownloadButton(b)
            }, btnDelay)
        })
    }), $(document).arrive("#content", function() {
        var a = this;
        setTimeout(function() {
            addDownloadButton(a)
        }, btnDelay), $(".sound").bind("DOMNodeRemoved", function(b) {
            $(b.target).find("canvas.g-box-full.sceneLayer") && setTimeout(function() {
                addDownloadButton(a)
            }, btnDelay)
        })
    })
});
