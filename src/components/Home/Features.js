import React, { Component } from 'react';
import FeaturesItem from './common/FeaturesItem';
import localizations from '../Localizations'

import Radium from 'radium';
let styles;

const items = [{
        header: localizations.home_section1Title,
        icon: 'fa fa-search',
        text: localizations.home_section1Desc,
    },
    {
        header: localizations.home_section2Title,
        icon: 'fa fa-calendar',
        text: localizations.home_section2Desc,
    },
    {
        header: localizations.home_section3Title,
        icon: 'fa fa-thumbs-o-up',
        text: localizations.home_section3Desc,
    },
];

class Features extends Component {
    constructor(props) {
        super(props)
        this.state = {
            displayItems: false
        }
    }

    componentDidMount() {
        this.setState({ displayItems: true })
    }

    render() {
        return (
        !this.state.displayItems 
        ?   <div></div> 
        :   <div style={styles.container}>
                <FeaturesItem 
                    key={1}
                    Title={localizations.home_feature_circle_title}
                    descr={localizations.home_feature_circle_desc}
                    router={this.props.router}
                    image='/images/Group.png'                     
                />
                <FeaturesItem 
                    key={ 2 }
                    Title={localizations.home_feature_organise_title}
                    descr={localizations.home_feature_organise_desc}
                    router={this.props.router}
                    image='/images/organise.png' 
                />
                <FeaturesItem 
                    key={ 3 }
                    Title={localizations.home_feature_event_title}
                    descr={localizations.home_feature_event_desc}
                    router={this.props.router}
                    image='/images/s-icone.png' 
                />
                <FeaturesItem 
                    key={ 4 }
                    Title={localizations.home_feature_chat_title}
                    descr={localizations.home_feature_chat_desc}
                    router={this.props.router}
                    image='/images/chat.png' 
                />
                <FeaturesItem 
                    key={ 5 }
                    Title={localizations.home_feature_notif_title}
                    descr={localizations.home_feature_notif_desc}
                    router={this.props.router}
                    image='/images/notif.png' 
                />
                <FeaturesItem 
                    key={ 6 }
                    Title={localizations.home_feature_calendar_title}
                    descr={localizations.home_feature_calendar_desc}
                    router={this.props.router}
                    image='/images/calendar-01.png' 
                />
            </div>
        );
    }
}


styles = {
    container: {
        margin: '2%',
        // height: '320px',
        height: 'auto',
        display: 'flex',
        justifyContent: 'space-evenly',
        flexWrap: 'wrap',
        '@media (max-width: 768px)': {
            margin: '2% 15px',
        },
        '@media (max-width: 480px)': {
            margin: '2% auto',
            display: 'block',
            height: 'auto'
        }
    },
};


export default Radium(Features);