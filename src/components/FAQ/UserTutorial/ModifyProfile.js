import React, { Component } from 'react';
import {createFragmentContainer, graphql} from 'react-relay';
import { Link } from 'found'

import Header from '../../common/Header/Header.js'
import Footer from '../../common/Footer/Footer'
import Loading from '../../common/Loading/Loading'
import localizations from '../../Localizations'

import Radium from 'radium';
import styles from './styles';

class ModifyProfile extends Component {
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
                {localizations.faq_tutorial_modify_profile_title}
            </div>
            <div style={styles.body}>
                <div style={styles.sectionTitle}>
                    {localizations.faq_tutorial_modify_profile_subtitle}
                </div>
                <div style={styles.sectionContent}>
                    <div style={styles.sectionIntro}>
                        {localizations.faq_tutorial_modify_profile_intro}
                    </div>
                    <div style={styles.row}>
                        <div style={styles.column}>
                            <img style={styles.image} src="/images/faq/user-tutorial/modify-profile-1.png"/>
                            <span style={styles.imageNote}>{localizations.faq_tutorial_modify_profile_pic1_note}</span>
                        </div>
                        <div style={styles.column}>
                            <img style={styles.image} src="/images/faq/user-tutorial/modify-profile-2.png"/>
                            <span style={styles.imageNote}>{localizations.faq_tutorial_modify_profile_pic2_note}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

    );
  }
}

export default createFragmentContainer(Radium(ModifyProfile), {
  viewer: graphql`
    fragment ModifyProfile_viewer on Viewer {
      id
      me {
        id
        pseudo
      }
    }
  `,
});