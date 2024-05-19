import React from 'react';
import PureComponent, { pure } from '../PureComponent'
import Radium from 'radium';
import Geosuggest from 'react-geosuggest'

import { colors, metrics, fonts } from '../../../theme';

let inputStyles
let styles;

class FilterPlace extends PureComponent {
  state = {
    highlightFieldBorder: false,
  }

  componentDidUpdate(prevProps) {
      if (!prevProps.locationInputFocus && this.props.locationInputFocus) {
          this.setState({ highlightFieldBorder: true })
          setTimeout(() => this.inputRef.focus(), 250);
      }
      else if (prevProps.locationInputFocus && !this.props.locationInputFocus) {
        this.setState({ highlightFieldBorder: false })
      }
  }

  render() {

    const { label,
        distanceLabel,
        locationName,
        _handleRemoveLocation,
        placeholder,
        distanceRange,
        _distanceRangeChanged,
        _distanceRangeBlur,
        userLocation, 
        radius,
        _handleLocationChange,
        _locationSelected,
        hideRange } = this.props;

    const geoInputStyles = this.state.highlightFieldBorder
        ? { ...inputStyles, input: { ...inputStyles.input, ...styles.inputHighlighted } }
        : { ...inputStyles, input: { ...inputStyles.input}} ;

    return (
      <div style={styles.container}>
            <div style={styles.column}>
                <div style={styles.row}>
                    <div style={styles.label}>{label}</div>
                    <div style={{position: 'relative', width: '100%', flex: 3}}>
                        {locationName && 
                            <span onClick={_handleRemoveLocation} style={styles.closeCross}>
                                <i className="fa fa-times" style={styles.cancelIcon} aria-hidden="true"></i>
                            </span>
                        }
                        <Geosuggest
                            ref={(r) => { this.inputRef = r; }}
                            style={geoInputStyles}
                            placeholder={placeholder}
                            onSuggestSelect={_locationSelected}
                            initialValue={locationName}
                            location={userLocation}
                            radius={radius}
                            onChange={() => typeof _handleLocationChange !== 'undefined' ? _handleLocationChange() : null}
                            //onBlur={() => { this.setState({ highlightFieldBorder: false }); }}
                        />
                    </div>
                </div>
                {!hideRange && 
                    <div style={styles.distanceRangeContainer}>
                        {distanceLabel && 
                            <div style={styles.label}>{distanceLabel}</div>
                        }
                        <div style={{flex: 3}}>
                            <input
                                style={styles.distanceRange}
                                type="number"
                                placeholder="0"
                                value={distanceRange}
                                onChange={_distanceRangeChanged}
                                onBlur={_distanceRangeBlur}
                            />
                            <span style={styles.labelKm}> Km</span>
                        </div>
                    </div>
                }
            </div>
      </div>
    );
  }
}

styles = {
    container: {
        marginTop: 10,
        marginBottom: 10, 
        paddingLeft: 10,
        width: '100%',
        fontFamily: 'Lato',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    closeCross: {
        position: 'absolute',
        right: 0,
        top: 6,
        width: 0,
        height: 0,
        color: colors.gray,
        marginRight: '15px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    label: {
        display: 'block',
        color: colors.blueLight,
        fontSize: 12,
        lineHeight: 1,
        flex: 1
    },
    row: {
        display:'flex',
        padding: 0,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        '@media (max-width: 420px)': {
          display:'block',
        }
    },
    column: {
        marginTop: 5,
        display:'flex',
        padding: 0,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'flex-start',
        position: 'relative',
        '@media (max-width: 420px)': {
          display:'block',
        }
    },
    cancelIcon: {
        marginRight: 15,
    },
    distanceRangeContainer: {
        display: 'flex',
        alignItems: 'center',
        marginTop: 10,
        width: '100%'
        //marginLeft: 15
    },
    distanceRange: {
        width: 50,
        backgroundColor: '#FFFFFF',
        border: '2px solid #5E9FDF',
        borderRadius: '3px',
        marginRight: 5,
        height: 35,
        textAlign: 'center',
        fontFamily: fonts.size.xl,
        color: 'rgba(146,146,146,0.87)',
        fontSize: 16,
    },
    labelKm: {
        color: colors.blue,
        fontSize: '18px',
        fontWeight: fonts.weight.medium,
        marginRight: 10
    },
    inputHighlighted: {
        border: '2px solid ' + colors.red
    }
}

inputStyles = {
	'input': {
        fontFamily: fonts.size.xl,
        lineHeight: '25px',
        height: 30,
        width: '85%',
        color: 'rgba(0, 0, 0, 0.64)',
        padding: 3,
        outline: 'none',
        backgroundColor: '#FFFFFF',
        border: '2px solid #5E9FDF',
        borderRadius: '3px',
        fontSize: 12,
        ':focus': {
            borderBottomColor: colors.green,
        },
    },
    'suggests': {
        width: '200%',
        position: 'absolute',
        top: 30,
        zIndex: 100,
	},
	'suggests--hidden': {
		width: '0',
		display: 'none',
	},
    'suggestItem': {
        marginHorizontal: metrics.margin.small,
        padding: metrics.padding.small,
        borderBottom: '1px solid rgb(220, 220, 220)',
        color: colors.blue,
        fontFamily: 'Lato',
        fontSize: 12,
        cursor: 'pointer',
        textAlign: 'left',
        backgroundColor: colors.white,
    },
}

export default Radium(FilterPlace);
