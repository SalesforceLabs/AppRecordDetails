import { LightningElement, api, wire, track} from 'lwc';
import getObjectDetailConfigMethod from '@salesforce/apex/ObjectDetailController.getObjectDetailConfig';

import {getRecord} from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import PROFILE_NAME from '@salesforce/schema/User.Profile.Name';

export default class objectDetails extends LightningElement {
    @api recordId;
    @api objName;
    @api configName;
    @track configData;
    @track error;
    @track isEditVisible;
    @track isViewVisible;
    @track isStencilVisible;
    @track focusFieldApi;
    @api profileNames;
    isConfigVisible = false;
    isDetailVisible = true;
    isFirstLoad = false;


    connectedCallback() {
        this.isStencilVisible = true;
        this.isEditVisible = false;
        this.isViewVisible = true;
    }
    /* 
    *  Info: This wire mothod is invoking uiApi to get context users information information
    *  Params: recordId-User id of context user
    *  Params: fields-Profile Name of context user
    *  Result: Check profile name of context user to show hide settings icon
    */
    @wire(getRecord, {
        recordId: USER_ID,
        fields: [PROFILE_NAME]
    })
    wireuser( { error,data }){
        if (data && this.profileNames) {
            let profilelist = this.profileNames.split(',');
            let profName = data.fields.Profile.displayValue

            if(profilelist.includes(profName)){
                this.isConfigVisible = true;
            }
        }else if(error){
            this.error = error;
        }    
    }

     /* 
    *  Info: This wire mothod is invoking uiApi to get context users information information
    *  Params: configName-Config name of metadata
    *  Params: objName-Object Name string
    *  Result: Check profile name of context user to show hide settings icon
    */
    @wire(getObjectDetailConfigMethod, { configName: '$configName',objName: '$objName' })
    getConfig(result) {
        if (result.data) {
            this.configData = result.data;
            this.error = undefined;
            if(result.data.length == 0){
                this.isFirstLoad = true;
            }
                
        } else if (result.error) {
            this.error = result.error;
            this.configData = undefined;
        }
    }
    /*  
    *  Info: Toggles section to collaps and expand
    *  Params: event
    *  Result: On click of Section colapse and expang on the underlying fields
    */
    toggleSection(event){
        event.stopPropagation();
        let iconElement = event.target;
        if(event.target.tagName === 'H3'){
            iconElement = event.target.children[0];
        }
        else if(event.target.tagName === 'SPAN'){
            iconElement = event.target.previousSibling;
        }
        if(iconElement.style.transform){
            iconElement.style = '';
            event.target.closest('div').classList.add('slds-is-open');
        }else{
            iconElement.style = 'transform: rotate(-90deg)';
            event.target.closest('div').classList.remove('slds-is-open');
        }
    }
    /* 
    *  Info: This Method is called on successfull load of record details
    *  Params: event
    *  Result: hides the stencil and shows edit icon
    */
    handleViewLoad(event){
        const recordEditElement = this.template.querySelector("div[id^='idxRecordView']");
        if(recordEditElement)
            recordEditElement.classList.remove('slds-hide');
        this.isStencilVisible = false;
    }
    /* 
    *  Info: This Method is called on click of edit pencil icon
    *  Params: event
    *  Result: Toggles form view to recor edit mode
    */
    handleEditLoad(event){
        const recordEditElement = this.template.querySelector("div[id^='idxRecordEdit']");
        if(recordEditElement)
            recordEditElement.classList.remove('slds-hide');
        let lexInputEle = this.template.querySelector("*[data-apiedit='"+this.focusFieldApi+"']");
        lexInputEle.scrollIntoView({block: "center"});
        this.isStencilVisible = false;
    }
    /* 
    *  Info: This Method is called on click of edit pencil icon
    *  Params: event
    *  Result: Toggles form view to recor edit mode
    */
    toggleEditForm(event){
        this.isEditVisible = true;
        this.isViewVisible = false;
        this.focusFieldApi  = event.target.dataset.api;
        this.isStencilVisible = true;
    }
    /* 
    *  Info: This Method is called on success of record edit form  
    *  Params: event
    *  Result: Toggles form edit to recor view mode
    */
    handleSuccess(){
        this.isEditVisible = false;
        this.isViewVisible = true;
        this.isStencilVisible = true;
    }
    /* 
    *  Info: This Method is called on click of setting icon
    *  Params: event
    *  Result: Toggles form view to config mode
    */
    showConfigPage(){
        this.isDetailVisible = false;
    }
    /* 
    *  Info: This Method is called on event onupdateconfig
    *  Params: event
    *  Result: Reloads form only if successfull save is performed
    */
    handleUpdateConfig(event){
        if(event.detail.showDetails && event.detail.refreshData){
            window.location.reload();
        }
        this.isDetailVisible = event.detail.showDetails;
    }

    
}