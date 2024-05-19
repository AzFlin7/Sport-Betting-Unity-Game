import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';

import { colors } from '../../theme';

let styles;

class Switch extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
				value: props.defaultValue,
		};
	}

	_handleClick() {
		let changed = this.state.value ^ 1;
		this.setState({
				value: changed,
		});
	}

	render() {
		return (
		<div style={styles.container}>
			<div style={styles.track} onClick={()=>{this.props.onChange; this._handleClick()}}>
				<span style={(this.state.value === 0) ? styles.activeSpan : styles.span}>Calendar</span>
				<span style={(this.state.value === 1) ? styles.activeSpan : styles.span}>List</span>
			</div>
		</div>
		);
	}
}


    styles = {
    container: {
        position: 'relative',
        width: 153,
        height: 22,
        marginBottom: 20,
    },

    track: {
        width: 153,
        height: 22,
        borderRadius: 2,
        backgroundColor: colors.white,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        border: '2px solid '+colors.blue,
        cursor: 'pointer',
    },

    span: {
        fontSize: 12,
        color: colors.blue,
        fontWeight: 'bold',
        width: '100%',
        height: '100%',
        lineHeight: '18px',
        textAlign: 'center',
    },

    activeSpan: {
        fontSize: 12,
        color: colors.white,
        fontWeight: 'bold',
        width: '100%',
        height: '100%',
        lineHeight: '18px',
        textAlign: 'center',
        backgroundColor: colors.blue,
    },
}


export default Radium(Switch);
