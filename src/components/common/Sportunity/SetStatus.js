import localizations from '../../Localizations';

function SetStatus(sportunity, status, userId) {
  let statusResult = 'AVAILABLE_GREY';
  let color = 'GREY';
  let status_information = localizations.status_information_available_grey;

  if (
    status.indexOf('Available') >= 0 &&
    sportunity.game_information &&
    sportunity.game_information.opponent &&
    (sportunity.game_information.opponent.lookingForAnOpponent ||
      (sportunity.game_information.opponent.invitedOpponents &&
        sportunity.game_information.opponent.invitedOpponents.edges &&
        sportunity.game_information.opponent.invitedOpponents.edges.findIndex(
          edge =>
            edge.node.members.findIndex(member => member.id === userId) >= 0,
        ) >= 0))
  ) {
    statusResult = 'LOOKING_FOR_AN_OPPONENT';
    color = 'GREY';
    //status_information = localizations.status_lookingForAnOpponent;
  } 
  else if (status === 'Available-Black') {
    statusResult = 'AVAILABLE_BLACK';
    color = 'BLACK';
    status_information = localizations.status_information_available_black;
  } 
  else if (status === 'Waiting-List-Yellow') {
    statusResult = 'WAITING_LIST_YELLOW';
    color = 'YELLOW';
    status_information = localizations.status_information_waiting_list_yellow;
  } 
  else if (status === 'Full-Red') {
    statusResult = 'FULL_RED';
    color = 'RED';
    status_information = localizations.status_information_full_red;
  } 
  else if (status === 'Booked-Grey') {
    statusResult = 'BOOKED_GREY';
    color = 'GREY';
    status_information = localizations.status_information_booked_grey;
  } 
  else if (status === 'Booked-Black') {
    statusResult = 'BOOKED_BLACK';
    color = 'BLACK';
    status_information = localizations.status_information_booked_black;
  } 
  else if (status === 'Booked-Over') {
    statusResult = 'BOOKED_PINK';
    color = 'PINK';
    status_information = localizations.status_information_booked_pink;
  }
  else if (status === 'Waiting-List-Booked-Yellow') {
    statusResult = 'WAITING_LIST_BOOKED_YELLOW';
    color = 'YELLOW';
    status_information = localizations.status_information_waiting_list_booked_yellow;
  } 
  else if (status === 'Organized-Grey') {
    statusResult = 'ORGANIZED_GREY';
    color = 'GREY';
    status_information = localizations.status_information_organized_grey;
  } 
  else if (status === 'Organized-Black') {
    statusResult = 'ORGANIZED_BLACK';
    color = 'BLACK';
    status_information = localizations.status_information_organized_black;
  } 
  else if (status === 'Organized-Yellow') {
    statusResult = 'ORGANIZED_YELLOW';
    color = 'YELLOW';
    status_information = localizations.status_information_organized_yellow;
  } 
  else if (status === 'Organized-Red') {
    statusResult = 'ORGANIZED_RED';
    color = 'RED';
    status_information = localizations.status_information_organized_red;
  } 
  else if (status === 'Organized-Over') {
    statusResult = 'ORGANIZED_PINK';
    color = 'PINK';
    status_information = localizations.status_information_organized_pink;
  }
  else if (status === 'Assistant-Grey') {
    statusResult = 'ASSISTANT_GREY';
    color = 'GREY';
    status_information = '';
  } 
  else if (status === 'Assistant-Black') {
    statusResult = 'ASSISTANT_BLACK';
    color = 'BLACK';
    status_information = '';
  } 
  else if (status === 'Assistant-Yellow') {
    statusResult = 'ASSISTANT_YELLOW';
    color = 'YELLOW';
    status_information = '';
  } 
  else if (status === 'Assistant-Red') {
    statusResult = 'ASSISTANT_RED';
    color = 'RED';
    status_information = '';
  } 
  else if (status === 'Assistant-Over') {
    statusResult = 'ASSISTANT_PINK';
    color: 'PINK';
    status_information = '';
  }
  else if (status === 'Asked-CoOrganization-Grey') {
    statusResult = 'ASKED_COORGANIZATION_GREY';
    color = 'GREY';
    status_information = '';
  }
  else if (status === 'Asked-CoOrganization-Black') {
    statusResult = 'ASKED_COORGANIZATION_BLACK';
    color = 'BLACK';
    status_information = '';
  }
  else if (status === 'Asked-CoOrganization-Yellow') {
    statusResult = 'ASKED_COORGANIZATION_YELLOW';
    color = 'YELLOW';
    status_information = '';
  }
  else if (status === 'Asked-CoOrganization-Red') {
    statusResult = 'ASKED_COORGANIZATION_RED';
    color = 'RED';
    status_information = '';
  } 
  else if (status === 'Asked-CoOrganization-Over') {
    statusResult = 'ASKED_COORGANIZATION_PINK';
    color = 'PINK';
    status_information = '';
  } 
  else if (status === 'Willing-List-Green') {
    statusResult = 'WILLING_LIST_GREEN';
    color = 'GREEN';
    status_information = localizations.status_information_willing_list_green;
  } 
  else if (status === 'Past') {
    statusResult = 'PASSED';
    color = 'GREY';
  } 
  else if (status === 'Cancelled') {
    statusResult = 'CANCELLED';
    color = 'GREY';
  } 
  else if (status === 'Invited-Grey') {
    statusResult = 'INVITED';
    color = 'GREY';
  } 
  else if (status === 'Invited-Black') {
    statusResult = 'INVITED';
    color = 'BLACK';
  } 
  else if (status === 'Invited-Yellow') {
    statusResult = 'INVITED';
    color = 'YELLOW';
    status_information = localizations.status_information_waiting_list_yellow;
  } 
  else if (status === 'Invited-Over') {
    statusResult = 'INVITED';
    color = 'PINK';
    status_information = localizations.status_information_invited_pink;
  } 
  else if (status === 'Declined-Grey') {
    statusResult = 'DECLINED';
    color = 'GREY';
  } 
  else if (status === 'Declined-Black') {
    statusResult = 'DECLINED';
    color = 'BLACK';
  }

  let displayStatus = localizations.status_available;

  if (statusResult === 'AVAILABLE_GREY' || statusResult === 'AVAILABLE_BLACK') {
    displayStatus = localizations.status_available;
    if (sportunity.kind === "PRIVATE") {
      displayStatus = localizations.status_private;
    }
  }
  if (statusResult === 'WAITING_LIST_YELLOW' || statusResult === 'WAITING_LIST_BOOKED_YELLOW') {
    displayStatus = localizations.status_waiting_list;
  }
  if (statusResult === 'BOOKED_GREY' || statusResult === 'BOOKED_BLACK' || statusResult === 'BOOKED_PINK') {
    displayStatus = localizations.status_booked;
  }
  if (statusResult === 'ORGANIZED_GREY' || statusResult === 'ORGANIZED_BLACK' || statusResult === 'ORGANIZED_RED' || statusResult === 'ORGANIZED_YELLOW' || statusResult === 'ORGANIZED_PINK') {
    displayStatus = localizations.status_organized;
  }
  if (statusResult === 'ASSISTANT_GREY' || statusResult === 'ASSISTANT_BLACK' || statusResult === 'ASSISTANT_RED' || statusResult === 'ASSISTANT_YELLOW' || statusResult === 'ASSISTANT_PINK') {
    displayStatus = localizations.status_assistant;
    if (userId && sportunity.organizers && sportunity.organizers.length > 0) {
      sportunity.organizers.forEach(organizer => {
        if (
          organizer.organizer.id === userId &&
          organizer.secondaryOrganizerType
        ) {
          displayStatus = organizer.secondaryOrganizerType.name[
            localizations.getLanguage().toUpperCase()
          ].toUpperCase();
        } else if (
          organizer.organizer.id === userId &&
          organizer.customSecondaryOrganizerType
        ) {
          displayStatus = organizer.customSecondaryOrganizerType.toUpperCase();
        }
      });
    }
  }
  if (statusResult === 'ASKED_COORGANIZATION_GREY' || statusResult === 'ASKED_COORGANIZATION_BLACK' || statusResult === 'ASKED_COORGANIZATION_YELLOW' || statusResult === 'ASKED_COORGANIZATION_RED' ||  statusResult === 'ASKED_COORGANIZATION_PINK') {
    displayStatus = localizations.status_asked_assistant;
  }
  if (statusResult === 'WILLING_LIST_GREEN') {
    displayStatus = localizations.status_waiting_list;
  }
  if (statusResult === 'PASSED') {
    displayStatus = localizations.status_passed;
  }
  if (statusResult === 'CANCELLED') {
    displayStatus = localizations.status_cancelled;
  }
  if (statusResult === 'DECLINED') {
    displayStatus = localizations.status_declined;
  }
  if (statusResult === 'INVITED') {
    displayStatus = localizations.status_invited;
  }
  if (statusResult === 'LOOKING_FOR_AN_OPPONENT') {
    displayStatus = localizations.status_lookingForAnOpponent;
  }

  if (sportunity.survey && !sportunity.survey.isSurveyTransformed && sportunity.survey.surveyDates.length > 1) {
    statusResult = 'POLL';
    color = 'GREY';
    displayStatus = localizations.status_survey;
    status_information =
      localizations.status_information_survey['0'] +
      sportunity.organizers[0].organizer.pseudo +
      localizations.status_information_survey['1'];
  }

  return {
    ...sportunity,
    statusResult,
    displayStatus,
    status_information,
    color,
  };
}

export default SetStatus;
