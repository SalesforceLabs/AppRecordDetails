import { createElement } from "lwc";
import appSpecificLayoutConfig from "c/objectDetailsConfig";
import { registerApexTestWireAdapter } from "@salesforce/sfdx-lwc-jest";
import getObjectInfoMethod from "@salesforce/apex/ObjectDetailController.getObjectInfo";
import { registerLdsTestWireAdapter } from '@salesforce/sfdx-lwc-jest';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

//realistic data with list of fields to be displayed on layout
const mockGetObjectValues = require("./data/getAccountObjectDetails.json");
const mockGetConfigData = require('./data/getAccountConfigData.json');

// Register as Apex wire adapter. Some tests verify that provisioned values trigger desired behavior.
const getObjectInfoAdapter = registerLdsTestWireAdapter(getObjectInfo);

describe("c-object-details-config", () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        // Prevent data saved on mocks from leaking between tests
        jest.clearAllMocks();
    });

    describe("change this accordingly", () => {
        it("getObjectInfo @wire data", () => {
            const OBJECT_API_NAME_INPUT = 'ACCOUNT';

            const WIRE_PARAMETER = { objectApiName: OBJECT_API_NAME_INPUT };
            // Create element
            var element = createElement("c-object-details-config", {
                is: appSpecificLayoutConfig
            });
            element.objName = OBJECT_API_NAME_INPUT;
            element.configData = mockGetConfigData;

            document.body.appendChild(element);
            getObjectInfoAdapter.emit(mockGetObjectValues);

            return Promise.resolve().then(() => {

                const dualPicklists = element.shadowRoot.querySelectorAll('lightning-dual-listbox');
                dualPicklists.forEach(dualBox => {
                    dualBox.dispatchEvent(new CustomEvent('change'));
                });

                const sectionNames = element.shadowRoot.querySelectorAll('lightning-input');
                expect(sectionNames.length).toBe(3);

                window.HTMLSelectElement.prototype.checkValidity = true;
                window.HTMLSelectElement.prototype.reportValidity = true;

                window.HTMLInputElement.prototype.checkValidity = true;
                window.HTMLInputElement.prototype.reportValidity = true;

                element.dummyfn = jest.fn().mockImplementation(() => { return null; });

                const addNewSection = element.shadowRoot.querySelector('lightning-button[title="Add Section"]');
                addNewSection.dispatchEvent(new CustomEvent('click'));

                const deleteIcon = element.shadowRoot.querySelector('lightning-button-icon');
                deleteIcon.dispatchEvent(new CustomEvent('click'));

                const saveBtn = element.shadowRoot.querySelector('lightning-button[title="Save"]');
                saveBtn.dispatchEvent(new CustomEvent('click'));

                const cancelBtn = element.shadowRoot.querySelector('lightning-button[title="Cancel"]');
                cancelBtn.dispatchEvent(new CustomEvent('click'));
            });
        });
    });
});