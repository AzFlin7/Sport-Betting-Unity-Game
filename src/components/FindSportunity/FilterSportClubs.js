import React from 'react';
import PureComponent, { pure } from '../common/PureComponent'
import MultiSelectCircle from '../common/Inputs/MultiSelectCircle';
import Radium from 'radium';
import ReactTooltip from 'react-tooltip'
import { colors } from '../../theme';
import localizations from '../Localizations'

import Input from './Input';

let styles;


class FilterSportClubs extends PureComponent {

	state = {
    term: '',
    selectedClubs: [],
	}

  _handleClubSelected = (club) => {
    let clubIndex = this.state.selectedClubs.findIndex(selectedClub => selectedClub.id === club.id)
    let selectedClubs = this.state.selectedClubs;

    if (clubIndex < 0) {
        selectedClubs.push(club);
        let term = '';
        if (selectedClubs.length > 0)
            term = selectedClubs.length + ' ' + localizations.fint_my_sport_club_selected;
        if (selectedClubs.length > 1)
            term = selectedClubs.length + ' ' + localizations.fint_my_sport_club_selecteds;
        this.setState({
            selectedClubs,
            term
        });
        this.props._updateAddSportClubFilter(club);
    }
    else {
        selectedClubs.splice(clubIndex, 1)
        let term = '';
        if (selectedClubs.length > 0)
            term = selectedClubs.length + ' ' + localizations.fint_my_sport_club_selected;
        if (selectedClubs.length > 1)
            term = selectedClubs.length + ' ' + localizations.fint_my_sport_club_selecteds;
        this.setState({
            selectedClubs,
            term
        });
        this.props._updateRemoveSportClubFilter(club);
    }
  }

  _handleClearSelection = () => {
    this.setState({
        term: '',
        selectedClubs: [],
    })
    this.props._updateClearSportClubFilter();
  }

  render() {
    const { term, selectedClubs } = this.state;

    const {circlesUserIsIn} = this.props;

    return (
      <MultiSelectCircle
        list={circlesUserIsIn && circlesUserIsIn.edges && circlesUserIsIn.edges.length > 0 
          ? circlesUserIsIn.edges.map(edge => edge.node)
          : []}
        values={selectedClubs}
        term={term}
        onChange={this._handleClubSelected}
        clearSelection={this._handleClearSelection}
      />
    );
  }
}

styles = {
};

export default Radium(FilterSportClubs);
