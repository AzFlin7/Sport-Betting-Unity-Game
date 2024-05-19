import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Radium from 'radium';
import { withAlert } from 'react-alert';
import { connect } from 'react-redux';

import NewUpdateCarPoolingModal from './NewUpdateCarPoolingModal.js';

import CancelCarPoolingMutation from './Mutations/CancelCarPoolingMutation.js';
import BookCarPoolingMutation from './Mutations/BookCarPoolingMutation.js';
import CancelCarPoolingBookMutation from './Mutations/CancelCarPoolingBookMutation.js';
import newCarPoolingMutation from './Mutations/NewCarPoolingMutation';
import modifyCarPoolingMutation from './Mutations/ModifyCarPoolingMutation';
import askCarPoolingMutation from './Mutations/AskCarPoolingMutation';

import localizations from '../../Localizations';
import { styles } from './styles.js';
import CarPoolingCard from '../CarPoolingCard';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

class CarPooling extends React.Component {
  constructor() {
    super();
    this.alertOptions = {
      offset: 60,
      position: 'top right',
      theme: 'light',
      transition: 'fade',
    };

    this.state = {
      displayNewCarPoolingModal: false,
      displayUpdateCarPoolingModal: false,
      updatingCarPooling: null,
      userIsDriver: null,
      userIsPassenger: null,
      displayAskCarPoolingButton: true,
    };
  }

  componentDidMount() {
    const {
      viewer: { me },
      sportunity: { carPoolings },
    } = this.props;
    this._userIsDriver(carPoolings, me);
    this._userIsPassenger(carPoolings, me);
    // co-organizer with view permissions should not be able to request and creat carpooling.
  }

  componentWillReceiveProps = nextProps => {
    const {
      viewer: { me },
      sportunity,
    } = nextProps;
    if (sportunity) {
      this._userIsDriver(sportunity.carPoolings, me);
      this._userIsPassenger(sportunity.carPoolings, me);
    }
  };

  _userIsDriver = (carPoolings, user) => {
    let result = null;

    carPoolings.forEach(carPooling => {
      if (carPooling.driver.id === user.id) result = carPooling.id;
    });

    this.setState({
      userIsDriver: result,
    });
  };

  _userIsPassenger = (carPoolings, user) => {
    let result = null;
    carPoolings.forEach(carPooling => {
      if (carPooling.passengers && carPooling.passengers.length > 0) {
        if (
          carPooling.passengers.findIndex(
            passenger => passenger.id === user.id,
          ) >= 0
        )
          result = carPooling.id;
      }
    });

    this.setState({
      userIsPassenger: result,
    });
  };

  updateCarPooling = carPooling => {
    this.setState({
      updatingCarPooling: carPooling,
      displayUpdateCarPoolingModal: true,
    });
  };

  cancelCarPooling = carPooling => {
    const { viewer, sportunity } = this.props;

    let params = {
      viewer: viewer,
      sportunityIDVar: sportunity.id,
      carPoolingIDVar: carPooling.id,
    };

    CancelCarPoolingMutation.commit(params, {
      onSuccess: response => {
        this.props.alert.show(localizations.event_carPooling_updateSucces, {
          ///////////////////////
          timeout: 2000,
          type: 'success',
        });
      },
      onFailure: error => {
        this.props.alert.show(localizations.event_carPooling_updateFailed, {
          ///////////////////////
          timeout: 4000,
          type: 'error',
        });
      },
    });
  };

  bookCarPooling = carPooling => {
    const {
      viewer,
      viewer: { me },
      sportunity,
    } = this.props;

    let params = {
      viewer: viewer,
      sportunityIDVar: sportunity.id,
      carPoolingIDVar: carPooling.id,
      userIDVar: me.id,
    };

    BookCarPoolingMutation.commit(params, {
      onSuccess: response => {
        this.props.alert.show(localizations.event_carPooling_updateSucces, {
          ///////////////////////
          timeout: 2000,
          type: 'success',
        });
      },
      onFailure: error => {
        this.props.alert.show(localizations.event_carPooling_updateFailed, {
          timeout: 4000,
          type: 'error',
        });
      },
    });
  };

