/* global Modernizr, jscolor */

import React, { Component } from 'react';
import './App.css';
import nearestColor from 'nearest-color';
import tinycolor from 'tinycolor2';
import './Modernizr';
import 'jscolor-picker';

class App extends Component {
    state = {
        isLoading: true,
        currentColor: {
            name: null,
            hexValue: '',
            rgbValue: null,
        },
        colorList: 'default',
        isInputTypeSupported: true,
        possibleColorLists: ['default'],
        listDescriptions: {
            default: {
                title: 'Default',
                description: 'The default color list',
            },
        },
    };

    componentDidMount() {
        this.fetchFromAPI();
    }

    setNewColorList = (event) => {
        this.setState({ colorList: event.target.value });
        this.fetchFromAPI();
    };

    fetchFromAPI = () => {
        this.setState({ isLoading: true });

        fetch('https://api.color.pizza/v1/lists/')
            .then((response) => {
                return response.json();
            })
            .then((response) => {
                console.log(response);
                this.setState({
                    possibleColorLists: response.availableColorNameLists,
                    listDescriptions: response.listDescriptions,
                });
            });

        fetch(`https://api.color.pizza/v1/?list=${this.state.colorList}`)
            .then((response) => {
                return response.json();
            })
            .then((response) => {
                this.getColors(response.colors);
            });
    }

    getColors = (colors) => {
        let mappedColors = {};
        colors.forEach(function(entry) {
            mappedColors[entry.name] = entry.hex;
        });

        this.nearestColors = nearestColor.from(mappedColors);

        this.updateColor(
            null,
            '#' + ('000000' + ((Math.random() * 0xffffff) << 0).toString(16)).slice(-6)
        );

        this.setState({ isLoading: false });

        if (!Modernizr.inputtypes.color) {
            this.setState({ isInputTypeSupported: false });
            new jscolor(document.querySelector('.color-namer__color-input'));
            document
                .querySelector('.color-namer__color-input')
                .setAttribute('onchange', 'updateColor(this.jscolor)');
            window.updateColor = (event) => {
                let color = tinycolor(
                    document.querySelector('.color-namer__color-input').style['background-color']
                ).toHexString();
                this.updateColor(event, color);
            };
        }

        this.colorInput.focus();
    };

    updateColor = (event, value) => {
        const colorValue = value || event.target.value;

        let validFormat =
            tinycolor(colorValue).getFormat() === 'name' ||
            tinycolor(colorValue).getFormat() === 'rgb' ||
            tinycolor(colorValue).getFormat() === 'hex';
        let validColor = tinycolor(colorValue).isValid();

        if (!validColor || !validFormat) {
            return false;
        }

        const color = this.nearestColors(tinycolor(colorValue).toHexString());

        this.setState({
            currentColor: {
                name: color.name,
                hexValue: tinycolor(colorValue).toHexString(),
                rgbValue: tinycolor(colorValue).toRgbString(),
            },
        });
    };

    render() {
        const Loader = () => (
            <div className="bouncing-loader">
                <div />
                <div />
                <div />
            </div>
        );

        return (
            <div className="color-namer">
                <a
                    className="github-badge-link"
                    href="https://github.com/robertcoopercode/color-namer"
                >
                    <span className="github-badge">View the Code</span>
                </a>
                <h1 className="color-namer__title">Color Namer</h1>
                <div className="color-namer__center-container">
                    {!this.state.isLoading ? (
                        <React.Fragment>
                            <span className="color-namer__name">
                                {this.state.currentColor.name}
                            </span>
                            <div className="color-namer__preview-container">
                                <div
                                    className="color-namer__preview"
                                    style={{
                                        backgroundColor: this.state.currentColor.hexValue,
                                    }}
                                >
                                    {this.state.isInputTypeSupported ? (
                                        <input
                                            className="color-namer__color-input"
                                            type="color"
                                            onChange={this.updateColor}
                                            value={this.state.currentColor.hexValue}
                                        />
                                    ) : (
                                        <input
                                            className="color-namer__color-input"
                                            type="button"
                                            onChange={this.updateColor}
                                            value={this.state.currentColor.hexValue}
                                        />
                                    )}
                                </div>
                                <span className="color-namer__preview-info">
                                    {'click for a color picker'}
                                </span>
                            </div>
                            <div className="color-namer__value-container">
                                <div className="color-namer__value  color-namer__value--hex">
                                    <span className="color-namer__value-label">hex</span>
                                    <span className="color-namer__value-text">
                                        {this.state.currentColor.hexValue}
                                    </span>
                                </div>
                                <div className="color-namer__value  color-namer__value--rgb">
                                    <span className="color-namer__value-label">rgb</span>
                                    <span className="color-namer__value-text">
                                        {this.state.currentColor.rgbValue}
                                    </span>
                                </div>
                            </div>
                        </React.Fragment>
                    ) : (
                        <Loader />
                    )}
                    <input
                        className="color-input"
                        autoComplete="off"
                        autoCapitalize="off"
                        placeholder={this.state.currentColor.hexValue}
                        onChange={this.updateColor}
                        ref={(input) => (this.colorInput = input)}
                    />
                    <div className="color-namer__lists">
                        <label className="color-namer__list-label">
                            <strong>Color List</strong>
                            <select
                                className="list-select"
                                value={this.colorList}
                                onChange={this.setNewColorList}
                            >
                                {this.state.possibleColorLists.map(list => (
                                    <option key={list} value={list}>
                                        {this.state.listDescriptions[list].title}
                                        &nbsp;({this.state.listDescriptions[list].colorCount})
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
                <div className="color-namer__bottom-container">
                    <div className="bottom-container-section  bottom-container-section--features">
                        <h3 className="bottom-container-section__title">Features</h3>
                        <ul className="bottom-container-section__list">
                            <li className="bottom-container-section__item">
                                Over 30,000 color names
                            </li>
                            <li className="bottom-container-section__item">
                                Accepts both hex and rgb formats
                            </li>
                            <li className="bottom-container-section__item">Color picker</li>
                        </ul>
                    </div>
                    <div className="bottom-container-section  bottom-container-section--instructions">
                        <h3 className="bottom-container-section__title">Accepted input formats</h3>
                        <ul className="bottom-container-section__list">
                            <li className="bottom-container-section__item">
                                hex with hash (e.g.{' '}
                                <span className="bottom-container-section__highlight">#323</span> or{' '}
                                <span className="bottom-container-section__highlight">#332233</span>
                                )
                            </li>
                            <li className="bottom-container-section__item">
                                hex without hash (e.g.{' '}
                                <span className="bottom-container-section__highlight">323</span> or{' '}
                                <span className="bottom-container-section__highlight">332233</span>)
                            </li>
                            <li className="bottom-container-section__item">
                                rgb (e.g.{' '}
                                <span className="bottom-container-section__highlight">
                                    rgb(103, 33, 158)
                                </span>
                                )
                            </li>
                            <li className="bottom-container-section__item">
                                supported CSS color names (e.g.{' '}
                                <span className="bottom-container-section__highlight">red</span>)
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
