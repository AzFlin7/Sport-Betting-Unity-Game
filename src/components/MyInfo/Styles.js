import { colors, fonts, metrics } from '../../theme'

const styles = {
	container: {
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
	header: {
		fontFamily: 'Lato',
		fontSize: 20,
		//fontWeight: 'bold',
		color: colors.black,
		paddingBottom: 15,
		flex: 5,
	},
	pageHeader: {
		fontFamily: 'Lato',
		fontSize: 20,
		fontWeight: 'bold',
		color: colors.blue,
		marginBottom: 15,
	},
	pagedocument: {
		fontSize:16,
    lineHeight: 2,
    color: 'rgba(0, 0, 0, 0.65)',
    fontStyle: 'normal',
    marginTop: 15,
    maxWidth: 570,
		fontFamily: 'arial',
		minHeight: 162,
    margin: '40px auto'
	},
	row: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		marginTop: 15,
		//marginBottom: 10,
		alignItems: 'baseline',
	},
	col: {
		display: 'flex',
		flexDirection: 'column',
		marginBottom: 10
	},
	rowBold: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		marginTop: 15,
		fontWeight: 'bold',
	},
	rowHeader: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		marginTop: 30,
		borderBottom: '1px solid ' + colors.gray,
		flexGrow: 0,
	},
	exclamationRow: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		marginTop: 15,
		alignItems: 'center',
		marginTop: 10,
	},
	label: {
		fontSize: 16,
		width: 180,
		color: colors.black,
	},
	longLabel: {
		fontSize: 16,
		flex: 2,
		color: colors.black,
	},
	smallLabel: {
		fontSize: 16,
		height: '32px',
    lineHeight: '20px',
		flex: 1,
		color: colors.black,
	},
	note: {
		fontSize: 16,
		height: '32px',
    lineHeight: '20px',
		color: colors.black,
	},
	importantNote: {
		fontSize: 16,
		height: '32px',
    lineHeight: '20px',
		color: colors.red,
		marginBottom: 15
	},
	exclamationMark: {
		fontSize: 16,
		height: '32px',
    lineHeight: '20px',
		color: colors.red,
		marginRight: 15
	},
	tableHeader: {
		fontSize: 16, 
		fontWeight: 'bold',
		color: colors.black,
		height: 30,
		borderBottom: '1px solid ' + colors.gray,
		'@media (max-width: 560px)': {
			fontSize: 14
		}
	},
	tableRow: {
		height: 33,
		borderBottom: '8px solid transparent',
		borderTop: '10px solid transparent'
	},
	tableLabel: {
		fontSize: 16,
    lineHeight: '20px',
		color: colors.black,
		width: 505,
		verticalAlign: 'middle',
		'@media (max-width: 560px)': {
			fontSize: 14
		}
	},
	tableCol: {
		textAlign: 'center',
		width: 70,
		verticalAlign: 'middle'
	},
	refContainer: {
		borderWidth: 1,
		borderColor: colors.lightGray,
		margin: '3px 0px 5px',
		borderStyle: 'solid',
		borderRadius: 2,
		color: colors.darkGray,
		fontSize: 14
	},
	notePassword: {
		fontSize: 16,
		lineHeight: '20px',
		color: colors.black,
	},
	inputLabel: {
		fontSize: 16,
    	lineHeight: '20px',
		color: colors.black,
	},
	inputLabelExample: {
		fontSize: 16,
    	lineHeight: '20px',
		color: '#BBB', 
		fontStyle: 'italic'
	},
	explaination: {
		fontSize: 16, 
		lineHeight: '24px',
		color: colors.black,
		fontStyle: 'italic',
		marginBottom: 30
	},
	completeInfoText: {
		fontSize: 16, 
		lineHeight: '24px',
		color: colors.black,
		fontStyle: 'italic',
		marginTop: 15
	},
	noDataError: {
		fontSize: 14,
		height: '32px',
    lineHeight: '20px',
		color: colors.error,
		width: '100%',
		textAlign: 'center',
		marginTop: 20,
	},
	error: {
		fontSize: 14,
		height: '32px',
    lineHeight: '20px',
		color: colors.error,
	},
	input: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '32px',
    lineHeight: '32px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    display: 'block',
    background: 'transparent',
    //marginBottom: '20px',
    //width: '100%',
    fontSize: 16,
    outline: 'none',
		width: 300,
	},
	smallInput: {
		borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.blue,
    height: '32px',
    lineHeight: '32px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    display: 'block',
    background: 'transparent',
    fontSize: 16,
    outline: 'none',
		width: 50,
		textAlign: 'center',
		marginRight: 10
	},
	inputError: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.error,
    height: '32px',
    lineHeight: '32px',
    fontFamily: 'Lato',
    color: 'rgba(0,0,0,0.65)',
    display: 'block',
    background: 'transparent',
    //marginBottom: '20px',
    //width: '100%',
    fontSize: fonts.size.medium,
    outline: 'none',
		width: 300,
  },
	editButton: {
		selfAlign: 'flex-end',
		color: colors.blue,
		cursor: 'pointer', 
		right: 0,
		fontFamily: 'Lato',
		fontSize: 20,
		paddingBottom: 15,
		flex: 1,
		textAlign: 'right',
	},
	subHeader: {
		fontFamily: 'Lato',
		fontSize: 16,
		fontWeight: 'bold',
		color: colors.black,
		marginTop: 10,
		width: '100%',
		paddingBottom: 5,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	cancelLink: {
		fontFamily: 'Lato',
		fontSize: 16,
		marginLeft: 20,
		color: colors.blue,
		cursor: 'pointer',
	},
	cardType: {
		fontSize: 16,
		width: '35%',
		color: colors.black,
		textAlign: 'center',
	},
	cardMask: {
		fontSize: 16,
		width: '30%',
		color: colors.black,
		textAlign: 'center',
	},
	cardExpiry: {
		fontSize: 16,
		width: '15%',
		color: colors.black,
		textAlign: 'center',
	},
	cardRemove: {
		fontSize: 16,
		width: '20%',
		color: colors.black,
		textAlign: 'center',
	},
	oneThird: {
		fontSize: 16,
		width: '33%',
		color: colors.black,
		textAlign: 'left',
	},
	checkboxInput: {
		width: 18,
		height: 18,
		border: '2px solid #5E9FDF',
		display: 'block',
	},
	checkbox: {
		width: 18,
		height: 18,
		border: '2px solid #5E9FDF',
		cursor: 'pointer'
	},
	cardsIcon: {
		maxWidth: 170
	},
	blueButton: {
    backgroundColor: colors.blue,
    color: colors.white,
    fontSize: fonts.size.small,
    borderRadius: metrics.radius.tiny,
    margin: metrics.margin.medium,
    outline: 'none',
		border: 'none',
		padding: '10px',
		cursor: 'pointer',
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		marginBottom: 40
	},

	certificateButton: {
    backgroundColor: colors.blue,
    color: colors.white,
    fontSize: fonts.size.small,
    borderRadius: metrics.radius.tiny,
    margin: metrics.margin.medium,
    outline: 'none',
		border: 'none',
		padding: '5px',
		cursor: 'pointer',
		boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
		marginBottom: 40
	},

	bankAccountContainer: {
		marginTop: 15,
		padding: '10px 15px',
		backgroundColor: '#EEE',
		borderRadius: 5
	},
	bankAccountTitleContainer: {

	},
	bankAccountTitle: {
		fontFamily: 'Lato',
		fontSize: 16,
		color: colors.black,
		paddingBottom: 10,
		fontWeight: 'bold'
	},
	bankAccountExplanation: {
		fontFamily: 'Lato',
		fontSize: 14,
		color: colors.black,
		fontFamily: 'Lato',
		fontStyle: 'italic',
		marginBottom: 10
	},
	bankAccountDetailRow: {
		fontSize: 14,
		flex: 2,
		color: colors.black,
		marginBottom: 3
	},
	head:{
		fontSize:25,
		fontFamily: 'Lato',
		fontWeight:'bold',
		color: 'red',
	},
	geosuggest: {
    input: {
      width: 300,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderBottomWidth: 2,
      borderBottomColor: colors.blue,
      paddingRight: 20,

      fontSize: 16,
      fontFamily: 'Lato',
      lineHeight: 1,
      paddingLeft: 3,
      paddingBottom: 5,
			color: 'rgba(0,0,0,0.65)',

      outline: 'none',
      ':focus': {
        borderBottomColor: colors.green,
      },
    },

    suggests: {
      width: 300,
      position: 'absolute',
      backgroundColor: colors.white,

      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
      border: '2px solid rgba(94,159,223,0.83)',
      padding: 20,
      zIndex: 100,
    },

    suggestItem: {
      paddingTop: 10,
      paddingBottom: 10,
      color: '#515151',
      fontSize: 18,
      fontWeight: 500,
      fontFamily: 'Helvetica Neue',
	},
  },
}

export default styles