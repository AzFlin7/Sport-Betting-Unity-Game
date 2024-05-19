import React from 'react'
import Radium from 'radium';
import PropTypes from 'prop-types';
import { withAlert } from 'react-alert'
import { withRouter, Link } from 'found'
import Paper from '@material-ui/core/Paper';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import { withStyles } from '@material-ui/core/styles';
import DatePicker from 'react-datepicker'
var Style = Radium.Style;
import format from 'date-fns/format'
import dateformat from 'dateformat'
import moment from 'moment'
import { connect } from 'react-redux';
import cloneDeep from 'lodash/cloneDeep';

import Input from './Input'
import { colors, fonts, metrics } from '../../../theme'
import localizations from '../../Localizations'
import SearchModal from '../../common/SearchModal';
import InputText from './InputText'
import InputNumber from './InputNumber'
import InputSelect from './InputSelect'
import InputDate from './InputDate'
import Switch from '../../common/Switch'

const backendTypeList = [null, "A period paiement", "Customizable ‘ à la carte training’", "Flexible period paiement"]
//const backendTypeList = [null, "CUSTOM", "TEXT", "NUMBER", "BOOLEAN", "ADDRESS", "DATE", "PHONE_NUMBER"]
var Style = Radium.Style;
let styles

function cleanAskedInformationList(array) {
    let cache = {};
    let out = array.filter(function(elem,index,array){
        return cache[elem.id] ? 0 : cache[elem.id]=1 ;
    });
    return out;
}

const Chips = props => {
    const { onRemoveItem, onEditItem, items } = props;
    
    return (
      <div style={styles.chipPanel}>
        {items.map((item, index) => (
          <Chip
            key={index}
            label={item.name}
            onDelete={() => onRemoveItem(index)}
            className={props.classes.chip}
            clickable={true}
            color="primary"
            onClick={() => onEditItem(index)}
          />
        ))}
      </div>
    );
}
  
Chips.propTypes = {
    onRemoveItem: PropTypes.func.isRequired,
    onEditItem: PropTypes.func.isRequired,
    items: PropTypes.any,
};
  
const StyledChips = withStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    chip: {
      marginRight: 5,
      marginLeft: 5,
      marginTop: 5,
      background: '#64a5d7',
      color: 'white',
      cursor: 'pointer'
    },
})(Chips);

