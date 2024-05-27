import React from 'react';
import { withRouter } from "react-router-dom";
import Screenfull from "screenfull";
import { withOrientationChange, MobileView, isMobile } from "react-device-detect";
import { withTranslation } from 'react-i18next';
import { isMobileSafari } from './utils.js';

import LogoMenu from './LogoMenu.js'
import BottomBar from './BottomBar.js'
import MainBar from './MainBar.js'
import Player from './Player.js'
import Welcome from './Welcome.js'
import Analytics from './Analytics.js'

import IconRotate from './assets/IconRotate.js'

import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.onFullScreenChange = this.onFullScreenChange.bind(this);
    this.onToggleFullscreen = this.onToggleFullscreen.bind(this);
    this.onPlayerClick = this.onPlayerClick.bind(this);
    this.onVideoEnd = this.onVideoEnd.bind(this);
    this.onSwitchCategory = this.onSwitchCategory.bind(this);
    this.onToggleUI = this.onToggleUI.bind(this);
    this.onToggleMute = this.onToggleMute.bind(this);
    this.onChangeVolume = this.onChangeVolume.bind(this);
    this.updateGuide = this.updateGuide.bind(this);
    this.skipVideo = this.skipVideo.bind(this);
    this.setMuted = this.setMuted.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);

    if (!isMobileSafari()) {
      Screenfull.on('change', this.onFullScreenChange);
    }

    const saved = this.getStateFromLocalStorage() || {};

    this.state = {
      welcome: saved.welcome_v2 !== undefined 
            ? saved.welcome_v2
            : true,
      categories: null,
      guide: null,
      currentCategory: null,
      isUIVisible: true,
      volume:
        saved.volume !== undefined
          ? saved.volume
          : 1,
      isMuted: 
        saved.isMuted !== undefined
          ? saved.isMuted
          : true,
      savedGuide: saved.guide,
      showSettings: false,
      isOnDemand: false,
      onDemandVideo: null,
    };

    window.addEventListener('beforeunload', e => {
      this.saveStateToLocalStorage();
    });
  }

  toggleSettings() {
    this.setState({ showSettings: !this.state.showSettings });
  }

  async componentDidMount() {
    const { videoId } = this.props.match.params;
    if (videoId) {
      this.setState({ isOnDemand: true });
      await this.fetchOnDemandVideo(videoId);
    }

    Analytics.setUserProperty({
      isUIVisible: this.state.isUIVisible,
      isMuted: this.state.isMuted,
      isFullscreen: false
    });

    let category = this.props.location.pathname.split('/')[1];
    if (!category) {
      const prevState = this.getStateFromLocalStorage();
      if (prevState) {
        category = prevState.currentCategory;
      }
    }

    this.setState({
      currentCategory: category
    });

    this.updateGuide();
  }

  async fetchOnDemandVideo(videoId) {
    try {
      const response = await fetch(`https://polychroma.tv/wp-json/tv/item/${videoId}`);
      const videoData = await response.json();
      if (videoData && videoData.src) {
        this.setState({
          onDemandVideo: {
            src: videoData.src,
            type: videoData.type
          }
        });
      }
    } catch (error) {
      console.error('Error fetching on-demand video:', error);
    }
  }

  updateURL() {
    const searchParams = new URLSearchParams();
    const slug = this.state.currentCategory;
    this.props.history.push(`/${slug}?${searchParams.toString()}`);
  }

  getParamsFromURL() {
    const possibleParams = ['ui', 'muted'];
    const params = new URLSearchParams(this.props.location.search);

    let ret = {}
    possibleParams.forEach( p => {
        let value = params.get(p);
        if (value) {
            ret[p] = value === 'true';
        }
    })

    return ret;
  }

  getStateFromLocalStorage() {
    const savedState = JSON.parse(window.localStorage.getItem('polychroma-app-state'));
    console.debug('Retrieved saved state from local storage:', savedState);
    return savedState;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentCategory !== this.state.currentCategory) {
      if (this.state.guide) {
        const currentChannelData = this.state.guide.channels[this.state.currentCategory];
        if (Date.now() > currentChannelData.time2) {
          this.updateGuide();
        }

        if (prevState.currentCategory) {
          Analytics.event('category_skipped');
        }
      }

      this.updateURL();
    }

    if (this.state.isUIVisible !== prevState.isUIVisible
        || this.state.isMuted !== prevState.isMuted) {
        Analytics.setUserProperty({
          isUIVisible: this.state.isUIVisible,
          isMuted: this.state.isMuted
        });
    }
  }

  onSwitchCategory(e) {
    this.setState({ currentCategory: e.currentTarget.dataset.id });
  }

  onToggleUI() {
    this.setState({ isUIVisible: !this.state.isUIVisible });
  }

  onPlayerClick(value) {
    this.setState({ isUIVisible: false })
  }

  onVideoEnd() {
    this.updateGuide();
  }

  onToggleFullscreen() {
    Screenfull.toggle();
  }

  onFullScreenChange(e) {
    this.setState({
      isUIVisible: !Screenfull.isFullscreen
    })

    Analytics.setUserProperty({
      isFullscreen: Screenfull.isFullscreen
    });
  }

  onToggleMute() {
    this.setState({
      isMuted: !this.state.isMuted,
    });
  }

  setMuted() {
    this.setState({
      isMuted: true
    });
  }

  onChangeVolume(newVolume) {
    this.setState({ volume: newVolume });
  }

  skipVideo() {}

  saveStateToLocalStorage() {
    const state = {
      isUIVisible: this.state.isUIVisible,
      isMuted: this.state.isMuted,
      currentCategory: this.state.currentCategory,
      welcome_v2: this.state.welcome,
      volume: this.state.volume,
      guide: this.state.guide
    }
 
    const str = JSON.stringify(state);
    window.localStorage.setItem('polychroma-app-state', str);
  }

  async updateGuide() {
    const res = await (await fetch('/api/get')).json();
    const guide = res.body;

    console.debug('New computed guide:', guide);

    let currentCategory;
    if (this.state.currentCategory && guide.channels[this.state.currentCategory]) {
      currentCategory = this.state.currentCategory;
    } else {
      currentCategory = Object.keys(guide.channels)[0];
    }

    if (this.state.savedGuide && this.state.savedGuide.channels) {
      const currentChannels = guide.channels;
      const prevChannels = this.state.savedGuide.channels;
      Object.keys(currentChannels).forEach( k => {
        if (prevChannels[k]) {
          const l1 = prevChannels[k].length;
          const l2 = currentChannels[k].length;
          const diff = l2 - l1;
          currentChannels[k].diff = diff > 0 ? diff : 0;
        }
      })
    }

    this.setState({
      guide,
      currentCategory
    });
  }

  render() {
    const { t } = this.props;
    const isReady = !!this.state.guide;

    let currentChannelData;
    if (isReady) {
      currentChannelData = this.state.guide.channels[this.state.currentCategory];
    }

    return (
      <div>
        <MobileView>
        {
          this.props.isPortrait && !this.state.welcome &&
          <div className="fixed top-0 left-0 w-screen h-screen flex flex-col items-center justify-center text-white z-10 bg-teal-800">
            <IconRotate/>
            <div className="w-1/2 my-2 text-lg text-center leading-tight font-body">
              { t('turn-phone') }
            </div>
          </div>
        }
        </MobileView>

        {
          this.state.welcome &&
          <Welcome
            onStartClick={() => this.setState({welcome: false})}
          />
        }

        {
          !this.state.welcome &&
          <div>
            <Player
              channelData={this.state.isOnDemand ? null : currentChannelData}
              guideCreatedAt={isReady && this.state.guide.createdAt}
              isMuted={this.state.isMuted}
              volume={this.state.volume}
              isUIVisible={this.state.isUIVisible}
              onPlayerClick={this.onPlayerClick}
              onVideoEnd={this.onVideoEnd}
              skipVideo={this.skipVideo}
              setMuted={this.setMuted}
            />

            <BottomBar
              channelData={currentChannelData}
              isUIVisible={this.state.isUIVisible}
              isMuted={this.state.isMuted}
              volume={this.state.volume}
              onChangeVolume={this.onChangeVolume}
              onToggleMute={this.onToggleMute}
              onToggleFullscreen={this.onToggleFullscreen}
              onDemandVideo={this.fetchOnDemandVideo}
            />

            <div
              className={
                this.state.isUIVisible
                  ? 'opacity-100'
                  : 'opacity-0 pointer-events-none'}
              style={{
                transition: this.state.isUIVisible
                  ? 'opacity 1.2s ease-out 0.8s'
                  : 'opacity 0.8s ease-out'
              }}
              >
              <MainBar
                channels={isReady && this.state.guide.channels}
                currentCategory={this.state.currentCategory}
                onSwitchCategory={this.onSwitchCategory}
                onAboutClick={() => this.setState({welcome: true})}
                showSettings={this.state.showSettings}
                toggleSettings={this.toggleSettings}
              />
            </div>

            <LogoMenu
              isUIVisible={this.state.isUIVisible}
              onToggleUI={this.onToggleUI}
            />
          </div>
        }
      </div>
    );
  }
}

export default withRouter(withOrientationChange(withTranslation()(App)));
