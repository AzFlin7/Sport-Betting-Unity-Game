import React from 'react'
import Modal from 'react-modal'
import {colors, fonts} from '../../../theme'
import moment from "moment/moment";
import Radium, {StyleRoot} from 'radium'
import tableStyle from './styles'

import localizations from '../../Localizations'
import {
  createRefetchContainer,
  graphql,
} from 'react-relay/compat';
import Circle from "./Circle";
import UpdateSportunityStatisticsMutation from "../../EventView/StatsFilling/Mutations/UpdateSportunityStatisticsMutation";
import UpdateSportunityTypeMutation from "../../EventView/StatsFilling/Mutations/UpdateSportunityTypeMutation" 
import UpdateSportunityResultMutation from "../../EventView/StatsFilling/Mutations/UpdateSportunityResultMutation"
import { withAlert } from 'react-alert'
import SportunityRow from './SportunityRow'
import NumericInput from 'react-numeric-input';

let styles, modalStyles, cantCloseModalStyles;

class FillStatsModal extends React.Component {
    constructor(props) {
      super(props);
	    this.alertOptions = {
		    offset: 60,
		    position: 'top right',
		    theme: 'light',
		    transition: 'fade',
	    };
      this.state = {
        isLoading: false,
        selectedIndex: -1,
	      userStatistics: [],
        loadingMember: false,
	      sportunitiesList: []
      }
    }

    componentDidMount() {
    	let sportunitiesList = []
	    if (this.props.user.statSportunities && this.props.user.statSportunities.edges && this.props.user.statSportunities.edges.length > 0)
		    this.props.user.statSportunities.edges.forEach(node => {
		    	let sportunity = node.node;
		    	sportunitiesList.push({
            id: sportunity.id,
				    title: sportunity.title,
				    sport: sportunity.sport,
				    beginning_date: sportunity.beginning_date,
				    sportunityType: sportunity.sportunityType,
				    opponent: sportunity.game_information.opponent,
				    sportunityTypeStatus: sportunity.sportunityTypeStatus,
				    score: sportunity.score,
            isModified: false,
			    })
		    })
      this.setState({sportunitiesList})
    }



    //
    //
    // componentWillUnmount() {
    //     window.removeEventListener('click', this._handleClickOutside);
    // }

    componentWillReceiveProps = (nextProps) => {
      if (this.state.selectedIndex >= 0 && nextProps.viewer.sportunityStatistics) {
	      this.setState({
		      userStatistics: this._getParticipantsStats(nextProps.viewer.sportunityStatistics),
          loadingMember: false,
	      })
      }
    };

	  _getParticipantsStatsCols = (sportunityStatistics) => {
      let results = [];
      if (sportunityStatistics && sportunityStatistics.length > 0) {
        sportunityStatistics.forEach(stat => {
          if (stat.participant && results.findIndex(result => result.id === stat.statisticName.id) < 0)
            results.push(stat.statisticName)
        })
      }
      return results ;
    }

    _getParticipantsStats = (sportunityStatistics) => {
      let results = [];
      if (sportunityStatistics && sportunityStatistics.length > 0) {
        sportunityStatistics.forEach(stat => {
          if (stat.participant) {
            let index = results.findIndex(result => result.participant && result.participant.id === stat.participant.id);
            if (index < 0)
              results.push({participant: stat.participant, values:[{id: stat.statisticName.id , value:stat.value}]})
            else
              results[index].values.push({id: stat.statisticName.id , value:stat.value})
          }
        })
      }
      return results ;
    };

    _handleClickOutside = event => {
        if (this._containerNode && !this._containerNode.contains(event.target) && this.props.canCloseModal) {
            this._closeModal()
        }
    }

    _handleCloseRequest = () => {
        if (this.props.canCloseModal)
            this._closeModal()
    }

    _closeModal = () => {
        this.props.toggleModal()
    }

