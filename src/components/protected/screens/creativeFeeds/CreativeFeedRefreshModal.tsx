import React, { useState, Fragment, useEffect } from "react";
import { Modal, Button, Form, Alert, InputGroup } from "react-bootstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Datetime from "react-datetime";
import momentPropTypes from "react-moment-proptypes";
import * as _ from "lodash";
import validator from "validator";
import moment from "moment";
import * as Validation from "../../../../client/Validation";
import * as Api from "../../../../client/Api";
import * as Helper from "../../../../client/Helper";
import * as FiltersHelper from "../../shared/filters/FiltersHelper";
import * as ExcelHelper from "../../../../client/ExcelHelper";
import { ValidationError, SelectOption, StatisticFilter, GroupOption, ScopeType } from "../../../../client/schemas";
import { Rights, Scope } from "../../../../models/Common";
import { CreativeFeed, CreativeFeedRow, UpdateSettings, AttributeMapping } from "../../../../models/data/CreativeFeed";
import CreativeFeedAttributeRow from "./CreativeFeedAttributeRow";
import { CreativeFeedAttributeDataRowProps } from "./CreativeFeedAttributeRow";

interface CreativeFeedRefreshModalProps {
  show: boolean;
  updateSettings: UpdateSettings | null;
  rights: Rights;
  writeAccess: boolean;
  handleClose: () => void;
  handleSubmit: (updateSettings: Partial<UpdateSettings>) => void;
}

