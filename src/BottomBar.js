import React from 'react';
import { withTranslation } from 'react-i18next';
import Screenfull from "screenfull";
import { withRouter } from 'react-router-dom'; // Add this import

import { BrowserView, isMobile } from "react-device-detect";

import {
  MAIN_BAR_WIDTH,
  BOTTOM_BAR_HEIGHT,
  BOTTOM_BAR_AUTOCLOSE_TIMEOUT_MS,
  LABELS_TRANSITION_MS,
  CHROMA_EASING_BEZIER,
  CHROMA_EASING_TIMING,
} from './constants.js';

import { throttle, stripEmojis } from './utils.js';

import IconVolume from './assets/IconVolume.js'
import IconFullScreen from './assets/IconFullScreen.js'
// import IconGlobe from './assets/IconGlobe.js'


class BottomBar extends React.Component {
  autoCloseTimeout;

  constructor(props) {
    super(props);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.throttleMouseMove = throttle(this.onMouseMove, 300);

    this.state = {
      loading: true,
      open: false,
      showVolumeSlider: false,
      currentVideoDescription: '',
      additionalInfo: {
        contentRating: '',
        genre: '',
        year: ''
      }
    }

    this.videoPlayerRef = React.createRef(); // Add this line

    this.delayStateUpdate();
    this.updateMenuAutocloseBehavior();
  }

  async fetchVideoDescription() {
    const { channelData } = this.state;
    if (!channelData || !channelData.currentVideo) {
      this.setState({ currentVideoDescription: 'No data available.' });
      return;
    }

    const { currentVideo } = channelData;
    let description = '';
    let additionalInfo = {
      contentRating: '',
      genre: '',
      year: ''
    };

    try {
      if (currentVideo.fields['playerType'] === 'html5') {
        const sanitizedId = currentVideo.fields['id'].split('-')[0];
        const response = await fetch(`https://imdb.polychroma.workers.dev/title/${sanitizedId}`);
        const data = await response.json();
        description = data.plot || 'No data available.';
        additionalInfo = {
          contentRating: data.contentRating || 'Not Rated',
          genre: data.genre ? data.genre.slice(0, 2).join(', ') : '',
          year: data.year || ''
        };
      } else if (currentVideo.fields['playerType'] === 'YouTube') {
        const response = await fetch(`https://hls.videochro.me/info/${currentVideo.fields['id']}`);
        const data = await response.json();
        description = data.description || 'No data available.';
      }
    } catch (error) {
      description = 'No data available.';
    }

    this.setState({ 
      currentVideoDescription: this.processDescription(description),
      additionalInfo
    });
  }

  processDescription(description) {
  const firstPeriodIndex = description.indexOf('.');
  if (firstPeriodIndex !== -1) {
    const secondPeriodIndex = description.indexOf('.', firstPeriodIndex + 1);
    if (secondPeriodIndex !== -1) {
      return description.substring(0, secondPeriodIndex + 1);
    } else {
      return description.substring(0, firstPeriodIndex + 1);
    }
  }
  return description;
  }

  onMouseMove(e) {
    console.debug('onMouseMove');

    if (!this.props.isUIVisible) {
      this.setState({
        open: true
      });
    }
  }

  updateMenuAutocloseBehavior() {
    if (this.props.isUIVisible)  {
      document.removeEventListener(
        'mousemove',
        this.throttleMouseMove,
        { capture: true, passive: true });
    } else {
      this.setState({
        open: false
      })

      setTimeout( () => {
        document.addEventListener(
          'mousemove', 
          this.throttleMouseMove,
          { capture: true, passive: true }
        );
      }, 1500);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isMobile && prevProps.isUIVisible !== this.props.isUIVisible) {
      this.updateMenuAutocloseBehavior();
    }

    if (prevProps.channelData !== this.props.channelData) {
      this.setState({
        loading: true,
      }, () => {
        setTimeout(() => {
          this.setState({
            channelData: this.props.channelData // Update state with new channelData
          }, () => {
            this.delayStateUpdate();
            this.fetchVideoDescription();
          });
        }, LABELS_TRANSITION_MS / 2); // Delay for half the transition duration
      });
    }

    if (prevState.open !== this.state.open) {
      this.autoCloseMenu()
    }
  }