  cancelCarPoolingBook = carPooling => {
    const {
      viewer,
      viewer: { me },
      sportunity,
    } = this.props;

    let params = {
      viewer: viewer,
      sportunityIDVar: sportunity.id,
      carPoolingIDVar: carPooling.id,
      userIDVar: me.id,
    };

    CancelCarPoolingBookMutation.commit(params, {
      onSuccess: response => {
        this.props.alert.show(localizations.event_carPooling_updateSucces, {
          timeout: 2000,
          type: 'success',
        });
      },
      onFailure: error => {
        this.props.alert.show(localizations.event_carPooling_updateFailed, {
          timeout: 4000,
          type: 'error',
        });
      },
    });
  };

  newCarPooling = params => {
    newCarPoolingMutation.commit(params, {
      onSuccess: response => {
        this.props.alert.show(localizations.event_carPooling_updateSucces, {
          ///////////////////////
          timeout: 2000,
          type: 'success',
        });
        this.setState({
          displayNewCarPoolingModal: false,
        });
      },
      onFailure: error => {
        this.props.alert.show(localizations.event_carPooling_updateFailed, {
          timeout: 4000,
          type: 'error',
        });

        setTimeout(function() {
          this.setState({
            displayNewCarPoolingModal: false,
          });
        }, 2000);
      },
    });
  };

  modifyCarPooling = params => {
    modifyCarPoolingMutation.commit(params, {
      onSuccess: response => {
        this.props.alert.show(localizations.event_carPooling_updateSucces, {
          timeout: 2000,
          type: 'success',
        });
        this.setState({
          displayUpdateCarPoolingModal: false,
        });
      },
      onFailure: error => {
        this.props.alert.show(localizations.event_carPooling_updateFailed, {
          timeout: 4000,
          type: 'error',
        });

        setTimeout(function() {
          this.setState({
            displayUpdateCarPoolingModal: false,
          });
        }, 2000);
      },
    });
  };

  askForACarPooling = () => {
    const {
      viewer,
      viewer: { me },
      sportunity,
    } = this.props;

    let params = {
      viewer: viewer,
      sportunityIDVar: sportunity.id,
    };
    askCarPoolingMutation.commit(params, {
      onSuccess: response => {
        this.props.alert.show(localizations.event_carPooling_askSuccess, {
          timeout: 2000,
          type: 'success',
        });
        this.setState({
          displayAskCarPoolingButton: false,
        });
      },
      onFailure: error => {
        this.props.alert.show(localizations.event_carPooling_updateFailed, {
          timeout: 4000,
          type: 'error',
        });
      },
    });
  };

