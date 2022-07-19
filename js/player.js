
class Track {

}

class Player {
    constructor(playerId, tracks) {
        this.loadedTracks = [];
        this.allTracksLoaded = false;
        this.scalar = 1;
        this.strokeWidth = 10;
        this.path = null;
        this.pathElement = null;
        this.pathString = "";
        this.progressElement = null;
        this.playing = false;
        this.currentTrackIndex = 0;
        this.duration = 0;
        this.seek = 0;
        this.polls = {
            seek: {
                id: null,
                interval: 1000 / 4, // 4 times per second (4Hz)
                hook: function hook() {
                    this.seek = this.setSeek();
                }
            }
        };
        this.yScale = 25;
        this.playerId = playerId;
    };

    setSeek(){
        return;
    };
}

export { Player };