  autoCloseMenu() {
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }

    this.autoCloseTimeout = setTimeout(() => {
      this.setState({
        open: false
      })
    }, BOTTOM_BAR_AUTOCLOSE_TIMEOUT_MS);
  }

  delayStateUpdate() {
    setTimeout(() => {
      this.setState({
        loading: false,
        ...this.props
      })
    }, LABELS_TRANSITION_MS);
  }

  getFormatedTimes() {
    const { time1, time2, time3 } = this.state.channelData;
    const { i18n } = this.props;

    const dateTimeOpts = {
      hour: '2-digit',
      minute: '2-digit'
    };

    const str1 = new Date(time1).toLocaleTimeString(i18n.language, dateTimeOpts);
    const str2 = new Date(time2).toLocaleTimeString(i18n.language, dateTimeOpts);
    const str3 = new Date(time3).toLocaleTimeString(i18n.language, dateTimeOpts);

    return {
      time1Str: `${str1} — ${str2}`,
      time2Str: `${str2} — ${str3}`
    }
  }

  render() {
    const { t, onDemandVideo } = this.props;

    let currentVideo, nextVideo;
    let time1Str, time2Str;
    let channelTitle, channelUrl;
    let currentVideoTitle, currentVideoUrl;
    let nextVideoTitle;
    let shouldShowNextVideo;

    if (onDemandVideo) {
      currentVideoTitle = onDemandVideo.title;
      currentVideoUrl = `title/${onDemandVideo.id}`;
      channelTitle = '';
      channelUrl = '';
      time1Str = '';
      time2Str = '';
      shouldShowNextVideo = false;
    } else if (this.state.channelData) {
      ({ time1Str, time2Str } = this.getFormatedTimes());
      ({ currentVideo, nextVideo } = this.state.channelData);

      channelTitle =
        currentVideo.fields['channelTitle'] &&
        currentVideo.fields['channelTitle'][0];
      channelUrl =
        currentVideo.fields['channelUrl'] &&
        currentVideo.fields['channelUrl'][0];

      currentVideoUrl = `title/${currentVideo.fields['id']}`;
      currentVideoTitle = stripEmojis(currentVideo.fields['title']);
      nextVideoTitle = stripEmojis(nextVideo.fields['title']);

      const remainingTimeSec = (new Date(this.state.channelData.time2) - new Date()) / 1000;
      shouldShowNextVideo =
        nextVideoTitle &&
        remainingTimeSec < 10 * 60;
    }

    return (
      <div className={`
        bottom-bar bg-white z-1 fixed left-0 bottom-0 w-full
        transform transition-all
        ${this.props.isUIVisible || this.state.open ? '-translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `} style={{
        transitionTimingFunction: CHROMA_EASING_BEZIER,
        transitionDuration: CHROMA_EASING_TIMING
      }}>
        <div
          className="pt-2 flex justify-between text-teal-800 font-body"
          style={{
            paddingLeft: MAIN_BAR_WIDTH,
            height: BOTTOM_BAR_HEIGHT + 'px'
          }}
        >
          <div className={` 
            flex w-10/12 transform transition-all ease-out
            ${(this.props.isUIVisible && !this.state.loading) || (this.state.open) ? '-translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}
            style={{ transitionDuration: LABELS_TRANSITION_MS + 'ms' }}
          >
            <div className={`${isMobile ? 'w-10/12' : 'w-6/12'} pr-8 flex flex-col`}>
              <div className="mt-2 text-xs font-extrabold whitespace-no-wrap mb-1">
                {time1Str}
              </div>

              <div className="flex justify-between">
                <div className="flex truncate">
                  <div className="truncate">
                    <div className={`truncate ${isMobile ? '' : 'text-xl'}`}>
                      <button className="hover:underline current-video-title" onClick={() => {
                        this.props.history.push(`/${currentVideoUrl}`);
                        this.props.fetchOnDemandVideo(currentVideo.fields['id']);
                      }}>
                        {currentVideoTitle}
                      </button>
                    </div>

                    <div>
                      <a className=" hover:underline" href={channelUrl}>
                        {channelTitle}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs additional-info">
                {onDemandVideo ? (
                  <>
                    {onDemandVideo.additionalInfo.contentRating && <div className="content-rating">{onDemandVideo.additionalInfo.contentRating}</div>}
                    {onDemandVideo.additionalInfo.genre && <div>{onDemandVideo.additionalInfo.genre}</div>}
                    {onDemandVideo.additionalInfo.year && <div>({onDemandVideo.additionalInfo.year})</div>}
                  </>
                ) : (
                  <>
                    {this.state.additionalInfo.contentRating && <div className="content-rating">{this.state.additionalInfo.contentRating}</div>}
                    {this.state.additionalInfo.genre && <div>{this.state.additionalInfo.genre}</div>}
                    {this.state.additionalInfo.year && <div>({this.state.additionalInfo.year})</div>}
                  </>
                )}
              </div>
              <div className="mt-2 text-xs description">
                {this.state.currentVideoDescription}
              </div>
            </div>

                {
                  shouldShowNextVideo &&
                  <BrowserView viewClassName="w-5/12 pr-8 flex flex-col text-gray-400">
                      {/* <div className="mb-1 mt-2 h-2px w-full bg-gray-300"/> */}
                      <div className="mt-2 text-xs font-extrabold whitespace-no-wrap mb-1">
                        { t('later') }
                      </div>

                      <div className="flex">
                        <div className="truncate">
                          <div className="truncate text-xl">
                            { nextVideoTitle }
                          </div>
                        </div>
                      </div>
                  </BrowserView>
                }
              </div>
              
              <div className="w-2/12 mt-4 pr-2 flex justify-end items-start">
                <div
                  className="relative"
                  onMouseEnter={() => this.setState({showVolumeSlider: true})} 
                  onMouseLeave={() => this.setState({showVolumeSlider: false})}
                >
                  {
                    !isMobile &&
                    this.state.showVolumeSlider &&
                    <div
                      className={`
                        absolute flex bg-white p-5 rounded-lg
                        transition-all ease-in-out duration-300
                        ${this.state.showVolumeSlider ? 'opacity-100' : 'opacity-0'}
                      `}
                      style={{
                        transform: `rotate(-90deg)`,
                        top: -112,
                        right: -56
                        }}>
                      <input
                        className={this.props.isMuted ? undefined : `cursor-pointer`}
                        type="range" min={0} max={1} step={0.02}
                        value={this.props.volume}
                        disabled={this.props.isMuted}
                        onChange={e => {
                          this.props.onChangeVolume(e.target.value);
                        }}
                      />
                    </div>
                  }

                  <button className={`
                    p-5 hover:bg-gray-200 transition-colors duration-300 rounded-lg
                    ${this.props.isMuted ? 'text-red-700' : ''} `}
                    onClick={this.props.onToggleMute}>
                      <IconVolume isMuted={this.props.isMuted}/>
                  </button>
                </div>
                
                {
                  Screenfull.isEnabled &&
                  <button
                    className="p-5 hover:bg-gray-200 transition-colors duration-300 rounded-lg"
                    onClick={this.props.onToggleFullscreen}>
                      <IconFullScreen isFullScreen={Screenfull.isFullscreen}/>
                  </button>
                }
              </div>
          </div>
        </div>
    );
  }
}

export default withRouter(withTranslation()(BottomBar));
