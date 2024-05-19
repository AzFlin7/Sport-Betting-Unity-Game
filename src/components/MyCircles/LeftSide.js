import React from 'react'
import localizations from '../Localizations'
import { colors, metrics } from '../../theme'

let styles

const Title = ({ children }) => <h2 style={styles.title}>{children}</h2>
const SubTitle = ({ children }) => <h3 style={styles.subtitle}>{children}</h3>

class LeftSide extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		const { activeSection, user } = this.props
		return(
			<section style={styles.container}>
                <Title>
                    {!user || user.profileType === 'PERSON'
                    ? localizations.header_my_community
                    : localizations.header_my_teams
                    }
                </Title>
                
				{user && (user.circles && user.circles.edges && user.circles.edges.length > 0 ||
                    user.circlesSuperUser && user.circlesSuperUser.edges && user.circlesSuperUser.edges.length > 0) &&
                    <div style={activeSection === 'allMembers' ? styles.menuActive : styles.menu}
                        onClick={this.props.onChangeSection.bind(this, 'allMembers')}>
                        {localizations.circles_allMembers}
                    </div>
                }

                <div style={activeSection === 'findCircles' ? styles.menuActive : styles.menu}
                    onClick={this.props.onChangeSection.bind(this, 'findCircles')}>
                {localizations.find_public_circle_title}
                </div>

                {user && 
                    <div style={activeSection === 'myCircles' ? styles.menuActive : styles.menu}
                        onClick={this.props.onChangeSection.bind(this, 'myCircles')}>
                        {localizations.circles_title}
                    </div>
                }

                {user && user.subAccounts && user.subAccounts.length > 0 &&
                    <div style={activeSection === 'subAccounts' ? styles.menuActive : styles.menu}
                        onClick={this.props.onChangeSection.bind(this, 'subAccounts')}>
                        {user.profileType === 'PERSON' ? localizations.circles_subAccounts_children : localizations.circles_subAccounts_teams}
                    </div>
                }

                {user && user.circlesUserIsIn && user.circlesUserIsIn.edges && user.circlesUserIsIn.edges.length > 0 && 
                    <div style={activeSection === 'sportClubs' ? styles.menuActive : styles.menu}
                        onClick={this.props.onChangeSection.bind(this, 'sportClubs')}>
                        {localizations.find_my_sport_clubs}
                    </div>
                }
                
                {user && user.profileType !== 'PERSON' && ((user.circles && user.circles.edges && user.circles.edges.length > 0) || (user.circlesSuperUser && user.circlesSuperUser.edges && user.circlesSuperUser.edges.length > 0)) && 
                    <div style={activeSection === 'membersInfo' ? styles.menuActive : styles.menu}
                        onClick={this.props.onChangeSection.bind(this, 'membersInfo')}>
                        {localizations.circles_information}
                    </div>
                }

                {user && user.profileType !== 'PERSON' && ((user.circles && user.circles.edges && user.circles.edges.length > 0) || (user.circlesSuperUser && user.circlesSuperUser.edges && user.circlesSuperUser.edges.length > 0)) && 
                    <div style={activeSection === 'paymentModels' ? styles.menuActive : styles.menu}
                        onClick={this.props.onChangeSection.bind(this, 'paymentModels')}>
                        {localizations.circles_paymentModels}
                    </div>
                }
                {user && user.profileType !== 'PERSON' && ((user.circles && user.circles.edges && user.circles.edges.length > 0) || (user.circlesSuperUser && user.circlesSuperUser.edges && user.circlesSuperUser.edges.length > 0)) &&
                    <div style={activeSection === 'termOfUse' ? styles.menuActive : styles.menu}
                        onClick={this.props.onChangeSection.bind(this, 'termOfUse')}>
                        {localizations.circles_termOfUse}
                    </div>
                }
			</section>
		)
	}
}

styles = {
    container: {
        margin: 15,
        width: 200,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        fontFamily: 'Lato',
        margin: metrics.margin.medium,
        position: 'relative'
    },
	menu: {
		fontFamily: 'Lato',
		fontSize: 16,
		color: colors.black,
		margin: '10px 15px 10px 15px',
		//marginLeft: 15,
		cursor: 'pointer',
        position: 'relative',
        width: '100%'
	},
	menuActive: {
		fontFamily: 'Lato',
		fontSize: 16,
		color: colors.blue,
		border: '1px solid ' + colors.blue,
		padding: '10px 15px',
		borderLeft: '5px solid ' + colors.blue,
		cursor: 'pointer',
        position: 'relative',
        width: '100%',
        fontWeight: 'bold'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: colors.blue,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'rgba(0,0,0,0.65)',
    },
}

export default LeftSide
