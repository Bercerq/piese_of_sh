import { Button, FormGroup, FormControl, FormLabel  } from "react-bootstrap";
import CustomRowAttributes from "./CustomAttributeRow";
import { CustomAttributeRowProps } from "./CustomAttributeRow";
import * as React from "react";
import FontIcon from "../../../../UI/FontIcon";

import * as _ from "lodash";
import { OverwritableProperty } from "../OverwritableProperty";
import Select from "react-select";

interface CustomAttributeFormProps {
  name: String;
  options: OverwritableProperty[]
  writeAccess: boolean;
  handleCustomAttributeUpdate: (values: OverwritableProperty[]) => void
}


const CustomAttributeForm = (props: CustomAttributeFormProps) => {
  const [customs, setCustoms] = React.useState<OverwritableProperty[]>(props.options.filter(ow => filterUsedProperty(ow)));
  const [selectedAdd, setSelectedAdd] = React.useState<{label: string, value: string}>();

  React.useEffect(() => {
      setCustoms(props.options.filter(ow => filterUsedProperty(ow)))
  }, [JSON.stringify(props.options)]);

  
  React.useEffect(() => {
    props.handleCustomAttributeUpdate(customs)
}, [customs]);
  
  React.useEffect(() => {
    //not quite correct (sets the first option on both deletes and adds => good enough)
    setSelectedAdd(getFirstOption())
}, [customs.length]);

  function filterUsedProperty(ow: OverwritableProperty): boolean {
    return ow.current != "" || ow.original != "";
  }

  const handleDelete = (labelName: string) => {
    setCustoms((customs) => {
      let newCustoms = customs.filter((custom) => custom.propertyName != labelName);
      let notChosenOptions = availableOptions(newCustoms)
      return newCustoms.map((custom) => {
        let labels = new Set(notChosenOptions.map((option) => option.propertyName))
        labels.add(custom.propertyName)
        return _.assign({}, custom, { options: props.options.filter((option) => labels.has(option.propertyName)) });
      });
    });
  }

  const handleOptionChange = (oldLabel: string, newLabel: string, newValue: string) => {
    setCustoms((customs) => {
      return customs
        .map((custom) => {
          if (custom.propertyName == oldLabel) {
            return findProperty(newLabel);
          } else {
            return custom;
          }
        });
    });
  }

  const handleTextChange = (label: string, value: String) => {
    setCustoms((customs) => {
      return customs
        .map((custom) => {
          if (custom.propertyName == label) {
            return _.assign({}, custom, { current: value });
          } else {
            return custom;
          }
        });
    });
  }

  const availableOptions = (customs: OverwritableProperty[]) => {
    let alreadyPicked = new Set(customs.map((custom) => custom.propertyName))
    return props.options.filter((option) => !alreadyPicked.has(option.propertyName))
  }

  const findProperty = (label: string) => {
    return props.options.find((a) => a.propertyName == label)
  }

  const handleAdd = () => {
    const options = availableOptions(customs)
    if (options && selectedAdd) {
      let option = options.find(option => option.propertyName == selectedAdd.label)
      //readjust the currently available options for the other customs
      setCustoms([...customs, option])
    }
  }
  function getOptions(): { label: string, value: string }[] {
    return [...availableOptions(customs)]
      .map(option => { return { label: option.propertyName, value: option.propertyName } });
  }

  function getFirstOption(): { label: string, value: string } {
    let options = getOptions();
    return ((options.length > 0) ? options[0] : null);
  }

  return <FormGroup className="row">
    <FormLabel  className="col-sm-12">{props.name}</FormLabel >
    <div className="col-sm-12">
      {
        customs.map((row) => {
          return <CustomRowAttributes
            property={row}
            writeAccess={props.writeAccess}
            getOptions={() => {
              return [row, ...availableOptions(customs)]
                .map(option => { return { label: option.propertyName, value: option.propertyName } });
            }}
            value={row.current as string}
            handleTextChange={handleTextChange}
            handleDelete={handleDelete}
            handleOptionChange={handleOptionChange}
          />
        })
      }
    </div>
    {
      (getOptions().length > 0) ? (<div className="col-sm-12">
        <div className="row">
          <div className="col-sm-5">
            <div className="form group">
              <Select
                isDisabled={!props.writeAccess}
                inputId={`selector-custom-prop`}
                className="react-select-container"
                classNamePrefix="react-select"
                onChange={(event : {label: string, value: string}) => {
                  setSelectedAdd(event)
                 }}
                value={selectedAdd}
                options={getOptions()}
              />
            </div>
          </div>
          <div className="col-sm-3 align-self-end">
            <Button size="sm" variant="primary" onClick={handleAdd} disabled={!props.writeAccess}><FontIcon name="plus" /> ADD</Button>
          </div>
        </div>
      </div>)
        : null}




  </FormGroup>
}
export default CustomAttributeForm;