import React from 'react';
import PureComponent, { pure } from '../PureComponent'
import { colors, metrics, fonts } from '../../../theme';
import InputCheckbox from '../../common/Inputs/InputCheckbox'

let styles;

const MenuItem = pure((props) => {
    const { label, selected } = props;
    return (
        <div style={styles.container} onClick={props.onChange}>
            <InputCheckbox 
                checked={selected}
                onChange={() => {}}
            />
            <label style={selected ? styles.selectedLabel : styles.label}>
                {label} 
            </label>
        </div>
    );
});

styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        marginTop: 1,
        marginBottom: 1,
        paddingTop: 3,
        paddingBottom: 3,
        marginLeft: 12,
        cursor: 'pointer'
    },
    label: {
        fontSize: 12,
        fontFamily: 'Lato',
        color: 'rgba(0, 0, 0, 0.64)',
        cursor: 'pointer',
        marginBottom: 4
    },
    selectedLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Lato',
        color: colors.blue,
        cursor: 'pointer',
        marginBottom: 4
    },
    checkBox: {
        cursor: 'pointer',
        height: 14,
        width: 14
    }
};

export default MenuItem ;