class PaymentModel extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            askedInformation: [],
            askedInformationTypeListIsOpen: false,
            showCustomInfo: true,
            showCustomInfoA: false,
            showCustomInfoB: false,
            customInfoListIsOpen: false,
            customFieldAnswersList: [],
            newInformationType: 1,
            newInformationName: '',
            newInformationFilledByOwner: false,
            editItemName: '',
            formName: '',
            priceName:'',
            duration:'',
            durationA:'',
            askNewInfo: false,
            formSaveVisible: true,
            formChanged: false,

            newPaymentModelName: '',
            newPaymentModelPrice: 0,
            newPaymentModelPaymentTypes: [],
            selectedCircles: [],
            askedInformationList: [],

            newPaymentTypeName: '',
            newPaymentTypePrice: '',
            newPaymentTypeConditions: [],

            editItem: null,
            editItemIndex: null,
            editPaymentTypeName: '',
            editPaymentTypePrice: '',
            editPaymentTypeConditions: [],

            displayNewCondition: false,
            hasChanged: false,

            isPaymentInAppAllowed: true,
            feesForMember: true,
            isCheckboxChanged: false,
            mode: 'edit',
            date: moment(),
            dateEnd: moment(),
        }
    }

    _updateFormName = e => {
        this.setState({
            newPaymentModelName: e.target.value
        })
    }
    _updatePriceName = e => {
        this.setState({
            newPaymentModelPrice: e.target.value
        })
    }
    _updateTime = e => {
        this.setState({
            duration: e.target.value
        })
    }
    _updateTimeA = e => {
        this.setState({
            durationA: e.target.value
        })
    }

    _updateInvitedCircles = circles => {
        let newAskedInfoList = [];
        circles.forEach(circle => newAskedInfoList = newAskedInfoList.concat(circle.askedInformation))

        this.setState({
            selectedCircles: circles,
            askedInformationList: cleanAskedInformationList(newAskedInfoList),
            hasChanged: true,
            formSaveVisible: true
        });
    }

    componentDidMount = () => {
        if (this.props.paymentModelToEdit) {
            this.setState({
                newPaymentModelName: this.props.paymentModelToEdit.name,
                newPaymentModelPrice: this.props.paymentModelToEdit.price.cents / 100,
                date: this.props.paymentModelToEdit.beginning_date ? moment(this.props.paymentModelToEdit.beginning_date) : null,
                dateEnd: this.props.paymentModelToEdit.ending_date ? moment(this.props.paymentModelToEdit.ending_date) : null,
                memberShipFeesType: 
                    this.props.paymentModelToEdit.memberShipFeesType === "Period_Paiement"
                    ?   1
                    :   this.props.paymentModelToEdit.memberShipFeesType === "Flexible_Period_Paiement"
                        ?   2
                        :   3,
                isPaymentInAppAllowed: this.props.paymentModelToEdit.inAppPaymentAllowed, 
                feesForMember: this.props.paymentModelToEdit.memberToPayFees, 
                selectedCircles: this.props.paymentModelToEdit.circles && this.props.paymentModelToEdit.circles.edges && this.props.paymentModelToEdit.circles.edges.length > 0
                    ?   this.props.paymentModelToEdit.circles.edges.map(edge => edge.node)
                    :   [],
                newPaymentModelPaymentTypes: this.props.paymentModelToEdit.conditions.map(condition => ({
                    id: condition.id,
                    name: condition.name,
                    price: {
                        cents: condition.price.cents, 
                        currency: condition.price.currency
                    },
                    conditions: condition.conditions.map(cond => ({
                        askedInformation: cond.askedInformation,
                        askedInformationComparator: cond.askedInformationComparator,
                        askedInformationComparatorValue: 
                            cond.askedInformationComparatorValue
                            ?   cond.askedInformationComparatorValue
                            :   cond.askedInformationComparatorValueString
                                ?   cond.askedInformationComparatorValueString
                                :   null,
                        askedInformationComparatorDate: cond.askedInformationComparatorDate
                    }))
                })).sort((a,b) => {
                    if (a.name < b.name)
                        return -1; 
                    else if (a.name > b.name)
                        return 1; 
                    else 
                        return 0;
                }),
                askedInformationList: this.props.paymentModelToEdit.circles && this.props.paymentModelToEdit.circles.edges && this.props.paymentModelToEdit.circles.edges.length > 0
                ?   (() => {
                        let list = []; 
                        this.props.paymentModelToEdit.circles.edges.forEach(edge => list = list.concat(edge.node.askedInformation))
                        return cleanAskedInformationList(list)
                    })()
                :   []
            })
        }
    }

    onClose = () => {
        this.props.onClose(); 
    }

    _updateNewPaymentModelPrice = e => {
        if (e.target.value.length < 5)
            this.setState({
                newPaymentModelPrice: e.target.value,
                hasChanged: true
            })
    }

    _updateNewPaymentTypeName = e => {
        this.setState({
            newPaymentTypeName: e.target.value,
            hasChanged: true
        })
    }

    _updateNewPaymentTypePrice = e => {
        if (e.target.value.length < 5)
            this.setState({
                newPaymentTypePrice: e.target.value,
                hasChanged: true
            })
    }

    _updateNewConditionAskedInformation = (index, item) => {
        if (this.state.editItem) {
            let newList = this.state.editPaymentTypeConditions;
            newList[index] = {
                askedInformation: item,
                askedInformationComparator: '',
                askedInformationComparatorValue: '',
                askedInformationComparatorDate: '',
            }

            this.setState({
                editPaymentTypeConditions: newList
            })
        }
        else {
            let newList = this.state.newPaymentTypeConditions; 
            newList[index] = {
                newConditionAskedInformation: item,
                newConditionComparator: '',
                newConditionComparatorValue: '',
            }

            this.setState({
                newPaymentTypeConditions: newList
            })
        }
    }

    _updateNewConditionComparator = (index, item) => {
        if (this.state.editItem) {
            let newList = this.state.editPaymentTypeConditions;
            newList[index] = {
                askedInformation: newList[index].askedInformation,
                askedInformationComparator: item.name,
                askedInformationComparatorValue: '',
                askedInformationComparatorDate: ''
            }

            this.setState({
                editPaymentTypeConditions: newList
            })
        }
        else {
            let newList = this.state.newPaymentTypeConditions; 
            newList[index] = {
                newConditionAskedInformation: newList[index].newConditionAskedInformation,
                newConditionComparator: item,
                newConditionComparatorValue: '',
            }
            
            this.setState({
                newPaymentTypeConditions: newList
            })
        }
    }

    _updateNewConditionComparatorValue = (index, item) => {
        if (this.state.editItem) {
            let newList = this.state.editPaymentTypeConditions; 
            newList[index] = {
                askedInformation: newList[index].askedInformation,
                askedInformationComparator: newList[index].askedInformationComparator,
                askedInformationComparatorValue: item.name,
            }
            
            this.setState({
                editPaymentTypeConditions: newList
            })
        }
        else {
            let newList = this.state.newPaymentTypeConditions; 
            newList[index] = {
                newConditionAskedInformation: newList[index].newConditionAskedInformation,
                newConditionComparator: newList[index].newConditionComparator,
                newConditionComparatorValue: item,
            }
            
            this.setState({
                newPaymentTypeConditions: newList
            })
        }
    }

    _updateNewConditionComparatorDate = (index, moment) => {
        if (this.state.editItem) {
            let newList = this.state.editPaymentTypeConditions; 
            newList[index] = {
                askedInformation: newList[index].askedInformation,
                askedInformationComparator: newList[index].askedInformationComparator,
                askedInformationComparatorDate: moment._d,
            }
            
            this.setState({
                editPaymentTypeConditions: newList
            })
        }
        else {
            let newList = this.state.newPaymentTypeConditions; 
            newList[index] = {
                newConditionAskedInformation: newList[index].newConditionAskedInformation,
                newConditionComparator: newList[index].newConditionComparator,
                newConditionComparatorDate: moment._d,
            }
            
            this.setState({
                newPaymentTypeConditions: newList
            })
        }
    }

    _handlePaymentInAppAllowedChanged = (e) => {
		this.setState({
			isPaymentInAppAllowed: !this.state.isPaymentInAppAllowed,
			isCheckboxChanged: true
		})
    }
    
    _handleFeesForMemberChanged = e => {
        this.setState({
			feesForMember: !this.state.feesForMember,
			isCheckboxChanged: true
		})
    }    

    _removeRow = index => {
        if (this.state.editItem) {
            let newList = this.state.editPaymentTypeConditions; 
            newList.splice(index, 1)
            
            this.setState({
                editPaymentTypeConditions: newList
            })
            // if (newList.length === 0)
            //     this.addConditionRow()
        }
        else {
            let newList = this.state.newPaymentTypeConditions; 
            newList.splice(index, 1)
            
            this.setState({
                newPaymentTypeConditions: newList
            })
            // if (newList.length === 0)
            //     this.addConditionRow()
        }
    }

    _handleAddPaymentType = () => {
        if (!this.state.editItem) {
            if (this.state.newPaymentTypeName === '' || this.state.newPaymentTypePrice === '') {
                this.props.alert.show(localizations.circles_paymentModel_newPaymentType_error, {
                    timeout: 2000,
                    type: 'error',
                });
                return ;
            }
            let areConditionOk = true ;
            this.state.newPaymentTypeConditions.forEach(condition => {
                if ((condition.newConditionComparatorValue === '' && condition.newConditionComparatorDate === '') || !condition.newConditionAskedInformation || condition.newConditionComparator === '') {
                    areConditionOk = false
                }
            })
            if (!areConditionOk || this.state.newPaymentTypeConditions.length === 0) {
                this.props.alert.show(localizations.circles_paymentModel_newPaymentType_error_2, {
                    timeout: 2000,
                    type: 'error',
                });
                return ;
            }

            let newState = this.state.newPaymentModelPaymentTypes;
            newState.push({
                name: this.state.newPaymentTypeName,
                conditions: this.state.newPaymentTypeConditions.map(condition => ({
                    askedInformation: condition.newConditionAskedInformation,
                    askedInformationComparator: condition.newConditionAskedInformation.type === 'BOOLEAN' || condition.newConditionAskedInformation.type === 'CUSTOM'
                        ?   "="
                        :   condition.newConditionComparator.name,
                    askedInformationComparatorValue: 
                        condition.newConditionAskedInformation.type === 'BOOLEAN' 
                        ?   condition.newConditionComparatorValue.name === localizations.circle_yes ? 1 : 0
                        :   condition.newConditionAskedInformation.type === 'DATE' 
                            ?   null
                            :   condition.newConditionAskedInformation.type === 'CUSTOM'
                                ?   condition.newConditionComparatorValue.name
                                :   parseInt(condition.newConditionComparatorValue.name),
                    askedInformationComparatorDate: condition.newConditionAskedInformation.type === 'DATE' 
                        ?   condition.newConditionComparatorDate
                        :   null
                })),
                price: {
                    cents: parseInt(this.state.newPaymentTypePrice) * 100,
                    currency: this.props.userCurrency
                },
                
            })

            this.setState({
                newPaymentModelPaymentTypes: newState,
                newPaymentTypeName: '',
                newPaymentTypePrice: '',
                newPaymentTypeConditions: [],
                displayNewCondition: false,
                hasChanged: true
            })   
        }
        else
            this._validationEditItem()
    }

    newCondition = () => {
        if (!this.state.displayNewCondition) {
            this.setState({
                displayNewCondition: true
            })
            this.addConditionRow()
        }
    }

    _cancelAddCondition = () => {
        this.setState({
            newPaymentTypeName: '',
            newPaymentTypePrice: '',
            newPaymentTypeConditions: [],
            displayNewCondition: false
        })   
        this._cancelEdit()
    }

    _removeItem = (index) => {
        let newState = this.state.newPaymentModelPaymentTypes;
        newState.splice(index, 1);
        this.setState({
            newPaymentModelPaymentTypes: newState,
            hasChanged: true
        })
    }

    _editItem = (index) => {
        let item = cloneDeep(this.state.newPaymentModelPaymentTypes[index]);
        this.setState({
            editItem: item,
            editItemIndex: index,
            editPaymentTypeName: item.name,
            editPaymentTypePrice: item.price.cents / 100,
            editPaymentTypeConditions: item.conditions
        })
    }

    _updateEditPaymentTypeName = e => {
        this.setState({
            editPaymentTypeName: e.target.value,
        })
    }

    _updateEditPaymentTypePrice = e => {
        if (e.target.value.length < 5)
            this.setState({
                editPaymentTypePrice: e.target.value
            })
    }

    _cancelEdit = () => {
        this.setState({
            editItem: null,
            editItemIndex: null,
            editPaymentTypeName: '',
            editPaymentTypePrice: '',
            editPaymentTypeConditions: [],
        })
    }

    _validationEditItem = () => {
        if (this.state.editPaymentTypeName === '' || this.state.editPaymentTypePrice === '') {
            this.props.alert.show(localizations.circle_paymentModel_newCondition_error, {
                timeout: 2000,
                type: 'error',
            });
            return ;
        }
        let areConditionOk = true ;        
        this.state.editPaymentTypeConditions.forEach(condition => {
            if ((condition.askedInformationComparatorValue === '' && condition.askedInformationComparatorDate === '') || !condition.askedInformation || condition.askedInformationComparator === '') {
                areConditionOk = false
            }
        })
        if (!areConditionOk || this.state.editPaymentTypeConditions.length === 0) {
            this.props.alert.show(localizations.circles_paymentModel_newPaymentType_error_2, {
                timeout: 2000,
                type: 'error',
            });
            return ;
        }
        
        let newList = this.state.newPaymentModelPaymentTypes;
        let index = this.state.editItemIndex;

        newList[index] = {
            id: this.state.editItem.id, 
            name: this.state.editPaymentTypeName,
            price: {
                cents: parseInt(this.state.editPaymentTypePrice) * 100,
                currency: this.props.userCurrency
            },
            conditions: this.state.editPaymentTypeConditions.map(condition => ({
                askedInformation: condition.askedInformation,
                askedInformationComparator: condition.askedInformation.type === 'BOOLEAN' || condition.askedInformation.type === 'CUSTOM'
                ?   "="
                :   condition.askedInformationComparator,
                askedInformationComparatorValue: condition.askedInformation.type === 'BOOLEAN' 
                    ?   (condition.askedInformationComparatorValue === localizations.circle_yes || condition.askedInformationComparatorValue === 1) ? 1 : 0
                    :   condition.askedInformation.type === 'DATE' 
                        ?   null
                        :   condition.askedInformation.type === 'CUSTOM' 
                            ?   condition.askedInformationComparatorValue
                            :   parseInt(condition.askedInformationComparatorValue),
                askedInformationComparatorDate: condition.askedInformation.type === 'DATE'
                    ?   condition.askedInformationComparatorDate
                    :   null
            }))            
        }

        this.setState({
            newPaymentModelPaymentTypes: newList,
            editPaymentTypeName: '',
            editPaymentTypePrice: '',
            editPaymentTypeConditions: [],
            editItem: null,
            editItemIndex: null,
            displayNewCondition: false,
            hasChanged: true
        })
    }

    handleSave = () => {
        if (this.state.newPaymentModelName === '') {
            this.props.alert.show(localizations.circles_paymentModel_missing_name, {
                timeout: 2000,
                type: 'error',
            });
            return ;
        }
        if (this.state.selectedCircles.length === 0) {
            this.props.alert.show(localizations.circles_paymentModel_missing_circles, {
                timeout: 2000,
                type: 'error',
            });
            return ;
        }
        
        this.setState({formSaveVisible: false});

        if (this.state.editItem) {
            this._validationEditItem();
        }
        if (this.state.newPaymentTypeName !== '') {
            this._handleAddPaymentType();
        }

        setTimeout(() => {
            let paymentModel = {
                id: this.props.paymentModelToEdit ? this.props.paymentModelToEdit.id : null,
                name: this.state.newPaymentModelName,
                price: {
                    cents: this.state.newPaymentModelPrice * 100,
                    currency: this.props.paymentModelToEdit ? this.props.paymentModelToEdit.price.currency : this.props.userCurrency
                },
                circles: this.state.selectedCircles.map(circle => circle.id),
                beginning_date: this.state.date,
                ending_date: this.state.dateEnd,
                memberShipFeesType: 
                    this.state.newInformationType === 1
                    ?   "Period_Paiement"
                    :   this.state.newInformationType === 2
                        ?   "Flexible_Period_Paiement"
                        :   "Customizable",
                inAppPaymentAllowed: this.state.isPaymentInAppAllowed, 
                memberToPayFees: this.state.feesForMember, 
                // paymentViaBankWireAllowed: 
                // max_duration: 
                // max_uses
                conditions: this.state.newPaymentModelPaymentTypes.map(paymentType => ({
                    id: paymentType.id ? paymentType.id : null, 
                    name: paymentType.name,
                    price: {
                        cents: paymentType.price.cents,
                        currency: this.props.paymentModelToEdit ? this.props.paymentModelToEdit.price.currency : this.props.userCurrency
                    },
                    conditions: paymentType.conditions.map(condition => ({
                        askedInformation: condition.askedInformation.id,
                        askedInformationComparator: condition.askedInformation.type === 'BOOLEAN' || condition.askedInformation.type === 'CUSTOM'
                        ?   "="
                        :   condition.askedInformationComparator,
                        askedInformationComparatorValue: condition.askedInformation.type === 'BOOLEAN' 
                            ?   (condition.askedInformationComparatorValue === localizations.circle_yes || condition.askedInformationComparatorValue === 1) ? 1 : 0
                            :   condition.askedInformation.type === 'DATE' || condition.askedInformation.type === 'CUSTOM' 
                                ?   null
                                :   parseInt(condition.askedInformationComparatorValue),
                        askedInformationComparatorValueString: condition.askedInformation.type === 'CUSTOM' 
                        ?   condition.askedInformationComparatorValue
                        :   null,
                        askedInformationComparatorDate: condition.askedInformation.type === 'DATE' 
                            ?   new Date(condition.askedInformationComparatorDate)
                            :   null
                    })),
                })),            
            };

            if (this.props.editPaymentModel) 
                paymentModel.id = this.props.editPaymentModel.id;

            this.props.onSave(paymentModel)
        }, 250)
    }

    addConditionRow = () => {
        if (this.state.editItem) {
            let newList_ = this.state.editPaymentTypeConditions ;
            newList_.push({
                askedInformation: null,
                askedInformationComparator: '', 
                askedInformationComparatorValue: '',
            })
            this.setState({
                editPaymentTypeConditions: newList_,
                displayNewCondition: true
            })
        }
        else {
            let newList = this.state.newPaymentTypeConditions ;
            newList.push({
                newConditionAskedInformation: null,
                newConditionComparator: '', 
                newConditionComparatorValue: '',
                newConditionComparatorDate: ''
            })
            this.setState({
                newPaymentTypeConditions: newList,
                displayNewCondition: true
            })
        }
    }

    _handleSelectType = (typeIndex) => {
        if (typeIndex === 1) {
            this.setState({
                newInformationType: typeIndex,
                askedInformationTypeListIsOpen: false,
                showCustomInfo: true,
                showCustomInfoA: false,
                showCustomInfoB: false,
            });
        } else if (typeIndex === 2) {
            this.setState({
                newInformationType: typeIndex,
                askedInformationTypeListIsOpen: false,
                showCustomInfoA: true,
                showCustomInfo: false,
                showCustomInfoB: false,
            });
        } 
        else if (typeIndex === 3) {
            this.setState({
                newInformationType: typeIndex,
                askedInformationTypeListIsOpen: false,
                showCustomInfoB: true,
                showCustomInfoA: false,
                showCustomInfo: false,
            });
        } 
        else {
            this.setState({
                newInformationType: typeIndex,
                askedInformationTypeListIsOpen: false,
                addItemSaveVisible: !!this.state.newInformationName,
                showCustomInfo: true,
                showCustomInfoA: false,
                showCustomInfoB: false,
                customInfoListIsOpen: false,
                customFieldAnswersList: [],
            });
        }
    }

    _openTypeList = () => {
        this.setState({
            askedInformationTypeListIsOpen: !this.state.askedInformationTypeListIsOpen
        })
    }

    _openCustomInfoList = () => {
        this.setState({
            customInfoListIsOpen: !this.state.customInfoListIsOpen
        })
    }

    _handleDateChange = moment => {
        this.setState({
            date: moment,
        })
    }
    
    
    _handleEndingDateChange = moment => {
        this.setState({
            dateEnd: moment,
        })
    }

    render() {
        const { showCustomInfo, showCustomInfoA, showCustomInfoB, customInfoListIsOpen, date } = this.state
        const typeList =
            [{title: ""},
            {title: localizations.circles_paymentModel_dropdownA, tip: localizations.circles_paymentModel_dropdownA_tip},
            // {title: localizations.circles_paymentModel_dropdownB, tip: localizations.circles_paymentModel_dropdownB_tip},
            // {title: localizations.circles_paymentModel_dropdownC, tip: localizations.circles_paymentModel_dropdownC_tip}
        ]
        const numberComparatorList = [{name: '≥'},{name: '>'},{name: '='},{name: '<'},{name: '≤'}];
        const booleanComparatorList = [{name: localizations.equal}];
        const booleanValues = [{name: localizations.circle_yes}, {name: localizations.circle_no}];
        const dateComparatorList = [{name: '≥'},{name: '≤'}];

        return(
            <div style={styles.container}>
                <Paper zDepth={4} style={{ padding: '8px 70px 1px' }}>
                    <div style={styles.pageHeader}>
                        {this.props.paymentModelToEdit 
                        ?   localizations.circles_paymentModel_edit1 + this.props.paymentModelToEdit.name 
                        :   localizations.circles_paymentModel_new_2
                        }
                    </div>
                    <div style={styles.dataCellRow}>
                        <div style={styles.dataCellWrapper}>
                            <InputLabel style={styles.label} htmlFor="input-description">
                                {localizations.circles_paymentModel_name}
                            </InputLabel>
                            <br />
                            <div style={{...styles.nameInput, marginBottom: 20}}>
                                <InputText 
                                    maxLength={"25"}
                                    value={this.state.newPaymentModelName}
                                    onChange={this._updateFormName}
                                    placeholder={localizations.circles_paymentModel_name_placeholder}
                                />
                            </div>
                        </div>
                        <div style={styles.dataCellWrapper}>
                            <InputLabel style={styles.label} htmlFor="input-description">
                                {localizations.event_price}
                            </InputLabel>
                            <br />
                            <div style={{...styles.nameInput, marginBottom: 20}}>
                                <InputNumber 
                                    maxLength={"25"}
                                    value={this.state.newPaymentModelPrice}
                                    onChange={this._updatePriceName}
                                    placeholder={localizations.manageVenue_price}
                                />
                                {!this.props.paymentModelToEdit && 
                                    <div style={styles.changeCurrency}>
                                        {localizations.newSportunity_changeCurrency}
                                        <select 
                                            style={styles.currencySelect} 
                                            onChange={e => this.props._updateUserCurrency(e.target.value)}
                                            value={this.props.userCurrency}
                                        >
                                            {['CHF', 'EUR'].map(c => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                    </select>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div style={styles.dataCellRow}>
                        <div style={styles.dataCellWrapper1}>
                            <InputLabel style={styles.label} htmlFor="input-description">
                                {localizations.myEvents_type}
                            </InputLabel>
                            <br />
                            <div style={styles.typeListContainer}>
                                <input
                                    onClick={this._openTypeList}
                                    style={styles.loadInput}
                                    value={typeList[this.state.newInformationType].title}
                                />
                                <span style={styles.triangle} onClick={this._openTypeList}/>
                                {this.state.askedInformationTypeListIsOpen &&
                                <div style={styles.dropdown}>
                                    <ul>
                                        {typeList.filter((type, index) => index > 0).map((type, index) => (
                                            <li key={index} style={styles.listItem} onClick={() => this._handleSelectType(index+1)}>
                                                {type.title +  " "}
                                                <i className="fa fa-question-circle-o" title={type.tip}/>
                                            </li>
                                        ))
                                        }
                                    </ul>
                                </div>
                                }
                            </div>
                        </div>
                        <div style={styles.dataCellWrapper2}>
                        {showCustomInfo && 
                            <div style={styles.dataCellWrapper3}>
                                <div style={styles.inputGroupA}>
                                    <InputLabel style={{...styles.labelDate, marginTop: 5}} htmlFor="input-description">
                                        {localizations.circles_paymentModel_startDate}
                                    </InputLabel>
                                    <InputLabel style={{...styles.labelDate, marginTop: 5, marginLeft: 42}} htmlFor="input-description">
                                        {localizations.circles_paymentModel_endDate}
                                    </InputLabel>
                                </div>
                                <br />
                                <div style={styles.inputGroup}>
                                    <Style
                                        scopeSelector=".datetime-hours"
                                        rules={{
                                            '.rdtPicker': {
                                                borderRadius: '3px',
                                                width: '100px',
                                                border: '2px solid #5E9FDF',
                                            },
                                            '.form-control': styles.time,
                                        }}
                                    />
                                    <Style
                                        scopeSelector=".datetime-day"
                                        rules={{
                                            input: styles.date,
                                        }}
                                    />
                                    <Style
                                        scopeSelector=".react-datepicker"
                                        rules={{
                                            div: { fontSize: '1.4rem' },
                                            '.react-datepicker__current-month': { fontSize: '1.5rem' },
                                            '.react-datepicker__month': { margin: '1rem' },
                                            '.react-datepicker__day': {
                                            width: '2rem',
                                            lineHeight: '2rem',
                                            fontSize: '1.4rem',
                                            margin: '0.2rem',
                                            },
                                            '.react-datepicker__day-names': {
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            marginTop: 5,
                                            },
                                            '.react-datepicker__header': {
                                            padding: '1rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            },
                                        }}
                                    />
                                    <Style
                                        scopeSelector=".react-datepicker-popper"
                                        rules={{
                                            zIndex: 10,
                                        }}
                                    />
                                    <div style={{ marginLeft: -40, marginTop: '3%'}}>
                                        <DatePicker
                                            dateFormat="DD/MM/YYYY"
                                            todayButton={localizations.newSportunity_today}
                                            selected={this.state.date}
                                            onChange={this._handleDateChange}
                                            minDate={moment()}
                                            locale={localizations.getLanguage().toLowerCase()}
                                            nextMonthButtonLabel=""
                                            previousMonthButtonLabel=""
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                        />
                                    </div>
                                    <div style={{ marginLeft: 5, marginTop: '3%'}}>
                                        <DatePicker
                                            dateFormat="DD/MM/YYYY"
                                            todayButton={localizations.newSportunity_today}
                                            selected={this.state.dateEnd}
                                            onChange={this._handleEndingDateChange}
                                            minDate={moment()}//moment() // this.state.date
                                            locale={localizations.getLanguage().toLowerCase()}
                                            nextMonthButtonLabel=""
                                            previousMonthButtonLabel=""
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                        />
                                    </div>
                                </div>
                            </div>
                        }
                        {showCustomInfoA && 
                            <div style={styles.dataCellWrapper4}>
                                <InputLabel style={styles.label} htmlFor="input-description">
                                    {localizations.circles_paymentModel_PeriodA}
                                </InputLabel>
                                <br />
                                <div style={{...styles.nameInput, marginBottom: 20}}>
                                    <InputText 
                                        maxLength={"25"}
                                        value={this.state.duration}
                                        onChange={this._updateTime}
                                        placeholder={localizations.manageVenue_timeslot}
                                    />
                                </div>
                                <div style={{...styles.smallExplanation, marginBottom: 8}}>
                                    {localizations.circles_paymentModel_small_condition_explanation}
                                </div>
                            </div>
                        }
                        {showCustomInfoB && 
                            <div style={styles.dataCellWrapper4}>
                                <div style={styles.inputGroup}>
                                    <InputLabel style={styles.label} htmlFor="input-description">
                                        {localizations.circles_paymentModel_PeriodB}
                                    </InputLabel>
                                    <InputLabel style={styles.label} htmlFor="input-description">
                                        {localizations.circles_paymentModel_PeriodC}
                                    </InputLabel>
                                </div>
                                <br />
                                <div style={styles.inputGroup}>
                                    <div style={{...styles.nameInput, marginBottom: 20}}>
                                        <InputText 
                                            maxLength={"25"}
                                            value={this.state.durationA}
                                            onChange={this._updateTimeA}
                                            placeholder={localizations.manageVenue_timeslot}
                                        />
                                    </div>
                                
                                    <div style={{...styles.nameInput, marginBottom: 20}}>
                                        <InputText 
                                            maxLength={"25"}
                                            value={this.state.durationA}
                                            onChange={this._updateTimeA}
                                            placeholder={localizations.manageVenue_timeslot}
                                        />
                                    </div>
                                </div>
                                <div style={{...styles.smallExplanation, marginBottom: 8}}>
                                    {localizations.circles_paymentModel_small_condition_explanation}
                                </div>
                            </div>
                        }
                        </div>
                    </div>
                </Paper>

                <Paper zDepth={4} style={{ padding: "8px 70px 1px", marginTop: 25 }}>
                  <div>
                      <h1 style={styles.title}>
                          {localizations.circles_paymentModel_circles_apply}
                      </h1>
                      <hr style={{ marginBottom: 25, marginLeft: -70, marginRight: -70 }} />

                      <SearchModal
                        isModal={false}
                        isOpen={this.state.displaySearchModal}
                        viewer={this.props.viewer}
                        onClose={this.onCloseModal}
                        onValide={this._updateInvitedCircles}
                        tabs={["Groups"]}
                        openOnTab={"Groups"}
                        allowToSeeCircleDetails={false}
                        types={['ADULTS', 'CHILDREN']}
                        circleTypes={['MY_CIRCLES', 'CHILDREN_CIRCLES']}
                        queryCirclesOnOpen={true}
                        noNeedToValidate={true}
                        defaultCircleList={this.state.selectedCircles}
                        maxHeight={400}
                      />
                  </div>
                </Paper>

                <Paper zDepth={4} style={{ padding: "8px 70px 1px", marginTop: 25 }}>
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h1 style={{...styles.title, marginBottom: 0}}>
                            {localizations.circles_paymentModel_exceptions}
                        </h1>
                        {this.state.selectedCircles.length > 0 && !this.state.displayNewCondition && !this.state.editItem
                        ?   <div style={styles.newConditionContainer}>
                                <span onClick={this.addConditionRow} style={styles.newConditionTitle}>
                                    {localizations.circles_paymentModel_newPaymentType_newCondition}
                                </span>
                            </div>
                        :   <div></div>
                        }
                    </div>
                    <hr style={{ marginBottom: 0, marginLeft: -70, marginRight: -70 }} />
                    {this.state.newPaymentModelPaymentTypes.length > 0 && 
                        <div>
                            <StyledChips
                                onRemoveItem={this._removeItem}
                                onEditItem={this._editItem}
                                items={this.state.newPaymentModelPaymentTypes}
                            />
                        </div>
                    }
                
                    <div style={{...styles.row, marginTop: 25}}>
                        <div>
                            {this.state.selectedCircles.length === 0 &&
                                <div style={{ ...styles.mediumExplanationBlack, marginBottom: 50 }}>
                                    {localizations.circles_paymentModel_default_info}
                                </div>
                            }

                            {this.state.selectedCircles.length > 0 && this.state.newPaymentModelPaymentTypes.length === 0 &&
                                <div style={{ ...styles.mediumExplanationBlack, marginBottom: 50 }}>
                                    {localizations.circles_paymentModel_default_info1}
                                </div>
                            }

                            {(this.state.displayNewCondition || this.state.editItem) && 
                                <div style={styles.row}>
                                    <div>
                                        <div style={styles.row}>
                                            <div style={styles.nameInput}>
                                                {localizations.circles_paymentModel_name}
                                            </div>
                                            <div style={styles.priceInput}>
                                                {localizations.price}
                                            </div>
                                        </div>

                                        <div style={styles.row}>
                                            <div style={{...styles.nameInput, marginBottom: 20}}>
                                                <InputText 
                                                    maxLength={"25"}
                                                    value={this.state.editItem ? this.state.editPaymentTypeName : this.state.newPaymentTypeName}
                                                    onChange={this.state.editItem ? this._updateEditPaymentTypeName : this._updateNewPaymentTypeName}
                                                    placeholder={localizations.circles_information_form_condition_placeholder}
                                                />
                                            </div>
                                            <div style={styles.priceInput}>
                                                <InputNumber
                                                    maxLength={"5"}
                                                    value={this.state.editItem ? this.state.editPaymentTypePrice : this.state.newPaymentTypePrice}
                                                    onChange={this.state.editItem ? this._updateEditPaymentTypePrice : this._updateNewPaymentTypePrice}
                                                />
                                                <div style={styles.currency}>
                                                    {this.props.userCurrency}
                                                </div>
                                            </div>
                                        </div>

                                        {(this.state.newPaymentTypeConditions.length > 0 || this.state.editPaymentTypeConditions.length > 0) &&
                                            <div style={styles.row}> 
                                                <div style={styles.informationInput}>
                                                    {localizations.circles_paymentModel_information + '*'}
                                                </div>
                                                <div style={styles.comparatorInput}>
                                                    {localizations.circles_paymentModel_comparator}
                                                </div>
                                                <div style={styles.valueInput}>
                                                    {localizations.circles_paymentModel_value}
                                                </div>
                                                <div style={{flex: 1}} />
                                            </div>
                                        }

                                        {this.state.newPaymentTypeConditions.length > 0 &&
                                            this.state.newPaymentTypeConditions.map((row, index) => (
                                                <div style={{...styles.row, marginBottom: -10}} key={index}>
                                                    <div style={styles.informationInput}>
                                                        <InputSelect 
                                                            selectedItem={row.newConditionAskedInformation}
                                                            onSelectItem={(item) => this._updateNewConditionAskedInformation(index, item)}
                                                            list={this.state.askedInformationList.map(info => (info.type === 'TEXT' || info.type === 'ADDRESS' || info.type === 'PHONE_NUMBER') ? false : info).filter(i => Boolean(i))}
                                                            isDisabled={!this.state.askedInformationList || this.state.askedInformationList.length === 0}
                                                            placeholder={this.state.selectedCircles.length === 0 ? localizations.circles_paymentModel_condition_placeholder : localizations.circles_paymentModel_condition_placeholder2}
                                                        />
                                                    </div>
                                                    <div style={styles.comparatorInput}>
                                                        <InputSelect 
                                                            selectedItem={row.newConditionComparator}
                                                            onSelectItem={(item) => this._updateNewConditionComparator(index, item)}
                                                            isDisabled={!row.newConditionAskedInformation}
                                                            list={row.newConditionAskedInformation 
                                                                ?   row.newConditionAskedInformation.type === 'BOOLEAN' || row.newConditionAskedInformation.type === 'CUSTOM'
                                                                    ?   booleanComparatorList 
                                                                    :   row.newConditionAskedInformation.type === 'DATE'
                                                                        ?   dateComparatorList
                                                                        :   numberComparatorList
                                                                :   []
                                                            }
                                                        />
                                                    </div>
                                                    <div style={styles.valueInput}>
                                                        {row.newConditionAskedInformation && row.newConditionAskedInformation.type === 'BOOLEAN' 
                                                        ?   <InputSelect
                                                                selectedItem={row.newConditionComparatorValue}
                                                                onSelectItem={item => this._updateNewConditionComparatorValue(index, item)}
                                                                isDisabled={!row.newConditionComparator}
                                                                list={booleanValues}
                                                            />
                                                        :   row.newConditionAskedInformation && row.newConditionAskedInformation.type === 'CUSTOM' 
                                                            ?   <InputSelect
                                                                    selectedItem={row.newConditionComparatorValue}
                                                                    onSelectItem={item => this._updateNewConditionComparatorValue(index, item)}
                                                                    isDisabled={!row.newConditionComparator}
                                                                    list={row.newConditionAskedInformation.answers.map(a => ({name: a}))}
                                                                />  
                                                            :   row.newConditionAskedInformation && row.newConditionAskedInformation.type === 'DATE' 
                                                                ?   <InputDate
                                                                        value={row.newConditionComparatorDate}
                                                                        onChange={moment => this._updateNewConditionComparatorDate(index, moment)}
                                                                        isDisabled={!row.newConditionComparator}
                                                                    />
                                                                :   <InputNumber
                                                                        maxLength={"5"}
                                                                        value={row.newConditionComparatorValue ? row.newConditionComparatorValue.name : ''}
                                                                        onChange={e => this._updateNewConditionComparatorValue(index, {name: e.target.value})}
                                                                        isDisabled={!row.newConditionComparator}
                                                                    />
                                                        }
                                                    </div>
                                                    <div style={{...styles.removeIcon, flex: 1}} onClick={() => this._removeRow(index)}>
                                                        <i style={{marginLeft: 5}} className="fa fa-times fa-2x" />
                                                    </div>
                                                </div>
                                            ))
                                        }

                                        {this.state.editPaymentTypeConditions.length > 0 &&
                                            this.state.editPaymentTypeConditions.map((row, index) => (
                                                <div style={{...styles.row, marginBottom: -10}} key={index}>
                                                    <div style={styles.informationInput}>
                                                        <InputSelect 
                                                            selectedItem={row.askedInformation}
                                                            onSelectItem={(item) => this._updateNewConditionAskedInformation(index, item)}
                                                            list={this.state.askedInformationList.map(info => (info.type === 'TEXT' || info.type === 'ADDRESS' || info.type === 'PHONE_NUMBER') ? false : info).filter(i => Boolean(i))}
                                                            isDisabled={!this.state.askedInformationList || this.state.askedInformationList.length === 0}
                                                            placeholder={this.state.selectedCircles.length === 0 ? localizations.circles_paymentModel_condition_placeholder : localizations.circles_paymentModel_condition_placeholder2}
                                                        />
                                                    </div>

                                                    <div style={styles.comparatorInput}>
                                                        <InputSelect 
                                                            selectedItem={row.askedInformation 
                                                                ?   {name: row.askedInformationComparator}
                                                                :   null
                                                            }
                                                            onSelectItem={(item) => this._updateNewConditionComparator(index, item)}
                                                            isDisabled={!row.askedInformation}
                                                            list={row.askedInformation 
                                                                ?   row.askedInformation.type === 'BOOLEAN' || row.askedInformation.type === 'CUSTOM'
                                                                    ?   booleanComparatorList 
                                                                    :   row.askedInformation.type === 'DATE'
                                                                        ?   dateComparatorList
                                                                        :   numberComparatorList
                                                                :   []
                                                            }
                                                        />
                                                    </div>

                                                    <div style={styles.valueInput}>
                                                        {row.askedInformation && row.askedInformation.type === 'BOOLEAN' 
                                                        ?   <InputSelect
                                                                selectedItem={{name: row.askedInformation.type === 'BOOLEAN' 
                                                                    ?   (row.askedInformationComparatorValue === 1 || row.askedInformationComparatorValue === localizations.circle_yes) 
                                                                        ? localizations.circle_yes 
                                                                        : !!row.askedInformationComparatorValue
                                                                            ?   localizations.circle_no
                                                                            :   null
                                                                    :   row.askedInformationComparatorValue}}
                                                                onSelectItem={item => this._updateNewConditionComparatorValue(index, item)}
                                                                isDisabled={!row.askedInformationComparator}
                                                                list={booleanValues}
                                                            />
                                                        :   row.askedInformation && row.askedInformation.type === 'CUSTOM' 
                                                            ?   <InputSelect
                                                                    selectedItem={{name: row.askedInformationComparatorValue}}
                                                                    onSelectItem={item => this._updateNewConditionComparatorValue(index, item)}
                                                                    isDisabled={!row.askedInformationComparator}
                                                                    list={row.askedInformation.answers.map(a => ({name: a}))}
                                                                />  
                                                            :   row.askedInformation && row.askedInformation.type === 'DATE' 
                                                                ?   <InputDate
                                                                        value={row.askedInformationComparatorDate}
                                                                        onChange={moment => this._updateNewConditionComparatorDate(index, moment)}
                                                                        isDisabled={!row.askedInformationComparator}
                                                                    />
                                                                :   <InputNumber
                                                                        maxLength={"5"}
                                                                        value={row.askedInformationComparatorValue}
                                                                        onChange={e => this._updateNewConditionComparatorValue(index, {name: e.target.value})}
                                                                        isDisabled={!row.askedInformationComparator}
                                                                    />
                                                        }
                                                    </div>
                                                    <div style={{...styles.removeIcon, flex: 1}} onClick={() => this._removeRow(index)}>
                                                        <i style={{marginLeft: 5}} className="fa fa-times fa-2x" />
                                                    </div>
                                                </div>
                                            ))
                                        }

                                        <div style={styles.smallExplanation}>
                                            {localizations.circles_information_form_condition_explanation}
                                        </div>

                                        <div style={styles.newConditionContainer}>
                                            <span onClick={this.addConditionRow} style={styles.newConditionTitle}>
                                                {localizations.circles_paymentModel_newPaymentType_newCondition}
                                            </span>
                                        </div>
                                    
                                        <div style={styles.buttonRow}>
                                            <button onClick={this._cancelAddCondition} style={{...styles.cancelButton, height: 35, fontSize: 18}}>
                                                {localizations.info_cancel}
                                            </button>
                                            <button onClick={this._handleAddPaymentType} style={{...styles.validateButton, height: 35, fontSize: 18}}>
                                                {localizations.circles_paymentModel_newPaymentType_validate}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            }

                        </div>
                    </div>
                </Paper>

                <Paper zDepth={4} style={{ padding: "8px 70px 1px", marginTop: 25 }}>
                    
                    <h1 style={styles.title}>
                          {localizations.circles_paymentModel_exceptions2}
                    </h1>
                    <hr style={{ marginBottom: 25, marginLeft: -70, marginRight: -70 }} />

                    <div style={styles.checkboxRow}>
                        {this.state.mode === 'edit' && 
                            <Switch
                                checked={this.state.isPaymentInAppAllowed}
                                onChange={(e) => this._handlePaymentInAppAllowedChanged(e)}
                            />
                        }
                        <div style={styles.checkboxLabel}>
                            {this.state.isPaymentInAppAllowed
                            ?   <div style={styles.checkboxTitle}>
                                    {localizations.circles_paymentModel_ConditionA_Active}
                                </div>
                            :   <div style={styles.checkboxTitle}>
                                    {localizations.circles_paymentModel_ConditionA_Inctive}
                                </div>
                            }
                        </div>
                    </div>
                    <div style={styles.mediumExplanation}>
                        {this.state.isPaymentInAppAllowed
                        ?   <div>
                                {localizations.circles_paymentModel_ConditionA_Active_Sentence.split('{walletLink}')[0]}
                                <Link style={styles.link} target="_blank" to="/my-wallet">{localizations.wallet}</Link>
                                {localizations.circles_paymentModel_ConditionA_Active_Sentence.split('{walletLink}')[1]}
                            </div>
                        :   <div>
                                {localizations.circles_paymentModel_ConditionA_Inactive_Sentence}
                            </div>
                        }
                    </div>
                        

                    <div style={styles.checkboxRow}>
                        {this.state.mode === 'edit' && 
                            <Switch
                                checked={!this.state.feesForMember}
                                onChange={(e) => this._handleFeesForMemberChanged(e)}
                            />
                        }
                        <div style={styles.checkboxLabel}>
                            {this.state.feesForMember
                            ?   <div style={styles.checkboxTitle}>
                                    {localizations.circles_paymentModel_ConditionB_Inctive}
                                </div>
                            :   <div style={styles.checkboxTitle}>
                                    {localizations.circles_paymentModel_ConditionB_Active}
                                </div>
                            }
                        </div>
                    </div>
                    <div style={styles.mediumExplanation}>
                        {this.state.feesForMember
                        ?   <div>
                                {localizations.circles_paymentModel_ConditionB_Inactive_Sentence
                                    .replace('{memberShipAmountAfterFees}', ( Math.round((this.state.newPaymentModelPrice * (1 + this.props.user.paymentModelFees / 100)) * 100)/100 + ' ' + (this.props.paymentModelToEdit ? this.props.paymentModelToEdit.price.currency : this.props.userCurrency)))
                                }
                            </div>
                        :   <div>
                                {localizations.circles_paymentModel_ConditionB_Active_Sentence
                                    .replace('{memberShipAmountAfterFees}', ( Math.round((this.state.newPaymentModelPrice * (1 - this.props.user.paymentModelFees / 100)) * 100) / 100 + ' ' + (this.props.paymentModelToEdit ? this.props.paymentModelToEdit.price.currency : this.props.userCurrency)))
                                }
                            </div>
                        }
                    </div>

                    <hr style={{ margin: '20px -70px' }} />
                    <div style={{ margin: "15px 0" }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            style={{ marginRight: 12 }}
                            onClick={this._handleGoBack}>
                            {localizations.circles_back}
                        </Button>
                        {this.state.formSaveVisible &&
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={this.handleSave}
                            >
                                {localizations.circles_save}
                            </Button>
                        }
                    </div>
                </Paper>
            </div>
        )
    }
}

styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      paddingRight: 70,
      width: '100%'
    },
    checkBox: {
        width: 18,
        height: 18,
        border: '2px solid #5E9FDF',
        display: 'block',
        cursor: 'pointer',
        margin: 'auto'
    },
    buttonRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    dataCellRow: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		marginTop: '40px'
    },
    dataCellWrapper: {
		marginLeft: '10%',
		width: '40%',
		flex: 1
    },
    dataCellWrapper1: {
		marginLeft: '10%',
		width: '40%',
        flex: 1,
        marginBottom: '5%'
    },
    dataCellWrapper2: {
		width: '40%',
        flex: 1,
    },
    dataCellWrapper3: {
		width: '60%',
        flex: 1,
    },
    dataCellWrapper4: {
		marginLeft: '10%',
		width: '90%',
		flex: 1
    },
    label: {
      fontSize: '15px',
      color: '#353535',
    },
    headerRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        paddingBottom: 3,
        borderBottom: '1px solid ' + colors.gray,
        color: colors.blueLight
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        color: colors.blue,
    },
    subRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 2
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        flex: 9
    },
    label: {
        fontFamily: 'Lato',
        fontSize: 15,
        flex: '1 1 20%',
        color: colors.blue
    },
    customInfoLabel: {
        fontFamily: 'Lato',
        fontSize: 15,
        flex: '1 1 30%'
    },
    checkBoxContainer: {
        fontFamily: 'Lato',
        fontSize: 15,
        flex: '1 1 18%'
    },
    customInfoListContainer: {
        position: 'relative',
        flex: '1 1 30%',
        marginTop: 2,
        marginLeft: 5,
    },
    customInfoList: {
        //position: 'absolute',
        top: 70,
        left: 0,

        width: '100%',
        maxHeight: 300,

        backgroundColor: colors.white,

        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
        border: '2px solid rgba(94,159,223,0.83)',
        padding: 20,

        overflowY: 'scroll',
        overflowX: 'hidden',

        zIndex: 100,
    },
    type: {
        fontFamily: 'Lato',
        fontSize: 15,
        flex: '1 1 20%',
        marginLeft: 5
    },
    removeIcon: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        color: colors.redGoogle,
        cursor: 'pointer',
    },
    editIcon: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        color: colors.blueLight,
        cursor: 'pointer',
        flex: 1
    },
    validateEditionIcon: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        color: colors.green,
        cursor: 'pointer',
        flex: 1
    },
    saveButton: {
        width: '500px',
        height: '50px',
        backgroundColor: colors.blue,
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
        borderRadius: '3px',
        display: 'inline-block',
        fontFamily: 'Lato',
        fontSize: '22px',
        textAlign: 'center',
        color: colors.white,
        borderWidth: 0,
        marginTop: 15,
        marginBottom: 10,
        cursor: 'pointer',
        lineHeight: '27px',
    },
    saveButtonContainer: {
        display: 'flex',
        justifyContent: 'center'
    },
    altButton: {
        fontSize: 12,
        width: 100,
        margin: 50,
    },
    title: {
        marginBottom: 10,
        color: "#4E4E4E",
        fontFamily: "Lato",

        fontSize: 24,
        fontWeight: "bold"
    },
    input: {
        marginBottom: 25
    },
    pageHeader: {
        fontFamily: 'Lato',
        fontSize: 34,
        fontWeight: fonts.weight.large,
        color: colors.black,
        marginBottom: 30
    },
    typeListContainer: {
        position: 'relative',
        flex: 1,
		width: '80%'
    },
    headerRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        paddingBottom: 3,
        borderBottom: '1px solid ' + colors.gray,
        color: colors.blueLight
    },
    section: {
        margin: '10px 0',
        padding: 15,
        backgroundColor: '#EEEEEE',
        borderRadius: 5
    },
    loadInput: {
        borderWidth: 0,
        borderBottomWidth: 2,
        borderStyle: 'solid',
        borderColor: colors.blue,
        height: '30px',
        lineHeight: '36px',
        fontFamily: 'Lato',
        display: 'block',
        background: 'transparent',
        fontSize: 18,
        outline: 'none',
        cursor: 'pointer',
        width: '100%',
        color: '#515151',
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        color: colors.blue,
    },
    dropdown: {
        position: 'absolute',
        top: 31,
        left: 0,
        width: '100%',
        maxHeight: 250,
        backgroundColor: colors.white,
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
        border: '2px solid rgba(94,159,223,0.83)',
        padding: '7px 20px',
        overflowY: 'scroll',
        overflowX: 'hidden',
        zIndex: 100,
    },
    subRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        flex: 9
    },
    listItem: {
        paddingTop: 5,
        paddingBottom: 5,
        color: '#515151',
        fontSize: 20,
        fontWeight: 500,
        fontFamily: 'Lato',
        borderBottomWidth: 1,
        borderColor: colors.blue,
        borderStyle: 'solid',
        cursor: 'pointer',
    },
    label: {
        fontFamily: 'Lato',
        fontSize: 15, 
        flex: 5,
        color: colors.blue
    },
    labelDate: {
        fontFamily: 'Lato',
        fontSize: '14px',
        textAlign: 'left',
        color: colors.blue,
        display: 'inline',
        marginLeft: '-40px'
        // lineHeight: 1,
        // color: '#646464',
        // display: 'block',
        // marginRight: 5,
        // flex: 1
    },
    insideDate: {
        backgroundColor: '#E2E2E2',
        border: '0px solid #5E9FDF',
        borderRadius: '3px',
        marginLeft: '3px',
        height: '35px',
        textAlign: 'center',
        fontFamily: '26px',
        color: 'rgba(146,146,146,0.87)'
    },
    checkBoxContainer: {
        fontFamily: 'Lato',
        fontSize: 15, 
        flex: 3
        
    },
    checkboxTitle: {
		fontWeight: 'bold'
	},
    checkboxLabel:  {
		fontFamily: 'Lato',
		fontSize: 16,
		color: colors.blue,
        flex: 5,
        marginLeft: '2%'
    },
	checkboxRow: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: '30px',
		marginRight: '2%',
		marginLeft: '2%'
	},
    type: {
        fontFamily: 'Lato',
        fontSize: 15, 
        flex: 5,
        marginLeft: 5
    },
    customInfoListInput: {
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
        width: '100%',
        fontSize: 18,
        outline: 'none',
        ':disabled': {
            borderColor: colors.gray,
        },
    },
    removeIcon: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
		color: colors.redGoogle,
        cursor: 'pointer',
        flex: 1
    },
    editIcon: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
		color: colors.blueLight,
        cursor: 'pointer',
        flex: 1
    },
    validateEditionIcon: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
		color: colors.green,
        cursor: 'pointer',
        flex: 1
    },
    smallExplanation: {
        fontSize: 13,
        color: colors.gray, 
        fontStyle: 'italic'
    },
    mediumExplanationBlack: {
        fontSize: 16,
        color: colors.gray, 
        fontStyle: 'italic'
    },
    triangle: {
        position: 'absolute',
        right: 3,
        top: 12,
        width: 0,
        height: 0,
        transition: 'border 100ms',
        transitionOrigin: 'left',
        color: colors.blue,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: `8px solid ${colors.blue}`,
        cursor: 'pointer',
    },
    mediumExplanation: {
        fontSize: 15,
        color: colors.gray, 
        fontStyle: 'italic',
        marginTop: '2%',
        marginLeft: '2%'
    },
    mediumHeading: {
        fontSize: 18,
        marginTop: '2%',
        marginLeft: '2%'
    },
    inputGroup: {
      display: 'flex',
      alignItems: 'center',
    },  
    inputGroupA: {
        display: 'inline-flex',
        width: '150%',
      }, 
    saveButton: {
        height: '50px',
        padding: '0px 50px',
        backgroundColor: colors.green,
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
        borderRadius: '3px',
        display: 'flex',
        fontFamily: 'Lato',
        fontSize: '22px',
        textAlign: 'center',
        color: colors.white,
        borderWidth: 0,
        margin: '15px auto 10px auto',
        cursor: 'pointer',
        lineHeight: '27px',
        flex: 1,
        justifyContent: 'center',
    },
    validateButton: {
        height: '50px',
        backgroundColor: colors.green,
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
        borderRadius: '3px',
        display: 'flex',
        fontFamily: 'Lato',
        fontSize: '22px',
        textAlign: 'center',
        color: colors.white,
        borderWidth: 0,
        margin: '15px 15px 10px 15px',
        cursor: 'pointer',
        lineHeight: '27px',
        flex: 1,
        justifyContent: 'center',
    },
    cancelButton: {
        height: '50px',
        backgroundColor: colors.redGoogle,
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
        borderRadius: '3px',
        display: 'flex',
        fontFamily: 'Lato',
        fontSize: '22px',
        textAlign: 'center',
        color: colors.white,
        borderWidth: 0,
        margin: '15px 15px 10px 15px',
        cursor: 'pointer',
        lineHeight: '27px',
        flex: 1,
        justifyContent: 'center'
    },

    priceInput: {
        fontFamily: 'Lato',
        fontSize: 15, 
        flex: 3,
        marginRight: 15,
        position: 'relative'
    },
    nameInput: {
        fontFamily: 'Lato',
        fontSize: 15, 
        flex: 7,
        marginRight: 15,
    },
    informationInput: {
        fontFamily: 'Lato',
        fontSize: 15, 
        flex: 10,
        marginRight: 15,
    },
    comparatorInput: {
        fontFamily: 'Lato',
        fontSize: 15, 
        flex: 3,
        marginRight: 15,
    },
    valueInput: {
        fontFamily: 'Lato',
        fontSize: 15, 
        flex: 3,
        marginRight: 15,
    },
    newConditionContainer: {
        margin: '10px 0px',
        display: 'flex',
        justifyContent: 'flex-end'
    },
    newConditionTitle: {
        fontFamily: 'Lato',
        fontSize: 15, 
        color: colors.white,
        alignItems: 'center',
        backgroundColor: colors.blue,
        padding: '10px',
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.24)',
        borderRadius: 3,
        cursor: 'pointer'
    },
    currency: {
        position: 'absolute',
        right: 2,
        top: 10,
        color: colors.gray
    },
    currencySelect: {
        width: 100,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottomWidth: 2,
        borderBottomColor: colors.blue,
        fontFamily: 'Lato',
        paddingBottom: 5,
        marginLeft: 40,
        fontSize: 16,
        lineHeight: 1,
        paddingLeft: 3
    },
    link: {
        textDecoration: 'none',
        color: colors.darkBlue,
    },
    chipPanel: {
        // display: 'flex',
        // flexDirection: 'row',
        // justifyContent: 'flex-start',
        // alignItems: 'center',
        padding: 5
    },
}

export default Radium(withAlert(withRouter(PaymentModel)))
