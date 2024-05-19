import { colors } from '../../../theme';

export default {
  circle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textDecoration: 'none',
    width: '100%'
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    marginBottom: 7,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
  name: {
    color: colors.black,
    fontSize: 17,
    textDecoration: 'none',
    textTransition: 'none',
    width: '100%',
    textAlign: 'center',
    wordWrap: 'break-word',
    fontWeight: 'bold'
  },
    container: {
        padding: '40px',
        fontFamily: 'Lato',
        color: 'rgba(0,0,0,0.65)',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center'
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
    subtitle: {
        fontSize: 18,
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
        verticalAlign: 'middle',
      '@media (maxWidth: 480px)': {
        minWidth: 150,
      },
      '@media (maxWidth: 376px)': {
        minWidth: 50,
      },

    },
  col: {
    padding: '5px 10px',
    borderRight: '1px solid rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
    verticalAlign: 'middle'
  },
  teamRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    alignItems: 'baseline'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 50,
    color: colors.blue,
    fontWeight: 'bold',
    fontFamily: 'lato',
  },
  statName: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'lato',
  },
}