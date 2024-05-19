import { colors } from '../../../theme';

export default {
    container: {
        padding: '40px',
        fontFamily: 'Lato',
        color: 'rgba(0,0,0,0.65)',
        boxShadow: 'rgba(0, 0, 0, 0.4) 0px 0px 4px 0px'
    },
    returnButton: {
        color: colors.blue,
        fontSize: 18,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center'
    },  
    backButton: {
        fontSize: 22,
        marginRight: 5
    },
    title: {
        fontSize: 32,
        fontWeight: 500,
        marginTop: 25,
        marginBottom: 30,
    },
    section: {
        marginBottom: 30
    },
    note: {
        fontSize: 18,
    },
    blueNote: {
        fontSize: 18,
        marginRight: 10,
        color: colors.blue
    },
    typeRow: {
        marginBottom: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    subtitle: {
        fontSize: 24,
        fontWeight: 500,
        marginBottom: 15,
    },
    table: {
        border: '1px solid rgba(0, 0, 0, 0.4)',
        fontSize: 18,
        margin: 'auto',
    },
    headerCol: {
        padding: '5px 10px',
        border: '1px solid rgba(0, 0, 0, 0.4)',
        fontWeight: 'bold',
        verticalAlign: 'middle'
    },  
    colLabel: {
        minWidth: 250,
        padding: '5px 10px',
        border: '1px solid rgba(0, 0, 0, 0.4)',
        fontWeight: 'bold',
        verticalAlign: 'middle'
    },
    col: {
        padding: '5px 10px',
        border: '1px solid rgba(0, 0, 0, 0.4)',
        textAlign: 'center',
        verticalAlign: 'middle'
    },
    input: {
        width: 50,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottomWidth: 2,
        borderBottomColor: colors.blue,
        fontSize: 20,
        fontFamily: 'Lato',
        lineHeight: 1,
        color: 'rgba(0, 0, 0, 0.64)',
        paddingBottom: 8,
        outline: 'none',
        textAlign: 'center',
        '@media (max-width: 768px)': {
          width: 180,
        },
        '@media (max-width: 600px)': {
          width: 240,
        },
        ':focus': {
          borderBottomColor: colors.green,
        },
    },
    checkboxInput: {
		width: 18,
		height: 18,
        margin: 'auto',
        cursor: 'pointer'
	},
    numericInput: {
        wrap: {
            height: 32,
            width: '100%'
        },
        input: {
            height: 32,
            width: '100%',
            minWidth: 70
        },
        arrowUp: {
            
        },
        arrowDown: {
            
        }
    },
    button_container: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '25px auto'
    },  
    validateButton: {
        backgroundColor: colors.green,
        color: colors.white,
        width: 230,
        borderRadius: 100,
        borderStyle: 'none',
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
        fontSize: 22,
        cursor: 'pointer',
        padding: '13px 5px',
    
        position: 'relative',
      },
}