import React from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import * as _ from "lodash";
import * as Utils from "../../../../../client/Utils";
import DropArea from "../../../../UI/DropArea";
import { DropFile } from "../../../../../client/schemas";
import FontIcon from "../../../../UI/FontIcon";
import { RetailBranch } from "../../../../../models/data/RetailBranch";

declare var XLSX;

interface RetailBranchImportModalProps {
  show: boolean;
  existingBranches: RetailBranch[];
  handleClose: () => void;
  handleSubmit: (data: { retailBranches: RetailBranch[], replaceAll: boolean }) => void;
}

interface RetailBranchImportModalState {
  file: File;
  fileInputKey: string; // state var needed for workaround to reset file input - update this state var to rerender input
  replaceAll: boolean;
  retailBranches: any[];
  saving: boolean;
  dropLoading: boolean;
  fileWarnings: string[];
  fileErrors: string[];
  fileSuccessText: string;
  fileValidationText: string;
}

export default class RetailBranchImportModal extends React.Component<RetailBranchImportModalProps, RetailBranchImportModalState> {
  constructor(props, context) {
    super(props, context);
    this.state = this.initialState();
  }

  initialState() {
    return {
      file: null,
      fileInputKey: "0",
      retailBranches: [],
      replaceAll: false,
      saving: false,
      dropLoading: false,
      fileErrors: [],
      fileWarnings: [],
      fileSuccessText: "",
      fileValidationText: ""
    };
  }

  handleEntering = () => {
    const state = this.initialState();
    this.setState(state);
  }

  handleClose = () => {
    const state = this.initialState();
    this.setState(state, () => { this.props.handleClose() });
  }

  fileChange = (e) => {
    const file = _.get(e, "target.files[0]", null);
    this.dataToImport(file, (errors, warnings, retailBranches) => {
      this.setState({ file, fileErrors: errors, fileWarnings: warnings, fileSuccessText: file.name, fileValidationText: "", retailBranches: retailBranches || [] });
    });
  }

  radioChange = (e) => {
    if (e.target.checked) {
      const replaceAll = e.target.value === "replace";
      this.setState({ replaceAll });
    }
  }

  onDropError = (err) => {
    if (err) {
      this.setState({ fileErrors: [err], fileSuccessText: "", fileWarnings: [], fileValidationText: "", retailBranches: [] });
    } else {
      this.setState({ fileErrors: [], fileSuccessText: "", fileWarnings: [], fileValidationText: "", retailBranches: [] });
    }
  }

  onDropUpload = (files: DropFile[]) => {
    this.setState({ dropLoading: true }, () => {
      const file = files[0].file;
      const fileInputKey = Math.random().toString(36);
      this.dataToImport(file, (errors, warnings, retailBranches) => {
        this.setState({ file, fileInputKey, fileErrors: errors, fileWarnings: warnings, fileSuccessText: file.name, retailBranches: retailBranches || [], dropLoading: false });
      });
    });
  }

  handleSubmit = () => {
    if (this.state.file) {
      if (this.state.fileErrors.length === 0) {
        this.setState({ saving: true, fileValidationText: "" }, () => {
          const replaceAll = this.state.replaceAll;
          const retailBranches = this.state.retailBranches;
          this.props.handleSubmit({ replaceAll, retailBranches });
        });
      } else {
        this.setState({ fileValidationText: "Fix the above file errors before submitting." });
      }
    } else {
      this.setState({ fileValidationText: "No file found." });
    }
  }

