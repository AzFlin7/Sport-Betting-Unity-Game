import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';

import { colors, fonts } from '../../theme'

import InfoLegal from './InfoLegal'
import InfoNatural from './InfoNatural'
import localizations from '../Localizations'
import Payment from './Payment'
import BankAccount from './BankAccount'
import Wallet from './Wallet/index'

let styles

let profileType = [];
profileType["PERSON"] = localizations.register_user_type_person;
profileType["BUSINESS"] = localizations.register_user_type_business;
profileType["ORGANIZATION"] = localizations.register_user_type_organization;
profileType["SOLETRADER"] = localizations.register_user_type_soletrader;

class Info extends React.Component {
	constructor(props) {
		super(props)

	}

	render() {
		const { user, isProfileComplete } = this.props

		return(
			<section style={styles.container}>
				<div style={styles.header}>{localizations.info_myInfo}</div>
				<div style={styles.explanation}>
					{localizations.info_myInfo_explanaition}
				</div>
				<div style={styles.row} >
					<div style={styles.label}>{localizations.info_profileType}</div>
					<div style={styles.value}>{profileType[user.profileType]}</div>
				</div>
				<div style={styles.row} >
					{ user.profileType.toUpperCase() === 'PERSON'
							? <InfoNatural user={this.props.user} viewer={this.props.viewer} {...this.props}/>
							: <InfoLegal user={this.props.user} viewer={this.props.viewer} {...this.props} /> }
				</div>
				<Payment {...this.props} />
				<BankAccount {...this.props} />
				{/* wallet has its own tab */}
				{/*<Wallet {...this.props} />*/}

			</section>
		)
	}
}

styles = {
	header: {
		fontFamily: 'Lato',
		fontSize: 20,
		fontWeight: 'bold',
		color: colors.blue,
		marginBottom: 15,
	},
	container: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
	},
	explanation: {
		fontSize: 16,
		lineHeight: '24px',
		color: colors.black,
		fontStyle: 'italic',
		marginBottom: 30
	},
	row: {
		display: 'flex',
		flexDirection: 'row',
		width: '100%',
	},
	label: {
		fontSize: 16,
		height: '32px',
    lineHeight: '32px',
		width: 180,
		color: colors.black,
	},
	value: {
		fontSize: 16,
		height: '32px',
    lineHeight: '32px',
		color: colors.black,
	},
	input: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '32px',
    lineHeight: '32px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    display: 'block',
    background: 'transparent',
    marginBottom: '20px',
    //width: '100%',
    fontSize: fonts.size.medium,
    outline: 'none',
  },
}

export default createFragmentContainer(Info, {
  user: graphql`
    fragment MyInfoInfo_user on User {
          ...InfoLegal_user
          ...InfoNatural_user
          ...BankAccount_user
          ...Payment_user
		  profileType
		  isProfileComplete
      }
  `,
  viewer: graphql`
    fragment MyInfoInfo_viewer on Viewer {
              ...InfoLegal_viewer
              ...InfoNatural_viewer
              ...Payment_viewer
              ...BankAccount_viewer
              ...Wallet_viewer
          }
  `,
})
