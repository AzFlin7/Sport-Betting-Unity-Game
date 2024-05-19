import React from 'react'
import Radium from 'radium'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Modal from 'react-modal'
import { withAlert } from 'react-alert'
import ReactLoading from 'react-loading'
import cloneDeep from 'lodash/cloneDeep';

import { colors, fonts } from '../../../theme'
import InputText from './InputText'
import InputNumber from './InputNumber'
import InputSelect from './InputSelect'
import InputDate from './InputDate'
import MultiSelectCircle from '../../common/Inputs/MultiSelectCircle';
//import ActionSelect from '../ActionSelect'
//import {styles, modalStyles} from './style'
import localizations from '../../Localizations'

function cleanAskedInformationList(array) {
    let cache = {};
    let out = array.filter(function(elem,index,array){
        return cache[elem.id] ? 0 : cache[elem.id]=1 ;
    });
    return out;
}

let styles
let modalStyles

class PaymentModelModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            newPaymentModelName: '',
            newPaymentModelPrice: 0,
            newPaymentModelPaymentTypes: [],
            selectedCircles: [],
            askedInformationList: [],

            newPaymentTypeName: '',
            newPaymentTypePrice: '',
            newPaymentTypeConditions: [],

            editItem: null,
            editPaymentTypeName: '',
            editPaymentTypePrice: '',
            editPaymentTypeConditions: [],

            displayNewCondition: false,
            hasChanged: false
        };
    }

    componentDidMount = () => {
        if (this.props.paymentModelToEdit) {
            this.setState({
                newPaymentModelName: this.props.paymentModelToEdit.name,
                newPaymentModelPrice: this.props.paymentModelToEdit.price.cents,
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
                        askedInformationComparatorValue: cond.askedInformationComparatorValue,
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

    _handleChangeSelectedCircles = circle => {
        let newList = this.state.selectedCircles ;
        let index = newList.findIndex(item => item.id === circle.id);
        if (index >= 0)
            newList.splice(index, 1);
        else
            newList.push(circle)

        let newAskedInfoList = [];
        newList.forEach(circle => newAskedInfoList = newAskedInfoList.concat(circle.askedInformation))

        this.setState({
            selectedCircles: newList,
            askedInformationList: cleanAskedInformationList(newAskedInfoList),
            hasChanged: true
        })
    }

    _updateNewPaymentModelName = e => {
        this.setState({
            newPaymentModelName: e.target.value,
            hasChanged: true
        })
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

    _removeRow = index => {
        if (this.state.editItem) {
            let newList = this.state.editPaymentTypeConditions; 
            newList.splice(index, 1)
            
            this.setState({
                editPaymentTypeConditions: newList
            })
            if (newList.length === 0)
                this.addConditionRow()
        }
        else {
            let newList = this.state.newPaymentTypeConditions; 
            newList.splice(index, 1)
            
            this.setState({
                newPaymentTypeConditions: newList
            })
            if (newList.length === 0)
                this.addConditionRow()
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
            if (!areConditionOk) {
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
                    askedInformationComparator: condition.newConditionAskedInformation.type === 'BOOLEAN'
                        ?   "="
                        :   condition.newConditionComparator.name,
                    askedInformationComparatorValue: 
                        condition.newConditionAskedInformation.type === 'BOOLEAN' 
                        ?   condition.newConditionComparatorValue.name === localizations.circle_yes ? 1 : 0
                        :   condition.newConditionAskedInformation.type === 'DATE' 
                            ?   null
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
        let editItem = item;
        let editPaymentTypeName = item.name;
        let editPaymentTypePrice = item.price.cents / 100;
        let editPaymentTypeConditions = item.conditions;

        this.setState({
            editItem: item,
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
        if (!areConditionOk) {
            this.props.alert.show(localizations.circles_paymentModel_newPaymentType_error_2, {
                timeout: 2000,
                type: 'error',
            });
            return ;
        }
        
        let newList = this.state.newPaymentModelPaymentTypes;
        let index = newList.findIndex(item => item.id === this.state.editItem.id);

        newList[index] = {
            id: this.state.editItem.id, 
            name: this.state.editPaymentTypeName,
            price: {
                cents: parseInt(this.state.editPaymentTypePrice) * 100,
                currency: this.props.userCurrency
            },
            conditions: this.state.editPaymentTypeConditions.map(condition => ({
                askedInformation: condition.askedInformation,
                askedInformationComparator: condition.askedInformation.type === 'BOOLEAN'
                ?   "="
                :   condition.askedInformationComparator,
                askedInformationComparatorValue: condition.askedInformation.type === 'BOOLEAN' 
                    ?   (condition.askedInformationComparatorValue === localizations.circle_yes || condition.askedInformationComparatorValue === 1) ? 1 : 0
                    :   condition.askedInformation.type === 'DATE' 
                        ?   null
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
            hasChanged: true
        })
    }

    _handleSave = () => {
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

        if (this.state.editItem) {
            this._validationEditItem();
        }
        if (this.state.newPaymentTypeName !== '') {
            this._handleAddPaymentType();
        }

        setTimeout(() => {
            if (this.state.newPaymentModelPaymentTypes.length === 0) {
                this.props.alert.show(localizations.circles_paymentModel_missing_condition, {
                    timeout: 2000,
                    type: 'error',
                });
                return ;
            }
            let paymentModel = {
                id: this.props.paymentModelToEdit ? this.props.paymentModelToEdit.id : null,
                name: this.state.newPaymentModelName,
                conditions: this.state.newPaymentModelPaymentTypes.map(paymentType => ({
                    id: paymentType.id ? paymentType.id : null, 
                    name: paymentType.name,
                    price: paymentType.price,
                    conditions: paymentType.conditions.map(condition => ({
                        askedInformation: condition.askedInformation.id,
                        askedInformationComparator: condition.askedInformation.type === 'BOOLEAN'
                        ?   "="
                        :   condition.askedInformationComparator,
                        askedInformationComparatorValue: condition.askedInformation.type === 'BOOLEAN' 
                            ?   (condition.askedInformationComparatorValue === localizations.circle_yes || condition.askedInformationComparatorValue === 1) ? 1 : 0
                            :   condition.askedInformation.type === 'DATE' 
                                ?   null
                                :   parseInt(condition.askedInformationComparatorValue),
                        askedInformationComparatorDate: condition.askedInformation.type === 'DATE' 
                            ?   new Date(condition.askedInformationComparatorDate)
                            :   null
                    })),
                })),            
                price: {
                    cents: this.state.newPaymentModelPrice * 100,
                    currency: this.props.userCurrency
                },
                circles: this.state.selectedCircles.map(circle => circle.id)
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
                editPaymentTypeConditions: newList_
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
                newPaymentTypeConditions: newList
            })
        }
    }

    render() {
        const { viewer, user } = this.props;
        const numberComparatorList = [{name: '≥'},{name: '>'},{name: '='},{name: '<'},{name: '≤'}];
        const booleanComparatorList = [{name: localizations.equal}];
        const booleanValues = [{name: localizations.circle_yes}, {name: localizations.circle_no}];
        const dateComparatorList = [{name: '≥'},{name: '≤'}];//[{name: localizations.before}, {name: localizations.after}]

        let circleList = user.paymenModelsCircles.edges.map(edge => edge.node) ;
        if (user.paymenModelsCirclesSuperUser && user.paymenModelsCirclesSuperUser.edges && user.paymenModelsCirclesSuperUser.edges.length > 0)
            circleList = circleList.concat(user.paymenModelsCirclesSuperUser.edges.map(edge => ({...edge.node, name: edge.node.name + ' ' + localizations.circle_owner + ' ' + edge.node.owner.pseudo})));

        circleList = circleList.filter(circle => circle.type === 'ADULTS' || circle.type === 'CHILDREN')

        return (
            <Modal
                isOpen={true}
                style={modalStyles}
                contentLabel={localizations.circles_paymentModel_new_1}
            >
                <div style={styles.modalContent}>
                    <div style={styles.modalHeader}>
                        <div style={styles.modalTitle}>
                            {this.props.paymentModelToEdit ? localizations.circles_paymentModel_edit : localizations.circles_paymentModel_new_1}
                        </div>
                        <div style={styles.modalClose} onClick={this.onClose}>
                            <i className="fa fa-times fa-2x" />
                        </div>
                    </div>
                    <section style={styles.section}>
                        <div style={{...styles.row, marginBottom: 20}}>
                            <div style={styles.label}>
                                {localizations.circles_paymentModel_name}
                            </div>
                            <div style={{flex: 8}}>
                                <InputText 
                                    maxLength={"25"}
                                    value={this.state.newPaymentModelName}
                                    onChange={this._updateNewPaymentModelName}
                                    placeholder={localizations.circles_information_form_placeholder}
                                />
                            </div>
                        </div>

                        <div style={{...styles.row, marginBottom: 20}}>
                            <div style={styles.label}>
                                {localizations.circles_paymentModel_circles}
                            </div>
                            <div style={{flex: 8}}>
                                <MultiSelectCircle
                                    list={circleList}
                                    values={this.state.selectedCircles}
                                    term={this.state.selectedCircles.length > 0 ? this.state.selectedCircles.map(item => item.name).join(', ') : ''}
                                    onChange={this._handleChangeSelectedCircles}
                                />
                            </div>
                        </div>
                    </section>

                    {this.state.newPaymentModelPaymentTypes.length > 0 && 
                        <section style={styles.section}>
                            <div style={styles.conditionListTitle}>
                                {localizations.circles_paymentModel_conditions}
                            </div>

                            <div style={styles.headerRow}>
                                <div style={styles.nameInput}>
                                    {localizations.circles_paymentModel_name}
                                </div>
                                <div style={styles.priceInput}>
                                    {localizations.price}
                                </div>
                                <div style={styles.subRow}/>
                            </div>
                            {this.state.newPaymentModelPaymentTypes.map((item, index) => (
                                <div style={styles.row} key={index}>
                                    <div style={styles.nameInput}>
                                        {item.name}
                                    </div>
                                        
                                    <div style={styles.priceInput}>
                                        {item.price.cents / 100 + ' ' + item.price.currency}                                    
                                    </div>

                                    <div style={styles.subRow}>
                                        <div style={styles.editIcon} onClick={() => this._editItem(index)}>
                                            <i style={{marginLeft: 5}} className="fa fa-pencil fa-2x" />
                                        </div>
                                        <div style={styles.removeIcon} onClick={() => this._removeItem(index)}>
                                            <i style={{marginLeft: 5}} className="fa fa-times fa-2x" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </section>
                    }

                    <div style={styles.newConditionContainer} >
                        <span onClick={this.newCondition} style={styles.newConditionTitle}>
                            {localizations.circles_paymentModel_newPaymentType}
                        </span>
                    </div>

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
                                                        ?   row.newConditionAskedInformation.type === 'BOOLEAN' 
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
                                                        ?   {name: row.askedInformation.type === 'BOOLEAN' 
                                                                ?   localizations.equal
                                                                :   row.askedInformationComparator
                                                            }
                                                        :   null
                                                    }
                                                    onSelectItem={(item) => this._updateNewConditionComparator(index, item)}
                                                    isDisabled={!row.askedInformation}
                                                    list={row.askedInformation 
                                                        ?   row.askedInformation.type === 'BOOLEAN' 
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
                                                                : localizations.circle_no
                                                            :   row.askedInformationComparatorValue}}
                                                        onSelectItem={item => this._updateNewConditionComparatorValue(index, item)}
                                                        isDisabled={!row.askedInformationComparator}
                                                        list={booleanValues}
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
                    
                    {!this.state.displayNewCondition && !this.state.editItem && this.state.newPaymentModelName && this.state.selectedCircles.length > 0 && this.state.newPaymentModelPaymentTypes.length > 0 && this.state.hasChanged &&
                        (this.props.isSaving 
                        ?   <div style={styles.processingContainer}>
                                <ReactLoading type='cylon' color={colors.blue}/>
                            </div>
                        :   <button onClick={this._handleSave} style={styles.saveButton}>
                                {localizations.circles_save}
                            </button>
                        )
                    }
                </div>
            </Modal>
        )
    }
}

const dispatchToProps = (dispatch) => ({
})
  
const stateToProps = (state) => ({
    userCurrency: state.globalReducer.userCurrency,
})

export default connect(
    stateToProps,
    dispatchToProps
)(Radium(withAlert(PaymentModelModal)));

styles = {
	container: {
		width: '100%',
		display: 'flex',
        flexDirection: 'column',
        marginTop: 15
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
    modalContent: {
		flexDirection: 'column',
        justifyContent: 'flex-start',
        width: 500,
        paddingBottom: 10,
        maxHeight: '85vh', 
        overflow: 'visible',
        display: 'block'
	},
	modalHeader: {
		display: 'flex',
		flexDirection: 'row',
        alignItems: 'flex-center',
		justifyContent: 'space-between',
	},
	modalTitle: {
		fontFamily: 'Lato',
		fontSize:24,
		fontWeight: fonts.weight.medium,
		color: colors.blue,
		marginBottom: 20,
		flex: '2 0 0',
	},
	modalClose: {
		justifyContent: 'flex-center',
		paddingTop: 10,
		color: colors.gray,
		cursor: 'pointer',
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
        flex: 1
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
        flex: 5
    },
    checkBoxContainer: {
        fontFamily: 'Lato',
        fontSize: 15, 
        flex: 3
    },
    checkBoxLabel: {
        fontFamily: 'Lato',
        fontSize: 15, 
        flex: 3,
        marginLeft: 5
    },
    type: {
        fontFamily: 'Lato',
        fontSize: 15, 
        flex: 5,
        marginLeft: 5
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
    newInfoTitle: {
        fontFamily: 'Lato',
        fontSize: 15, 
        color: colors.blueLight,
        marginTop: 20,
        marginBottom: 10
    },
    dropdown: {
        position: 'absolute',
        top: 31,
        left: 0,    
        width: '100%',
        maxHeight: 300,    
        backgroundColor: colors.white,    
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.24), 0 0 4px 0 rgba(0,0,0,0.12)',
        border: '2px solid rgba(94,159,223,0.83)',
        padding: '7px 20px',    
        overflowY: 'scroll',
        overflowX: 'hidden',    
        zIndex: 100,
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
        fontSize: fonts.size.medium,
        outline: 'none',
        cursor: 'pointer',
        width: '100%',
        color: '#515151',
    },
    typeListContainer: {
        position: 'relative',
        flex: 5,
        marginTop: 2,
        marginLeft: 5,
    },
    smallExplanation: {
        fontSize: 13,
        color: colors.gray, 
        fontStyle: 'italic'
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
    plusButton: {
        justifyContent: 'flex-center',
		marginBottom: 20,
		color: colors.green,
        cursor: 'pointer',  
        flex: 1
    },
    conditionListTitle: {
        fontFamily: 'Lato',
        fontSize: 15, 
        color: colors.blueLight,
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
    },
    newConditionContainer: {
        margin: '20px auto',
        display: 'flex',
        justifyContent: 'center'
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
    processingContainer: {
        display: 'flex',
        justifyContent: 'center'
    },
}

modalStyles = {
    overlay : {
      position          : 'fixed',
      top               : 0,
      left              : 0,
      right             : 0,
      bottom            : 0,
      backgroundColor   : 'rgba(255, 255, 255, 0.75)',
    },
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)',
      border                     : '1px solid #ccc',
      background                 : '#fff',
      overflow                   : 'visible',
      WebkitOverflowScrolling    : 'touch',
      borderRadius               : '4px',
      outline                    : 'none',
      padding                    : '20px',
    },
}