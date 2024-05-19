import { colors } from '../../theme';

const styles = {
  languageTopRight: {
    marginTop: 15,
    marginBottom: 15,
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    backgroundImage: 'url(/images/background-signup.jpg)',
    backgroundSize: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    minHeight: '100vh',
  },
  signin: {
    fontFamily: 'Lato',
    fontSize: '18px',
    textAlign: 'right',
    lineHeight: '28px',
    color: 'rgba(255,255,255,0.65)',
    position:'absolute',
    right: '15px',
    top: '15px',
  },
  signinLink: {
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'none',
  },
  modalContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    maxWidth: 460,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: '16px',
    padding: '30px',
    marginTop: '75px',
    marginBottom: '50px',
    '@media (max-width: 1080px)': {  
      marginTop: '75px',
    }
  },

  // -------------------------------- Logo -------------------------------- //

  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: {
    fontFamily: 'Lato',
    fontSize: '24px',
    textAlign: 'center',
    lineHeight: '29px',
    color: '#4A4A4A',
    marginBottom: '20px',
    marginTop: '20px',
  },
  h2: {
    fontFamily: 'Lato',
    fontSize: '18px',
    lineHeight: '22px',
    textAlign: 'center',
    color: '#4A4A4A',
    marginBottom: '20px',
    marginTop: '20px',
  },
  email: {
    fontFamily: 'Lato',
    fontSize: '18px',
    lineHeight: '22px',
    textAlign: 'center',
    color: colors.darkBlue,
    marginBottom: '20px',
    marginTop: '20px',
  },
  logo: {
    maxWidth: '75px',
    height: 'auto',
    display: 'inline-block',
    margin: 'auto',
    userSelect: 'none',
  },

  // -------------------------------- Submit -------------------------------- //

  submitContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  submitOr: {
    fontFamily: 'Lato',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: '17px',
    color: 'rgba(65,65,65,0.65)',
    marginTop: 10,
    marginBottom: 10,
  },
  submitSmallPrint: {
    textAlign: 'center',
    fontFamily: 'Lato',
    fontsize: '12px',
    fontWeight: '500',
    lineHeight: '15px',
    color: '#212121',
    marginTop: 10,
    marginBottom: 10,
  },
  submitVenueLink: {
    fontFamily: 'Lato',
    fontSize: '18px',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: '20px',
    color: colors.blue,
    marginTop: 10,
  },
}

export default styles;
