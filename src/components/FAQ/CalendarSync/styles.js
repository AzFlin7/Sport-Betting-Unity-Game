import { colors } from '../../../theme'

export default  {
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 20,
    },
    content: {
        width: 1000,
        margin: '35px auto',
        display: 'flex',
        flexDirection: 'column',
        '@media (max-width: 960px)': {
            width: '94%',
        }
    },
    title: {
        fontSize: 30,
        color: colors.blue,
        fontFamily: 'Lato',
        marginBottom: 30
    },
    body: {
        borderRadius: 5,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.4)',
        fontSize: 16,
        fontFamily: 'Lato',
        color: colors.black,
        padding: '20px 30px',
    },
    sectionTitle: {
        fontSize: 18,
        textAlign: 'left',
        fontWeight: 'bold'
    },
    sectionSubTitle: {
        fontSize: 16,
        textAlign: 'left',
        fontWeight: 'bold'
    },
    sectionContent: {
        lineHeight: '28px',
        marginTop: 22,
        marginBottom: 30
    },
    sectionIntro: {
        fontStyle: 'italic'
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 25,
        '@media (max-width: 640px)': {
            flexDirection: 'column'
        }
    },
    secondRow: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 25,
        '@media (max-width: 960px)': {
            flexDirection: 'column'
        }
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
        width: '30%',
        margin: '0 auto',
        textAlign: 'center',
        '@media (max-width: 960px)': {
            width: '35%'
        },
        '@media (max-width: 780px)': {
            width: '40%'
        },
        '@media (max-width: 650px)': {
            width: '75%',
            marginBottom: 30
        },
    },
    biggerColumn: {
        display: 'flex',
        flexDirection: 'column',
        width: '60%',
        margin: '0 auto',
        textAlign: 'center',
        '@media (max-width: 960px)': {
            width: '95%',
            margin: '30px auto'
        },
    },
    image: {
        width: '100%'
    },
    imageNote: {
        fontSize: 14,
        color: colors.gray
    },
    paragraph: {
        marginTop: 35
    },
    cautionText: {
        border: '1px solid red',
        color: colors.red,
        padding: '10px 25px'
    },
    redText: {
        color: colors.red,
    },
    underlinedText: {
        textDecoration: 'underline'
    },
    importantNote: {
        marginTop: 10,
        color: colors.red,
        fontWeight: 'bold'
    }
}