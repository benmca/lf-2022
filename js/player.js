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
        orderButton: (jsPlayer.querySelector('.order-button') || {
          style: {}
        }),
        shuffleButton: (jsPlayer.querySelector('.shuffle-button') || {
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
        baseTracks: [],
        baseListItems: [],
        currentTrackId: null,
        shuffleEnabled: false,
        shuffleQueue: [],
        shuffleHistory: [],
        order: 'desc',
        debugPoll: null,
        durationPoll: null,
        idx: 0
      };

      jsPlayer.playClicked = function jsPlayerPlayClicked() {
        jsPlayer.bigPauseButton.style.display = 'block';
        jsPlayer.bigPlayButton.style.display = 'none';
        jsPlayer.pauseButton.style.display = 'block';
        jsPlayer.playButton.style.display = 'none';
        jsPlayer.playing = true;
        jsPlayer.player.play();
        jsPlayer.seekInterval = setInterval(jsPlayer.updateSeek, 500);
        jsPlayer.waitForDuration();
        jsPlayer.startDebugPoll();
      };
      jsPlayer.pauseClicked = function jsPlayerPauseClicked() {
        clearInterval(jsPlayer.seekInterval);
        if (jsPlayer.durationPoll) {
          clearInterval(jsPlayer.durationPoll);
          jsPlayer.durationPoll = null;
        }
        jsPlayer.stopDebugPoll();
        jsPlayer.bigPlayButton.style.display = 'block';
        jsPlayer.bigPauseButton.style.display = 'none';
        jsPlayer.playButton.style.display = 'block';
        jsPlayer.pauseButton.style.display = 'none';
        jsPlayer.playing = false;
        jsPlayer.player.pause();
      };
      jsPlayer.mediaEnded = function jsPlayerMediaEnded() {
        var nextIdx = jsPlayer.getNextIdx();
        if (nextIdx !== null) {
        jsPlayer.playTrack(nextIdx);
          return;
        }
        jsPlayer.pauseClicked();
        if (!jsPlayer.shuffleEnabled) {
          jsPlayer.idx = 0;
          jsPlayer.loadTrack(jsPlayer.idx);
        }
      };
      jsPlayer.loadTracklist = function jsPlayerLoadPlaylist() {
        jsPlayer.playlist = jsPlayer.wrapList.tagName ? jsPlayer.wrapList.querySelectorAll('ol > li') : [];
        var len = jsPlayer.playlist.length,
          tmp, i;
        if (len > 0) {
          jsPlayer.wrap.classList.add('list-view');
          jsPlayer.trackCount = 0;
          jsPlayer.baseTracks = [];
          jsPlayer.baseListItems = [];
          for (i = jsPlayer.trackCount; i < len; i++) {
            if (!jsPlayer.playlist[i].dataset) {
              jsPlayer.playlist[i].dataset = {};
            }
            tmp = jsPlayer.playlist[i].querySelector('a');
            if (tmp.tagName && !jsPlayer.playlist[i].dataset.idx) {
              var durationText = tmp.dataset.duration ? decodeURIComponent(tmp.dataset.duration).replace(/^\s+|\s+$/g, '') : '';
              jsPlayer.playlist[i].dataset.baseIdx = jsPlayer.trackCount;
              jsPlayer.playlist[i].dataset.idx = jsPlayer.trackCount;
              jsPlayer.baseListItems.push(jsPlayer.playlist[i]);
              jsPlayer.baseTracks.push({
                'id': jsPlayer.trackCount,
                'file': tmp.href,
                'artist': tmp.dataset.artist ? 'by ' + decodeURIComponent(tmp.dataset.artist).replace(/^\s+|\s+$/g, '') : '&nbsp;',
                'playlisttitle': tmp.dataset.playlisttitle,
                'name': decodeURIComponent(tmp.textContent || tmp.innerText).replace(/^\s+|\s+$/g, ''),
                'imgurl': tmp.dataset.imgurl,
                'posturl': tmp.dataset.posturl,
                'durationText': durationText,
                'durationSeconds': jsPlayer.parseDuration(durationText)
              });
              jsPlayer.trackCount++;
            }
          }
          jsPlayer.applyOrder(jsPlayer.order);
        }
      };
      jsPlayer.loadTrack = function jsPlayerLoadTrack(idx) {
        var list = jsPlayer.wrapList.tagName ? jsPlayer.wrapList.querySelectorAll('ol > li') : [],
          len = list.length,
          i;
        for (i = 0; i < len; i++) {
          if (list[i].classList) {
            if (i == idx) {
              list[i].classList.add('sel');
            } else {
              list[i].classList.remove('sel');
            }
          }
        }
        jsPlayer.titleText[vDoc.body.textContent ? 'textContent' : 'innerHTML'] = jsPlayer.tracks[idx].name;
        jsPlayer.artistText[vDoc.body.textContent ? 'textContent' : 'innerHTML'] = jsPlayer.tracks[idx].artist;
        jsPlayer.player.src = jsPlayer.tracks[idx].file;
        jsPlayer.playlistTitle = jsPlayer.tracks[idx].playlisttitle;

        document.getElementById("thing").style.backgroundImage = "url('" + (jsPlayer.tracks[idx].imgurl ? jsPlayer.tracks[idx].imgurl : " ") + "')";

        jsPlayer.posturl = jsPlayer.tracks[idx].posturl;
        jsPlayer.idx = idx;
        jsPlayer.currentTrackId = jsPlayer.tracks[idx].id;
        if (jsPlayer.player.load) {
          jsPlayer.player.load();
        }
        jsPlayer.waitForDuration();
    };
      jsPlayer.playTrack = function jsPlayerPlayTrack(idx, options) {
        jsPlayer.loadTrack(idx);
        if (options && options.resetShuffle && jsPlayer.shuffleEnabled) {
          jsPlayer.resetShuffleQueue();
        }
        jsPlayer.playClicked();
      };
      jsPlayer.listClicked = function jsPlayerListClicked(event) {
        clearInterval(jsPlayer.seekInterval);
        var parent = event.target.parentNode;
        if (parent.parentNode.tagName.toLowerCase() === 'ol') {
          event.preventDefault();
          jsPlayer.playTrack(parseInt(parent.dataset.idx, 10), {
            resetShuffle: true
          });
        }
      };
      jsPlayer.setDuration = function jsPlayerSetDuration() {
        var duration = jsPlayer.getDurationValue();
        var current = jsPlayer.player.currentTime || 0;
        if (isFinite(current)) {
          jsPlayer.currentTime[vDoc.body.textContent ? 'textContent' : 'innerHTML'] = jsPlayer.formatTime(current);
        }
        if (!duration || !isFinite(duration) || duration <= 0) {
          if (jsPlayer.tracks[jsPlayer.idx] && jsPlayer.tracks[jsPlayer.idx].durationText) {
            jsPlayer.durationTime[vDoc.body.textContent ? 'textContent' : 'innerHTML'] = jsPlayer.tracks[jsPlayer.idx].durationText;
          }
          return;
        }
        jsPlayer.durationTime[vDoc.body.textContent ? 'textContent' : 'innerHTML'] = jsPlayer.formatTime(duration);
        jsPlayer.seekBar.value = 100 * current / duration;
      };
      jsPlayer.updateSeek = function jsPlayerUpdateSeek() {
        var duration = jsPlayer.getDurationValue();
        var current = jsPlayer.player.currentTime || 0;
        if (isFinite(current)) {
          jsPlayer.currentTime[vDoc.body.textContent ? 'textContent' : 'innerHTML'] = jsPlayer.formatTime(current);
        }
        if (duration && isFinite(duration) && duration > 0) {
          jsPlayer.seekBar.value = 100 * current / duration;
          jsPlayer.durationTime[vDoc.body.textContent ? 'textContent' : 'innerHTML'] = jsPlayer.formatTime(duration);
        } else if (jsPlayer.tracks[jsPlayer.idx] && jsPlayer.tracks[jsPlayer.idx].durationText) {
          var fallbackSeconds = jsPlayer.tracks[jsPlayer.idx].durationSeconds;
          if (fallbackSeconds && isFinite(fallbackSeconds) && fallbackSeconds > 0) {
            jsPlayer.seekBar.value = 100 * current / fallbackSeconds;
          }
          jsPlayer.durationTime[vDoc.body.textContent ? 'textContent' : 'innerHTML'] = jsPlayer.tracks[jsPlayer.idx].durationText;
        }
      };
      jsPlayer.seekHeld = function jsPlayerSeekHeld() {
        jsPlayer.seekBar.parentNode.classList.add('sel');
        clearInterval(jsPlayer.seekInterval);
        jsPlayer.player.pause();
      };
      jsPlayer.seekToPoint = function jsPlayerSeekToPoint(event) {
        var rect = jsPlayer.seekBar.getBoundingClientRect();
        var clientX = event.clientX;
        if (event.touches && event.touches.length > 0) {
          clientX = event.touches[0].clientX;
        }
        var percent = (clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        jsPlayer.seekBar.value = percent * 100;
        jsPlayer.seekReleased();
      };
      jsPlayer.seekReleased = function jsPlayerSeekReleased() {
        var duration = jsPlayer.getDurationValue();
        if (duration && isFinite(duration) && duration > 0) {
          jsPlayer.player.currentTime = jsPlayer.seekBar.value * duration / 100;
          jsPlayer.seekBar.parentNode.classList.remove('sel');
          if (jsPlayer.playing) {
            jsPlayer.player.play();
            jsPlayer.seekInterval = setInterval(jsPlayer.updateSeek, 500);
          } else {
            jsPlayer.updateSeek();
          }
        }
      };
      jsPlayer.prevClicked = function jsPlayerPrevClicked(event) {
        event.preventDefault();
        var prevIdx = jsPlayer.getPrevIdx();
        if (prevIdx !== null) {
          jsPlayer.idx = prevIdx;
          if (jsPlayer.playing) {
            jsPlayer.playTrack(jsPlayer.idx);
          } else {
            jsPlayer.loadTrack(jsPlayer.idx);
          }
        } else {
          jsPlayer.pauseClicked();
          if (!jsPlayer.shuffleEnabled) {
            jsPlayer.idx = 0;
            jsPlayer.loadTrack(jsPlayer.idx);
          }
        }
      };
      jsPlayer.nextClicked = function jsPlayerNextClicked(event) {
        event.preventDefault();
        var nextIdx = jsPlayer.getNextIdx();
        if (nextIdx !== null) {
          jsPlayer.idx = nextIdx;
          if (jsPlayer.playing) {
            jsPlayer.playTrack(jsPlayer.idx);
          } else {
            jsPlayer.loadTrack(jsPlayer.idx);
          }
        } else {
          jsPlayer.pauseClicked();
          if (!jsPlayer.shuffleEnabled) {
            jsPlayer.idx = 0;
            jsPlayer.loadTrack(jsPlayer.idx);
          }
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
      jsPlayer.findIndexById = function jsPlayerFindIndexById(id) {
        var i;
        for (i = 0; i < jsPlayer.tracks.length; i++) {
          if (jsPlayer.tracks[i].id === id) {
            return i;
          }
        }
        return 0;
      };
      jsPlayer.syncSelection = function jsPlayerSyncSelection() {
        var list = jsPlayer.wrapList.tagName ? jsPlayer.wrapList.querySelectorAll('ol > li') : [];
        var i;
        for (i = 0; i < list.length; i++) {
          if (list[i].classList) {
            if (i === jsPlayer.idx) {
              list[i].classList.add('sel');
            } else {
              list[i].classList.remove('sel');
            }
          }
        }
      };
      jsPlayer.applyOrder = function jsPlayerApplyOrder(order) {
        var indices = [],
          i,
          ol;
        for (i = 0; i < jsPlayer.baseTracks.length; i++) {
          indices.push(i);
        }
        if (order === 'asc') {
          indices.reverse();
        }
        jsPlayer.tracks = indices.map(function(idx) {
          return jsPlayer.baseTracks[idx];
        });
        if (jsPlayer.wrapList.tagName) {
          ol = jsPlayer.wrapList.querySelector('ol');
          if (ol) {
            indices.forEach(function(baseIdx, newIdx) {
              var li = jsPlayer.baseListItems[baseIdx];
              if (li) {
                li.dataset.idx = newIdx;
                ol.appendChild(li);
              }
            });
            jsPlayer.playlist = jsPlayer.wrapList.querySelectorAll('ol > li');
          }
        }
        jsPlayer.order = order;
        if (jsPlayer.currentTrackId !== null) {
          jsPlayer.idx = jsPlayer.findIndexById(jsPlayer.currentTrackId);
          jsPlayer.syncSelection();
        }
        jsPlayer.updateOrderButton();
      };
      jsPlayer.updateOrderButton = function jsPlayerUpdateOrderButton() {
        if (!jsPlayer.orderButton.tagName) {
          return;
        }
        var isAsc = jsPlayer.order === 'asc';
        jsPlayer.orderButton.classList.toggle('active', isAsc);
        jsPlayer.orderButton.setAttribute('aria-pressed', isAsc ? 'true' : 'false');
        jsPlayer.orderButton.setAttribute('title', isAsc ? 'Order: oldest first' : 'Order: newest first');
      };
      jsPlayer.shuffleArray = function jsPlayerShuffleArray(array) {
        var i, j, temp;
        for (i = array.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
      };
      jsPlayer.resetShuffleQueue = function jsPlayerResetShuffleQueue() {
        var currentId = jsPlayer.currentTrackId;
        var remaining = [];
        var i;
        for (i = 0; i < jsPlayer.baseTracks.length; i++) {
          if (jsPlayer.baseTracks[i].id !== currentId) {
            remaining.push(jsPlayer.baseTracks[i].id);
          }
        }
        jsPlayer.shuffleArray(remaining);
        jsPlayer.shuffleQueue = remaining;
        jsPlayer.shuffleHistory = currentId !== null ? [currentId] : [];
      };
      jsPlayer.updateShuffleButton = function jsPlayerUpdateShuffleButton() {
        if (!jsPlayer.shuffleButton.tagName) {
          return;
        }
        jsPlayer.shuffleButton.classList.toggle('active', jsPlayer.shuffleEnabled);
        jsPlayer.shuffleButton.setAttribute('aria-pressed', jsPlayer.shuffleEnabled ? 'true' : 'false');
        jsPlayer.shuffleButton.setAttribute('title', jsPlayer.shuffleEnabled ? 'Shuffle: on' : 'Shuffle: off');
      };
      jsPlayer.waitForDuration = function jsPlayerWaitForDuration() {
        if (jsPlayer.durationPoll) {
          clearInterval(jsPlayer.durationPoll);
        }
        var attempts = 0;
        jsPlayer.durationPoll = setInterval(function() {
          attempts += 1;
          var duration = jsPlayer.player.duration;
          if (duration && isFinite(duration) && duration > 0) {
            clearInterval(jsPlayer.durationPoll);
            jsPlayer.durationPoll = null;
            jsPlayer.setDuration();
            return;
          }
          if (attempts > 40) {
            clearInterval(jsPlayer.durationPoll);
            jsPlayer.durationPoll = null;
          }
        }, 250);
      };
      jsPlayer.startDebugPoll = function jsPlayerStartDebugPoll() {
        if (jsPlayer.debugPoll || !window.location.search.includes('playerdebug=1')) {
          return;
        }
        jsPlayer.debugPoll = setInterval(function() {
          var duration = jsPlayer.player.duration;
          var seekableEnd = null;
          if (jsPlayer.player.seekable && jsPlayer.player.seekable.length > 0) {
            seekableEnd = jsPlayer.player.seekable.end(jsPlayer.player.seekable.length - 1);
          }
          console.log('[playerdebug]', {
            duration: duration,
            seekableEnd: seekableEnd,
            readyState: jsPlayer.player.readyState,
            networkState: jsPlayer.player.networkState,
            currentTime: jsPlayer.player.currentTime
          });
        }, 1000);
      };
      jsPlayer.stopDebugPoll = function jsPlayerStopDebugPoll() {
        if (jsPlayer.debugPoll) {
          clearInterval(jsPlayer.debugPoll);
          jsPlayer.debugPoll = null;
        }
      };
      jsPlayer.parseDuration = function jsPlayerParseDuration(value) {
        if (!value) {
          return null;
        }
        var parts = value.split(':').map(function(part) {
          return parseInt(part, 10);
        }).filter(function(part) {
          return !isNaN(part);
        });
        if (parts.length === 0) {
          return null;
        }
        if (parts.length === 3) {
          return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        if (parts.length === 2) {
          return parts[0] * 60 + parts[1];
        }
        return parts[0];
      };
      jsPlayer.getDurationValue = function jsPlayerGetDurationValue() {
        var duration = jsPlayer.player.duration;
        if (duration && isFinite(duration) && duration > 0) {
          return duration;
        }
        if (jsPlayer.player.seekable && jsPlayer.player.seekable.length > 0) {
          var seekableEnd = jsPlayer.player.seekable.end(jsPlayer.player.seekable.length - 1);
          if (seekableEnd && isFinite(seekableEnd) && seekableEnd > 0) {
            return seekableEnd;
          }
        }
        if (jsPlayer.tracks[jsPlayer.idx] && jsPlayer.tracks[jsPlayer.idx].durationSeconds) {
          return jsPlayer.tracks[jsPlayer.idx].durationSeconds;
        }
        return null;
      };
      jsPlayer.toggleShuffle = function jsPlayerToggleShuffle() {
        jsPlayer.shuffleEnabled = !jsPlayer.shuffleEnabled;
        if (jsPlayer.shuffleEnabled) {
          jsPlayer.resetShuffleQueue();
        } else {
          jsPlayer.shuffleQueue = [];
          jsPlayer.shuffleHistory = [];
        }
        jsPlayer.updateShuffleButton();
      };
      jsPlayer.toggleOrder = function jsPlayerToggleOrder() {
        jsPlayer.applyOrder(jsPlayer.order === 'desc' ? 'asc' : 'desc');
      };
      jsPlayer.getNextIdx = function jsPlayerGetNextIdx() {
        if (jsPlayer.shuffleEnabled) {
          if (!jsPlayer.shuffleQueue || jsPlayer.shuffleQueue.length === 0) {
            return null;
          }
          var nextId = jsPlayer.shuffleQueue.shift();
          jsPlayer.shuffleHistory.push(nextId);
          return jsPlayer.findIndexById(nextId);
        }
        if (jsPlayer.idx + 1 < jsPlayer.trackCount) {
          return jsPlayer.idx + 1;
        }
        return null;
      };
      jsPlayer.getPrevIdx = function jsPlayerGetPrevIdx() {
        if (jsPlayer.shuffleEnabled) {
          if (jsPlayer.shuffleHistory.length > 1) {
            jsPlayer.shuffleHistory.pop();
            return jsPlayer.findIndexById(jsPlayer.shuffleHistory[jsPlayer.shuffleHistory.length - 1]);
          }
          return null;
        }
        if (jsPlayer.idx - 1 > -1) {
          return jsPlayer.idx - 1;
        }
        return null;
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
            jsPlayer.player.preload = 'metadata';
            jsPlayer.player.addEventListener('ended', jsPlayer.mediaEnded, true);
            jsPlayer.player.addEventListener('loadedmetadata', jsPlayer.setDuration, true);
            jsPlayer.player.addEventListener('loadeddata', jsPlayer.setDuration, true);
            jsPlayer.player.addEventListener('durationchange', jsPlayer.setDuration, true);
            jsPlayer.player.addEventListener('progress', jsPlayer.setDuration, true);
            jsPlayer.player.addEventListener('canplay', jsPlayer.setDuration, true);
            jsPlayer.player.addEventListener('canplaythrough', jsPlayer.setDuration, true);
            jsPlayer.player.addEventListener('timeupdate', jsPlayer.updateSeek, true);
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
            if (jsPlayer.orderButton.tagName) {
              jsPlayer.orderButton.addEventListener('click', jsPlayer.toggleOrder, true);
              jsPlayer.updateOrderButton();
            }
            if (jsPlayer.shuffleButton.tagName) {
              jsPlayer.shuffleButton.addEventListener('click', jsPlayer.toggleShuffle, true);
              jsPlayer.updateShuffleButton();
            }
            if (jsPlayer.seekBar.tagName) {
              jsPlayer.seekBar.addEventListener('mousedown', jsPlayer.seekHeld, true);
              jsPlayer.seekBar.addEventListener('mouseup', jsPlayer.seekReleased, true);
              jsPlayer.seekBar.addEventListener('click', jsPlayer.seekToPoint, true);
              jsPlayer.seekBar.addEventListener('touchstart', jsPlayer.seekToPoint, {
                passive: true
              });
              jsPlayer.seekBar.addEventListener('input', jsPlayer.updateSeek, true);
              jsPlayer.seekBar.addEventListener('change', jsPlayer.seekReleased, true);
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
