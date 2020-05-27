@isTest
public class SecurityUtilTest {
    
     private static User setUser(){    
        User u = new User();
        u.Alias = 'lwcuser';
        u.Email = 'lwcestuser@salesforce.com';
        u.EmailEncodingKey = 'UTF-8';
        u.LastName = 'lwc Test';
        u.LanguageLocaleKey = 'en_US';
        u.LocaleSidKey = 'en_US';
        u.ProfileId = [SELECT Id FROM Profile WHERE Name = 'System Administrator'].Id;
        u.TimeZoneSidKey = 'America/Los_Angeles';
        u.Username = 'lwcsysadmin@salesforce.com';
        insert u;
         
        system.assert(u <> null);
        return u;
     }
    
    @isTest
    private static void testCheckUpdate() {
        Test.startTest();
        System.runAs(setUser()){
            
            Map<String, Boolean> flsMap = SecurityUtil.checkUpdate('Account', new String[] {'Website'});
            System.assertEquals(true,flsMap.get('Website'));
        }
        Test.stopTest();
    }
}