import { LightningElement, api, wire, track} from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import upsertConfigMetadat from '@salesforce/apex/ObjectDetailController.updateDetailsConfig';


export default class AX_FI_CPAccountConfig extends LightningElement {
    @api objName; //Object Name for the config page to configure the metadata 
    @api configData; //JSON string form metadata that has existing data of sections and fields
    @api configName; // Either existing name of custom metadata record to update of new for creation
    @track options = []; // Fields related to object displayed in multi select picklist
    isNewSectionVisible = false; // Flag to show hide new section in config page

    /* 
    *  Info: This wire mothod is invoking uiApi to get object information
    *  Params: objName-Object name passed from the details page
    *  Result: Get list of fields and set in options in form of label-value pair used in multi picklist
    */
    @wire(getObjectInfo, { objectApiName: '$objName' })
    getObjMetadata( { data }){
        if (data) {
            const items =[];

            for (const field in data.fields) {
                if (data.fields.hasOwnProperty(field)) {
                    let fieldLabel = data.fields[field].label;
                    let fieldAPI = data.fields[field].apiName;
                    //Constructing label value pair for multiselect picklist
                    items.push({label: fieldLabel,
                                value: fieldAPI});
                    
                }
            }
            
            this.options.push(...items);
            
        }
    }

    /* 
    *  Info: Method to handle visibility of add new section
    *  Params: NA
    *  Result: sets a boolean vartiable isNewSectionVisible to true
    */
    handleAddSection(){
        this.isNewSectionVisible = true;
    }
    /* 
    *  Info: This methode is invoked onchange of fields selected and validates for uniqueness of the fields added under sections 
    *  Params: event
    *  Result: reports validation message if a duplicate fields is selected in the multiselect picklist
    */
    register(event) {

        let selectedfieldList =this.template.querySelectorAll("lightning-dual-listbox");
        let selectValidation=[];

        for(let i=0 ; i<selectedfieldList.length ; i++){
            let selectedfields = `${selectedfieldList[i].value}`.split(',');
            if(selectValidation.some(r=> selectedfields.indexOf(r) >= 0)){
                event.target.setCustomValidity("Duplicate fields found"); // Sets custom validatin message
            }else {
                selectedfieldList[i].setCustomValidity(""); // if there was a custom error before, reset it
            }
            selectedfieldList[i].reportValidity();// Tells lightning-input to show the error right away without needing interaction
            
            selectValidation.push(...selectedfields);
        }
    }

    /* 
    *  Info: This methode is invoked when we click on save of the config page
    *  Params: NA
    *  Result: Reconstructs the JSON to be stored on the custom metada records and updates/ creats the values on records
    */
    handleSave(){
        let secFields =this.template.querySelectorAll("lightning-input");
        let selectedfieldList =this.template.querySelectorAll("lightning-dual-listbox");
        let configDataUpdated=[]; // Holds the reconstructed JSON object

        //Validation logic to check for mandatory fields
        const validateInput = [...secFields]
        .reduce((validSoFar, inputCmp) => {
                    inputCmp.reportValidity();
                    return validSoFar && inputCmp.checkValidity();
        }, true);
        const validateSelect = [...selectedfieldList]
        .reduce((validSoFar, inputCmp) => {
                    inputCmp.reportValidity();
                    return validSoFar && inputCmp.checkValidity();
        }, true);
        //valid section name and fields are selected
        if (validateInput && validateSelect) {
            //Start : JSON constructon
            for(let i=0 ; i<secFields.length ; i++){
                let sectionData;
                let selectedfields = `${selectedfieldList[i].value}`.split(',');

                sectionData = {"SecName":secFields[i].value,"FieldList": selectedfields};
                configDataUpdated.push(sectionData);
            }
            //Stop : JSON constructon
            if(configDataUpdated){
                this.configData = configDataUpdated
            }
    
            let configDateStr = JSON. stringify(this.configData);
            //Imperative Apex call to update existing metadata record or create new record
            upsertConfigMetadat({configName:this.configName,configData:configDateStr})
                .then(() => {
                    if(this.isNewSectionVisible){
                        this.isNewSectionVisible = false;
                    }
                    //Dispatch an event to parent component to send flags to detail page
                    const updateEvent = new CustomEvent('updateconfig', {
                        detail: {"showDetails":true,"refreshData":true}
                    });
                    this.dispatchEvent(updateEvent);
                })
                .catch(error => {
                    console.log('update error '+ error.status);
                });
        } 

        
        
    }
    /* 
    *  Info: This methode delets the section and fields selected under section helps in updates for deleted section data
    *  Params: evnet
    *  Result: Removes Html dom from UI for the selected section to delete
    */
    handleDelete(event){
        let element = event.target.closest('div');
        if(element.classList.contains('slds-section')){
            element.remove();
        }else{
            this.isNewSectionVisible = false;
        } 
    }
    /* 
    *  Info: This methode dispatches event to cancle console page and show existing detail page without refreshing page
    *  Params: NA
    *  Result: navigate bback without refresh
    */
    handleCancel(){
        //Dispatch an event to parent component to sand the updated data
        const updateEvent = new CustomEvent('updateconfig', {
            detail: {"showDetails":true,"refreshData":false}
        });
        this.dispatchEvent(updateEvent);
    }
}