import React from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';
import Radium from 'radium'
import UpdateSportunityResultMutation from "../../EventView/StatsFilling/Mutations/UpdateSportunityResultMutation";
import UpdateSportunityTypeMutation from "../../EventView/StatsFilling/Mutations/UpdateSportunityTypeMutation";
import {colors} from "../../../theme";
import localizations from "../../Localizations";
import tableStyle from "./styles";
import moment from "moment/moment";
import InputList from './InputList'
import { withAlert } from 'react-alert';

class SportunityRow extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			id: null,
			title: null,
			sport: null,
			beginning_date: null,
			sportunityType: null,
			opponent: null,
			sportunityTypeStatus: null,
			score: null,
			isModified: false
		}
	}

	onSaveSportunityType = (last, closeAfter) => {
		let sportunity = this.state;
		if (!sportunity.sportunityType) {
			this.props.alert.show(localizations.event_fill_statistics_select_type, {
				timeout: 2000,
				type: 'error',
			});
			this.props.stopLoading()
			return;
		}

		let params = {
			viewer: this.props.viewer,
			sportunity: this.props.sportunity,
			sportunityTypeVar: sportunity.sportunityType.id,

		}

		UpdateSportunityTypeMutation.commit(params, {
				onSuccess: (response) => {
					if (last)
						this.props.alert.show(localizations.event_fill_statistics_success, {
							timeout: 2000,
							type: 'success',
						});

					this.props.stopLoading()
					this.onSaveSportunityResult(last, closeAfter);
				},
				onFailure: (error) => {
					this.props.alert.show(localizations.event_fill_statistics_failed, {
						timeout: 4000,
						type: 'error',
					});
					this.props.stopLoading()
				},
			}
		);
	};

	onSaveSportunityResult = (last, closeAfter = true) => {
		let sportunity = this.state;
		if (!sportunity.sportunityTypeStatus) {
			this.props.alert.show(localizations.event_fill_statistics_select_result, {
				timeout: 2000,
				type: 'error',
			});
			this.props.stopLoading()
			return 
		}

		let scoreVar ;
		if (sportunity.score.currentTeam !== null) {
			if (isNaN(sportunity.score.currentTeam)) {
				this.props.alert.show(localizations.event_fill_statistics_wrong_format, {
					timeout: 2000,
					type: 'error',
				});
				this.props.stopLoading()
				return ;
			}
			scoreVar = {}
			scoreVar.currentTeam = Number(sportunity.score.currentTeam);
			if (sportunity.score.adversaryTeam !== null) {
				if (isNaN(sportunity.score.adversaryTeam)) {
					this.props.alert.show(localizations.event_fill_statistics_wrong_format, {
						timeout: 2000,
						type: 'error',
					});
					this.props.stopLoading()
					return ;
				}
				scoreVar.adversaryTeam = Number(sportunity.score.adversaryTeam)
			}
			else {
				this.props.alert.show(localizations.event_fill_statistics_wrong_format, {
					timeout: 2000,
					type: 'error',
				});
				this.props.stopLoading()
				return ;
			}
		}

		let params = {
			viewer: this.props.viewer,
			sportunity: this.props.sportunity,
			scoreVar,
			sportunityTypeStatusVar: sportunity.sportunityTypeStatus.id
		}

		UpdateSportunityResultMutation.commit(params,{
				onSuccess: (response) => {
					if (last) {
						this.props.alert.show(localizations.event_fill_statistics_success, {
							timeout: 2000,
							type: 'success',
						});
						this.setState({isLoading: false})
						this.props.stopLoading()
						setTimeout(() => {
							closeAfter && this.props._closeModal();
						}, 2000);
					}
				},
				onFailure: (error) => {
					this.props.alert.show(localizations.event_fill_statistics_failed, {
						timeout: 4000,
						type: 'error',
					});
					this.props.stopLoading()
				},
			}
		);
	}

	componentDidMount() {
		this.props.onRef && this.props.onRef(this)
		let {sportunity} = this.props;
		this.setState({
			id: sportunity.id,
			title: sportunity.title,
			sport: sportunity.sport,
			beginning_date: sportunity.beginning_date,
			sportunityType: sportunity.sportunityType,
			opponent: sportunity.game_information.opponent,
			sportunityTypeStatus: sportunity.sportunityTypeStatus,
			score: sportunity.score,
			isModified: false
		})
	}

	componentWillUnmount() {
		this.props.onRef && this.props.onRef(undefined)
	}

	_handleChangeCurrentTeamScore = (e) => {
		this.setState({
				score: {
					currentTeam: e.target.value,
					adversaryTeam: this.state.score ? this.state.score.adversaryTeam : 0,
				},
				isModified: true
		}, () => setTimeout(() => {this.props.changeSportunity(this.state)}, 200));
	};

	_handleChangeAdversaryTeamScore = (e) => {
		this.setState({
				score: {
					currentTeam: this.state.score ? this.state.score.currentTeam : 0,
					adversaryTeam: e.target.value
				},
				isModified: true
		}, () => setTimeout(() => {this.props.changeSportunity(this.state)}, 200));
	};

	_handleChangeSportunityType = (e) => {
		this.setState({
				sportunityType: e,
				isModified: true
		}, () => setTimeout(() => {this.props.changeSportunity(this.state)}, 200));
	};

	_handleChangeSportunityResult = (e) => {
		this.setState({
			sportunityTypeStatus: e,
			isModified: true
		}, () => setTimeout(() => {this.props.changeSportunity(this.state)}, 200));
	};

	render() {
		const {
			index,
			selectedIndex,
			validChange,
			openMemberStats
		} = this.props;
		const sportunity = this.state;

		return(sportunity &&
			<tr key={index} style={{backgroundColor: (index % 2 === 1) ? '#FFF' : '#ddefff'}}>
				<td style={tableStyle.colLabel}>{sportunity.title}</td>
				<td style={tableStyle.col}>{moment(sportunity.beginning_date).format('DD/MM/YYYY')}</td>
				<td style={tableStyle.col}>
					{sportunity.sportunityType
					? sportunity.sportunityType.name[localizations.getLanguage().toUpperCase()]
					: <InputList
							value={sportunity.sportunityType && sportunity.sportunityType.name[localizations.getLanguage().toUpperCase()] || ''}
							list={sportunity.sport && sportunity.sport.sport.sportunityTypes || []}
							onClickItem={(e) => this._handleChangeSportunityType(e)}
						/>
					}
				</td>
				<td style={tableStyle.col}>
					{sportunity.opponent && sportunity.opponent.organizer 
					?	sportunity.opponent.organizer.pseudo
					:	sportunity.opponent && !sportunity.opponent.unknownOpponent && sportunity.opponent.invitedOpponents.edges.length > 0
						? sportunity.opponent.invitedOpponents.edges.map(opponent => (opponent.node.name)).join(', ')
						: '-' 
					}
				</td>
				<td style={tableStyle.col}>
					<InputList
						value={sportunity.sportunityTypeStatus ? sportunity.sportunityTypeStatus.name[localizations.getLanguage().toUpperCase()] : null}
						list={sportunity.sportunityType && sportunity.sportunityType.statuses || []}
						onClickItem={(e) => this._handleChangeSportunityResult(e)}
					/>
				</td>
				<td style={tableStyle.col}>
					{sportunity.sportunityType && sportunity.sportunityType.isScoreRelevant
					? <input
							type='number'
							style={styles.input}
							value={sportunity.score.currentTeam}
							disabled={!sportunity.sportunityTypeStatus}
							onChange={(e) => this._handleChangeCurrentTeamScore(e)}
					/>
					: '-' 
					}
				</td>
				<td style={tableStyle.col}>
					{sportunity.sportunityType && sportunity.sportunityType.isScoreRelevant
					? <input
							type='number'
							style={styles.input}
							value={sportunity.score.adversaryTeam}
							disabled={!sportunity.sportunityTypeStatus}
							onChange={(e) => this._handleChangeAdversaryTeamScore(e)}
					/>
					: '-' 
					}
				</td>
				<td 
					style={{...tableStyle.col, cursor: 'pointer' , backgroundColor: selectedIndex !== index ? (index % 2 === 0) ? '#FFF' : '#ddefff' : colors.green, color: this.state.selectedIndex !== index ? colors.black : colors.white}}
					onClick={() => {selectedIndex === index ? validChange(sportunity.id) : openMemberStats(index, sportunity.id)}}
				>
					{selectedIndex !== index ? localizations.fillStats_fillStatsMember : localizations.fillStats_valid}
				</td>
			</tr>
		)
	}
}

let styles = {
	input: {
		textAlign: 'center',
		backgroundColor: '#FFF0',
		borderBottom: '2px solid ' + colors.blue,
		borderTop: 'none',
		borderRight: 'none',
		borderLeft: 'none',
	},
}

export default createFragmentContainer(withAlert(Radium(SportunityRow)), {
    sportunity: graphql`
        fragment SportunityRow_sportunity on Sportunity {
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
    `
})