  dataToImport(f: File, cb: (err, warning, branches?) => void) {
    const self = this;
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
      const fileData = self.filterEmptyRows(rawData);
      const mapping = self.importMapping();
      const firstRow = fileData.shift().map((o) => { return o.trim() });
      const header = firstRow.map((o) => { return mapping[o]; });

      const columnErrors = self.getColumnErrors(header);
      const columnWarnings = self.getColumnWarnings(header, firstRow, mapping);

      if (columnErrors.length > 0) {
        cb(columnErrors, columnWarnings);
      } else {
        const toImport = self.getDataToImport(fileData, header);
        const errors = self.getRowsErrors(toImport);
        const warnings = columnWarnings.length > 0 ? columnWarnings : self.getRowsWarnings(toImport);

        if (errors.length > 0) {
          cb(errors, warnings);
        } else {
          cb(errors, warnings, toImport);
        }
      }
    };
    reader.readAsArrayBuffer(f);
  }

  filterEmptyRows(fileData) {
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

  importMapping() {
    return {
      "id": "branchId",
      "name": "name",
      "landing page": "urlTag",
      "latitude": "latitude",
      "longitude": "longitude",
      "radius": "radius",
      "targeting postal codes": "targetingZipCodes",
      "country": "country",
      "region": "region",
      "city": "city",
      "postal code": "postalCode",
      "address line 1": "address1",
      "address line 2": "address2",
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

  getRequiredImportFields() {
    return ["branchId", "name", "urlTag"];
  }

  getRadiusWarningFields() {
    return ["radius", "latitude", "longitude"];
  }

  getPostalCodeWarningFields() {
    return ["targetingZipCodes"];
  }

  getColumnErrors(header) {
    const required = this.getRequiredImportFields();
    const diff = _.difference(required, header);
    if (diff.length > 0) {
      return ['Missing required columns: "' + diff.join(', ') + '".'];
    }
    return [];
  }

  getColumnWarnings(header, firstRow, mapping) {
    const warnings = [];

    const undef = firstRow.filter((o) => { return _.isUndefined(mapping[o]) });
    if (undef.length > 0) {
      warnings.push('The following unrecognized columns will be ignored: "' + undef.join(', ') + '".');
    }

    const radiusFields = this.getRadiusWarningFields();
    const radiusDiff = _.difference(radiusFields, header);
    if (radiusDiff.length > 0) {
      warnings.push('Missing radius based targeting columns:  "' + radiusDiff.join(', ') + '".')
    }

    const postalCodeFields = this.getPostalCodeWarningFields();
    const postalCodeDiff = _.difference(postalCodeFields, header);
    if (postalCodeDiff.length > 0) {
      warnings.push('Missing targeting postal codes column.')
    }

    return warnings;
  }

  getDataToImport(fileData, header) {
    return fileData.map((row) => {
      var obj = {};
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

  getRowsErrors(data) {
    const errors = [];
    const duplicateIds = this.getDuplicateIds(data);
    if (duplicateIds.length > 10) {
      errors.push("Some ids are not unique within the update.");
    } else if (duplicateIds.length > 0) {
      errors.push("Some ids are not unique within the update: " + duplicateIds.join(', ') + ".");
    }

    const required = this.getRequiredImportFields();
    const requiredMissingIds = this.getMissingFieldsIds(data, required);
    if (requiredMissingIds.length > 10) {
      errors.push('Some branches lack mandatory field "id, name and/or landing page".');
    } else if (requiredMissingIds.length > 0) {
      errors.push('Branches with id: ' + requiredMissingIds.join(', ') + ' lack mandatory field "id, name and/or landing page".');
    }

    return errors;
  }

  getRowsWarnings(data) {
    const warnings = [];
    const radiusFields = this.getRadiusWarningFields();
    const radiusMissingIds = this.getMissingFieldsIds(data, radiusFields);
    if (radiusMissingIds.length > 10) {
      warnings.push('Some branches lack radius based targeting fields "latitude, longitude and/or radius".');
    } else if (radiusMissingIds.length > 0) {
      warnings.push('Branches with id: ' + radiusMissingIds.join(', ') + ' lack radius based targeting fields "latitude, longitude and/or radius".');
    }

    const postalCodeFields = this.getPostalCodeWarningFields();
    const postalCodeMissingIds = this.getMissingFieldsIds(data, postalCodeFields);
    if (postalCodeMissingIds.length > 10) {
      warnings.push('Some branches lack "targeting postal codes".');
    } else if (postalCodeMissingIds.length > 0) {
      warnings.push('Branches with id: ' + radiusMissingIds.join(', ') + ' lack "targeting postal codes".');
    }
    const renamedBranches = this.getRenamedBranches(data);
    if (renamedBranches.length > 10) {
      warnings.push(renamedBranches.length + ' number of ids will receive a new name. All existing statistics, costs and retail campaigns are tied to the branch\'s id. Performing this update will therefore display the new branch name for these existing statistics and retail campaigns . Make very sure, that this is indeed what you want (In most cases using a new id, rather than reusing an existing id is what should happen)');
    } else if (renamedBranches.length > 0) {
      warnings.push('Branches with id: ' + renamedBranches.join(',') + ' will receive a new name. All existing statistics, costs and retail campaigns are tied to the branch\'s id. Performing this update will therefore display the new branch name for these existing statistics and retail campaigns . Make very sure, that this is indeed what you want (In most cases using a new id, rather than reusing an existing id is what should happen)');
    }
    return warnings;
  }

  getDuplicateIds(data) {
    const countIds = _.countBy(data, 'branchId');
    return Object.keys(countIds).filter((o) => { return countIds[o] > 1 });
  }

  getMissingFieldsIds(data, fields) {
    const invalid = data.filter((o) => {
      const nullFields = _.values(_.pick(o, fields)).filter((v) => { return v === null; });
      return nullFields.length > 0;
    });
    return invalid.map((o) => { return o.branchId });
  }

  getRenamedBranches(data) {
    const newBranches = data.map((o) => { return _.pick(o, ["branchId", "name"]); });
    const existingBranches = this.props.existingBranches.map((o) => { return _.pick(o, ["branchId", "name"]); });
    const renamed = [];
    newBranches.forEach((branch) => {
      const existingBranch = existingBranches.find((o) => { return o.branchId === branch.branchId });
      if (existingBranch) {
        if (branch.name !== existingBranch.name) {
          renamed.push(branch.branchId);
        }
      }
    });
    return renamed;
  }

  render() {
    return <Modal size="lg" show={this.props.show} onHide={this.handleClose} onEntering={this.handleEntering} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Retail branches import</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-sm-12">
            <Form.Group id="retailbranch-import-file">
              <p>Upload an excel file to import retail branches. You can download an example file <a href="/files/import-retail-branches-template.xlsx" >here</a></p>
              <Form.Control
                key={this.state.fileInputKey}
                type="file"
                accept=".xls,.xlsx"
                onChange={this.fileChange}
              />
            </Form.Group>
            <Form.Group>
              <DropArea
                singleUpload={true}
                exts={[".xls", ".xlsx"]}
                text="Drag and drop file"
                loading={this.state.dropLoading}
                onError={this.onDropError}
                onUpload={this.onDropUpload}
              />
              <div className="pt-2">
                <div className="text-success pb-2">{this.state.fileSuccessText}</div>
                {this.state.fileErrors.length > 0 &&
                  <Alert variant="danger">
                    <div><FontIcon name="times-circle" /> <strong>Errors</strong></div>
                    <ul className="pl-3">
                      {
                        this.state.fileErrors.map((error, i) => <li key={`error-${i}`}>{error}</li>)
                      }
                    </ul>
                  </Alert>
                }
                {this.state.fileWarnings.length > 0 &&
                  <Alert variant="warning">
                    <div><FontIcon name="warning" /> <strong>Warnings</strong></div>
                    <ul className="pl-3">
                      {
                        this.state.fileWarnings.map((warning, i) => <li key={`warning-${i}`}>{warning}</li>)
                      }
                    </ul>
                  </Alert>
                }
              </div>
            </Form.Group>
          </div>
          <div className="col-sm-12">
            <div>
              <Form.Check inline
                id="retailbranch-import-type-append"
                type="radio"
                name="retailbranch-import-type"
                value="append"
                checked={!this.state.replaceAll}
                onChange={this.radioChange}
                label="Add/update retail branches"
              />
              <Form.Check inline
                id="retailbranch-import-type-replace"
                type="radio"
                name="retailbranch-import-type"
                value="replace"
                checked={this.state.replaceAll}
                onChange={this.radioChange}
                label="Replace all retail branches"
              />
            </div>
          </div>
          <div className="col-sm-12">
            <div className="text-danger">{this.state.fileValidationText}</div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" size="sm" onClick={this.handleClose}>CANCEL</Button>
        <Button variant="primary" size="sm" onClick={this.handleSubmit} disabled={this.state.saving}>SAVE</Button>
      </Modal.Footer>
    </Modal>
  }
}