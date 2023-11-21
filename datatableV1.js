import { LightningElement, api, track } from 'lwc';

export default class DatatableV1 extends LightningElement {
    // Required attribute
    @api columnConfig = [
        {label: "Opportunity Name", apiName: "Name"},
        {label: "Amount", apiName: "Amount"},
        {label: "Stage", apiName: "StageName"},
        {label: "Probability", apiName: "Probability"},
        {label: "Account Name", apiName: "Account.Name"},
        {label: "Close Date", apiName: "CloseDate"},
    ]
    @api recordList = [];

    // Optional Attribute
    @api tableHeader;
    @api tableSubHeader;
    @api allowSNo = false;

    // Essential for internal working
    @track datatableColumnConfig = [];
    @track recordListString = "";
    @track recordAvailable = false;
    @track disableSort = true;


    // Initialize component and do important checks and configuration
    connectedCallback(){
        // Check if columnConfig is set or not
        if(!this.columnConfig || !(this.columnConfig.length > 0)) {
            console.error("columnConfig is a required property for datatable component.");
        } else {
            // Validate and clean columnConfig as per component requirements
            let i = 1; 
            const modifiedColumnConfig = [];
            this.columnConfig.forEach((configObj) => {
                const modifiedConfigObj = {...configObj};
                modifiedConfigObj.columnNo = "col"+i;
                modifiedConfigObj.sortIconName = "utility:arrowup";
                modifiedConfigObj.sortDirection = "ascending";
                modifiedColumnConfig.push(modifiedConfigObj);
                i++;
            });
            // datatableColumnConfig contains actual configuration for Components columns
            this.datatableColumnConfig = modifiedColumnConfig;

            // Validate list of records
            if(!this.recordList || !(this.recordList.length > 0)){
                console.error("recordList is a required property for datatable component.");
            } else {
                this.updateTableRecordRows(this.recordList);
                this.disableSort = false;
                this.recordAvailable = true;
            }
        }
    }


    // Calls whenver the component is rerendered and set the records for table
    renderedCallback(){
        const tbodyElement = this.template.querySelector(".table-tbody");
        tbodyElement.innerHTML = this.recordListString;
    }


    // Update the records of table based on given list of sObjects
    updateTableRecordRows(newRecordList){
        // If parent provided record list is invalid or empty then do nothing
        if(!newRecordList || !(newRecordList.length > 0)) {
            console.error("Given record list is invalid, List of sObject is accepted only.")
        } else {
            // Create string for all row 
            let recordListString = "";
            let i = 1;
            // Create string for single row
            newRecordList.forEach((record) => {
                let recordString = "";
                recordString += '<tr class="slds-hint-parent">';

                // If S.No. is also requested
                if(this.allowSNo){
                    recordString += `<td data-label="S.No.">`;
                    recordString += `<div class="slds-truncate" title="${i}">${i}</div>`;
                    recordString += '</td>';
                }
                i++;

                // Only add field data based on column config user provide not the list of records, it ensure symmetry for UI
                this.columnConfig.forEach((columnConfObj) => {
                    let columnApiName = columnConfObj.apiName;
                    let columnLabelName = columnConfObj.label;
                    let fieldString = "";

                    // If requested column is related field
                    let value = "";
                    if(columnApiName.includes(".")){
                        const relationLevels = columnApiName.split(".");
                        value = record;
                        // Get related data value for particular field
                        relationLevels.forEach((level) => {
                            if(value[level]){
                                value = value[level];
                            } else {
                                value = "";
                            }
                        });
                    }
                    // If column is not a related field and is present in column config
                    else if(record.hasOwnProperty(columnApiName)){
                        value = record[columnApiName];
                    }
                    // If column is present in column config but have no data 
                    else {
                        value = "";
                    }
                    fieldString += `<td data-label="${columnLabelName}">`;
                    fieldString += `<div class="slds-truncate" title="${value}">${value}</div>`;
                    fieldString += '</td>';
                    recordString += fieldString; 

                });
                recordString += '</tr>';
                recordListString += recordString;
                this.recordListString = recordListString;
            });
        }
    }


    // Sort columns of table with server side sorting
    sortHandler(event) {
        this.disableSort = true;
        let column = event.currentTarget.dataset.column;
        let sortDirection = event.currentTarget.dataset.sortDirection;
        let sortValue = "";
        let fieldConfigObjIndex = this.datatableColumnConfig.findIndex((columnConfObj) => columnConfObj["columnNo"] == column); 
        // If invalid column name then set default
        if(!fieldConfigObjIndex){
            fieldConfigObjIndex  = 0;
        }
        // if invalid sort direction then set default
        if(sortDirection == "descending"){
            sortValue = "DESC";
        } else {
            sortValue = "ASC";
        }
        let fieldApiName = this.datatableColumnConfig[fieldConfigObjIndex].apiName;
        // Sorting
        this.clientSideSort(fieldApiName, sortValue)
        this.disableSort = false;
        this.toggleSortDirection(fieldConfigObjIndex);
    }


    // Toggle sort direction and icon
    toggleSortDirection(fieldConfigObjIndex){
        if(this.datatableColumnConfig[fieldConfigObjIndex].sortDirection == "ascending"){
            // This will cause lightning-button-icon to rerender
            this.datatableColumnConfig[fieldConfigObjIndex].sortDirection = "descending";
            this.datatableColumnConfig[fieldConfigObjIndex].sortIconName = "utility:arrowdown";
        } else {
            // This will cause lightning-button-icon to rerender
            this.datatableColumnConfig[fieldConfigObjIndex].sortDirection = "ascending";
            this.datatableColumnConfig[fieldConfigObjIndex].sortIconName = "utility:arrowup";
        }
    }

    
    // Client Side Sorting
    clientSideSort(fieldApiName, orderDirection) {
        const dataList = [...this.recordList];
        dataList.sort((oppObj1, oppObj2) => {
            // If its contains related data
            if(fieldApiName.includes(".")) {
                const levels = fieldApiName.split(".");
                let value1 = oppObj1;
                let value2 = oppObj2;
                levels.forEach((level) => {
                    if(value1 != undefined){
                        value1 = value1[level];
                    }
                    if(value2 != undefined){
                        value2 = value2[level];
                    }
                })
                if(orderDirection == "DESC"){
                    if(value2 == ""){
                        return -1;
                    }
                    return value2.localeCompare(value1);
                } else {
                    return value1.localeCompare(value2);
                }
            }
            // If its not contain related data 
            else {
                // Handle different data types
                if (typeof oppObj1[fieldApiName] === 'string' && typeof oppObj2[fieldApiName] === 'string') {
                    if(orderDirection == "DESC"){
                        return oppObj2[fieldApiName].localeCompare(oppObj1[fieldApiName]);
                    } else {
                        return oppObj1[fieldApiName].localeCompare(oppObj2[fieldApiName]);
                    }
                } else {
                    if(orderDirection == "DESC"){
                        return oppObj2[fieldApiName] - oppObj1[fieldApiName];
                    } else {
                        return oppObj1[fieldApiName] - oppObj2[fieldApiName];
                    }
                }
            }
        })
        //  Update new records on Table
        this.updateTableRecordRows(dataList);
    }
}