import React from 'react';
import PureComponent, { pure } from '../PureComponent'
import Radium from 'radium';
import PropTypes from 'prop-types';

const propTypes = {
    component: PropTypes.object.isRequired,
    title: PropTypes.string,
    expanded: PropTypes.bool
};

let styles;

class CustomExpander extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            expanded: props.expanded ? props.expanded : false // by default we are keeping it closed.
        };
    }


    render() {

        const { component } = this.props;

        return (
            <div style={styles.wrapper}>
                <div style={styles.title}>
                    <span>{this.props.title}</span>
                    { expanded === true ?
                        <i class="fa fa-chevron-up" onClick={() => { this.setState({ expanded: false })}}  aria-hidden="true"></i>
                        : <i class="fa fa-chevron-down" aria-hidden="true"  onClick={() => { this.setState({ expanded: true })}} ></i>
                    }
                </div>
                { expanded === true &&
                    <div style={styles.row}>
                        {/*
                            the component will be rendered here
                        */}
                        {component}
                    </div>
                }
            </div>
        );
    }
}


styles = {
    wrapper: {
        width: '100%',
    },

    title: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
};


Expander.propTypes = propTypes;


export default Radium(Expander);

