import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import Radium from 'radium';
import ReactTooltip from 'react-tooltip'
import {Link} from 'found'

import { colors } from '../../theme';
import localizations from '../Localizations'

import Switch from '../common/Switch';
import SelectCircle from '../common/Inputs/SelectCircle';
import Dropdown from './Dropdown';
import Input from './Input';

let styles;

const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

class OpponentSelect extends PureComponent {

    render() {
        const { viewer, isOpenMatch, unknownOpponent } = this.props;

        return (
            <div
                style={styles.container}
                ref={node => { this._containerNode = node; }}
            >
                <div style={styles.section}>
                    <div style={styles.switchRow}>
                        <ReactTooltip effect="solid" multiline={true} />
                        <label style={unknownOpponent ? styles.disabledLabel : styles.label}>
                            {localizations.newSportunity_openMatch}
                            <Link target='_blank' to='/faq/tutorial/opponents-management' style={{color: colors.blueLight}}>
                                <i
                                    data-tip={localizations.newSportunity_openMatch_explanation}
                                    style={styles.openMatchToolTip}
                                    className="fa fa-question-circle"
                                    aria-hidden="true"
                                />
                            </Link>
                        </label>
                        <Switch 
                            checked={isOpenMatch}
                            onChange={this.props.openMatchSwitch}
                            disabled={unknownOpponent}
                        />
                    </div>
                    
                    <div style={styles.switchRow}>
                        <label style={isOpenMatch ? styles.disabledLabel : styles.label}>
                            {localizations.newSportunity_unknown_opponent_switch}
                        </label>
                        <Switch
                            checked={unknownOpponent}
                            onChange={this.props.unknownOppponentSwitch}
                            disabled={isOpenMatch}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

OpponentSelect.defaultProps = {
    placeholder: 'Select',
}

var spinKeyframes = Radium.keyframes({
    '0%': { transform: 'rotate(0deg)' },
    '100%' :{ transform: 'rotate(360deg)' },
}, 'spin');

const stylesBases = {
  autocompletion_dropdown: {
    position: 'absolute',
    left: 0,

    width: '100%',
    maxHeight: 220,

    backgroundColor: colors.white,

    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
    border: '2px solid rgba(94,159,223,0.83)',
    padding: 20,

    overflowY: 'scroll',
    overflowX: 'hidden',

    zIndex: 100,
  }
}

styles = {
    container: {
        position: 'relative',
        width: '100%',
        marginBottom: 25
    },
    dropdown: {
        position: 'absolute',
        top: 65,
        width: '100%',
        overflow: 'visible',
    },
    paperStyle: {
        marginLeft: '- 70px',
        marginRight: '- 70px',
        position: 'absolute',
        top: '153px',
        width: 'calc(100 % + 140px)',
        padding: '8px 70px 1px',
        
    },
	triangle: {
		position: 'absolute',
		right: 0,
		top: 35,
		width: 0,
		height: 0,

		transition: 'border 100ms',
		transitionOrigin: 'left',

		color: colors.blue,

		cursor: 'pointer',

		borderLeft: '8px solid transparent',
		borderRight: '8px solid transparent',
		borderTop: `8px solid ${colors.blue}`,
	},
	triangleOpen: {
		position: 'absolute',
		right: 0,
		top: 35,
		width: 0,
		height: 0,

		transition: 'border 100ms',
		transitionOrigin: 'left',

		color: colors.blue,

		cursor: 'pointer',

		borderLeft: '8px solid transparent',
		borderRight: '8px solid transparent',
		borderBottom: `8px solid ${colors.blue}`,
	},
    section: {
      //   backgroundColor: colors.lightGray,
        padding: '10px 15px 10px 0px',
        marginBottom: 10,
        borderRadius: 5
    },
    sectionTitle: {
        fontFamily: 'Lato',
        fontSize: '18px',
        marginBottom: 15,
        paddingBottom: 5, 
        borderBottom: '1px solid '+colors.darkGray,
        color: colors.darkGray
    },

    autocompletion_dropdown: {
      ...stylesBases.autocompletion_dropdown,
      top: 60,
    },

    removeCross: {
        float: 'right',
        width: 0,
        color: colors.gray,
        marginRight: '15px',
        cursor: 'pointer',
        fontSize: '16px',
    },

    list: {},

    listItem: {
        paddingBottom: 10,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 5
    },

    listItemClickable: {
        paddingBottom: 10,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 5,
        cursor: 'pointer'
    },
    listItemClickableFullWidth: {
        paddingBottom: 10,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        cursor: 'pointer'
    },
    listItemClickableColumn: {
        paddingBottom: 10,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginBottom: 5,
        cursor: 'pointer'
    },
    note: {
        fontSize: 16, 
        cursor: 'auto',
        fontStyle: 'italic',
        marginBottom: 10
    },
    avatar: {
        width: 39,
        height: 39,
        marginRight: 10,
        color: colors.blue,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '50%',
    },
    closeCross: {
        position: 'absolute',
        right: 0,
        top: 30,
        width: 0, 
        height: 0,
        color: colors.gray,
        marginRight: '15px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    cancelIcon: {
        marginRight: 15,
    },
    spinnerItem: {
        borderLeft: '6px solid #f3f3f3',
        borderRight: '6px solid #f3f3f3',
        borderBottom: '6px solid #f3f3f3',
        borderTop: '6px solid #3498db',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        marginRight: '20px',
        animation: 'x 1.5s ease 0s infinite',
        animationName: spinKeyframes,
    },
    inputRow: {
        marginBottom: 25,
        position: 'relative',
    },
    switchRow: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 25,
        width : '40%',
    },
    label: {
        fontFamily: 'Lato',
        fontSize: '18px',
        //textAlign: 'right',
        lineHeight: 1,
        color: '#316394',
        display: 'block',
        marginRight: 20,
        flex: 1
    },
    disabledLabel: {
        fontFamily: 'Lato',
        fontSize: '18px',
        //textAlign: 'right',
        lineHeight: 1,
        color: '#D1D1D1',
        display: 'block',
        marginRight: 20,
        flex: 1
      },
    openMatchToolTip: {
        marginLeft: 10,
        fontSize: 16,
        cursor: 'pointer'
    },
    buttonIcon: {
        color: colors.blue,
        position: 'relative',
        marginLeft: 10
    },
    numberContainer: {
        position: 'absolute',
        top: '4px',
        left: '15px',
        width: 24,
        textAlign: 'center'
    },
    number: {
        fontSize: 17,
        fontWeight: 'bold'
    },
    hr: {
        marginLeft: -70,
        marginRight: -70,
    },
};

export default createFragmentContainer(Radium(OpponentSelect), {
    viewer: graphql`
        fragment Opponent_viewer on Viewer {
                me {
                    id
                }
            }
        `,
    }
);
