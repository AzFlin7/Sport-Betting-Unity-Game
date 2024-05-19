import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import InvitedCircleDetails from './InvitedCircleDetails'


const styles = theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
});

const PanelCircle = ({ name, openCircleDetails, closeCircleDetails, circle, selectedCircle, fields, viewer, itemList, user, circleDetails, isModalOpen, closeModal, onChangeCircleAutoParticipate, onChangeUserAutoParticipate,
  onChangeCirclePrice, _handleNotificationTypeChange, _handleNotificationAutoXDaysBeforeChange, isModifying, isSurvey }) => {
  
  const toggleDetails = (isOpen) => isOpen ? openCircleDetails() : closeCircleDetails()

  return (
    <ExpansionPanel expanded={isModalOpen} onChange={(e, isOpen) => toggleDetails(isOpen)}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon onClick= {() => openCircleDetails() }/>}>
        <Typography >{name}</Typography>
      </ExpansionPanelSummary>

      <ExpansionPanelDetails>
        <Typography>
          <InvitedCircleDetails
            selectedCircle={selectedCircle}
            name={name}
            circle={viewer.circle}
            openCircleDetails={openCircleDetails}
            viewer={viewer}
            itemList={itemList}
            user={viewer.me}
            circleDetails={viewer.circle}
            selectedCircle={selectedCircle}
            onChangeCircleAutoParticipate={onChangeCircleAutoParticipate}
            onChangeUserAutoParticipate={onChangeUserAutoParticipate}
            onChangeCirclePrice={onChangeCirclePrice}
            _handleNotificationTypeChange={_handleNotificationTypeChange}
            _handleNotificationAutoXDaysBeforeChange={_handleNotificationAutoXDaysBeforeChange}
            isModifying={isModifying}
            isSurvey={isSurvey}
            fields={fields}
          />
        </Typography>
      
      </ExpansionPanelDetails>
    </ExpansionPanel>
);
}

export default withStyles(styles)(PanelCircle);
