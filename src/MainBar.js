import React from 'react';
import { withTranslation } from 'react-i18next';
import { BrowserView, isMobile } from "react-device-detect";

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
            lightMode: true
        }
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

    setLightMode = () => {
        const newMode = !this.state.lightMode;
        if (newMode) {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
        }
        this.setState({ lightMode: newMode });
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
                                <div className="settings-item">
                                    <span>Dark Mode</span>
                                    <label className="toggle-switch">
                                        <input type="checkbox" onChange={this.setLightMode} checked={this.state.lightMode} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div className="settings-item">
                                    <span>Cache</span>
                                    <button className="ios-button" onClick={this.clearCache}>Clear Cache</button>
                                </div>
                            </div>
                        ) : (
                            Object.keys(channels).map(k =>
                                <button
                                    className={`
                                        flex items-baseline w-full text-left focus:outline-none
                                        hover:text-current focus:text-current transition-all ease-in duration-300
                                        ${isMobile ? 'py-1 text-lg' : 'py-2 text-xl'}
                                        ${currentCategory === k ? 'text-current' : 'text-gray-400'}
                                    `}
                                    onClick={this.props.onSwitchCategory}
                                    data-id={channels[k].slug}
                                    key={k}
                                >
                                    {
                                        i18n.language.split('-')[0] === 'es'
                                            ? channels[k]['title-es']
                                            : i18n.language.split('-')[0] === 'en'
                                                ? channels[k]['title-en']
                                                : channels[k]['title']
                                    }
                                    {
                                        !isMobile &&
                                        <sup className="ml-1 text-xs">
                                            {channels[k].length}
                                            {
                                                channels[k].diff ?
                                                <span className={`
                                                    text-teal-600 font-bold py-0 px-1 text-xs
                                                    ${this.state.fadeOutDiffs ? 'opacity-0' : 'opacity-100'}`}
                                                    style={{transition: 'opacity 10s ease-in'}}>
                                                    <span className="font-logo">↑</span>{ channels[k].diff }
                                                </span>
                                                : null
                                            }
                                        </sup>
                                    }
                                </button>
                            )
                        )
                    }
                </div>

                <BrowserView>
                    <div className="flex flex-col -mb-2 mt-4">
                        <button
                            className={SECONDARY_NAV_STYLE}
                            onClick={this.toggleSettings}
                        >
                           { this.state.showSettings ? t('back') : t('settings') }
                        </button>
                    </div>
                </BrowserView>
            </div>
        );
    }
}

export default withTranslation()(MainBar);
