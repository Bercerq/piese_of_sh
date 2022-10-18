import * as React from "react";
import { Button } from "react-bootstrap";
import FontIcon from "../../../UI/FontIcon";

interface CollapsingButtonProps {
    id: string;
    numberItems: Number;
    divId: string;
    buttonStyle : 
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'dark'
    | 'light'
    | 'link'
    | 'outline-primary'
    | 'outline-secondary'
    | 'outline-success'
    | 'outline-danger'
    | 'outline-warning'
    | 'outline-info'
    | 'outline-dark'
    | 'outline-light';
    collapseState: Boolean;
    labelName: string;
    setCollapseState : (Boolean) => void;
}

const CollapsingButton = (props: CollapsingButtonProps) => {
    const [label, setLabel] = React.useState<JSX.Element>(getLabel)

    React.useEffect(() => setLabel(getLabel), [props.numberItems, props.collapseState])

    function checkState() {
        const collapseState = document.getElementById(props.id)?.getAttribute("aria-expanded") === "true";
        props.setCollapseState(collapseState);
    }
    function getLabel() {
        return <span> {props.numberItems + " " + props.labelName} <FontIcon name={(props.collapseState) ? "angle-up" : "angle-down"} /></span>;
    }

    return <Button
        id={props.id}
        variant={props.buttonStyle}
        onClick={ () => checkState()}
        data-toggle="collapse"
        data-target={"#" + props.divId}
        aria-expanded="false">
        {label}
    </Button>
}
export default CollapsingButton;