const CreativeFeedRefreshModal = (props: CreativeFeedRefreshModalProps) => {

  const [saving, setSaving] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [baseItemName, setBaseItemName] = useState<string>(props.updateSettings?.itemName)
  const [urlvalidation, setUrlValidation] = useState<ValidationError>({ error: false, message: "" });
  const [url, setUrl] = useState<string>(props.updateSettings?.updateUrl);
  const [fieldOptions, setFieldOptions] = useState<string[]>(props.updateSettings?.fieldOptions || []);

  const setCreativeFeeedAttributeRows = () => {
    const numberAtttributes = 15;
    let array: Array<CreativeFeedAttributeDataRowProps> =
      Array.from({ length: numberAtttributes }, (_, index) => index + 1).map((a, index) => {
        return modelToAttributeRow("custom" + (index + 1), "custom " + (index + 1))
      });
    return array;
  }

  const modelToAttributeRow: (name: string, displayName: string) => CreativeFeedAttributeDataRowProps = (name, displayName) => {
    const defaultValues: AttributeMapping = { externalName: "", creativeName: "", type: "text" };
    let update = (props.updateSettings && props.updateSettings[name]) ?
      props.updateSettings[name] : defaultValues;
    return {
      internal_name: displayName,
      field_name: update.externalName,
      external_name: update.creativeName,
      type: update.type,
    }
  }

  const attributeRowToModel: (row: CreativeFeedAttributeDataRowProps) => AttributeMapping = (row) => {
    return {
      externalName: row.field_name,
      creativeName: row.external_name,
      type: row.type,
    }
  }
  const [key, setKey] = useState<CreativeFeedAttributeDataRowProps>(modelToAttributeRow("key", "key"));
  const [rows, setRows] = useState<CreativeFeedAttributeDataRowProps[]>(setCreativeFeeedAttributeRows());
  const [shownRows, setShownRows] = useState<number>(rows.map(a => a.external_name != "").lastIndexOf(true) + 1);


  useEffect(() => {
    setShownRows(rows.map(a => a.external_name != "").lastIndexOf(true) + 1)
  }, [rows]);

  const handleEntering = async () => {
    setSaving(false);
    setShowLoader(false);
    setBaseItemName(props.updateSettings?.itemName)
    setKey(modelToAttributeRow("key", "key"))
    setRows(setCreativeFeeedAttributeRows())
    setFieldOptions(props.updateSettings?.fieldOptions || []);
    setShownRows(rows.map(a => a.external_name != "").lastIndexOf(true) + 1)
  }


  function save() {
    setSaving(true);

    let creativeFeed: Partial<UpdateSettings> = {
      updateUrl: url,
      itemName: baseItemName,
      key: attributeRowToModel(key),
      custom1: attributeRowToModel(rows[0]),
      custom2: attributeRowToModel(rows[1]),
      custom3: attributeRowToModel(rows[2]),
      custom4: attributeRowToModel(rows[3]),
      custom5: attributeRowToModel(rows[4]),
      custom6: attributeRowToModel(rows[5]),
      custom7: attributeRowToModel(rows[6]),
      custom8: attributeRowToModel(rows[7]),
      custom9: attributeRowToModel(rows[8]),
      custom10: attributeRowToModel(rows[9]),
      custom11: attributeRowToModel(rows[10]),
      custom12: attributeRowToModel(rows[11]),
      custom13: attributeRowToModel(rows[12]),
      custom14: attributeRowToModel(rows[13]),
      custom15: attributeRowToModel(rows[14]),
      fieldOptions: fieldOptions
    }
    props.handleSubmit(creativeFeed);


  }
  const getData = async (url: string) => {
    try {
      const xml = await Api.Post({ path: "/xml", body: { url: url } });
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml.xml, "text/xml");
      const map = new Map<string, number>()
      addToMap(xmlDoc, map, "");
      const baseElement = getBaseElement(map);
      setBaseItemName(baseElement);
      const adjustedNameSet = adjustNamesForBase(baseElement, map);
      setFieldOptions(Array.from(adjustedNameSet))
    } catch (err) {
      console.log(err)
    }

  }

  const addToMap = (xml: Node, map: Map<string, number>, parentName: string) => {
    xml.childNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        let name = parentName + "." + node.nodeName;
        let current = (map.get(name)) ? map.get(name) : 0;
        map.set(name, current + 1);
        addToMap(node, map, name);
      }
    });
  }

  const adjustNamesForBase = (baseName: string, map: Map<string, number>) => {
    const adjustedNameSet = new Set<string>();
    map.forEach((value, key) => {
      if (key.startsWith(baseName) && key != baseName) {
        const newKey = key.substring(baseName.length + 1 /*remove leading .*/, key.length);
        adjustedNameSet.add(newKey);
      }
    })
    return adjustedNameSet;
  }

  const getBaseElement = (map: Map<string, number>) => {

    let mostFoundNumber =  new Map<number, number>();
    map.forEach((value, key) => {
      let current = (mostFoundNumber.get(value)) ? mostFoundNumber.get(value) : 0;
      mostFoundNumber.set(value, current+1);
    })
    let mostFoundNumberElements = 0
    let highestNumber = 0
    mostFoundNumber.forEach((value, key) => {
      if (value > highestNumber) {
        mostFoundNumberElements = key;
        highestNumber = value;
      }
    });
    let baseName = ""
    map.forEach((value, key) => {
      if (value == mostFoundNumberElements && (baseName == "" || baseName.split(".").length > key.split(".").length)) {
        baseName = key;
      }
    })
    return baseName;
  }

  return <Modal size="lg" show={props.show} onHide={props.handleClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Data feed settings</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row no-gutters">
        <div className="col-lg-12">
          <Form.Group controlId="creative-feed-description">
            <Form.Label>Datafeed url:</Form.Label>
            <div className="row no-gutters">
              <div className="col-lg-9">
                <Form.Control
                  autoFocus
                  readOnly={false && !props.writeAccess}
                  isInvalid={urlvalidation.error}
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(() => {
                    return e.target.value;
                  })}
                />
              </div>
              <div className="col-lg-3 ">
                <Button variant="primary" size="sm" onClick={() => {
                  getData(url)
                }} > Get url</Button>
              </div>
            </div>
          </Form.Group>
        </div>
      </div>
      <div>
      <CreativeFeedAttributeRow 
        show={true}
        data={key}
        name_options_method={fieldOptions}
        writeAccess={props.writeAccess}
        updateAttribute={(e) => {
          setKey(e)
        }}
      />
      </div>
      <div>
        {rows.map((prop, index) =>
            <CreativeFeedAttributeRow
              show={index <= shownRows}
              data={prop}
              name_options_method={fieldOptions}
              writeAccess={props.writeAccess}
              updateAttribute={(e) => {
                let array = rows;
                array[index] = e
                setRows(() => [...array])
              }}
            />)}
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="light" size="sm" onClick={props.handleClose}>CANCEL</Button>
      <Button variant="primary" size="sm" onClick={() => { save(); }} disabled={saving || !props.writeAccess}>OKAY</Button>
    </Modal.Footer>

  </Modal>;
}
export default CreativeFeedRefreshModal;