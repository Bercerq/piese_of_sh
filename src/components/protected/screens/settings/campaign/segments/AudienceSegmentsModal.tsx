import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import CheckboxTree, { Node } from "react-checkbox-tree";
import * as _ from "lodash";
import { DATargeting } from "../../../../../../models/data/Attribute";
import FontIcon from "../../../../../UI/FontIcon";

interface AudienceSegmentsModalProps {
  show: boolean;
  digitalAudienceValues: string[];
  daTargeting: DATargeting;
  onClose: () => void;
  onSubmit: (values: string[]) => void;
}

const AudienceSegmentsModal = (props: AudienceSegmentsModalProps) => {
  const [checked, setChecked] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const daTargetingNodes = _.get(props, "daTargeting.children", []);
  const nodes = getTreeNodes(daTargetingNodes);

  const handleEntering = () => {
    const checked = _.get(props, "digitalAudienceValues", []);
    const expanded = getExpanded(checked);
    setChecked(checked);
    setExpanded(expanded);
  }

  function getTreeNodes(daTargetingNodes: DATargeting[]): Node[] {
    return daTargetingNodes.map((node) => {
      let treeNode: Node = {
        value: node.segmentId.toString(),
        label: node.name
      };
      if (node.children && node.children.length > 0) {
        treeNode.children = getTreeNodes(node.children);
      }
      return treeNode;
    });
  }


  function getNodePath(node: DATargeting, value: string) {
    if (node.segmentId.toString() === value) {
      return [];
    } else if (node.children && node.children.length > 0) {
      for (var i = 0; i < node.children.length; i++) {
        const path = getNodePath(node.children[i], value);
        if (path) {
          if (node.children[i].children && node.children[i].children.length > 0) {
            path.unshift(node.children[i].segmentId.toString());
          }
          return path;
        }
      }
    }
    return null;
  }

  function getExpanded(checked: string[]) {
    const paths = checked.map((v) => {
      return getNodePath(props.daTargeting, v);
    });
    return _.uniq(_.flatten(paths));
  }

  const handleSubmit = () => {
    props.onSubmit(checked);
  }

  return <Modal size="lg" show={props.show} onHide={props.onClose} onEntering={handleEntering} backdrop="static">
    <Modal.Header closeButton>
      <Modal.Title>Rule settings</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="row no-gutters">
        <div className="col-lg-12 px-1">
          <CheckboxTree
            icons={{
              check: <FontIcon name="check-square" />,
              uncheck: <FontIcon name="square-o" />,
              halfCheck: <FontIcon name="minus-square" />,
              expandClose: <FontIcon name="plus" />,
              expandOpen: <FontIcon name="minus" />,
              expandAll: null,
              collapseAll: null,
              parentClose: null,
              parentOpen: null,
              leaf: null,
            }}
            nodes={nodes}
            checked={checked}
            expanded={expanded}
            onCheck={setChecked}
            onExpand={setExpanded}
          />
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button size="sm" variant="light" onClick={props.onClose}>CLOSE</Button>
      <Button size="sm" variant="primary" onClick={handleSubmit}>UPDATE</Button>
    </Modal.Footer>
  </Modal>;
}
export default AudienceSegmentsModal;