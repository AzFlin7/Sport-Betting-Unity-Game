import { colors } from '../../../theme';

export const styles = {
  container: {
    flex: 1,
    width: '100%',
    margin: 'auto',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: colors.blue,
    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24)',
    paddingLeft: 20,
    '@media (max-width: 500px)': {
      display: 'flex',
    },
  },
  loggedInContainer: {
    flex: 1,
    // max-width: 1400,
    width: '100%',
    margin: 'auto',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: colors.blue,
    position: 'relative',
    //boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24)', Vikas B - commenting the shadow because we need to merge the colors of side pane with the header
    paddingLeft: 20,
    '@media (max-width: 990px)': {
      height: 'auto',
      display: 'block',
      paddingLeft: 10,
      paddingRight: 10,
    },
    '@media (max-width: 500px)': {
      display: 'flex',
    },
  },
  logo: {
    color: colors.white,
    flexShrink: 0,
    height: 62,
    marginRight: 40,
    lineHeight: '62px',
    '@media (max-width: 900px)': {
      marginRight: 5,
    },
    '@media (max-width: 500px)': {
      height: 'auto',
      display: 'block',
      textAlign: 'center',
      marginRight: 0,
    },
  },
  loggedInLogo: {
    color: colors.white,
    flexShrink: 0,
    height: 62,
    marginRight: 40,
    lineHeight: '62px',
    '@media (max-width: 850px)': {
      marginRight: 20,
    },
    '@media (max-width: 990px)': {
      height: 'auto',
      display: 'block',
      textAlign: 'center',
      marginRight: 0,
    },
    '@media (max-width: 500px)': {
      flex: 1,
    },
  },
  logoImg: {
    maxHeight: 30,
    verticalAlign: 'middle',
  },
  logoLink: {
    height: 62,
    display: 'inline-block',
  },
  download_icons: {
    display: 'none',
    '@media (max-width: 500px)': {
      display: 'block',
      textAlign: 'center',
      paddingTop: 7,
      paddingBottom: 7,
    },
  },
  download_icons_text: {
    fontSize: 14,
    fontFamily: 'Lato',
  },
  col5: {
    width: '50%',
  },
  iconImage: { width: '75%' },
  button: {
    fontSize: '12px',
    backgroundColor: colors.blue,
    color: colors.white,
    textTransform: 'none',
  }
};
