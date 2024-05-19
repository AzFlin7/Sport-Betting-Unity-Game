import React from 'react';
import localizations from '../Localizations';
import { colors } from '../../theme';

let styles;

class LeftSide extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { activeSection, isProfileComplete, viewer } = this.props;
    return (
      <section>
        <div
          style={activeSection === 'my-info' ? styles.menuActive : styles.menu}
          onClick={this.props.onChangeSection.bind(this, 'my-info')}
        >
          {localizations.info_myInfo}
        </div>

        {/*viewer.me && viewer.me.profileType === 'PERSON' && (
          <div
            style={
              activeSection === 'circle_forms' ? styles.menuActive : styles.menu
            }
            onClick={this.props.onChangeSection.bind(this, 'circle_forms')}
          >
            {localizations.circles_information}
          </div>
        )}
        {viewer.me && viewer.me.profileType === 'PERSON' && (
          <div
            style={
              activeSection === 'circle_fees' ? styles.menuActive : styles.menu
            }
            onClick={this.props.onChangeSection.bind(this, 'circle_fees')}
          >
            {localizations.circles_myPaymentModels}
          </div>
          )*/}

        {/*isProfileComplete &&
					<div style={activeSection === 'payment' ? styles.menuActive : styles.menu}
						onClick={this.props.onChangeSection.bind(this, 'payment')}>
						{localizations.info_paymentMethods}
					</div>
				*/}

        {/*isProfileComplete &&
					<div style={activeSection === 'bank' ? styles.menuActive : styles.menu}
						onClick={this.props.onChangeSection.bind(this, 'bank')}>
						{localizations.info_bankAccount}
					</div>
				*/}

        <div
          style={
            activeSection === 'password' ? styles.menuActive : styles.menu
          }
          onClick={this.props.onChangeSection.bind(this, 'password')}
        >
          {localizations.info_password}
        </div>

        <div
          style={
            activeSection === 'notification' ? styles.menuActive : styles.menu
          }
          onClick={this.props.onChangeSection.bind(this, 'notification')}
        >
          {localizations.info_notification}
        </div>

        {/*isProfileComplete &&
					<div style={activeSection === 'wallet' ? styles.menuActive : styles.menu}
						onClick={this.props.onChangeSection.bind(this, 'wallet')}>
						{localizations.info_wallet_title}
					</div>
				*/}

        <div
          style={
            activeSection === 'statistics' ? styles.menuActive : styles.menu
          }
          onClick={this.props.onChangeSection.bind(this, 'statistics')}
        >
          {localizations.info_statistics}
        </div>

        {/* {!this.props.viewer.me.isSubAccount &&
					<div style={activeSection === 'user-preferences' ? styles.menuActive : styles.menu}
						onClick={this.props.onChangeSection.bind(this, 'user-preferences')}>
						{localizations.info_userPreferences}
					</div>
				} */}

        <div
          style={
            activeSection === 'share-access' ? styles.menuActive : styles.menu
          }
          onClick={this.props.onChangeSection.bind(this, 'share-access')}
        >
          {localizations.accessshare_title}
        </div>

        <div
          style={
            activeSection === 'sync-calendar' ? styles.menuActive : styles.menu
          }
          onClick={this.props.onChangeSection.bind(this, 'sync-calendar')}
        >
          {localizations.synchronize_calendar_title}
        </div>

        {/*<div*/}
          {/*style={activeSection === 'wallet' ? styles.menuActive : styles.menu}*/}
          {/*onClick={this.props.onChangeSection.bind(this, 'wallet')}*/}
        {/*>*/}
          {/*{localizations.info_wallet_title}*/}
        {/*</div>*/}
      </section>
    );
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
  },
  menuActive: {
    fontFamily: 'Lato',
    fontSize: 16,
    color: colors.blue,
    border: `1px solid ${colors.blue}`,
    padding: '10px 15px',
    borderLeft: `5px solid ${colors.blue}`,
    cursor: 'pointer',
  },
};

export default LeftSide;
