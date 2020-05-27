public class SecurityUtil {
	public static Map<String, Boolean> checkUpdate(String objectName, List<String> lFieldNames) {
      Map<String, Boolean> mUpdatedFLS = checkFieldIsUpdatable(getDescribeFields(objectName, lFieldNames));
      return mUpdatedFLS;
    }
    
    public static Map<String, Schema.DescribeFieldResult> getDescribeFields(String objectName, List<String> lFieldNames) {
      //Schema.SObjectType objType = Schema.getGlobalDescribe().get(objectName);
      SObjectType objType = ((SObject)Type.forName(objectName).newInstance()).getSObjectType();
      Schema.DescribeSObjectResult objDescribe = objType.getDescribe();
      Map<String, Schema.DescribeFieldResult> mDescribeFieldResults = new Map<String, Schema.DescribeFieldResult>();
      Map<String,Schema.SObjectField> sobjFieldMap = objDescribe.fields.getMap();
      for(String fieldName : lFieldNames) {
        // ** Check for standard fields
        if(sobjFieldMap.containsKey(fieldName)){
            Schema.DescribeFieldResult fieldDescribe = objDescribe.fields.getMap().get(fieldName).getDescribe();
            if(!mDescribeFieldResults.containsKey(fieldName)) {
                mDescribeFieldResults.put(fieldName, fieldDescribe);
            } 
        }
        
      }
      return mDescribeFieldResults;
    }
    
    private static Map<String, Boolean> checkFieldIsUpdatable(Map<String, Schema.DescribeFieldResult> mFieldDescribeResults) {
      Map<String, Boolean> mFLSResult = new Map<String, Boolean>();
      for(String fieldName : mFieldDescribeResults.keySet()) {
        if(mFieldDescribeResults.get(fieldName).isUpdateable()) {
            mFLSResult.put(fieldName, true);
        } else {
            mFLSResult.put(fieldName, false);
        }
      }
       return mFLSResult;
    }
}