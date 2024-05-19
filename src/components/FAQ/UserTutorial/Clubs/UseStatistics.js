import React, { Component } from 'react';
import {createFragmentContainer, graphql} from 'react-relay';

import Header from '../../../common/Header/Header'
import Footer from '../../../common/Footer/Footer'
import Loading from '../../../common/Loading/Loading'
import localizations from '../../../Localizations'

import Radium from 'radium';
import styles from '../styles';


class UserTutorialUseStatistics extends Component {
  constructor(props) {
    super(props)
    this.state = {
      language: localizations.getLanguage(),
    }
  }

  _setLanguage = (language) => {
    this.setState({ language: language })
  }

  render() {
    const { viewer } = this.props

    return (
      <div style={styles.container}>
        <div style={styles.content}>
            <div style={styles.title}>
                {localizations.faq_team_tutorial_use_statistics_title}
            </div>
            <div style={styles.body}>
                <ol style={styles.orderedList}>
                    <li style={styles.paragraph}>
                        <span>{localizations.faq_team_tutorial_use_statistics_step1_title}</span>
                        <div style={styles.row}>
                          <div style={styles.biggerColumn}>
                            <img style={styles.image} src="/images/faq/user-tutorial/use-statistics-1.jpg"/>
                          </div>
                        </div>
                    </li>
                    <li style={styles.paragraph}>
                        <span>{localizations.faq_team_tutorial_use_statistics_step2_title}</span>
                        <div style={styles.row}>
                          <div style={styles.biggerColumn}>
                            <img style={styles.image} src="/images/faq/user-tutorial/use-statistics-2.jpg"/>
                          </div>
                        </div>
                        <span style={styles.rowNoteTop}>{localizations.faq_team_tutorial_use_statistics_step2_note}</span>
                    </li>
                    <li style={styles.paragraph}>
                        <span>{localizations.faq_team_tutorial_use_statistics_step3_title}</span>
                        <div style={styles.row}>
                          <div style={styles.biggerColumn}>
                            <img style={styles.image} src="/images/faq/user-tutorial/use-statistics-3.jpg"/>
                          </div>
                        </div>
                    </li>
                    <li style={styles.paragraph}>
                        <span>{localizations.faq_team_tutorial_use_statistics_step4_title}</span>
                        <div style={styles.row}>
                          <div style={styles.biggerColumn}>
                            <img style={styles.image} src="/images/faq/user-tutorial/use-statistics-4.jpg"/>
                          </div>
                        </div>
                    </li>
                    <li style={styles.paragraph}>
                        <span>{localizations.faq_team_tutorial_use_statistics_step5_title}</span>
                        <div style={styles.row}>
                          <div style={styles.biggerColumn}>
                            <img style={styles.image} src="/images/faq/user-tutorial/use-statistics-5.png"/>
                          </div>
                        </div>
                        <span style={styles.rowNoteTop}>{localizations.faq_team_tutorial_use_statistics_step5_note1}</span>
                        <div style={styles.row}>
                          <div style={styles.column}>
                            <img style={styles.image} src="/images/faq/user-tutorial/use-statistics-5.1.png"/>
                          </div>
                        </div>
                        <span style={styles.rowNoteTop}>{localizations.faq_team_tutorial_use_statistics_step5_note2}</span>
                        <div style={styles.row}>
                          <div style={styles.biggerColumn}>
                            <img style={styles.image} src="/images/faq/user-tutorial/use-statistics-5.2.png"/>
                          </div>
                        </div>
                    </li>
                </ol>
            </div>
        </div>
      </div>

    );
  }
}


export default createFragmentContainer(Radium(UserTutorialUseStatistics), {
  viewer: graphql`
    fragment UseStatistics_viewer on Viewer {
      id
      me {
        id
        pseudo
      }
    }
  `,
});
