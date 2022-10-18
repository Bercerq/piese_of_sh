import React, { Fragment } from "react";
import * as _ from "lodash";
import FontIcon from "./FontIcon";
import { DropFile } from "../../client/schemas";
import * as Utils from "../../client/Utils";
import Loader from "./Loader";

interface DropAreaProps {
  singleUpload: boolean;
  exts?: string[];
  text: string;
  loading: boolean;
  onUpload: (files: DropFile[]) => void;
  onError?: (err: string) => void;
}

interface DropAreaState {
  isDragover: boolean;
}

export default class DropArea extends React.Component<DropAreaProps, DropAreaState> {

  constructor(props, context) {
    super(props, context);
    this.state = {
      isDragover: false
    };
  }

  handleDragEnter = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({ isDragover: true });
  }

  handleDragLeave = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({ isDragover: false });
  }

  handleDrop = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const items = e.dataTransfer.items;
    const entries = await this.getEntries(items);
    const files: DropFile[] = await this.getFiles(entries);

    if (files.length > 1 && this.props.singleUpload) {
      this.props.onError("Multiple file upload is not allowed.");
    } else {
      if (this.props.singleUpload && this.props.exts) {
        const file = files[0].file;
        const ext = Utils.getExtension(file.name);
        if (this.props.exts.indexOf(ext) < 0) {
          this.props.onError("Allowed extensions " + this.props.exts.join(", "));
        } else {
          this.props.onUpload(files);
        }
      } else {
        this.props.onUpload(files);
      }
    }

    this.setState({ isDragover: false });
  }

  getClassName() {
    return this.state.isDragover ? "drop-area is-dragover" : "drop-area";
  }

  getFile(entry, key) {
    return new Promise((resolve) => {
      entry.file((file) => {
        const fileObj = {
          file: file,
          path: entry.fullPath,
          key: key
        };
        resolve(fileObj);
      });
    });
  }

  getFiles(entries): Promise<DropFile[]> {
    const self = this;
    return new Promise((resolve) => {
      const promises = [];
      entries.forEach((entry, i) => {
        entry.forEach((entryFile) => {
          promises.push(self.getFile(entryFile, i));
        });
      });
      Promise.all(promises).then((result) => {
        resolve(result);
      });
    });
  }

  getEntries(items) {
    const self = this;
    return new Promise((resolve) => {
      const promises = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();
        promises.push(self.getItemEntries(item, i));
      }
      Promise.all(promises).then((result) => {
        resolve(result);
      });
    });
  }

  getItemEntries(item, i) {
    const self = this;
    return new Promise((resolve) => {
      if (item.isFile) {
        resolve([item]);
      } else {
        self.traverseDirectory(item).then((result) => {
          resolve(_.flattenDeep(result));
        });
      }
    });
  }

  traverseDirectory(item) {
    const reader = item.createReader();
    const self = this;
    return new Promise(function (resolve) {
      const promises = [];
      function readEntries() {
        // According to the FileSystem API spec, readEntries() must be called until it calls the callback with an empty array
        reader.readEntries((entries) => {
          if (!entries.length) {
            resolve(Promise.all(promises));
          } else {
            promises.push(Promise.all(entries.map((entry) => {
              if (entry.isFile) {
                return entry;
              }
              return self.traverseDirectory(entry);
            })));
            readEntries();
          }
        });
      }
      readEntries();
    });
  }

  render() {
    return <div className={this.getClassName()} onDragOver={this.handleDragEnter} onDragEnter={this.handleDragEnter} onDrop={this.handleDrop}>
      <Loader visible={this.props.loading} />
      {!this.props.loading &&
        <Fragment>
          <FontIcon name="download" />
          <div>{this.props.text}</div>
        </Fragment>
      }
    </div>
  }
}