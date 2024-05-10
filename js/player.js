window.addEventListener('load', function() {
  (function(vWin) {
    'use strict';
    var vDoc = vWin.document,
      jsPlayer = vDoc.querySelector('.player-wrap');

    // HTML5 audio player + playlist controls
    if (jsPlayer) {
      jsPlayer = {
        wrap: jsPlayer,
        player: jsPlayer.querySelector('audio'),
        wrapList: (vDoc.querySelector('.playlist-wrap') || {}),
        currentTime: (jsPlayer.querySelector('.current-time') || {}),
        durationTime: (jsPlayer.querySelector('.duration-time') || {}),
        seekBar: (jsPlayer.querySelector('.seek-bar') || {
          style: {}
        }),
        bigPlayButton: (jsPlayer.querySelector('.big-play-button') || {
          style: {}
        }),
        bigPauseButton: (jsPlayer.querySelector('.big-pause-button') || {
          style: {}
        }),
        playButton: (jsPlayer.querySelector('.play-button') || {
          style: {}
        }),
        pauseButton: (jsPlayer.querySelector('.pause-button') || {
          style: {}
        }),
        prevButton: (jsPlayer.querySelector('.prev-button') || {
          style: {}
        }),
        nextButton: (jsPlayer.querySelector('.next-button') || {
          style: {}
        }),
        playlistButton: (jsPlayer.querySelector('.playlist-button') || {
          style: {}
        }),
        titleText: (jsPlayer.querySelector('.title-text') || {
          style: {}
        }),
        artistText: (jsPlayer.querySelector('.artist-text') || {
          style: {}
        }),
        seekInterval: null,
        trackCount: 0,
        playing: false,
        playlist: [],
        tracks: [],
        idx: 0
      };

      jsPlayer.playClicked = function jsPlayerPlayClicked() {
        console.log("playClicked");
        jsPlayer.bigPauseButton.style.display = 'block';
        jsPlayer.bigPlayButton.style.display = 'none';
        jsPlayer.pauseButton.style.display = 'block';
        jsPlayer.playButton.style.display = 'none';
        jsPlayer.playing = true;
        jsPlayer.player.play();
        jsPlayer.seekInterval = setInterval(jsPlayer.updateSeek, 500);
      };
      jsPlayer.pauseClicked = function jsPlayerPauseClicked() {
        console.log("pauseClicked");
        clearInterval(jsPlayer.seekInterval);
        jsPlayer.bigPlayButton.style.display = 'block';
        jsPlayer.bigPauseButton.style.display = 'none';
        jsPlayer.playButton.style.display = 'block';
        jsPlayer.pauseButton.style.display = 'none';
        jsPlayer.playing = false;
        jsPlayer.player.pause();
      };
      jsPlayer.mediaEnded = function jsPlayerMediaEnded() {
        if (parseInt(jsPlayer.idx) + 1 < jsPlayer.trackCount) {
          console.log("mediaEnded:a");
          jsPlayer.idx++;
          jsPlayer.playTrack(jsPlayer.idx);
        } else {
          console.log("mediaEnded:b");
          jsPlayer.pauseClicked();
          jsPlayer.idx = 0;
          jsPlayer.loadTrack(jsPlayer.idx);
        }
      };
      jsPlayer.loadTracklist = function jsPlayerLoadPlaylist() {
        console.log("loadTracklist");
        jsPlayer.playlist = jsPlayer.wrapList.tagName ? jsPlayer.wrapList.querySelectorAll('ol > li') : [];
        var len = jsPlayer.playlist.length,
          tmp, i;
        if (len > 0) {
          jsPlayer.wrap.classList.add('list-view');
          for (i = jsPlayer.trackCount; i < len; i++) {
            if (!jsPlayer.playlist[i].dataset) {
              jsPlayer.playlist[i].dataset = {};
            }
            tmp = jsPlayer.playlist[i].querySelector('a');
            if (tmp.tagName && !jsPlayer.playlist[i].dataset.idx) {
              jsPlayer.playlist[i].dataset.idx = i;
              jsPlayer.trackCount++;
              jsPlayer.tracks.push({
                'file': tmp.href,
                'artist': tmp.dataset.artist ? 'by ' + decodeURIComponent(tmp.dataset.artist).replace(/^\s+|\s+$/g, '') : '&nbsp;',
                'playlisttitle': tmp.dataset.playlisttitle,
                'name': decodeURIComponent(tmp.textContent || tmp.innerText).replace(/^\s+|\s+$/g, ''),
                'imgurl': tmp.dataset.imgurl,
                'posturl': tmp.dataset.posturl
              });
            }
          }
        }
      };
      jsPlayer.loadTrack = function jsPlayerLoadTrack(idx) {
        console.log("loadTrack");
        var len = jsPlayer.playlist ? jsPlayer.playlist.length : 0,
          i;
        for (i = 0; i < len; i++) {
          if (jsPlayer.playlist[i].classList) {
            if (i == idx) {
              jsPlayer.playlist[i].classList.add('sel');
            } else {
              jsPlayer.playlist[i].classList.remove('sel');
            }
          }
        }
        jsPlayer.titleText[vDoc.body.textContent ? 'textContent' : 'innerHTML'] = jsPlayer.tracks[idx].name;
        jsPlayer.artistText[vDoc.body.textContent ? 'textContent' : 'innerHTML'] = jsPlayer.tracks[idx].artist;
        jsPlayer.player.src = jsPlayer.tracks[idx].file;
        jsPlayer.playlistTitle = jsPlayer.tracks[idx].playlisttitle;

        document.getElementById("thing").style.backgroundImage = "url('" + (jsPlayer.tracks[idx].imgurl ? jsPlayer.tracks[idx].imgurl : " ") + "')";

        jsPlayer.player.src = jsPlayer.tracks[idx].file;
        jsPlayer.posturl = jsPlayer.tracks[idx].posturl;
        jsPlayer.idx = idx;
      };
      jsPlayer.playTrack = function jsPlayerPlayTrack(idx) {
        console.log("playTrack");
        jsPlayer.loadTrack(idx);
        jsPlayer.playClicked();
      };
      jsPlayer.listClicked = function jsPlayerListClicked(event) {
        console.log("listClicked");
        clearInterval(jsPlayer.seekInterval);
        var parent = event.target.parentNode;
        if (parent.parentNode.tagName.toLowerCase() === 'ol') {
          event.preventDefault();
          jsPlayer.playTrack(parent.dataset.idx);
        }
      };
      jsPlayer.setDuration = function jsPlayerSetDuration() {
        jsPlayer.durationTime[vDoc.body.textContent ? 'textContent' : 'innerHTML'] = jsPlayer.formatTime(jsPlayer.player.duration);
        jsPlayer.currentTime[vDoc.body.textContent ? 'textContent' : 'innerHTML'] = jsPlayer.formatTime(jsPlayer.player.currentTime);
        jsPlayer.seekBar.value = jsPlayer.player.currentTime / jsPlayer.player.duration;
      };
      jsPlayer.updateSeek = function jsPlayerUpdateSeek() {
        if (jsPlayer.player.duration > -1) {
          jsPlayer.seekBar.value = 100 * (jsPlayer.player.currentTime || 0) / jsPlayer.player.duration;
          jsPlayer.currentTime[vDoc.body.textContent ? 'textContent' : 'innerHTML'] = jsPlayer.formatTime(jsPlayer.player.currentTime || 0);
        }
      };
      jsPlayer.seekHeld = function jsPlayerSeekHeld() {
        console.log("seekHeld");
        jsPlayer.seekBar.parentNode.classList.add('sel');
        clearInterval(jsPlayer.seekInterval);
        jsPlayer.player.pause();
      };
      jsPlayer.seekReleased = function jsPlayerSeekReleased() {
        console.log("seekReleased");
        if (jsPlayer.player.duration > -1) {
          jsPlayer.player.currentTime = jsPlayer.seekBar.value * jsPlayer.player.duration / 100;
          jsPlayer.seekBar.parentNode.classList.remove('sel');
          if (jsPlayer.playing) {
            console.log("seekReleased a");
            jsPlayer.player.play();
            jsPlayer.seekInterval = setInterval(jsPlayer.updateSeek, 500);
          } else {
            console.log("seekReleased b");
            jsPlayer.updateSeek();
          }
        }
      };
      jsPlayer.prevClicked = function jsPlayerPrevClicked(event) {
        event.preventDefault();
        if (jsPlayer.idx - 1 > -1) {
          jsPlayer.idx--;
          if (jsPlayer.playing) {
            jsPlayer.playTrack(jsPlayer.idx);
          } else {
            jsPlayer.loadTrack(jsPlayer.idx);
          }
        } else {
          jsPlayer.pauseClicked();
          jsPlayer.idx = 0;
          jsPlayer.loadTrack(jsPlayer.idx);
        }
      };
      jsPlayer.nextClicked = function jsPlayerNextClicked(event) {
        event.preventDefault();
        if (jsPlayer.idx + 1 < jsPlayer.trackCount) {
          jsPlayer.idx++;
          if (jsPlayer.playing) {
            jsPlayer.playTrack(jsPlayer.idx);
          } else {
            jsPlayer.loadTrack(jsPlayer.idx);
          }
        } else {
          jsPlayer.pauseClicked();
          jsPlayer.idx = 0;
          jsPlayer.loadTrack(jsPlayer.idx);
        }
      };
      jsPlayer.titleClicked = function jsPlayerTitleClicked(event) {
        event.preventDefault();
        if (jsPlayer.posturl) {
          window.location.href = jsPlayer.posturl;
        }
      };
      jsPlayer.playlistButtonClicked = function jsPlayerPlaylistButtonClicked() {
        jsPlayer.wrap.classList.toggle('show-list');
        jsPlayer.playlistButton.style.backgroundImage = (jsPlayer.wrap.classList.contains('show-list') && jsPlayer.wrap.style.backgroundImage) ? jsPlayer.wrap.style.backgroundImage : '';
      };
      jsPlayer.formatTime = function jsPlayerFormatTime(val) {
        var h = 0,
          m = 0,
          s;
        val = (parseInt(val, 10) || 0);
        if (val > 60 * 60) {
          h = parseInt(val / (60 * 60), 10);
          val -= h * 60 * 60;
        }
        if (val > 60) {
          m = parseInt(val / 60, 10);
          val -= m * 60;
        }
        s = val;
        val = (h > 0) ? h + ':' : '';
        val += (m > 0) ? ((m < 10 && h > 0) ? '0' : '') + m + ':' : '0:';
        val += ((s < 10) ? '0' : '') + s;
        return val;
      };
      jsPlayer.init = function jsPlayerInit() {
        if (!!vDoc.createElement('audio').canPlayType('audio/mpeg')) {
          if (jsPlayer.wrapList.tagName && jsPlayer.wrapList.querySelectorAll('ol > li').length > 0) {
            jsPlayer.loadTracklist();
          } else if (jsPlayer.wrap.tagName && jsPlayer.wrap.dataset.url) {
            jsPlayer.tracks = [{
              'file': jsPlayer.wrap.dataset.url,
              'artist': 'by-' + decodeURIComponent(jsPlayer.wrap.dataset.artist || 'unknown').replace(/^\s+|\s+$/g, ''),
              'name': decodeURIComponent(jsPlayer.wrap.dataset.title || '').replace(/^\s+|\s+$/g, '')
            }];
          }
          if (jsPlayer.tracks.length > 0 && jsPlayer.player) {
            jsPlayer.player.addEventListener('ended', jsPlayer.mediaEnded, true);
            jsPlayer.player.addEventListener('loadeddata', jsPlayer.setDuration, true);
            if (jsPlayer.wrapList.tagName) {
              jsPlayer.wrapList.addEventListener('click', jsPlayer.listClicked, true);
            }
            if (jsPlayer.bigPlayButton.tagName) {
              jsPlayer.bigPlayButton.addEventListener('click', jsPlayer.playClicked, true);
              if (jsPlayer.bigPauseButton.tagName) {
                jsPlayer.bigPauseButton.addEventListener('click', jsPlayer.pauseClicked, true);
              }
            }
            if (jsPlayer.playButton.tagName) {
              jsPlayer.playButton.addEventListener('click', jsPlayer.playClicked, true);
              if (jsPlayer.pauseButton.tagName) {
                jsPlayer.pauseButton.addEventListener('click', jsPlayer.pauseClicked, true);
              }
            }
            if (jsPlayer.prevButton.tagName) {
              jsPlayer.prevButton.addEventListener('click', jsPlayer.prevClicked, true);
            }
            if (jsPlayer.nextButton.tagName) {
              jsPlayer.nextButton.addEventListener('click', jsPlayer.nextClicked, true);
            }
            if (jsPlayer.playlistButton.tagName) {
              jsPlayer.playlistButton.addEventListener('click', jsPlayer.playlistButtonClicked, true);
            }
            if (jsPlayer.seekBar.tagName) {
              jsPlayer.seekBar.addEventListener('mousedown', jsPlayer.seekHeld, true);
              jsPlayer.seekBar.addEventListener('mouseup', jsPlayer.seekReleased, true);
            }
            jsPlayer.titleText.addEventListener('click', jsPlayer.titleClicked)
            jsPlayer.wrap.className += ' enabled';
            jsPlayer.loadTrack(jsPlayer.idx);
          }
        }
      };
      jsPlayer.init();
    }
  })(window || {});

});