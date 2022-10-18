import React, { Fragment, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import * as _ from "lodash";
import * as Api from "../../../../client/Api";
import * as Utils from "../../../../client/Utils";
import DropArea from "../../../UI/DropArea";
import { DropFile } from "../../../../client/schemas";
import FontIcon from "../../../UI/FontIcon";
import { CreativeFeed, CreativeFeedRow } from "../../../../models/data/CreativeFeed";
import Loader from "../../../UI/Loader";

declare var XLSX;

interface CreativeFeedImportModalProps {
    creativeFeed: CreativeFeed;
    show: boolean;
    rowsChanged: (retailStrategies: CreativeFeedRow[]) => void;
    exportData: (c : CreativeFeedRow[]) => void;
}

const CreativeFeedImport = (props: CreativeFeedImportModalProps) => {
    const [file, setFile] = useState<File>(null);
    const [fileInputKey, setFileInputKey] = useState<string>("0"); // state var needed for workaround to reset file input - update this state var to rerender input
    const [fileErrors, setFileErrors] = useState<string[]>([]);
    const [fileSuccessText, setFileSuccessText] = useState<string>("");
    const [fileValidationText, setFileValidationText] = useState<string>("");
    const [dropLoading, setDropLoading] = useState<boolean>(false);
    const [currentDataSummary, setCurrentDataSummary] = useState<string>(getDataSummary(props.creativeFeed?.rows || []))

    function getDataSummary(rows: CreativeFeedRow[]) {
        if (rows.length > 0) {
            const mapping = importMapping()
            const reversedMapping = new Map(Object.keys(mapping).map(a => [mapping[a], a]))
            const keys = Object.keys(mapping).map(a => mapping[a]).filter(a => a != "keys")
            const count = {}
            keys.forEach((key) => {
                count[key] = 0
                rows.forEach(row => {
                    if (row[key]) {
                        count[key] += 1;
                    }
                })
            })
            const usedKeys = keys.filter(key => count[key] > 0).map(a => reversedMapping.get(a));
            const partialKeys = keys.filter(key => count[key] != 0 && count[key] != rows.length).map(a => reversedMapping.get(a));
            let summary = `${rows.length} entries. Used properties: ${usedKeys.reduce((a, b) => a + (a != "" ? ", " : "") + b, "")}`
            if (partialKeys.length > 0) {
                summary += `, Not all entries have properties: ${partialKeys.reduce((a, b) => a + (a != "" ? ", " : "") + b, "")}!`
            }
            return summary
        }
        return "No data";
    }

    const handleEntering = async () => {
        setFile(null);
        setFileInputKey("0");
        setFileErrors([]);
        setFileSuccessText("");
        setFileValidationText("");
        setDropLoading(false);
    }

    const fileChange = (e) => {
        const file = _.get(e, "target.files[0]", null);
        importDataToOutput(file, "");
    }

    const onDropError = (err) => {
        if (err) {
            setFileErrors([err]);
            setFileSuccessText("");
            setFileValidationText("");
        } else {
            setFileErrors([]);
            setFileSuccessText("");
            setFileValidationText("");
        }
    }

    const onDropUpload = (files: DropFile[]) => {
        setDropLoading(true);
        const file = _.get(files, "[0].file");
        const fileInputKey = Math.random().toString(36);
        importDataToOutput(file, fileInputKey)
    }

    const importDataToOutput = (file, fileInputKey) => {
        dataToImport(file, (errors, strategies) => {
            setFile(file);
            setFileInputKey(fileInputKey);
            setFileErrors(errors);
            let rows = () =>{
                const summary = getDataSummary(strategies || [])
                if (summary.indexOf("Not all entries have") !== -1) {
                    setFileSuccessText("");
                    setFileValidationText(summary);
                } else if (summary == "No data") {
                    setFileSuccessText("");
                    setFileValidationText("File is empty, uploading it will clear the data feed!");
                }
                else {
                    setFileSuccessText(summary);
                    setFileValidationText("");
                }
                return strategies || [];
            }
            props.rowsChanged(rows());
            setDropLoading(false);
        });
    }

    function dataToImport(f: File, cb: (err, strategies?) => void) {
        const reader = new FileReader();
        reader.onload = function (e: any) {
            const xlsdata = e.target.result;
            let wb;

            const arr = Utils.fixExcelData(xlsdata);
            wb = XLSX.read(btoa(arr), {
                type: 'base64'
            });

            const sheetName = wb.SheetNames[0];
            const rawData = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, blankRows: false });
            const fileData = filterEmptyRows(rawData);
            const mapping = importMapping();
            const firstRow = fileData.shift().map((o) => { return o.trim() });
            const header = firstRow.map((o) => { return mapping[o]; });

            const columnErrors = getColumnErrors(header);

            if (columnErrors.length > 0) {
                cb(columnErrors);
            } else {
                const rows = getRows(fileData, header);
                const errors = getRowsErrors(rows);

                if (errors.length > 0) {
                    cb(errors);
                } else {
                    cb(errors, rows);
                }
            }
        };
        reader.readAsArrayBuffer(f);
    }

    function filterEmptyRows(fileData) {
        const filtered = fileData.filter((row) => {
            if (row.length === 0) {
                return false;
            } else {
                const rowData = row.map((col) => {
                    if (col === null || col === undefined) {
                        return "";
                    } else {
                        return col.trim();
                    }
                });
                return rowData.join("") !== "";
            }
        });
        return filtered;
    }

    function importMapping() {
        return {
            "id": "key",
            "name": "name",
            "landing page": "landingPage",
            "custom 1": "custom1",
            "custom 2": "custom2",
            "custom 3": "custom3",
            "custom 4": "custom4",
            "custom 5": "custom5",
            "custom 6": "custom6",
            "custom 7": "custom7",
            "custom 8": "custom8",
            "custom 9": "custom9",
        }
    }

    function getRequiredImportFields() {
        return ["key"];
    }

    function getColumnErrors(header) {
        const required = getRequiredImportFields();
        const diff = _.difference(required, header);
        if (diff.length > 0) {
            return ['Missing required columns: "' + diff.join(', ') + '".'];
        }
        return [];
    }

    function getRows(fileData, header) {
        return fileData.map((row) => {
            let obj: any = {};
            header.forEach(function (prop, i) {
                if (prop) {
                    obj[prop] = row[i] || null;
                }
            });
            return obj;
        });
    }

    function getRowsErrors(data) {
        const errors = [];
        const duplicateIds = getDuplicateIds(data);
        if (duplicateIds.length > 10) {
            errors.push("Some ids are not unique within the update.");
        } else if (duplicateIds.length > 0) {
            errors.push("Some ids are not unique within the update: " + duplicateIds.join(', ') + ".");
        }

        const required = getRequiredImportFields();
        const requiredMissingIds = getMissingFieldsIds(data, required);
        if (requiredMissingIds.length > 10) {
            errors.push('Some branches lack mandatory fields "id, budget".');
        } else if (requiredMissingIds.length > 0) {
            errors.push('Branches with id: ' + requiredMissingIds.join(', ') + ' lack mandatory fields "id, budget".');
        }

        return errors;
    }

    function getDuplicateIds(data) {
        const countIds = _.countBy(data, 'key');
        return Object.keys(countIds).filter((o) => { return countIds[o] > 1 });
    }

    function getMissingFieldsIds(data, fields) {
        const invalid = data.filter((o) => {
            const nullFields = _.values(_.pick(o, fields)).filter((v) => { return v === null; });
            return nullFields.length > 0;
        });
        return invalid.map((o) => { return o.branchId });
    }


    return <div>
        <div className="row no-gutters">
            <div className="col-sm-12 px-1">
                <Button variant="primary" size="sm" onClick={() => { props.exportData(props.creativeFeed?.rows || []) }} > Export data/template</Button>
                <div ><b> Current data: {currentDataSummary}</b></div>
            </div>
        </div>
        <br></br>
        <div className="row no-gutters">
            <div className="col-sm-12 px-1">
                <Form.Group id="datafeed-import-file">
                    <p>Upload an excel file to import feed data; when reuploading, missing keys and rows will be removed</p>
                    <Form.Control
                        key={fileInputKey}
                        type="file"
                        accept=".xls,.xlsx"
                        onChange={fileChange}
                    />
                </Form.Group>
                <Form.Group>
                    <DropArea
                        singleUpload={true}
                        exts={[".xls", ".xlsx"]}
                        text="Drag and drop file"
                        loading={dropLoading}
                        onError={onDropError}
                        onUpload={onDropUpload}
                    />
                    <div className="pt-2">
                        <div className="text-success pb-2">{fileSuccessText}</div>
                        {fileErrors.length > 0 &&
                            <Alert variant="danger">
                                <div><FontIcon name="times-circle" /> <strong>Errors</strong></div>
                                <ul className="pl-3">
                                    {
                                        fileErrors.map((error, i) => <li key={`error-${i}`}>{error}</li>)
                                    }
                                </ul>
                            </Alert>
                        }
                    </div>
                </Form.Group>
            </div>
            <div className="col-sm-12">
                <div className="text-danger">{fileValidationText}</div>
            </div>
        </div>
    </div>
}
export default CreativeFeedImport;