# Lightning Web Component Documentation

## Component Name

dataTableV1

## Description

This Lightning Web Component (LWC) is designed to display a table of sObjects with customizable columns and optional features.

## Required Attributes

### `columnConfig`

An array of objects defining the columns to be displayed in the table.

Example:

```javascript
@api columnConfig = [
    {label: "Opportunity Name", apiName: "Name"},
    {label: "Amount", apiName: "Amount"},
    {label: "Stage", apiName: "StageName"},
    {label: "Probability", apiName: "Probability"},
    {label: "Account Name", apiName: "Account.Name"},
    {label: "Close Date", apiName: "CloseDate"},
];
```

### `recordList`

A list of sObjects or a list of objects with key-value pairs where the key is the apiName in columnConfig.

Example:

```javascript
@api recordList = [/* List of sObjects or objects */];
```

## Optional Attributes

### `tableHeader`

Heading for table.

Example:

```javascript
@api tableHeader = "Opportunities";
```

### `tableSubHeader`

Sub-Heading for table.

Example:

```javascript
@api tableSubHeader = "(Stage based records)"
```

### `allowSNo`

A boolean indicating whether or not to include a serial number column

Example:

```javascript
@api allowSNo = true;
```
