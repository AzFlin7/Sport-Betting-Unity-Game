import React from 'react'
import localizations from '../Localizations'
import TutorialModal from '../common/Tutorial/index.js'
import { colors } from '../../theme'

let styles

class LeftSide extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			tutorial5IsVisible: false
		}
	}

	componentWillReceiveProps = (nextProps) => {
		if (this.props.viewer && this.props.viewer.me && this.props.viewer.me.id && !this.props.viewer.superMe && nextProps.viewer.superMe && (nextProps.viewer.superMe.profileType === 'BUSINESS' || nextProps.viewer.superMe.profileType === 'ORGANIZATION')) {
			setTimeout(() => 
				this.setState({
					tutorial5IsVisible: true
				}), 1000
			);
		}
	}

	render() {
		const { activeSection, circle } = this.props
		return(
			<section style={{position: 'relative'}}>
				<div style={activeSection === 'members' ? styles.menuActive : styles.menu}
                    onClick={this.props.onChangeSection.bind(this, 'members')}>
                    {localizations.circles_members}
                </div>

				<div style={activeSection === 'parameters' ? styles.menuActive : styles.menu}
					onClick={() => {this.setState({tutorial5IsVisible: false}); this.props.onChangeSection('parameters')}}>
					{localizations.circles_parameters}
				
					<TutorialModal
						isOpen={this.state.tutorial5IsVisible}
						tutorialNumber={6}
						tutorialName={"team_small_tutorial5"}
						message={localizations.team_small_tutorial5}
						confirmLabel={localizations.team_small_tutorial_ok}
						onPass={() => this.setState({tutorial5IsVisible: false})}
						position={{
							top: 30,
							left: 25
						}}
						arrowPosition= {{
							top: -8,
							left: 25
						}}
					/>
				</div>

				<div style={activeSection === 'information' ? styles.menuActive : styles.menu}
                    onClick={this.props.onChangeSection.bind(this, 'information')}>
                    {localizations.circles_information}
                </div>
			</section>
		)
	}
}

styles = {
	menu: {
		fontFamily: 'Lato',
		fontSize: 16,
		color: colors.black,
		marginTop: 22,
		marginBottom: 17,
		marginLeft: 15,
		cursor: 'pointer',
		position: 'relative'
	},
	menuActive: {
		fontFamily: 'Lato',
		fontSize: 16,
		color: colors.blue,
		border: '1px solid ' + colors.blue,
		padding: '10px 15px',
		borderLeft: '5px solid ' + colors.blue,
		cursor: 'pointer',
		position: 'relative'
	},
}

export default LeftSide
