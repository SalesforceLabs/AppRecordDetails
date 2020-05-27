public class ObjectDetailController {
    /********************************************************************************************************
    * Method retrieves the config settings for detail page and returns wrapper for collections platform
    * @param {String} configName - custom metadata developer name
    * @return {List<DetailsConfigWraper>} serialized DetailsConfigWraper data
    *********************************************************************************************************/
    @AuraEnabled(cacheable=true)
    public static List<DetailsConfigWraper> getObjectDetailConfig(String configName,String objName) {
        List<DetailsConfigWraper> detailsWrapList = new List<DetailsConfigWraper>();
        Set<String> readOnlySet = new Set<String>();
        List<String> fieldFlsList = new List<String>();
        if(configName!= NULL){
            for(ObjectDeatilsConfig__mdt conf : [SELECT Id,DeveloperName, SectionFieldMapping__c,ReadonlyFields__c FROM ObjectDeatilsConfig__mdt WHERE DeveloperName =: configName]){
                if(String.isNotBlank(conf.SectionFieldMapping__c)){
                     detailsWrapList = (List<DetailsConfigWraper>)JSON.deserialize(conf.SectionFieldMapping__c,List<DetailsConfigWraper>.class);
                }
                if(String.isNotBlank(conf.ReadonlyFields__c)){
                    readOnlySet.addAll(conf.ReadonlyFields__c.split(','));
                }
            }
        }
        
        if(!detailsWrapList.isEmpty()){
            for(DetailsConfigWraper dcw : detailsWrapList){
                fieldFlsList.addAll(dcw.fieldList);
            }
        }
        Map<String, Boolean> fieldFls = SecurityUtil.checkUpdate(objName,fieldFlsList);
        detailsWrapList = constructWraperData(fieldFls,detailsWrapList, readOnlySet);
        return detailsWrapList;
    }

    /********************************************************************************************************
    * Method constructs wrapper data based on fls and readonlyfieldset
    * @param {Map<String, Boolean>} flsMap - field Fls map
    * @param {List<DetailsConfigWraper>} detWrapList - configuration wrapper
    * @param {Set<String>} readOnlySet - Readonly field set
    * @return {List<DetailsConfigWraper>} detWrapList EWSDataWrapper data
    *********************************************************************************************************/
    private static List<DetailsConfigWraper> constructWraperData(Map<String, Boolean> flsMap, List<DetailsConfigWraper> detWrapList, Set<String> readOnlySet){
         List<DetailsConfigWraper> detailsConfigWrapList = new List<DetailsConfigWraper>();

         for(DetailsConfigWraper dcw : detWrapList){
             dcw =  new DetailsConfigWraper(dcw.secName, dcw.fieldList, flsMap, readOnlySet);
             detailsConfigWrapList.add(dcw);
         }
         
         return detailsConfigWrapList;
    }

     /********************************************************************************************************
    * Method constructs wrapper data based on fls and readonlyfieldset
    * @param String configName flsMap - field Fls map
    * @param String configData detWrapList - configuration wrapper
    * @return Void 
    *********************************************************************************************************/
    @AuraEnabled
    public static void updateDetailsConfig(String configName, String configData){

        Metadata.CustomMetadata customMetadata ;
        Metadata.CustomMetadataValue customField ;
        Metadata.DeployContainer mdContainer ; 
        BaseCustomMetadataCallback callback;
        Id jobId;
        
        if(configName != NULL && configData != NULL){
             
            customMetadata =  new Metadata.CustomMetadata();
            customMetadata.fullName = 'APRD__ObjectDeatilsConfig.'+configName;
            customMetadata.label = configName;
            
            customField = new Metadata.CustomMetadataValue();
            customField.field = 'APRD__SectionFieldMapping__c';
            customField.value = configData;
    
            mdContainer = new Metadata.DeployContainer();
            customMetadata.values.add(customField);
            mdContainer.addMetadata(customMetadata);
  
            // Setup deploy callback, MyDeployCallback implements
            // the Metadata.DeployCallback interface (code for
            // this class not shown in this example)
    
            callback = new BaseCustomMetadataCallback();
    
            // Enqueue custom metadata deployment
            // jobId is the deployment ID
            if(!Test.isRunningTest())
            	jobId = Metadata.Operations.enqueueDeployment(mdContainer, callback);
        }


         //Database.upsert(configObj);
    }

    //Wraper class
    public class DetailsConfigWraper{ 
        @AuraEnabled public String secName;
        @AuraEnabled public List<String> fieldList;
        @AuraEnabled public List<FieldConfigWraper> fieldConfigList;

        DetailsConfigWraper(){
            secName = '';
            fieldConfigList = new List<FieldConfigWraper>();
        }
        DetailsConfigWraper(String secName, List<String> fieldList,Map<String, Boolean> flsMap, Set<String> readOnlySet){
            this.secName = secName;
            this.fieldList = fieldList;
            fieldConfigList = new List<FieldConfigWraper>();
            for(String field : fieldList){
                FieldConfigWraper fcw = new FieldConfigWraper();
                if(flsMap.containsKey(field)){
                    fcw.fieldName = field;
                    fcw.isAccessible = flsMap.get(field);
                    fcw.isEditable = flsMap.get(field) && !readOnlySet.contains(field) ? true : false;
                    fcw.isReadonly = readOnlySet.contains(field) ? true : false;
                    fieldConfigList.add(fcw);
                }
                
            }
         }
    }

    class FieldConfigWraper{
        @AuraEnabled public String fieldName;
        @AuraEnabled public Boolean isAccessible;
        @AuraEnabled public Boolean isEditable;
        @AuraEnabled public Boolean isReadonly;

        FieldConfigWraper(){
            fieldName = '';
            isAccessible = false;
            isEditable = false;
            isReadonly = false;
        }
    }

    public class BaseCustomMetadataCallback implements Metadata.DeployCallback {
	    public void handleResult(Metadata.DeployResult result, Metadata.DeployCallbackContext context) {
	    	//TODO: Log the error to 'Org62_Error_Log__c'
	    	for(Metadata.DeployMessage deployMessage : result.details.componentFailures) {
	        	System.debug('Error result file name:' + deployMessage.fullName);
	        	System.debug('Error problem:' + deployMessage.problem);
	        }
	    }
	}

}