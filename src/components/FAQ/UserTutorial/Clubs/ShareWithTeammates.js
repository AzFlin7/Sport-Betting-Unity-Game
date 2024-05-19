import React, {
    Component
}
from 'react';
import {createFragmentContainer, graphql} from 'react-relay';

import Header from '../../../common/Header/Header'
import Footer from '../../../common/Footer/Footer'
import Loading from '../../../common/Loading/Loading'
import localizations from '../../../Localizations'

import Radium from 'radium';
import styles from '../styles';


class UserTutorial extends Component {
    constructor(props) {
        super(props)
        this.state = {
            language: localizations.getLanguage()
        , }
    }

    _setLanguage = (language) => {
        this.setState({
            language: language
        })
    }

    render() {
        const {
            viewer
        } = this.props

        return ( 
            <div style={styles.container}> 
                <div style={styles.content}>
                    <div style={styles.title}> 
                        {localizations.faq_team_tutorial_share_with_teammates_title} 
                    </div> 
                    <div style={styles.body}>
                        <div style={styles.sectionTitle}> 
                            {localizations.faq_team_tutorial_share_with_teammates_subtitle}
                        </div> 
                        <ol style={styles.orderedList}>
                            <li style={styles.paragraph}>
                                <span> 
                                    {localizations.faq_team_tutorial_share_with_teammates_step1_title} 
                                </span> 
                                <div style={styles.row}>
                                    <div style={styles.biggerColumn}>
                                        <img style={styles.image} src="/images/faq/user-tutorial/share-with-teammate-1.png" />
                                    </div> 
                                </div > 
                            </li> 
                            <li style={styles.paragraph}>
                                <span> 
                                    {localizations.faq_team_tutorial_share_with_teammates_step2_title} 
                                </span> 
                                <div style={styles.row}>
                                    <div style={styles.biggerColumn}>
                                        <img style={styles.image} src = "/images/faq/user-tutorial/share-with-teammate-2.png" />
                                    </div> 
                                </div > 
                            </li> 
                            <li style={styles.paragraph}>
                                <span> 
                                    {localizations.faq_team_tutorial_share_with_teammates_step3_title} 
                                </span> 
                                <div style={styles.row}>
                                    <div style={styles.column}>
                                        <a href="https://itunes.apple.com/us/app/sportunity/id1180429589?l=fr&ls=1&mt=8" > 
                                            <img style={styles.image} src = "/images/icon_appstore.png" /> 
                                        </a> 
                                    </div> 
                                    <div style={styles.column}>
                                        <a href="https://play.google.com/store/apps/details?id=com.sportunity"> 
                                            <img style={styles.image} src = "/images/icon_playstore.png" /> 
                                        </a> 
                                    </div> 
                                </div> 
                                <span style={styles.rowNoteTop}> 
                                    {localizations.faq_team_tutorial_share_with_teammates_step3_note} 
                                </span> 
                            </li> 
                            <li style={styles.paragraph}>
                                <span> 
                                    {localizations.faq_team_tutorial_share_with_teammates_step4_title} 
                                </span> 
                                <div style={styles.row}>
                                    <div style={styles.column}>
                                        <img style={styles.image} src="/images/faq/user-tutorial/share-with-teammate-3.jpg" />
                                    </div> 
                                    <div style={styles.biggerColumn} >
                                        <img style={styles.image} src = "/images/faq/user-tutorial/share-with-teammate-4.png" />
                                    </div> 
                                </div> 
                                <span style={styles.rowNoteTop}> 
                                    {localizations.faq_team_tutorial_share_with_teammates_step4_note} 
                                </span> 
                            </li> 
                            <li style={styles.paragraph}>
                                <span> 
                                    {localizations.faq_team_tutorial_share_with_teammates_step5_title} 
                                </span> 
                                <div style={styles.row}>
                                    <div style={styles.column}>
                                        <img style={styles.image} src = "/images/faq/user-tutorial/share-with-teammate-5.jpg" />
                                    </div> 
                                    <div style={styles.biggerColumn}>
                                        <img style={styles.image} src = "/images/faq/user-tutorial/share-with-teammate-6.jpg" />
                                    </div> 
                                </div > 
                            </li> 
                        </ol > 
                    </div> 
                </div >
            </div>
        );
    }
}

export default createFragmentContainer(Radium(UserTutorial), {
    viewer: graphql`
      fragment ShareWithTeammates_viewer on Viewer {
        id
        me {
          id
          pseudo
        }
      }
    `,
});
