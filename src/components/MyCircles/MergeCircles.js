import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from 'react-loading';
import { withAlert } from 'react-alert'
import ToggleDisplay from 'react-toggle-display'
import CircleMutation from './CircleMutation'
import localizations from '../Localizations'

import { colors } from '../../theme';

let styles

class MergeCircles extends Component {

    constructor() {
        super();
        
        this.state = {
            isMergedChecked: false
        }

        this.alertOptions = {
            offset: 14,
            position: 'top right',
            theme: 'light',
            timeout: 100,
            transition: 'fade',
        };
    }

    _updateCheckbox = event => {
        this.setState({
            isMergedChecked: !this.state.isMergedChecked
        })
    }

    _updateSubCircles = circleId => {
        let newSubCircles = this.props.subCircles ;
        let index = newSubCircles.indexOf(circleId);

        if (index >= 0) 
            newSubCircles.splice(index, 1);
        else 
            newSubCircles.push(circleId);

        this.props.updateSubCircles(newSubCircles)
    }

    render() {
            const {viewer, circles} = this.props
            return(
                <section>
                    <div style={styles.container}>
                        <div style={styles.checkboxRow} onClick={this._updateCheckbox}>
                            <div style={styles.checkboxLabel}>
                                {localizations.circles_new_merge}
                            </div>
                            <input style={styles.checkBox} 
                                type='checkbox' 
                                checked={this.state.isMergedChecked}
                            />
                        </div>
                        {this.state.isMergedChecked &&
                            <div>
                                {circles.map(circle => (
                                    <div key={circle.id} style={styles.checkboxRow} onClick={() => this._updateSubCircles(circle.id)}>
                                        <input style={styles.checkBox} 
                                            type='checkbox' 
                                            checked={this.props.subCircles.indexOf(circle.id) >= 0}
                                        />
                                        <span style={styles.circleLabel}>
                                            {circle.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                </section>
            )
    }
}

export default withAlert(MergeCircles)

styles = {
  container: {
    width: '100%',
  },
  checkboxRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontFamily: 'Lato',
    fontSize: 16, 
    color: colors.blue,
    flex: 5
  },
  checkBox: {
    width: 18,
    height: 18,
    border: '2px solid #5E9FDF',
    display: 'block',
    cursor: 'pointer',
    marginLeft: 15,
    flex: 1
  },
  circleLabel: {
      fontFamily: 'Lato',
      fontSize: 14, 
      color: 'rgba(0,0,0,0.65)',
      flex: 8
  }
}
