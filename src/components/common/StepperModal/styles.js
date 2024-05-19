import { colors, fonts } from '../../../theme';

export default {
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
    justifyContent: 'space-evenly',
    background: '#e1e1e1',
    padding: 10
  },
  modalTitle: {
    fontFamily: 'Lato',
    fontSize:24,
    fontWeight: fonts.weight.medium,
    color: colors.blue,
    flex: '2 0 0',
  },
  modalClose: {
    justifyContent: 'flex-center',
    color: colors.gray,
    cursor: 'pointer',
  },
  confirm: {
    color: colors.black,
    fontSize: 16,
    fontFamily: 'Lato',
    marginTop:20,
    marginBottom: 10,
  },
  accountLine: {
    display: 'flex',
    flexDirection: 'row',
    padding: '5px 10px',
    alignItems: 'center',
    cursor: 'pointer'
  },
  accountAvatar: {
    width: 39,
    height: 39,
    marginRight: 10,
    color: colors.blue,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderRadius: '50%',
  },
  accountPseudo: {
    display: 'flex',
    fontSize: 16,
    color: colors.blue,
    fontFamily: 'Lato',
    textAlign: 'center'
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
  addTeamIcon: {
    fontSize: 30,
    width: 38,
    height: 38,
    margin: '0px 10px 0 0px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    color: colors.blue,
    backgroundColor: colors.lightGray,
    fontFamily: 'Lato',
  },
  icon: {
    display: 'inline-block',
    width: 38,
    height: 38,
    marginRight: 10,
  },
  iconImage: {
    color: colors.white,
    width: 75,
    height: 75,
    borderRadius: '50%',
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    '@media (max-width: 650px)': {
      width: 65,
      height: 65,
    },
    '@media (max-width: 450px)': {
      width: 60,
      height: 60,
    }
  },
  linkImage: {
    width: 60,
    height: 60,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    fontSize: '4em',
    margin: 5,
    color: 'inherit'
  },
  label: {
    fontFamily: 'Lato',
    fontSize: 16,
    textAlign: 'center',
    color: colors.black,
  },
  stepTextContainer: {
    flexDirection: 'column',
    flex: '6 2 0',
    marginLeft: 20,
    paddingBottom: 10
  },
  stepTitle: {
    fontFamily: 'Lato',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'left',
    color: 'inherit',
    '@media (max-width: 650px)': {
      fontSize: 22
    },
    '@media (max-width: 450px)': {
      fontSize: 18
    }
  },
  stepDescription: {
    fontFamily: 'Lato',
    fontSize: 16,
    textAlign: 'left',
    color: 'inherit',
    paddingTop: 15,
    '@media (max-width: 650px)': {
      fontSize: 13
    },
    '@media (max-width: 450px)': {
      fontSize: 13
    }
  },
  listItemWrapper: {
    display: 'flex',
    width: '100%',
    minHeight: 100,
    borderBottom: '1px solid #ccc',
    cursor: 'pointer',
    marginBottom: '-10px',
    color: colors.black,
  },
  listItemWrapperDisabled: {
    display: 'flex',
    width: '100%',
    minHeight: 100,
    borderBottom: '1px solid #ccc',
    marginBottom: '-10px',
    color: colors.gray,
  },
  skipStep: {
    display: 'flex',
    fontFamily: 'Lato',
    font: 6,
    justifyContent: 'flex-end',
    cursor: 'pointer',
    alignItems: 'baseline'
  },
  progressBar: {
    position: 'relative',
    height: '30px',
    width: '90%',
    marginTop: 10,
    border: '1px solid #333'
  },
  filler: {
    display: 'flex',
    fontWeight: 'bold',
    background: colors.green,
    alignItems: 'center',
    height: '100%',
    borderRadius: 'inherit',
    transition: 'width .2s ease-in'
  },
  iconChecked: {
    fontSize: '4em',
    margin: 5,
    color: colors.green
  },
  iconStep: {
    fontSize: '4em',
    margin: 5,
    color: 'inherit',
    minWidth: 60,
    textAlign: 'center'
  },
  profileType: {
    fontFamily: 'Lato',
    paddingTop: 8,
    paddingLeft: 15,
    textDecoration: 'underline',
    cursor: 'pointer',
    color: colors.darkGray,
    '@media (max-width: 500px)': {
      paddingLeft: 0
    }
  },
  stepIconContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    color: 'inherit',
  },
  stepNumber: {
    fontSize: 35,
    color: 'inherit',
    fontFamily: 'Lato',
    fontWeight: 'bold',
    paddingBottom: 5
  },
  selectInput: {
    color: 'rgba(0,0,0,0.65)',
    border: '1px solid rgba(0,0,0,0.2)',
    borderColor: 'transparent',
    background: '#e1e1e1',
    borderBottom: '2px solid '+colors.blue,
    fontSize: 18,
    outline: 'none',
    fontFamily: 'Lato',
    width: '100%'
  },
  selectInputDisabled: {
    color: 'rgba(0,0,0,0.65)',
    border: '1px solid rgba(0,0,0,0.2)',
    borderColor: 'transparent',
    background: '#e1e1e1',
    borderBottom: '2px solid '+colors.darkGray,
    fontSize: 18,
    outline: 'none',
    fontFamily: 'Lato',
    width: '100%'
  }
};