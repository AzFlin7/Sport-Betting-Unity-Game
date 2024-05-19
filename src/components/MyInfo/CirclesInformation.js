import React from 'react'
import {createRefetchContainer, graphql} from 'react-relay';
import { withAlert } from 'react-alert'
import { Link } from 'found';
import ReactLoading from 'react-loading'
import moment from 'moment'
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

import { colors, fonts, appStyles } from '../../theme'
import UpdateFilledInformationMutation from '../Circle/CircleMembersInformation/UpdateFilledInformationMutation'
import InputText from '../common/Inputs/InputText'
import InputNumber from '../common/Inputs/InputNumber'
import InputCheckbox from '../common/Inputs/InputCheckbox'
import InputSelect from '../common/Inputs/InputSelect'
import InputDate from '../common/Inputs/InputDate'
import InputAddress from '../common/Inputs/InputAddress'
import InputPhone from '../common/Inputs/InputPhone'
import {showSelectDocumentModal} from '../MyInfo/Document/DocumentModal'
import localizations from '../Localizations'
import styles from './Styles'

class CirclesInformation extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            circlesWithAskedInformation: [],
            circlesWithAskedFees: [],
            editInfo: false,
            isLoading: false,
            cross: false,
            show: true,
        }
        this.alertOptions = {
            offset: 60,
            position: 'top right',
            theme: 'light',
            transition: 'fade',
        };
    }

    componentDidMount = () => {
        this._refetch()
        if (this.props.user && this.props.user.circlesInformationCircles && this.props.user.circlesInformationCircles.edges && this.props.user.circlesInformationCircles.edges.length > 0)
            this._setCircleWithAskedInformation(this.props.user.circlesInformationCircles.edges)
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.user && 
            nextProps.user.circlesInformationCircles && 
            nextProps.user.circlesInformationCircles.edges && 
            nextProps.user.circlesInformationCircles.edges.length > 0 && 
            (!this.props.user.circlesInformationCircles || !isEqual(this.props.user.circlesInformationCircles, nextProps.user.circlesInformationCircles)))
            this._setCircleWithAskedInformation(nextProps.user.circlesInformationCircles.edges)
    }

    _setCircleWithAskedInformation = (circles) => {
        let circleAskedInformationList = [];
        let paymentModelList = [];

        circles.forEach(circle => {
            if (circle.node.askedInformation && circle.node.askedInformation.length > 0) {
                circleAskedInformationList.push({
                    circle: circle.node,
                    forms: []
                });

                circle.node.askedInformation.forEach(askedInfo => {
                    let formIndex = circleAskedInformationList[circleAskedInformationList.length - 1].forms.findIndex(form => form.id === askedInfo.form.id);
                    if (formIndex >= 0) {
                        circleAskedInformationList[circleAskedInformationList.length - 1].forms[formIndex].info.push(askedInfo)
                    }
                    else {
                        circleAskedInformationList[circleAskedInformationList.length - 1].forms.push({
                            id: askedInfo.form.id,
                            name: askedInfo.form.name,
                            info: [askedInfo]
                        });
                    }
                })
            }
            if (circle.node.paymentModels && circle.node.paymentModels.length > 0) {
                paymentModelList.push(circle.node)
            }
        });

        this.setState({
            circlesWithAskedInformation: circleAskedInformationList,
            circlesWithAskedFees: paymentModelList,
        })
    }

    _setEditMode = () => {
        this.setState({
            editInfo: !this.state.editInfo
        })
    }

    _handleCancel = () => {
        this.setState({
            editInfo: false
        })
    }

    _handleSave = (circle) => {
        const idVar = circle.id;
        const userId = this.props.user.id;
        const viewer = this.props.viewer;

        this.setState({
            isLoading: true
        })
        
        var answersVar = [{
            userId,
            filledInformation: circle.membersInformation.map(answer => (
                typeof answer.value !== 'undefined'
                    ? {
                        id: answer.information,
                        value: answer.value && answer.value.id ? null : answer.value,
                        documentId: answer.value && answer.value.id ? answer.value.id : null
                    }
                    : false
            )).filter(i => Boolean(i))
        }]
        /*if(this.props.selected.name){
            let newData = {
                id: this.props.selected.id,
                value:this.props.selected.name
            }
            answersVar[0].filledInformation.push(newData)
        }*/
        UpdateFilledInformationMutation.commit({
                viewer,
                idVar,
                answersVar
            },
            {
                onFailure: error => {
                    this.props.alert.show(localizations.popup_editCircle_update_failed, {
                        timeout: 2000,
                        type: 'error',
                    });
                    let errors = JSON.parse(error.getError().source);
                    console.log(errors);
                    this.setState({
                        isLoading: false
                    })
                },
                onSuccess: (response) => {
                    this.props.alert.show(localizations.popup_editCircle_update_success, {
                        timeout: 2000,
                        type: 'success',
                    });
                    this.setState({
                        editInfo: false,
                        isLoading: false
                    })
                },
            }
        )
    }

    _handleUpdateValue = (circle, askedInfo, value) => {
        let newState = cloneDeep(this.state.circlesWithAskedInformation);
        let userId = this.props.user.id;

        if (askedInfo.type === 'NUMBER' && value.length > 5)
            return;
        if (askedInfo.type === 'PHONE_NUMBER' && value.length > 10)
            return;

        newState.forEach((newStateCircle, i) => {
            if (newStateCircle.circle.id === circle.id) {
                let index = newStateCircle.circle.membersInformation.findIndex(memberInfo => {
                    return (memberInfo.user.id === userId && memberInfo.information === askedInfo.id)
                })
                if (index >= 0) {
                    if (askedInfo.type === 'BOOLEAN')
                        newState[i].circle.membersInformation[index].value = value ? "true" : "false";
                    else {
                        newState[i].circle.membersInformation[index].value = value;
                        if (newState[i].circle.membersInformation[index].document && !value)
                            newState[i].circle.membersInformation[index].document = value
                    }
                }
                else {
                    newState[i].circle.membersInformation.push({
                        information: askedInfo.id,
                        user: this.props.user,
                        value: askedInfo.type === 'BOOLEAN' ? value ? "true" : "false" : value
                    })
                }
            }
        });

        this.setState({
            circlesWithAskedInformation: newState
        })
    }

    _getRowValue = (userId, membersInfo, askedInfo) => {
        let result;
        membersInfo.forEach(info => {
            if (info.user.id === userId && info.information === askedInfo.id) {
                if (askedInfo.type === "BOOLEAN")
                    result = info.value === "true" ? true : false;
                else if (askedInfo.type === "NUMBER")
                    result = parseInt(info.value)
                else if (askedInfo.type === "DOCUMENT") {
                    result = info.value ? info.value.name : info.document && info.document.id ? info.document.name : ""
                    if (info.validationStatus === 'REJECTED' && info.document) {
                        result = <span>
                            {`${result} - ${localizations.info_document_rejected} (${info.comment})`}
                            <br/>
                            <span style={{color: colors.redGoogle}}>{localizations.info_document_download_new}</span>
                        </span>
                        //result = result + "aha"
                    }
                }
                else
                    result = info.value;
            }
        })

        if (typeof result === "undefined") {
            if (askedInfo.type === "BOOLEAN")
                result = false;
            else
                result = ""
        }

        return result
    }

    _renderRowValue = (userId, membersInfo, askedInfo) => {
        let result;
        
        membersInfo.forEach(info => {
            if (info.user.id === userId && info.information === askedInfo.id && typeof info.value !== 'undefined') {
                if (askedInfo.type === "BOOLEAN")
                    result = info.value === "true" ? localizations.circle_yes : localizations.circle_no;
                else if (askedInfo.type === "NUMBER")
                    result = parseInt(info.value)
                else if (askedInfo.type === "DATE")
                    result = moment(new Date(info.value)).format('DD MMM YYYY')
                else if (askedInfo.type === "DOCUMENT") {
                    result = info.value 
                    ? info.value.name 
                    : info.document && info.document.id 
                        ? info.document.name 
                        : ""

                    if (info.validationStatus === 'REJECTED') {
                        result = result + ' - ' + localizations.info_document_rejected + ' (' + info.comment + ')'
                    }
                }
                else
                    result = info.value;
            }
        })

        if (typeof result === "undefined") {
            if (askedInfo.type === "BOOLEAN")
                result = localizations.circle_no;
            else
                result = ""
        }

        return result
    }
  
    buttonClicked(){
       this.setState({
            cross: true,
            show: false
       })
    }
    handleClose = () => {
        this.setState({ cross: false });
    };

    selectADocument = (circle, askedInfo) => {
        showSelectDocumentModal({
            canCloseModal: true,
            selectDocument: doc => this._handleUpdateValue(circle, askedInfo, doc),
        });
    }

    _renderInputField = (askedInfo, circle) => {
        const { user } = this.props;

        if (this.state.editInfo) {
            switch (askedInfo.type) {
                case 'TEXT': return (
                    <InputText
                        maxLenght={40}
                        value={this._getRowValue(user.id, circle.membersInformation, askedInfo)}
                        onChange={(e) => this._handleUpdateValue(circle, askedInfo, e.target.value)}
                    />
                )
                case 'NUMBER': return (
                    <InputNumber
                        max={99999}
                        value={this._getRowValue(user.id, circle.membersInformation, askedInfo)}
                        onChange={(e) => this._handleUpdateValue(circle, askedInfo, e.target.value)}
                    />
                )
                case 'BOOLEAN': return (
                    <InputCheckbox
                        checked={this._getRowValue(user.id, circle.membersInformation, askedInfo)}
                        onChange={(e) => this._handleUpdateValue(circle, askedInfo, e.target.checked)}
                    />
                )
                case 'ADDRESS': return (
                    <InputAddress
                        value={this._getRowValue(user.id, circle.membersInformation, askedInfo)}
                        onChange={(e) => this._handleUpdateValue(circle, askedInfo, e ? e.label : '')}
                    />
                )
                case 'DATE': return (
                    <div style={{ width: 200 }}>
                        <InputDate
                            value={this._getRowValue(user.id, circle.membersInformation, askedInfo)}
                            onChange={(e) => this._handleUpdateValue(circle, askedInfo, e._d)}
                        />
                    </div>
                )
                case 'PHONE_NUMBER': return (
                    <InputPhone
                        value={this._getRowValue(user.id, circle.membersInformation, askedInfo)}
                        onChange={(e) => this._handleUpdateValue(circle, askedInfo, e.target.value)}
                    />
                )
                case 'DOCUMENT' : return (
                    <div>
                        {this._getRowValue(user.id, circle.membersInformation, askedInfo)
                        ?   <span style={{display: 'flex', alignItems: 'center'}}>
                                {this._getRowValue(user.id, circle.membersInformation, askedInfo)}
                                <button 
                                    style={{color:'red', marginLeft: 10, border: 'none', background: 'none', cursor: 'pointer'}} 
                                    onClick={() => this._handleUpdateValue(circle, askedInfo, null)}
                                >
                                    <i className="fa fa-times fa-2x" />
                                </button>
                            </span>
                        :   <button 
                                style={appStyles.blueButton}
                                onClick={() => this.selectADocument(circle, askedInfo)}
                            >
                                {localizations.info_document_upload}
                            </button>
                        }
                    </div>
                )
                case 'CUSTOM': return (
                    <InputSelect
                        isDisabled={false}
                        list={askedInfo.answers.map(a => ({ name: a }))}
                        selectedItem={{ name: this._getRowValue(user.id, circle.membersInformation, askedInfo) }}
                        onSelectItem={(e) => this._handleUpdateValue(circle, askedInfo, e.name)}
                    />
                )
                default:
                    return (
                        <InputText
                            maxLenght={40}
                            value={this._getRowValue(user.id, circle.membersInformation, askedInfo)}
                            onChange={(e) => this._handleUpdateValue(circle, askedInfo, e.target.value)}
                        />
                    )
            }
        }
        else {
            return (
                <label style={styles.longLabel}>
                    {this._renderRowValue(user.id, circle.membersInformation, askedInfo)}
                </label>
            )
        }
    }

    _refetch = () => {
        this.props.relay.refetch();
    }

    render() {

        const { user, viewer } = this.props;
        const { circlesWithAskedInformation, circlesWithAskedFees, editInfo, isLoading } = this.state;

        if (user && !user.mangoId) {
            return (
                <section style={{ margin: 30 }}>
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            marginTop: 30,
                            flexGrow: 0,
                        }}
                    >
                        <div style={styles.pageHeader}>
                            {localizations.circles_information}
                        </div>
                    </div>
                    <section>

                        <div style={styles.completeInfoText}>
                            {localizations.info_sharedInfo_explanaition}
                        </div>
                        <div style={{ ...styles.completeInfoText, color: colors.red }}>
                            {localizations.info_sharedInfo_complete_profile2}
                        </div>
                    </section>
                </section>
            );
        }
     
        return (
            user.circlesInformationCircles && user.circlesInformationCircles.edges && user.circlesInformationCircles.edges.length > 0 && circlesWithAskedInformation.length > 0
                ? <section style={styles.container}>
                    <div style={styles.pageHeader}>
                        {localizations.circles_information}
                    </div>
                    <div style={styles.explaination}>
                        {localizations.info_sharedInfo_explanaition}
                    </div>

                    <div style={styles.rowHeader}>
                        <div style={styles.header}>
                            {localizations.info_circleInfo}
                        </div>
                        <div style={styles.editButton} onClick={this._setEditMode}>
                            {localizations.info_edit}
                        </div>
                    </div>
                    {circlesWithAskedInformation.map((circleWithAskedInfo, index) => (
                        <div style={styles.col} key={index}>
                            {circleWithAskedInfo.forms.map(form => (
                                <div style={styles.bankAccountContainer} key={form.id}>
                                    <label style={styles.subHeader}>
                                    {localizations.formatString(localizations.info_formName, form.name, circleWithAskedInfo.circle.owner.pseudo)}
                                    </label>
                                    {form.info.map(askedInfo => (
                                        askedInfo.filledByOwner
                                            ? false
                                            : <div style={styles.row} key={askedInfo.id}>
                                                <label style={styles.label}>
                                                    {askedInfo.name}
                                                </label>
                                                {this._renderInputField(askedInfo, circleWithAskedInfo.circle)}
                                            </div>
                                    )).filter(i => Boolean(i))}
                                </div>
                            ))}

                            {editInfo &&
                                <div style={styles.row}>
                                    <label style={styles.label}></label>
                                    {isLoading
                                        ? <ReactLoading type='cylon' color={colors.blue} />
                                        : <section>
                                            <button style={appStyles.blueButton} onClick={() => this._handleSave(circleWithAskedInfo.circle)}>
                                                {localizations.info_update}
                                            </button>
                                            <button style={appStyles.grayButton} onClick={this._handleCancel}>
                                                {localizations.info_cancel}
                                            </button>
                                        </section>
                                    }
                                </div>
                            }
                        </div>
                    ))}
                </section>
                : <section style={styles.container}>
                    <div style={styles.pageHeader}>{localizations.info_sharedInfo}</div>
                    <div style={styles.explaination}>
                        {localizations.info_sharedInfo_nothing}
                    </div>
                </section>
        )
    }
}