    validChange = (id) => {
    	this.setState({isProcessing: true})

	    const {userStatistics} = this.state;
	    let sportunityStatisticsVar = [];

	    userStatistics.forEach(userStatistic => {
		    userStatistic.values.forEach(value => {
			    sportunityStatisticsVar.push({
				    statisticId: value.id,
				    participantId: userStatistic.participant.id,
				    value: value.value
			    })
		    })
	    })

	    let params = {
		    sportunityIDVar: id,
		    sportunityStatisticsVar,
		    viewer: this.props.viewer,
	    }

      UpdateSportunityStatisticsMutation.commit(params,{
			    onSuccess: (response) => {
				    this.props.alert.show(localizations.event_fill_statistics_success, {
					    timeout: 2000,
					    type: 'success',
				    });
				    this.setState({selectedIndex: -1})

			    },
			    onFailure: (error) => {
				    this.props.alert.show(localizations.event_fill_statistics_failed, {
					    timeout: 4000,
					    type: 'error',
				    });

			    },
		    }
	    );
    }


	  openMemberStats = (index, id) => {
      if (this.state.sportunitiesList.filter(e => e.isModified === true).length > 0) 
        this.saveSportunity(false)
        
      setTimeout(() => {
        this.setState({
          selectedIndex: index,
          loadingMember: true,
        })

        this.props.relay.refetch(fragmentVariables => ({
          ...fragmentVariables,
          id: id,
          query: true
        }))
      }, 200)
    }

    renderStatMember = () => {
      const {userStatistics} = this.state;
      let participantsStatCols = this._getParticipantsStatsCols(this.props.viewer.sportunityStatistics);
      let sportunity = this.state.sportunitiesList[this.state.selectedIndex];

      return (
	    <div style={{width: 200, overflow: 'visible', height: '100%'}}>

		    <h3 style={{...tableStyle.subtitle, color: colors.red}}>
			    {localizations.event_fill_statistics_participants_title}
		    </h3>
		    <h3 style={{...tableStyle.subtitle, fontSize: 20, color: colors.red}}>
			    {sportunity.title + ' ' + moment(sportunity.beginning_date).format('DD/MM/YYYY')}
		    </h3>
		    {userStatistics && userStatistics.length > 0 &&
		    <div style={tableStyle.section}>
			    <table style={tableStyle.table}>
				    <thead>
				    <tr  style={{backgroundColor: '#abcff2'}}>
					    <th style={tableStyle.colLabel}>{localizations.event_fill_statistics_participant}</th>
					    {participantsStatCols.map((name, index) => (
						    <th key={index} style={tableStyle.headerCol}>
							    {name.name}
						    </th>
					    ))}
				    </tr>
				    </thead>
				    <tbody>
				    {userStatistics.map((stat, index) => (
					    <tr key={index} style={{backgroundColor: (index % 2 === 1) ? '#FFF' : '#ddefff'}}>
						    <td style={tableStyle.colLabel}>
							    <Circle
								    key={index}
								    name={stat.participant.pseudo || '' }
								    image={stat.participant.avatar}
							    />
						    </td>
						    {stat.values.map((value, colIndex) => (
							    <td key={index+'-'+colIndex} style={tableStyle.col}>
								    {colIndex === 0
                    ? <input
										    type="checkbox"
										    style={styles.input}
										    checked={value.value === 1}
										    onChange={(newValue) => this._handleChangeUserParticipation(index, newValue)}
                    />
                    : <NumericInput
										    style={styles.numericInput}
										    value={value.value ? value.value : 0}
										    min={0}
										    max={100}
										    disabled={stat.values[0].value === 0}
										    onChange={(newValue) => this._handleChangeUserStat(index, colIndex, newValue)}
                      />
								    }
							    </td>
						    ))}
					    </tr>
				    ))}
				    </tbody>
			    </table>
		    </div>
		    }

      </div>
      )
    }

	  _handleChangeUserParticipation = (rowIndex, event) => {
      let newUserStats = this.state.userStatistics;
      newUserStats[rowIndex].values[0].value = event.target.checked ? 1 : 0 ;

      if (!event.target.checked) {
        for (var i = 1 ; i < newUserStats[rowIndex].values.length ; i++) {
          newUserStats[rowIndex].values[i].value = 0 ;
        }
      }

      this.setState({
        userStatistics: newUserStats
      })
    };

