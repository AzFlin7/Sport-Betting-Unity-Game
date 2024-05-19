import React from 'react';
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import localizations from '../../Localizations';

import styles from './styles';

class ClubSteps extends React.Component {
  render() {
    let { user, tutorialSteps } = this.props;
    let stepNumbers = [8,7,6,5,4,3,2,1];
    return (
      <List component="nav">
        {!user.isSubAccount && <ListItem button>
          <div style={styles.listItemWrapper}>
            <div style={styles.stepIconContainer}>
              <div style={styles.stepNumber}>{stepNumbers.pop()}</div>
              <i
                className='fa fa-users'
                style={styles.iconStep}
              />
            </div>
            <div style={styles.stepTextContainer} onClick={() => {
              this.props.router.push('/share-access');
              this.props.onClose()
            }}>
              <div style={styles.stepTitle}>
                {localizations.stepper_modal_club_create_teams}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_club_create_teams_description_1}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_club_create_teams_description_2}
              </div>
            </div>
            {tutorialSteps && tutorialSteps.createSubAccountStep
              ? <div>
                <i
                  className='fa fa-check'
                  style={styles.iconChecked}
                />
              </div>
              : <div style={styles.skipStep} onClick={() => this.props.onSkipStep('createSubAccountStep')}>
                {localizations.stepper_modal_organize_skip}
              </div>
            }
          </div>
        </ListItem>
        }
        <ListItem button>
          <div style={styles.listItemWrapper}>
            <div style={styles.stepIconContainer}>
              <div style={styles.stepNumber}>{stepNumbers.pop()}</div>
              <i
                className='fa fa-key'
                style={styles.iconStep}
              />
            </div>
            <div style={styles.stepTextContainer} onClick={() => {
              this.props.router.push('/share-access');
              this.props.onClose()
            }}>
              <div style={styles.stepTitle}>
                {localizations.stepper_modal_club_give_access}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_club_give_access_description_1}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_give_access_description_2}
              </div>
            </div>
            {tutorialSteps && tutorialSteps.shareAccessStep
              ? <div>
                <i
                  className='fa fa-check'
                  style={styles.iconChecked}
                />
              </div>
              : <div style={styles.skipStep} onClick={() => this.props.onSkipStep('shareAccessStep')}>
                {localizations.stepper_modal_organize_skip}
              </div>
            }
          </div>
        </ListItem>
        <ListItem button>
          <div style={styles.listItemWrapper}>
            <div style={styles.stepIconContainer}>
              <div style={styles.stepNumber}>{stepNumbers.pop()}</div>
              <div style={{ ...styles.linkImage, backgroundImage: 'url(/images/stepper/add_group_icon.svg)' }}/>
            </div>
            <div style={styles.stepTextContainer} onClick={() => {
              this.props.router.push('/new-group');
              this.props.onClose()
            }}>
              <div style={styles.stepTitle}>
                {localizations.stepper_modal_club_create_group}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_club_create_group_description_1}
              </div>
            </div>
            {tutorialSteps && tutorialSteps.createCircleStep
              ? <div>
                <i
                  className='fa fa-check'
                  style={styles.iconChecked}
                />
              </div>
              : <div style={styles.skipStep} onClick={() => this.props.onSkipStep('createCircleStep')}>
                {localizations.stepper_modal_organize_skip}
              </div>
            }
          </div>
        </ListItem>
        <ListItem button>
          <div style={styles.listItemWrapper}>
            <div style={styles.stepIconContainer}>
              <div style={styles.stepNumber}>{stepNumbers.pop()}</div>
              <i
                className='fa fa-plus-circle'
                style={styles.iconStep}
              />
            </div>
            <div style={styles.stepTextContainer} onClick={() => {
                this.props.router.push('/new-sportunity');
                this.props.onClose()
              }}>
              <div style={styles.stepTitle}>
                {localizations.stepper_modal_club_organize_activity}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_club_organize_activity_description_1}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_club_organize_activity_description_2}
              </div>
            </div>
            {tutorialSteps && tutorialSteps.organizeStep
              ? <div>
                <i
                  className='fa fa-check'
                  style={styles.iconChecked}
                />
              </div>
              : <div style={styles.skipStep} onClick={() => this.props.onSkipStep('organizeStep')}>
                {localizations.stepper_modal_organize_skip}
              </div>
            }
          </div>
        </ListItem>
        <ListItem button>
          <div style={styles.listItemWrapper}>
            <div style={styles.stepIconContainer}>
              <div style={styles.stepNumber}>{stepNumbers.pop()}</div>
              <div style={{ ...styles.linkImage, backgroundImage: 'url(/images/stepper/statistic_black.png)' }}/>
            </div>
            <div style={styles.stepTextContainer} onClick={() => {
              this.props.router.push(`/statistics`);
              this.props.onClose()
            }}>
              <div style={styles.stepTitle}>
                {localizations.stepper_modal_club_stats}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_club_stats_description_1}
              </div>
            </div>
            {tutorialSteps && tutorialSteps.setupStatisticsStep
              ? <div>
                <i
                  className='fa fa-check'
                  style={styles.iconChecked}
                />
              </div>
              : <div style={styles.skipStep} onClick={() => this.props.onSkipStep('setupStatisticsStep')}>
                {localizations.stepper_modal_organize_skip}
              </div>
            }
          </div>
        </ListItem>
        <ListItem button>
          <div style={styles.listItemWrapper}>
            <div style={styles.stepIconContainer}>
              <div style={styles.stepNumber}>{stepNumbers.pop()}</div>
              <i
                className='fa fa-wpforms'
                style={styles.iconStep}
              />
            </div>
            <div style={styles.stepTextContainer} onClick={() => {
              this.props.router.push('/my-circles/members-info');
              this.props.onClose()
            }}>
              <div style={styles.stepTitle}>
                {localizations.stepper_modal_club_form}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_club_form_description_1}
              </div>
            </div>
            {tutorialSteps && tutorialSteps.createFormStep
              ? <div>
                <i
                  className='fa fa-check'
                  style={styles.iconChecked}
                />
              </div>
              : <div style={styles.skipStep} onClick={() => this.props.onSkipStep('createFormStep')}>
                {localizations.stepper_modal_organize_skip}
              </div>
            }
          </div>
        </ListItem>
        <ListItem button>
          <div style={styles.listItemWrapper}>
            <div style={styles.stepIconContainer}>
              <div style={styles.stepNumber}>{stepNumbers.pop()}</div>
              <i
                className='fa fa-money'
                style={styles.iconStep}
              />
            </div>
            <div style={styles.stepTextContainer} onClick={() => {
              this.props.router.push('/my-circles/payment-models');
              this.props.onClose()
            }}>
              <div style={styles.stepTitle}>
                {localizations.stepper_modal_club_subscription}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_club_subscription_description_1}
              </div>
            </div>
            {tutorialSteps && tutorialSteps.setupMembersSubscriptionStep
              ? <div>
                <i
                  className='fa fa-check'
                  style={styles.iconChecked}
                />
              </div>
              : <div style={styles.skipStep} onClick={() => this.props.onSkipStep('setupMembersSubscriptionStep')}>
                {localizations.stepper_modal_organize_skip}
              </div>
            }
          </div>
        </ListItem>
        <ListItem button>
          <div style={styles.listItemWrapper}>
            <div style={styles.stepIconContainer}>
              <div style={styles.stepNumber}>{stepNumbers.pop()}</div>
              <div style={{ ...styles.linkImage, backgroundImage: 'url(/images/stepper/valid-document.svg)' }}/>
            </div>
            <div style={styles.stepTextContainer} onClick={() => {
              this.props.router.push('/my-circles/terms-of-uses');
              this.props.onClose()
            }}>
              <div style={styles.stepTitle}>
                {localizations.stepper_modal_club_documents}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_club_documents_description_1}
              </div>
            </div>
            {tutorialSteps && tutorialSteps.addOfficialDocumentsStep
              ? <div>
                <i
                  className='fa fa-check'
                  style={styles.iconChecked}
                />
              </div>
              : <div style={styles.skipStep} onClick={() => this.props.onSkipStep('addOfficialDocumentsStep')}>
                {localizations.stepper_modal_organize_skip}
              </div>
            }
          </div>
        </ListItem>
      </List>);
  }
}

export default ClubSteps;