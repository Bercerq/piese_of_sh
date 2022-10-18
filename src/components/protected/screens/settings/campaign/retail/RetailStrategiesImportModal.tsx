import React, { Fragment, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import * as _ from "lodash";
import * as Api from "../../../../../../client/Api";
import * as Utils from "../../../../../../client/Utils";
import DropArea from "../../../../../UI/DropArea";
import { DropFile } from "../../../../../../client/schemas";
import FontIcon from "../../../../../UI/FontIcon";
import { RetailStrategy, StructureType } from "../../../../../../models/data/Campaign";
import { RetailBranch } from "../../../../../../models/data/RetailBranch";
import Loader from "../../../../../UI/Loader";

declare var XLSX;

interface RetailStrategiesImportModalProps {
  show: boolean;
  structure: StructureType;
  advertiserId: number;
  onClose: () => void;
  onSubmit: (retailStrategies: RetailStrategy[]) => void;
}

const RetailStrategiesImportModal = (props: RetailStrategiesImportModalProps) => {
  const [retailStrategies, setRetailStrategies] = useState<RetailStrategy[]>([]);
  const [retailBranches, setRetailBranches] = useState<RetailBranch[]>([]);
  const [file, setFile] = useState<File>(null);
  const [fileInputKey, setFileInputKey] = useState<string>("0"); // state var needed for workaround to reset file input - update this state var to rerender input
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [fileSuccessText, setFileSuccessText] = useState<string>("");
  const [fileValidationText, setFileValidationText] = useState<string>("");
  const [dropLoading, setDropLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  const handleEntering = async () => {
    setShowLoader(true);
    const retailBranches: RetailBranch[] = await Api.Get({ path: `/api/advertisers/${props.advertiserId}/retailbranches`, qs: { archived: "any" } });
    setRetailBranches(retailBranches);
    setRetailStrategies([]);
    setFile(null);
    setFileInputKey("0");
    setFileErrors([]);
    setFileSuccessText("");
    setFileValidationText("");
    setDropLoading(false);
    setShowLoader(false);
    setSaving(false);
  }

  const fileChange = (e) => {
    const file = _.get(e, "target.files[0]", null);
    dataToImport(file, (errors, strategies) => {
      setFile(file);
      setFileErrors(errors);
      setFileSuccessText(file.name);
      setFileValidationText("");
      setRetailStrategies(strategies || []);
    });
  }

  const onDropError = (err) => {
    if (err) {
      setFileErrors([err]);
      setFileSuccessText("");
      setFileValidationText("");
      setRetailStrategies([]);
    } else {
      setFileErrors([]);
      setFileSuccessText("");
      setFileValidationText("");
      setRetailStrategies([]);
    }
  }

  const onDropUpload = (files: DropFile[]) => {
    setDropLoading(true);
    const file = _.get(files, "[0].file");
    const fileInputKey = Math.random().toString(36);
    dataToImport(file, (errors, strategies) => {
      setFile(file);
      setFileInputKey(fileInputKey);
      setFileErrors(errors);
      setFileSuccessText(file.name);
      setFileValidationText("");
      setRetailStrategies(strategies || []);
      setDropLoading(false);
    });
  }

  const handleSubmit = () => {
    if (file) {
      if (fileErrors.length === 0) {
        setSaving(true);
        setFileValidationText("");
        props.onSubmit(retailStrategies);
      } else {
        setFileValidationText("Fix the above file errors before submitting.");
      }
    } else {
      setFileValidationText("No file found.");
    }
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
        console.log(JSON.stringify(rows))
        const errors = getRowsErrors(rows);

        if (errors.length > 0) {
          cb(errors);
        } else {
          const toImport = getDataToImport(rows);
          cb(errors, toImport);
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
      "id": "branchId",
      "name": "name",
      "budget": "budget",
      "impressions": "impressionCap",
      "max bid price": "maxBid",
      "radius": "radius",
      "targeting postal codes": "targetingZipCodes",
      "landing page": "urlTag",
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
    return ["branchId", "budget"];
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
          if (prop === "targetingZipCodes") {
            if (row[i]) {
              obj[prop] = row[i].split(',');
            } else {
              obj[prop] = null;
            }
          } else {
            obj[prop] = row[i] || null;
          }
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
    const countIds = _.countBy(data, 'branchId');
    return Object.keys(countIds).filter((o) => { return countIds[o] > 1 });
  }

  function getMissingFieldsIds(data, fields) {
    const invalid = data.filter((o) => {
      const nullFields = _.values(_.pick(o, fields)).filter((v) => { return v === null; });
      return nullFields.length > 0;
    });
    return invalid.map((o) => { return o.branchId });
  }

  function getDataToImport(rows) {
    const toImport = rows.map((row) => {
      const rb = retailBranches.find((o) => { return row.branchId === o.branchId });

      const nonNumbers = /[^0-9.]/
      console.log("BEFORE " + row.budget)
      console.log("AFTER " + row.budget.replace(nonNumbers, ""))
      const budget = parseFloat((row.budget || "").replace(nonNumbers, ""));
      const maxBid = row.maxBid ? parseFloat(row.maxBid.replace(nonNumbers, "")) : null;
      const impressionCap = row.impressionCap ? parseInt((row.impressionCap || "").replace(nonNumbers, "")) : null;
      if (rb) {
        return {
          campaignConstraints: {
            maxBid,
            budget,
            impressionCap
          },
          geoTargeting: {
            radius: row.radius,
            targetingZipCodes: row.targetingZipCodes
          },
          dynamicAdParameters: {
            urlTag: row.urlTag,
            custom1: row.custom1,
            custom2: row.custom2,
            custom3: row.custom3,
            custom4: row.custom4,
            custom5: row.custom5,
            custom6: row.custom6,
            custom7: row.custom7,
            custom8: row.custom8,
            custom9: row.custom9
          },
          branchId: row.branchId,
          retailBranchId: rb.id,
          retailBranch: rb
        };
      } else {
        return null;
      }
    });
    return toImport.filter((o) => { return o !== null });
  }

  function getExampleFilePath() {
    if (props.structure === "RETAIL_GPS") {
      return "/files/import-campaign-retail-gps-template.xlsx";
    } else {
      return "/files/import-campaign-retail-zip-template.xlsx";
    }
  }

  return <Modal size="lg" show={props.show} onHide={props.onClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Retail branches import</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row">
        <div className="col-sm-12">
          <Loader visible={showLoader} />
          {!showLoader && <Fragment>
          </Fragment>
          }
          <Form.Group id="retailbranch-import-file">
            <p>Upload an excel file to import retail branches. You can download an example file <a href={getExampleFilePath()}>here</a></p>
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
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" size="sm" onClick={props.onClose}>CANCEL</Button>
      <Button variant="primary" size="sm" onClick={handleSubmit} disabled={saving}>SAVE</Button>
    </Modal.Footer>
  </Modal>;
}
export default RetailStrategiesImportModal;