import React from 'react';
import Radium from 'radium';
import { createFragmentContainer, graphql } from 'react-relay/compat';

import Circle from './CircleRow';
import { colors } from '../../theme';
import localizations from '../Localizations';

let styles;

const Title = ({ children }) => <h2 style={styles.title}>{children}</h2>;

const GameInformationRow = ({ sportunity, language }) => {
  return sportunity.game_information &&
    sportunity.game_information.opponent &&
    (sportunity.game_information.opponent.organizer ||
      sportunity.game_information.opponent.organizerPseudo) ? (
    <article style={styles.container}>
      <section style={styles.section}>
        <Title>{localizations.newSportunity_opponent}</Title>
        <Circle
          name={
            sportunity.game_information.opponent.organizer
              ? sportunity.game_information.opponent.organizer.pseudo
              : sportunity.game_information.opponent.organizerPseudo || ''
          }
          link={
            sportunity.game_information.opponent.organizer
              ? `/profile-view/${
                  sportunity.game_information.opponent.organizer.id
                }`
              : null
          }
          image={
            sportunity.game_information.opponent.organizer
              ? sportunity.game_information.opponent.organizer.avatar
              : 'https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png'
          }
          isAdmin={false}
        />
      </section>
    </article>
  ) : sportunity.game_information &&
    sportunity.game_information.opponent &&
    sportunity.game_information.opponent.unknownOpponent ? (
    <article style={styles.container}>
      <section style={styles.section}>
        <Title>{localizations.newSportunity_opponent}</Title>
        <Circle
          name={localizations.newSportunity_unknown_opponent_short}
          image={
            'https://sportunitydiag304.blob.core.windows.net/avatars/default-avatar.png'
          }
          isAdmin={false}
        />
      </section>
    </article>
  ) : null;
};

styles = {
  container: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    fontFamily: 'Lato',
    '@media (max-width: 480px)': {
      display: 'block',
    },
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    borderBottom: `1px solid ${colors.lightGray}`,
  },
  title: {
    display: 'flex',
    padding: '20px 20px',
    fontSize: '25px',
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.65)',
    borderBottom: `1px solid ${colors.lightGray}`,
    marginTop: 20,
  },
};

export default createFragmentContainer(Radium(GameInformationRow), {
  sportunity: graphql`
    fragment GameInformationRow_sportunity on Sportunity {
      game_information {
        opponent {
          organizer {
            id
            pseudo
            avatar
          }
          organizerPseudo
          lookingForAnOpponent
          unknownOpponent
          invitedOpponents(last: 5) {
            edges {
              node {
                id
                name
                memberCount
                members {
                  id
                }
              }
            }
          }
        }
      }
    }
  `,
});
