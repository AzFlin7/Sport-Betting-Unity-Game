import React, { Component } from 'react';
import QuickTip from '../common/Sportunity/QuickTip'

import localizations from '../Localizations'

let styles;

class FAQLinks extends Component {
  render() {

    return (
      <div>
        <QuickTip
          link="/faq/how-to-follow-organizer"
          icon="calendar"
          messageHeader={localizations.faq_tutorial_follow_organiser[0]}
          messageBody={localizations.faq_tutorial_follow_organiser[1]}
        />
        <QuickTip
          link="/faq/how-to-modify-profile"
          icon="bolt"
          messageHeader={localizations.faq_tutorial_modify_profile[0]}
          messageBody={localizations.faq_tutorial_modify_profile[1]}
        />
      </div>
    );
  }
}


export default FAQLinks;