    _handleChangeUserStat = (rowIndex, colIndex, value) => {
      let newUserStats = this.state.userStatistics;
      newUserStats[rowIndex].values[colIndex].value = value.target ? value.target.value : value ;
      this.setState({
        userStatistics: newUserStats
      })
    };

		changeSportunity = (e, index) => {
			let {sportunitiesList} = this.state;
			sportunitiesList[index] = e;
	    this.setState({sportunitiesList});
    };

		saveSportunity = (closeAfter = true) => {
			this.setState({isLoading: true});
      let sportunitiesModifiedList = this.state.sportunitiesList.map((s, i) => ({...s, index: i})).filter(e => e.isModified === true)
      
			if (sportunitiesModifiedList.length > 0)
				sportunitiesModifiedList.forEach((sportunity, index) => {
					this['child'+sportunity.index].onSaveSportunityType(sportunity.index >= sportunitiesModifiedList.length - 1, closeAfter);
				})
			else
				this._closeModal();
    };
    
    stopLoading = () => {
      this.setState({isLoading: false});
    }

    render() {
    	const {user, viewer} = this.props;
    	const {sportunitiesList} = this.state
	    let showSportunityList = sportunitiesList.map((sportunity, index) => (
			    <SportunityRow
				    onRef={ref => this['child'+index] = ref}
				    viewer={viewer}
				    msg={this.msg}
				    _closeModal={this._closeModal}
				    sportunity={user.statSportunities.edges.map(node => node.node)[index]}
				    index={index}
				    selectedIndex={this.state.selectedIndex}
				    changeSportunity={(e) => this.changeSportunity(e, index)}
				    validChange={this.validChange}
            openMemberStats={this.openMemberStats}
            stopLoading={this.stopLoading}
			    />
	    ));
	    if (this.state.selectedIndex >= 0) {
		    showSportunityList.splice(this.state.selectedIndex + 1, 0, this.renderStatMember());
	    }

	    return (
          <Modal
            isOpen={this.props.isOpen}
            onRequestClose={this._handleCloseRequest}
            style={this.props.canCloseModal ? modalStyles : cantCloseModalStyles}
            contentLabel={localizations.fillStats_title}
          >
            <div style={styles.modalContent} ref={node => { this._containerNode = node; }}>
              <div style={styles.modalHeader}>
                <div style={styles.modalTitle}>{localizations.fillStats_title}</div>
                <div style={styles.modalClose} onClick={this._handleCloseRequest}>
                  <i className="fa fa-times fa-2x" />
                </div>
              </div>
	            <div style={{width: '100%', height: 400, overflow:'auto', paddingBottom:150}}>
		            <table style={{...tableStyle.table, fontFamily: 'lato'}}>
			            <thead>
			            <tr style={{backgroundColor: '#abcff2'}}>
				            <th style={tableStyle.colLabel}>{localizations.fillStats_table_title}</th>
				            <th style={tableStyle.headerCol}>{localizations.fillStats_table_date}</th>
				            <th style={tableStyle.headerCol}>{localizations.fillStats_table_type}</th>
				            <th style={tableStyle.headerCol}>{localizations.fillStats_table_opponent}</th>
				            <th style={tableStyle.headerCol}>{localizations.fillStats_table_result}</th>
				            <th style={tableStyle.headerCol}>{localizations.fillStats_table_teamsScore}</th>
				            <th style={tableStyle.headerCol}>{localizations.fillStats_table_opponentScore}</th>
				            <th style={tableStyle.headerCol}>{localizations.fillStats_table_statMember}</th>
			            </tr>
			            </thead>
			            <tbody>
			            {sportunitiesList && showSportunityList}
			            </tbody>
		            </table>
	            </div>
              <div style={styles.buttonRow}>
                { !this.state.isLoading &&
                <button onClick={() => {  setTimeout(() => {this._closeModal()},200)}} style={styles.redButton}>{localizations.fillStats_cancel}</button>
                }
                {!this.state.isLoading &&
                <button onClick={() => {this.saveSportunity();}} style={styles.greenButton}>{localizations.fillStats_valid}</button>
                }
              </div>
            </div>
          </Modal>
        )
    }
}

modalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.75)',
    zIndex: 2
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    width                 : '90%',
	  maxHeight             : '95%',
    transform             : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
  },
}

cantCloseModalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.9)',
    zIndex: 2
  },
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px',
  },
}

styles = {

	numericInput: {
		wrap: {
			height: 32,
			width: '100%',
			minWidth: '10ex'
		},
		input: {
			height: 32,
			width: '100%',
			minWidth: '10ex'
		},
		arrowUp: {

		},
		arrowDown: {

		}
	},
    container: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'space-between',
        fontFamily: 'Lato',
        lineHeight: 1,
        '@media (maxWidth: 500px)': {
            display: 'block',
        }
    },
    modalContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        '@media (maxWidth: 400px)': {
            width: 320,
        }
    },
    modalHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-center',
        justifyContent: 'space-between',
    },
    modalTitle: {
        fontFamily: 'Lato',
        fontSize:24,
        fontWeight: fonts.weight.large,
        flex: '2 0 0',
	      marginBottom: 20,
    },
    modalClose: {
        justifyContent: 'flex-center',
        color: colors.gray,
        cursor: 'pointer',
    },
    buttonRow: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    greenButton: {
        backgroundColor: colors.green,
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
        borderRadius: '3px',
        display: 'inline-block',
        fontFamily: 'Lato',
        fontSize: '22px',
        textAlign: 'center',
        color: colors.white,
        borderWidth: 0,
        marginTop: 10,
        marginBottom: 10,
        cursor: 'pointer',
        lineHeight: '27px',
        padding: '10px 20px'
    },
    redButton: {
		backgroundColor: colors.redGoogle,
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		borderRadius: '3px',
        display: 'inline-block',
        fontFamily: 'Lato',
        fontSize: '22px',
        textAlign: 'center',
        color: colors.white,
        borderWidth: 0,
        marginTop: 10,
        marginBottom: 10,
        cursor: 'pointer',
        lineHeight: '27px',
        padding: '10px 20px'
    },
    confirm: {
        color: colors.black,
        fontSize: 16,
        fontFamily: 'Lato',
        marginTop:20,
        marginBottom: 10,
    },
};

export default createRefetchContainer(Radium(withAlert(FillStatsModal)), {
//OK
     user: graphql`
       fragment FillStatsModal_user on User {
     id
     statSportunities: sportunities(first: 100) {
       edges {
         node {
           ...SportunityRow_sportunity
           id
           title
           beginning_date
           sport {
             sport {
               type
               sportunityTypes {
                 id
                 name {
                   FR,
                   EN
                   DE
                   ES
                 }
               }
             }
           }
           sportunityType {
             id
             name {
               EN
               FR
               DE
               ES
             }
             statuses {
               id,
               name {
                 FR,
                 EN
                 DE
                 ES
               }
             }
             isScoreRelevant
           }
           game_information {
             opponent {
                organizer {
                  id 
                  pseudo
                }
                unknownOpponent
                invitedOpponents (first: 20) {
                  edges {
                    node {
                      name
                    }
                  }
                }
              }
           }
           score {
             currentTeam
             adversaryTeam
           }
           sportunityTypeStatus {
             id
             name {
               EN
               FR
               DE
               ES
             }
           }
         }
       }
     }
   }`,
 viewer: graphql`
         fragment FillStatsModal_viewer on Viewer @argumentDefinitions (
          id: {type: "String", defaultValue: null}
          query: {type: "Boolean!", defaultValue: false}
          ){
            id
             sportunityStatistics (sportunityID: $id) @include(if:$query) {
                 statisticName {
                     id,
                     name
                 },
                 participant {
                     id
                     pseudo
                     avatar
                 }
                 value
             }
         }
     `,
 },
 graphql`
query FillStatsModalRefetchQuery(
    $id: String
    $query: Boolean!
) {
viewer {
    ...FillStatsModal_viewer
    @arguments(
      id: $id
      query: $query
    )
}
}
`,
 );

// export function filterModal(properties) {
//     document.body.children[0].classList.add('react-confirm-alert-blur');
//     const divTarget = document.createElement('div');
//     divTarget.id = 'react-confirm-alert';
//     document.body.appendChild(divTarget);
//     render(<FilterModal {...properties} isOpen={true} />, divTarget);
// }