export default createRefetchContainer(withAlert(CirclesInformation), {
    user: graphql`
        fragment CirclesInformation_user on User {
            id,
            mangoId
            appCurrency
            circlesInformationCircles: circlesUserIsIn (last: 100) {
                edges {
                    node {
                        id,
                        name
                        owner {
                            pseudo
                            paymentModelFees
                            bankAccount {
                                addressLine1,
                                addressLine2,
                                city,
                                postalCode,
                                country,
                                ownerName,
                                IBAN,
                                BIC
                            }
                        }
                        askedInformation {
                            id, 
                            name,
                            type,
                            answers
                            filledByOwner
                            form {
                                id
                                name
                            }
                        }
                        membersInformation {
                            id,
                            information,
                            user {
                                id,
                            }
                            value
                            document {
                                id,
                                name
                            }
                            validationStatus
                            comment
                        }
                        paymentModels {
                            id,
                            name,
                            paymentViaBankWireAllowed
                            memberToPayFees
                            inAppPaymentAllowed,
                            price {
                                cents,
                                currency
                            }
                            memberSubscriptions {
                                user {
                                    id
                                }
                                amount {
                                    cents
                                    currency
                                }
                                beginning_date
                                ending_date
                            }
                            conditions {
                                id,
                                name, 
                                price {
                                    cents,
                                    currency
                                }
                                conditions {
                                    askedInformation {
                                        id
                                        type
                                    }
                                    askedInformationComparator
                                    askedInformationComparatorValue
                                    askedInformationComparatorValueString
                                    askedInformationComparatorDate
                                }
                            }
                        }
                    }
                }
            }
        }
    `,
    viewer: graphql`
        fragment CirclesInformation_viewer on Viewer {
            id
            me {
                id
                documents {
                    id,
                    name,
                    link,
                    creation_date
                }
            }
            ...CirclePaymentReference_viewer
            ...FeesPaymentPopup_viewer
        }`
},
    graphql`query CirclesInformationRefetchQuery {
        viewer {
            ...CirclesInformation_viewer
            me {
                ...CirclesInformation_user
            }
        }
    }`
)