  render() {
    let {
      viewer,
      sportunity,
      isPast,
      isCancelled,
      isAdmin,
      userIsParticipant,
      canView,
      viewOnly
    } = this.props;
    const { userIsDriver, userIsPassenger } = this.state;

    return (
      <div style={styles.container}>
        <div style={styles.title}>{localizations.event_carPooling}</div>

        {!isPast &&
          !isCancelled &&
          (isAdmin || userIsParticipant || canView) &&
          (sportunity &&
          sportunity.carPoolings &&
          sportunity.carPoolings.length > 0 ? (
            sportunity.carPoolings.map((carPooling, index) => (
              <CarPoolingCard
                key={carPooling.id}
                carPooling={carPooling}
                index={index}
                userIsDriver={userIsDriver}
                userIsPassenger={userIsPassenger}
                bookCarPooling={this.bookCarPooling}
                updateCarPooling={this.updateCarPooling}
                cancelCarPooling={this.cancelCarPooling}
                cancelCarPoolingBook={this.cancelCarPoolingBook}
                viewOnly={viewOnly}
              />
            ))
          ) : (
            <div style={styles.text}>
              {localizations.event_carPooling_nothing}
            </div>
          ))}

        {/* create button */}
        <Grid container spacing={40}>
          {!isPast &&
            !isCancelled &&
            (isAdmin || userIsParticipant) &&
            !viewOnly &&
            !userIsDriver &&
            !userIsPassenger && (
              <Grid item xs={3}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    this.setState({ displayNewCarPoolingModal: true })
                  }
                >
                  {localizations.event_carPooling_create}
                </Button>
              </Grid>
            )}
          {/* ask button */}
          {!isPast &&
            !isCancelled &&
            (isAdmin || userIsParticipant) &&
            !viewOnly && 
            !userIsDriver &&
            !userIsPassenger &&
            this.state.displayAskCarPoolingButton && (
              <Grid item xs={3}>
                <Button variant="outlined" onClick={this.askForACarPooling}>
                  {localizations.event_carPooling_ask}
                </Button>
              </Grid>
            )}

          {viewOnly && 
            <div style={{...styles.text, marginLeft: 20, marginTop: 20}}>
              {localizations.event_carPooling_viewOnly}
            </div>
          }
        </Grid>
        {/* past event, no car pooling */}
        {isPast && (
          <div style={{ ...styles.msgContainer, marginTop: 10 }}>
            <i
              style={styles.exclamationIcon}
              className="fa fa-exclamation-circle fa-5x"
            />
            <div>
              <p style={styles.errorMsg}>
                {localizations.event_carPooling_past}
              </p>
            </div>
          </div>
        )}
        {/* canceled event, no car pooling */}
        {isCancelled && (
          <div style={{ ...styles.msgContainer, marginTop: 10 }}>
            <i
              style={styles.exclamationIcon}
              className="fa fa-exclamation-circle fa-5x"
            />
            <div>
              <p style={styles.errorMsg}>
                {localizations.event_carPooling_cancelled}
              </p>
            </div>
          </div>
        )}
        {!isPast &&
          !isCancelled &&
          !userIsParticipant &&
          !isAdmin &&
          !canView && (
            <div>
              <div style={{ ...styles.msgContainer, marginTop: 40 }}>
                <i
                  style={styles.exclamationIcon}
                  className="fa fa-exclamation-circle fa-5x"
                />
                <div>
                  <p style={styles.errorMsg}>
                    {localizations.event_carPooling_errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

        {this.state.displayNewCarPoolingModal && (
          <NewUpdateCarPoolingModal
            viewer={viewer}
            sportunity={sportunity}
            isModalVisible={this.state.displayNewCarPoolingModal}
            closeModal={() =>
              this.setState({ displayNewCarPoolingModal: false })
            }
            newCarPooling={this.newCarPooling}
            userCountry={this.props.userCountry}
          />
        )}

        {this.state.displayUpdateCarPoolingModal && (
          <NewUpdateCarPoolingModal
            viewer={viewer}
            sportunity={sportunity}
            carPooling={this.state.updatingCarPooling}
            isModalVisible={this.state.displayUpdateCarPoolingModal}
            closeModal={() =>
              this.setState({ displayUpdateCarPoolingModal: false })
            }
            updateCarPooling={this.modifyCarPooling}
            userCountry={this.props.userCountry}
          />
        )}
      </div>
    );
  }
}

const dispatchToProps = dispatch => ({});

const stateToProps = state => ({
  userCountry: state.globalReducer.userCountry,
});

let ReduxContainer = connect(
  stateToProps,
  dispatchToProps,
)(Radium(CarPooling));

export default createFragmentContainer(Radium(withAlert(ReduxContainer)), {
  viewer: graphql`
    fragment CarPooling_viewer on Viewer {
      id
      me {
        id
        appCountry
      }
    }
  `,
  sportunity: graphql`
    fragment CarPooling_sportunity on Sportunity {
      id
      beginning_date
      carPoolings {
        id
        driver {
          id
          pseudo
          avatar
        }
        address {
          address
          city
          zip
          country
        }
        starting_date
        number_of_sits
        passengers {
          id
          pseudo
          avatar
        }
      }
      organizers {
        organizer {
          id
        }
        permissions {
          chatAccess {
            view
            edit
          }
          memberAccess {
            view
            edit
          }
          carPoolingAccess {
            view
            edit
          }
          imageAccess {
            view
            edit
          }
          detailsAccess {
            view
            edit
          }
          compositionAccess {
            view
            edit
          }
        }
      }
    }
  `,
});
