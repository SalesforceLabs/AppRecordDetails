import { createElement } from "lwc";
import appSpecificLayout from "c/objectDetails";
import { registerApexTestWireAdapter } from "@salesforce/sfdx-lwc-jest";
import getObjectDetailConfigMethod from "@salesforce/apex/ObjectDetailController.getObjectDetailConfig";
import { registerLdsTestWireAdapter } from '@salesforce/sfdx-lwc-jest';

import { getRecord } from 'lightning/uiRecordApi';

//realistic data with list of fields to be displayed on layout
const mockGetMetadataValues = require("./data/getAccountLayoutData.json");
const mockGetMetadataErrorValues = require("./data/getAccountLayoutError.json");
const mockGetRecord = require('./data/getRecord.json');

// Register as Apex wire adapter. Some tests verify that provisioned values trigger desired behavior.
const getMetadataInfoAdapter = registerApexTestWireAdapter(getObjectDetailConfigMethod);
const getRecordAdapter = registerLdsTestWireAdapter(getRecord);

describe("c-object-details", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    // Prevent data saved on mocks from leaking between tests
    jest.clearAllMocks();
  });

  describe("verify section names and click on edit", () => {
    it("getObjectDetailConfigMethod @wire data", () => {
      const RECORD_ID_INPUT = '0012x000004KwDqAAK';
      const OBJECT_API_NAME_INPUT = 'ACCOUNT';
      const USER_ID = '005000000000000000';
      const PROFILE_NAME = 'System Administrator';

      const WIRE_PARAMETER = { configName: "xyz", recordId: USER_ID, fields: [PROFILE_NAME], profileNames: "System Administrator" };
      // Create element
      var element = createElement("c-object-details", {
        is: appSpecificLayout,
      });

      element.profileNames = 'System Administrator';
      element.recordId = RECORD_ID_INPUT;
      element.objName = OBJECT_API_NAME_INPUT;
      element.USER_ID = USER_ID;
      element.PROFILE_NAME = PROFILE_NAME;

      document.body.appendChild(element);

      const recordViewForm = element.shadowRoot.querySelector('lightning-record-view-form');
      expect(recordViewForm.recordId).toBe(RECORD_ID_INPUT);
      expect(recordViewForm.objectApiName).toBe(OBJECT_API_NAME_INPUT);
      // Emit data from @wire
      getRecordAdapter.emit(mockGetRecord);
      getMetadataInfoAdapter.emit(mockGetMetadataValues);

      return Promise.resolve().then(() => {
        try {
          recordViewForm.dispatchEvent(new CustomEvent('load'));
          //verify section names
          const sectionNamesTags = element.shadowRoot.querySelectorAll('span');
          var secNames = [];
          sectionNamesTags.forEach(secNameElement => {
            secNames.push(secNameElement.innerHTML);
          });
          sectionNamesTags[0].click();
          sectionNamesTags[0].click();

          const sectionNamesH3Tags = element.shadowRoot.querySelector('h3');
          sectionNamesH3Tags.click();
          sectionNamesH3Tags.click();

          mockGetMetadataValues.data.forEach(mockElement => {
            expect(secNames.includes(mockElement.secName)).toBe(true);
          });

          //verify the click on edit icon
          const editIcons = element.shadowRoot.querySelector('.editIcon');
          editIcons.click();

          return Promise.resolve().then(() => {
            //record edit form starts from here
            const recordEditForm = element.shadowRoot.querySelector('lightning-record-edit-form');

            //mock scroll to view functinality
            let scrollIntoViewMock = jest.fn();
            window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
            recordEditForm.dispatchEvent(new CustomEvent('load'));
            expect(scrollIntoViewMock).toBeCalled();

            expect(recordEditForm.recordId).toBe(RECORD_ID_INPUT);
            expect(recordEditForm.objectApiName).toBe(OBJECT_API_NAME_INPUT);

            // Validate if save and cancel buttons are defined
            const buttonLabels = ['Cancel', 'Save'];
            const buttonElements = element.shadowRoot.querySelectorAll('lightning-button button');
            buttonElements.forEach(buttonEl => {
              expect(buttonLabels.includes(buttonEl.label)).toBe(true);
            });
            recordEditForm.dispatchEvent(new CustomEvent('success'));

            const configBtn = element.shadowRoot.querySelector('lightning-button-icon');
            configBtn.click();
          });

        } catch (e) {
          console.log('--e--' + e);
        }
      });
    });

    it("getObjectDetailConfigMethod error scenario @wire data", () => {
      const RECORD_ID_INPUT = '0012x000004KwDqAAK';
      const OBJECT_API_NAME_INPUT = 'ACCOUNT';
      const USER_ID = '005000000000000000';
      const PROFILE_NAME = 'System Administrator';

      const WIRE_PARAMETER = { configName: "xyz", recordId: USER_ID, fields: [PROFILE_NAME], profileNames: "System Administrator" };
      // Create element
      var element = createElement("c-object-details", {
        is: appSpecificLayout,
      });

      element.profileNames = 'System Administrator';
      element.recordId = RECORD_ID_INPUT;
      element.objName = OBJECT_API_NAME_INPUT;
      element.USER_ID = USER_ID;
      element.PROFILE_NAME = PROFILE_NAME;

      document.body.appendChild(element);

      const recordViewForm = element.shadowRoot.querySelector('lightning-record-view-form');
      // Emit data from @wire
      getRecordAdapter.emit(mockGetRecord);
      getMetadataInfoAdapter.emit(mockGetMetadataErrorValues);

      return Promise.resolve().then(() => {
        
      });
    });
  });
});
