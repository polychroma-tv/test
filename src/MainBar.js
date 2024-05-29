import React from 'react';
import { withTranslation } from 'react-i18next';
import { BrowserView, isMobile } from "react-device-detect";
import { FaSun, FaMoon, FaCog, FaArrowLeft } from 'react-icons/fa';

import {
    BOTTOM_BAR_HEIGHT,
    MAIN_BAR_WIDTH
} from './constants.js';

const SECONDARY_NAV_STYLE = `
    py-1 text-left focus:outline-none hover:text-current focus:text-current
    text-gray-400 text-sm
`;

class MainBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fadeOutDiffs: false,
            showSettings: false,
            darkMode: true, // Set initial state to dark mode with toggle on
            language: 'en' // Set initial state to English
        }

        // Set the initial body class
        document.body.classList.add('dark-mode');
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.channels !== this.props.channels) {
            setTimeout(() => {
                this.setState({ fadeOutDiffs: true });
            }, 3000);
        }
    }

    toggleSettings = () => {
        this.setState({ showSettings: !this.state.showSettings });
    }

    setDarkMode = () => {
        const newMode = !this.state.darkMode;
        if (newMode) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        }
        this.setState({ darkMode: newMode });
    }

    setLanguage = () => {
        const newLanguage = this.state.language === 'en' ? 'fr' : 'en';
        this.props.i18n.changeLanguage(newLanguage);
        this.setState({ language: newLanguage });
    }

    clearCache = () => {
        localStorage.clear();
        window.location.reload();
    }

    render() {
        const {
            t, i18n,
            channels,
            currentCategory
        } = this.props;

        if (!channels || !currentCategory) {
            return null;
        }

        return (
            <div
                className={`
                    fixed left-0 top-0 z-1 h-full font-body
                    text-teal-800 flex flex-col justify-between
                    ${isMobile ? 'pl-6 pt-16 pb-4' : 'pl-20 pt-32'}
                `}
                style={{
                    width: MAIN_BAR_WIDTH,
                    paddingBottom: !isMobile && BOTTOM_BAR_HEIGHT
                }}>
                <div className={`flex flex-col items-start ${isMobile ? 'h-full justify-around' : ''}`}>
                    {
                        this.state.showSettings ? (
                            <div className="settings-menu">
                                <div className="settings-heading">Theme</div>
                                <div className="settings-item">
                                    <span>Dark Mode</span>
                                    <label className="toggle-switch">
                                        <input type="checkbox" onChange={this.setDarkMode} checked={this.state.darkMode} />
                                        <span className="slider round">
                                            <FaSun className="icon sun" />
                                            <FaMoon className="icon moon" />
                                        </span>
                                    </label>
                                </div>
                                <div className="settings-item">
                                    <span>Language</span>
                                    <label className="toggle-switch">
                                        <input type="checkbox" onChange={this.setLanguage} checked={this.state.language === 'fr'} />
                                        <span className="slider round">
                                            <span className="icon lang">EN</span>
                                            <span className="icon lang">FR</span>
                                        </span>
                                    </label>
                                </div>
                                <div className="settings-heading">Audio</div>
                                <div className="settings-item">
                                    <span>Compressor</span>
                                    <label className="toggle-switch">
                                        <input type="checkbox" onChange={this.props.toggleCompressor} checked={this.props.isCompressorEnabled} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div className="settings-item">
                                    <button className="ios-button" onClick={this.clearCache}>Clear Cache</button>
                                </div>
                            </div>
                        ) : (
                            <div className="main-bar-scroll">
                                {Object.keys(channels).map(k =>
                                    <button
                                        className={`
                                            flex items-center w-full text-left focus:outline-none
                                            hover:text-current focus:text-current transition-all ease-in duration-300
                                            ${isMobile ? 'py-1 text-lg' : 'py-2 text-xl'}
                                            ${currentCategory === k ? 'text-current' : 'text-gray-400'}
                                        `}
                                        onClick={this.props.onSwitchCategory}
                                        data-id={channels[k].slug}
                                        key={k}
                                    >
                                        <span className="text-xs mr-2">{channels[k].slug}</span>
                                        {
                                            i18n.language.split('-')[0] === 'es'
                                                ? channels[k]['title-es']
                                                : i18n.language.split('-')[0] === 'en'
                                                    ? channels[k]['title-en']
                                                    : channels[k]['title']
                                        }
                                    </button>
                                )}
                            </div>
                        )
                    }
                </div>
                <BrowserView>
                    <div className="flex flex-col -mb-2 mt-4">
                        <button
                            className={`${SECONDARY_NAV_STYLE} flex items-center`}
                            onClick={this.toggleSettings}
                        >
                           { this.state.showSettings ? <><FaArrowLeft className="mr-2" />{t('back')}</> : <><FaCog className="mr-2" />{t('settings')}</> }
                        </button>
                    </div>
                </BrowserView>
            </div>
        );
    }
}

export default withTranslation()(MainBar);
