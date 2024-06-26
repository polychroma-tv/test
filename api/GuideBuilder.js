class GuideBuilder {
  // Seed is based on current clock time, in seconds
  static getSeed() {
    return Math.floor((new Date().getTime()) / 1000);
  }

  static computeTimes(currentVideo, nextVideo, videoStartSec, debug = false) {
    const nowMs = Math.floor(Date.now());
    let time1, time2, time3;

    time1 = nowMs - videoStartSec * 1000;
    time2 = time1 + currentVideo.fields['duration'] * 60 * 1000;
    time3 = time2 + nextVideo.fields['duration'] * 60 * 1000;

    time1 = new Date(time1);
    time2 = new Date(time2);
    time3 = new Date(time3);

    if (debug) {
      console.debug('time1 =', time1);
      console.debug('time2 =', time2);
      console.debug('time3 =', time3);
    }

    return {
      time1,
      time2,
      time3
    }
  }

  static buildDatabase(playlists) {
    const database = {
      categories: {}
    };

    playlists.forEach((playlist, index) => {
      const channelSlug = 100 + index * 20;
      database.categories[channelSlug] = {
        slug: channelSlug,
        fields: {
          title: playlist.info.name,
          'title-en': playlist.info.name,
          'title-es': playlist.info.name
        },
        videos: playlist.playlist.map(video => {
          let id = video.src;
          if (video.playerType === 'html5') {
            id = video.src.split('/').pop().split('.').slice(0, -1).join('.');
          }
          return {
            fields: {
              id: id,
              title: video.name,
              duration: video.duration / 60, // Convert seconds to minutes
              url: video.src,
              playerType: video.playerType // Use the playerType from the playlist data
            }
          };
        })
      };
    });

    return database;
  }

  static getGuide(database) {
    let guide = {
      createdAt: new Date(),
      channels: {}
    };
    const categories = database.categories;

    console.debug('database', database);

    Object.keys(categories).forEach(key => {
      const c = categories[key];
      const channelData = this.computeCurrentVideoAndOffset(c.videos);
      guide.channels[c.slug] = {
        slug: c.slug,
        title: c.fields['title'],
        "title-en": c.fields['title-en'],
        "title-es": c.fields['title-es'],
        length: c.videos.length,
        ...channelData
      };
    });

    return guide;
  }

  static computeCurrentVideoAndOffset(records, debug = false) {
    if (!records || records.length === 0) {
      console.error('computeCurrentVideoAndOffset(): empty records');
      return null;
    }

    const seed = this.getSeed();

    const lengths = records.map(i => i.fields['duration'] * 60);
    const totalLength = lengths.reduce((a, b) => a + b, 0);
    const normalizedSeed = seed % totalLength;

    // Create array of accumulated lengths (in seconds)
    let accumulatedLengths = [0];
    for (let i = 0; i < lengths.length; i++) {
      accumulatedLengths[i + 1] = lengths[i] + accumulatedLengths[i];
    }
    
    // Compute index of currently playing video
    let currentVideoIndex = 0;
    for (let i = 0; normalizedSeed > accumulatedLengths[i]; i++) {
      currentVideoIndex = i;
    }
    
    currentVideoIndex %= records.length;
    const nextVideoIndex = (currentVideoIndex + 1) % records.length;
    
    // Find starting point (in seconds) of current video
    const videoStartSec = Math.floor(normalizedSeed - accumulatedLengths[currentVideoIndex]);
    
    const currentVideo = records[currentVideoIndex];
    const nextVideo = records[nextVideoIndex];
    
    const times = this.computeTimes(currentVideo, nextVideo, videoStartSec);
    
    if (debug) {
      console.debug('normalizedSeed', normalizedSeed);
      console.debug('accumulatedLengths', accumulatedLengths);
      console.debug('currentVideoIndex =', currentVideoIndex);
      console.debug('nextVideoIndex =', nextVideoIndex);
      console.debug('videoStartSec =', videoStartSec);
    }
    
    return {
      currentVideo: {
        ...currentVideo,
        playerType: currentVideo.fields.playerType
      },
      nextVideo: {
        ...nextVideo,
        playerType: nextVideo.fields.playerType
      },
      videoStart: videoStartSec,
      ...times
    };
  }
}
    
module.exports = GuideBuilder;
