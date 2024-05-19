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


class ManageAClubTutorial extends Component {
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
                        {localizations.faq_team_tutorial_manage_a_club_title} 
                    </div> 
                    <div style={styles.body}>
                        <div style={styles.sectionTitle}> 
                            {localizations.faq_team_tutorial_manage_a_club_subtitle}
                        </div> 
                        <ol style={styles.orderedList}>
                            <li style={styles.paragraph}>
                                <span> 
                                    {localizations.faq_team_tutorial_manage_a_club_step1_title} 
                                </span> 
                                <span style={styles.rowNoteTop}> 
                                    {localizations.faq_team_tutorial_manage_a_club_step1_note} 
                                </span> 
                                <div style={styles.row}>
                                    <div style={styles.biggerColumn}>
                                        <img style={styles.image} src="/images/faq/user-tutorial/manage-club-1.png" />
                                    </div> 
                                </div > 
                            </li> 
                            <li style={styles.paragraph}>
                                <span> 
                                    {localizations.faq_team_tutorial_manage_a_club_step2_title} 
                                </span> 
                                <div style={styles.row}>
                                    <div style={styles.column}>
                                        <img style={styles.image} src = "/images/faq/user-tutorial/manage-club-2.png" />
                                    </div> 
                                </div > 
                                <span style={styles.rowNoteTop}> 
                                    {localizations.faq_team_tutorial_manage_a_club_step2_note} 
                                </span> 
                            </li> 
                            <li style={styles.paragraph}>
                                <span> 
                                    {localizations.faq_team_tutorial_manage_a_club_step3_title} 
                                </span> 
                                <div style={styles.row}>
                                    <div style={styles.column}>
                                        <img style={styles.image} src="/images/faq/user-tutorial/manage-club-3-1.png" />
                                    </div> 
                                </div > 
                                <span style={styles.rowNoteTop}> 
                                    {localizations.faq_team_tutorial_manage_a_club_step3_note1} 
                                </span> 
                                <div style={styles.row}>
                                    <div style={styles.column}>
                                        <img style={styles.image} src="/images/faq/user-tutorial/manage-club-3-2.png" />
                                    </div> 
                                </div > 
                                <span style={styles.rowNoteTop}> 
                                    {localizations.faq_team_tutorial_manage_a_club_step3_note2} 
                                </span> 
                                <div style={styles.row}>
                                    <div style={styles.column}>
                                        <img style={styles.image} src="/images/faq/user-tutorial/manage-club-3-3.png" />
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

export default createFragmentContainer(Radium(ManageAClubTutorial), {
    viewer: graphql`
      fragment ManageAClub_viewer on Viewer {
        id
        me {
          id
          pseudo
        }
      }
    `,
});
