import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import Radium from 'radium';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import localizations from '../Localizations'
import { colors, fonts, metrics } from '../../theme'

let styles;

import Sport from './Sport'
import AddSport from '../Profile/AddSport';


class ProfileSports extends PureComponent {
  render() {
    const { viewer, onAddSport, sports, onDeleteSport, isSelfProfile } = this.props;

    return(
			<div style={styles.container}>
        <h2 style={styles.title}>{localizations.profileView_sports}</h2>
        {sports && sports.length
          ? <div style={styles.sportsContainer}>
              {sports.map((sport, index) => (
                <Sport 
                  key={sport.sport.id + index} 
                  style={styles.cards} 
                  sport={sport} 
                  onDeleteSport={onDeleteSport} 
                />
              ))}
            </div>
          : <p style={styles.description}>
              {isSelfProfile
              ? localizations.profileView_no_sport_selected_you
              : `${this.props.user.pseudo} ${localizations.profileView_no_sport_selected}.`
              }
            </p>
        }
        {isSelfProfile && 
          <div style={styles.buttonContainer}>
            <AddSport
              viewer={viewer}
              onAddSport={onAddSport}
              onDeleteSport={onDeleteSport}
            />
          </div>
        }
      </div>
    )
  }
}


styles = {
  container: {
    paddingLeft: 40,
    paddingRight: 40
  },
  sportsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    '@media (maxWidth: 610px)': {
      width: 400
    },
    '@media (maxWidth: 425px)': {
      width: 300
    }
  },
	title: {
    paddingTop: 20,
    paddingBottom: 20,
    fontSize: 32,
    fontWeight: 500,
  },
  description: {
    fontSize: 18,
    lineHeight: 1.2,
    paddingLeft: 40,
    paddingTop: 20,
    paddingBottom: 10,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  }
};

export default createFragmentContainer(Radium(ProfileSports), {
  viewer: graphql`
    fragment ProfileSports_viewer on Viewer {
      ...AddSport_viewer
    }
  `,
  sports: graphql`
    fragment ProfileSports_sports on SportDescriptor @relay(plural: true) {
      sport {
        id
        name {
          EN
          FR
          DE
        }
        logo
      }
      levels {
        id
        EN {
          name
        }
        FR {
          name
        }
        DE {
          name
        }
      }
      certificates {
        certificate {
          name {
            EN
            FR
            DE
          }
        }
      }
      positions {
        EN
        FR
        DE
      }
      assistantType {
        name {
          EN,
          FR,
          DE
        }
      }
    }
  `,
});
