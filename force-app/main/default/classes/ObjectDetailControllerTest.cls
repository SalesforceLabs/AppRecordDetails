@isTest
public class ObjectDetailControllerTest {
 static testMethod void orderStatusTest() {
        Test.startTest();
         
            List<ObjectDetailController.DetailsConfigWraper> detailsWrapList = new List<ObjectDetailController.DetailsConfigWraper>();
            detailsWrapList = ObjectDetailController.getObjectDetailConfig('AccountPage','Account');
            system.assert(detailsWrapList.size()>0);
            system.assertEquals(detailsWrapList[0].secName,'Account');
            
            String test1 = '[{"SecName":"Account","FieldList":["Website","Phone","AccountNumber"]}]';

            ObjectDetailController.updateDetailsConfig('AccountPage',test1);
         
        Test.stopTest();
     }  
}