import React from 'react';
import {Link} from 'found'
import Radium from 'radium';

import PureComponent from './PureComponent'
import { colors, fonts, metrics } from '../../theme'
import localizations from '../../components/Localizations';

let styles;

class PseudoInfoForTable extends PureComponent {

    render() {

        const { member } = this.props;
        const names = {};

        if (member &&
            member.circlesUserIsIn &&
            member.circlesUserIsIn.edges &&
            member.circlesUserIsIn.edges.length > 0) {
                member.circlesUserIsIn.edges.forEach(edge => {
                    names[edge.node.name] = '';
                });
        }
        else {
            names[localizations.circle_no_ground_found] = '';
        }

        const uniqueCircleNames = Object.keys(names).map(key => key);

        return (
            <div style={styles.pseudoContainer}>
            <Link to={'/profile-view/'+member.id} style={{ textDecoration: 'none' }}>
                <div
                    style={{...styles.iconImage, backgroundImage: member.avatar ? 'url('+ member.avatar +')' : 'url("https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png")'}}
                />
            </Link>
            <div style={styles.pseudo_circle_container}>
                <div style={styles.member_info_container}>
                <div style={styles.memberName}>
                        {member.pseudo}
                    </div>
                    <div style={styles.memberFullName}>
                    {
                            (member.firstName === null || typeof(member.firstName) === 'undefined')  &&
                            (member.lastName === null || typeof(member.lastName) === 'undefined') &&
                            ''
                    }
                    {
                            (member.firstName ||
                            member.firstName) &&
                            member.firstName + ' ' + member.lastName
                    }
                    </div>
                </div>
                <div style={styles.users_in_circle_container}>
                    <img src='/images/Group.svg' height='20px' />
                    <div style={styles.users_in_circle}>{ uniqueCircleNames.join(', ') }</div>
                </div>
            </div>
            </div>
        )
    }
}

styles = {
	pseudoContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'stretch',
		width: '100%'
	},
	pseudoContainer_second_column: {
		display: 'flex',
		flexDirection: 'column',
	},
    iconImage: {
		color:colors.white,
		width: 50,
        height: 50,
		borderRadius: '50%',
		backgroundPosition: '50% 50%',
        backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
    },
    pseudo_circle_container: {
		display: 'flex',
		width: '100%',
		flexDirection: 'column',
		justifyContent: 'space-evenly',
		alignItems: 'stretch',
		marginLeft: '20px'
	},
	member_info_container: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	memberName: {
		fontSize: 12,
		lineHeight: '20px',
		color: colors.blue,
		fontWeight: 'bold',
	},
	memberFullName: {
		fontSize: 12,
		lineHeight: '20px',
		color: colors.darkGray,
		fontWeight: 'bold',
	},
	users_in_circle_container: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center'
	},
	users_in_circle: {
		fontSize: '10px',
		marginLeft: '5px'
	},

}

export default PseudoInfoForTable;
