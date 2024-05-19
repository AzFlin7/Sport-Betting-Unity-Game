import React from 'react';
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import localizations from '../../Localizations';
import { colors, fonts } from '../../../theme';

import styles from './styles';
class ClubSteps extends React.Component {
  render() {
    let { user, tutorialSteps } = this.props;
    let stepNumbers = [7,6,5,4,3,2,1];
    return (
      <List component="nav">
        <ListItem button>
          <div style={styles.listItemWrapper}>
            <div style={styles.stepIconContainer}>
              <div style={styles.stepNumber}>{stepNumbers.pop()}</div>
              <div style={{ ...styles.linkImage, backgroundImage: 'url(/images/stepper/private_group_icon.svg)' }}/>
            </div>
            <div style={styles.stepTextContainer} onClick={() => {
              this.props.router.push('/my-circles');
              this.props.onClose()
            }}>
              <div style={styles.stepTitle}>
                {localizations.stepper_modal_person_join_private_group}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_person_join_private_group_description_1}
              </div>
            </div>
            {tutorialSteps && tutorialSteps.joinAPrivateCircleStep
              ? <div>
                <i
                  className='fa fa-check'
                  style={styles.iconChecked}
                />
              </div>
              : <div style={styles.skipStep} onClick={() => this.props.onSkipStep('joinAPrivateCircleStep')}>
                {localizations.stepper_modal_organize_skip}
              </div>
            }
          </div>
        </ListItem>
        <ListItem button>
          <div style={styles.listItemWrapper}>
            <div style={styles.stepIconContainer}>
              <div style={styles.stepNumber}>{stepNumbers.pop()}</div>
              <div style={{ ...styles.linkImage, backgroundImage: 'url(/images/stepper/public_group_icon.svg)' }}/>
            </div>
            <div style={styles.stepTextContainer} onClick={() => {
              this.props.router.push({pathname:"/find-circles", showPublicCircles:true});
              this.props.onClose()
            }}>
              <div style={styles.stepTitle}>
                {localizations.stepper_modal_person_join_public_group}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_person_join_public_group_description_1}
              </div>
            </div>
            {tutorialSteps && tutorialSteps.joinAPublicCircleStep
              ? <div>
                <i
                  className='fa fa-check'
                  style={styles.iconChecked}
                />
              </div>
              : <div style={styles.skipStep} onClick={() => this.props.onSkipStep('joinAPublicCircleStep')}>
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
                className='fa fa-check'
                style={styles.iconStep}
              />
            </div>
            <div style={styles.stepTextContainer} onClick={() => {
              this.props.router.push('/my-events');
              this.props.onClose()
            }}>
              <div style={styles.stepTitle}>
                {localizations.stepper_modal_person_availability}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_person_availability_description_1}
              </div>
            </div>
            {tutorialSteps && tutorialSteps.giveAvailabilitiesStep
              ? <div>
                <i
                  className='fa fa-check'
                  style={styles.iconChecked}
                />
              </div>
              : <div style={styles.skipStep} onClick={() => this.props.onSkipStep('giveAvailabilitiesStep')}>
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
                className='fa fa-user'
                style={styles.iconStep}
              />
            </div>
            <div style={styles.stepTextContainer} onClick={() => {
              this.props.router.push(`/profile-view/${this.props.user.id}`);
              this.props.onClose()
            }}>
              <div style={styles.stepTitle}>
                {localizations.stepper_modal_person_profile}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_person_profile_description_1}
              </div>
            </div>
            {tutorialSteps && tutorialSteps.fulfilProfileStep
              ? <div>
                <i
                  className='fa fa-check'
                  style={styles.iconChecked}
                />
              </div>
              : <div style={styles.skipStep} onClick={() => this.props.onSkipStep('fulfilProfileStep')}>
                {localizations.stepper_modal_organize_skip}
              </div>
            }
          </div>
        </ListItem>
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
                {localizations.stepper_modal_person_kids_profile}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_person_kids_profile_description_1}
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
              <div style={{ ...styles.linkImage, backgroundImage: 'url(/images/stepper/add_group_icon.svg)' }}/>
            </div>
            <div style={styles.stepTextContainer} onClick={() => {
              this.props.router.push('/new-group');
              this.props.onClose()
            }}>
              <div style={styles.stepTitle}>
                {localizations.stepper_modal_person_create_group}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_person_create_group_description_1}
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
                {localizations.stepper_modal_person_organize_activity}
              </div>
              <div style={styles.stepDescription}>
                {localizations.stepper_modal_person_organize_activity_description_1}
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
      </List>);
  }
}

export default ClubSteps;