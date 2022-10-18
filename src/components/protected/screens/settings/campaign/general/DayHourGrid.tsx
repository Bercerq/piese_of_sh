import React, { useState, useEffect, Fragment } from "react";
import * as _ from "lodash";
import * as Utils from "../../../../../../client/Utils";
import { DayType, TimeType, DayHourTargeting } from "../../../../../../models/data/Campaign";

interface DayHourGridProps {
  data: DayHourTargeting;
  disabled: boolean;
  onChange: (dayHour: DayHourTargeting) => void;
}

const DayHourGrid = (props: DayHourGridProps) => {
  const daynames = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];
  const hournames = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedCols, setSelectedCols] = useState<number[]>([]);
  const [items, setItems] = useState<string[]>(getItems());
  const [dragStart, setDragStart] = useState<{ row: number, col: number }>(null);

  useEffect(() => {
    const dayHour = getDayHour();
    props.onChange(dayHour);
  }, [JSON.stringify(items)]);

  function getItems(): string[] {
    let items = [];
    _.forEach(props.data, (hours, day) => {
      const dayIndex = dayMapping(day);
      const dayItems = hours.map((h) => { return `${dayIndex}__${h}` });
      items = items.concat(dayItems);
    });
    return items;
  }

  function getDayHour(): DayHourTargeting {
    let dayHour: DayHourTargeting = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }
    items.forEach((item) => {
      const parts = item.split("__");
      if (parts.length === 2) {
        const day = reverseDayMapping(parseInt(parts[0]));
        const hour = parseInt(parts[1]) as TimeType;
        dayHour[day].push(hour);
      }
    });
    return dayHour;
  }

  function dayMapping(day: DayType): number {
    switch (day) {
      case "monday": return 0;
      case "tuesday": return 1;
      case "wednesday": return 2;
      case "thursday": return 3;
      case "friday": return 4;
      case "saturday": return 5;
      case "sunday": return 6;
    }
  }

  function reverseDayMapping(day: number): DayType {
    switch (day) {
      case 0: return "monday";
      case 1: return "tuesday";
      case 2: return "wednesday";
      case 3: return "thursday";
      case 4: return "friday";
      case 5: return "saturday";
      case 6: return "sunday";
    }
  }

  function getClassNames(i, j) {
    const classNames = ["cell"];
    if (items.indexOf(`${i}__${j}`) > -1) {
      classNames.push("bid");
    }
    if (selectedCells.indexOf(`${i}__${j}`) > -1) {
      classNames.push("selected");
    }
    return classNames.join(" ");
  }

  function getDayClassNames(i) {
    const classNames = ["day-col"];
    if (selectedRows.indexOf(i) > -1) {
      classNames.push("selected");
    }
    return classNames.join(" ");
  }

  function getHourClassNames(j) {
    const classNames = ["hour-row"];
    if (selectedCols.indexOf(j) > -1) {
      classNames.push("selected");
    }
    return classNames.join(" ");
  }

  function clearSelected() {
    setSelectedCells([]);
    setSelectedRows([]);
    setSelectedCols([]);
  }

  const cellClick = (i, j) => {
    if (!props.disabled) {
      const clicked = `${i}__${j}`;
      const updated = Utils.addOrRemoveItemFromArray(selectedCells, clicked);
      setSelectedCells(updated);
    }
  }

  const dayClick = (i) => {
    if (!props.disabled) {
      const clickedIndex = selectedRows.findIndex((v) => { return v === i });
      const rowCells = hournames.map((h, j) => { return `${i}__${j}`; });
      const updatedRows = selectedRows.concat();
      let updatedCells = [];
      if (clickedIndex > -1) {
        updatedCells = _.difference(selectedCells, rowCells);
        updatedRows.splice(clickedIndex, 1);
      } else {
        updatedCells = _.union(selectedCells, rowCells);
        updatedRows.push(i);
      }
      setSelectedRows(updatedRows);
      setSelectedCells(updatedCells);
    }
  }

  const hourClick = (j) => {
    if (!props.disabled) {
      const clickedIndex = selectedCols.findIndex((v) => { return v === j });
      const colCells = daynames.map((d, i) => { return `${i}__${j}`; });
      const updatedCols = selectedCols.concat();
      let updatedCells = [];
      if (clickedIndex > -1) {
        updatedCells = _.difference(selectedCells, colCells);
        updatedCols.splice(clickedIndex, 1);
      } else {
        updatedCells = _.union(selectedCells, colCells);
        updatedCols.push(j);
      }
      setSelectedCols(updatedCols);
      setSelectedCells(updatedCells);
    }
  }

  const mouseDown = (i, j) => {
    if (!props.disabled) {
      setDragStart({ row: i, col: j });
    }
  }

  const mouseOver = (i, j) => {
    if (!props.disabled) {
      if (dragStart) {
        const dragEnd = { row: i, col: j };
        const selectedCells = getDragSelected(dragStart, dragEnd);
        setSelectedCells(selectedCells);
      }
    }
  }

  const mouseUp = (e) => {
    if (!props.disabled) {
      if (dragStart) {
        setDragStart(null);
        setSelectedRows([]);
        setSelectedCols([]);
      }
    }
  }

  function getDragSelected(from: { row: number, col: number }, to: { row: number, col: number }) {
    const deltaCol = Math.abs(from.col - to.col);
    const deltaRow = Math.abs(from.row - to.row);
    const startCol = Math.min(from.col, to.col);
    const startRow = Math.min(from.row, to.row);
    const selectedCells = [];
    for (let i = 0; i <= deltaCol; i++) {
      for (let j = 0; j <= deltaRow; j++) {
        selectedCells.push(`${startRow + j}__${startCol + i}`);
      }
    }
    return selectedCells;
  }

  const bidClick = () => {
    const updated = _.union(items, selectedCells);
    setItems(updated);
    clearSelected();
  }

  const clearClick = () => {
    const updated = _.difference(items, selectedCells);
    setItems(updated);
    clearSelected();
  }
  const tableClassName = props.disabled ? "hrdaygrid disabled" : "hrdaygrid";
  return <Fragment>
    <div className="hrdaygrid-buttons">
      <button className="btn btn-primary btn-sm mr-1" disabled={props.disabled} onClick={bidClick}>BID</button>
      <button className="btn btn-light btn-sm" disabled={props.disabled} onClick={clearClick}>CLEAR</button>
    </div>
    <table className={tableClassName}>
      {
        daynames.map((d, i) => <tr key={`row-${i}`}>
          <td onClick={() => { dayClick(i); }} className={getDayClassNames(i)}>{d}</td>
          {
            hournames.map((h, j) => <td
              key={`col-${i}-${j}`}
              className={getClassNames(i, j)}
              onClick={() => { cellClick(i, j); }}
              onMouseDown={(e) => { mouseDown(i, j) }}
              onMouseOver={(e) => { mouseOver(i, j) }}
              onMouseUp={mouseUp}
            ></td>)
          }
        </tr>)
      }
      <tr>
        <td></td>
        {
          hournames.map((h, j) => <td onClick={() => { hourClick(j); }} className={getHourClassNames(j)} key={`col-${j}`}>{h}</td>)
        }
      </tr>
    </table>
  </Fragment>;
}
export default DayHourGrid;