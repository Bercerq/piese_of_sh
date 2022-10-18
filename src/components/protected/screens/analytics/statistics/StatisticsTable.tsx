import React, { useEffect, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as _ from "lodash";
import { Metric } from "../../../../../client/schemas";
import FontIcon from "../../../../UI/FontIcon";
import * as TableHelper from "../../../../../client/TableHelper";
import { Options } from "../../../../../models/Common";
import * as Api from "../../../../../client/Api";

declare var $: any;

interface StatisticsTableProps {
  id: string;
  data: any;
  options: Options;
  attributeId: number;
  attributeId2: number;
  attributeFormat: number;
  attributeFormat2: number;
  filter: string[];
  metrics: Metric[];
  checked: string[];
  search: string;
}

const StatisticsTable = (props: StatisticsTableProps) => {
  useEffect(() => {
    init();
    return destroyTable;
  }, [props.data]);

  useEffect(() => {
    expandClick();
    setColumnVisibility();
  }, [props.checked]);

  useEffect(searchTable, [props.search]);

  function init() {
    loadTable();
    expandClick();
    onTableRedraw();
  }

  function loadTable() {
    if (props.metrics.length > 0 && props.data) {
      const $table = $("#" + props.id);
      const html = renderToStaticMarkup(<Fragment>
        <Header />
        <Body />
        <Footer />
      </Fragment>);
      $table.html(html);
      const col1 = props.metrics[0];
      let tableSettings: any = {
        order: [
          [col1.sort || 0, 'desc']
        ],
        paging: true,
        searching: true,
        dom: '<<t>ipl>',
        lengthMenu: [[30, 50, 100, -1], [30, 50, 100, "All"]],
        pageLength: 30,
        scrollCollapse: true,
        autoWidth: false,
        columnDefs: [{ width: "10%", targets: 0 }, { targets: '_all', orderSequence: ['desc', 'asc'] }],
        language: { search: "<i class='icon-filter_icon' aria-hidden='true'></i>", searchPlaceholder: "Filter records" }
      };
      if (props.attributeId2 !== -1) {
        tableSettings.columnDefs = [{ width: "2%", targets: 0, orderable: false }, { width: "10%", targets: 1 }];
      }
      $table.DataTable(tableSettings);
      setColumnVisibility();
    }
  }

  function destroyTable() {
    const $table = $("#" + props.id);
    if ($.fn.DataTable.isDataTable("#" + props.id)) {
      $table.DataTable().destroy();
    }
  }

  function searchTable() {
    if ($.fn.DataTable.isDataTable("#" + props.id)) {
      $("#" + props.id).DataTable().search(props.search).draw();
    }
  }

  function setColumnVisibility() {
    if ($.fn.DataTable.isDataTable("#" + props.id)) {
      const $table = $("#" + props.id).DataTable();
      const visible = getVisibleColumns();
      for (let i = 0; i < $table.columns().nodes().length; i++) {
        $table.column(i).visible(visible[i]);
        $("#" + props.id).find('tr[data-parent]').each(function () {
          if (visible[i]) {
            $(this).find('td:eq(' + i + ')').removeClass("d-none");
          } else {
            $(this).find('td:eq(' + i + ')').addClass("d-none");
          }
        });
      }
    }
  }

  function getVisibleColumns() {
    let visible = props.metrics.map((m, i) => {
      if (i == 0) {
        return true; //attribute column always visible
      }
      return props.checked.indexOf(m.col) > -1
    });
    if (props.attributeId2 !== -1) {//add the expand button column
      visible.unshift(true);
    }
    return visible;
  }

  function expandClick() {
    const $table = $("#" + props.id);
    $table.off("click", ".js-expand").on("click", ".js-expand", async function (e) {
      e.preventDefault();
      const $this = $(this);
      if (!$this.data("loading")) {
        const expanded = $this.data("expanded");
        const $row = $this.closest("tr");
        const rowId = $row.data("id");
        const $childRows = $table.find(`tr[data-parent="${rowId}"]`);

        if (expanded) {
          $this.attr("class", "js-expand text-success");
          $this.find("i").attr("class", "fa fa-plus-circle fa-lg");
          $childRows.hide();
          $(`#childrows-loading-${rowId}`).closest("tr").remove();
        } else {
          $this.attr("class", "js-expand text-danger");
          $this.find("i").attr("class", "fa fa-minus-circle fa-lg");

          if ($childRows.length > 0) {
            $childRows.show();
          } else {
            $this.data("loading", true);
            const colspan = $row.find("td").length;
            const childLoadingId = `childrows-loading-${_.kebabCase(rowId)}`;
            $row.after(`<tr><td colspan="${colspan}"><div class="loading" id="${childLoadingId}"></div></td></tr>`);
            try {
              const childData = await getChildData(rowId);
              $(`#${childLoadingId}`).closest("tr").remove();
              const childRowsHtml = renderToStaticMarkup(ChildBody(childData, rowId, $row.attr("class")));
              $row.after(childRowsHtml);
              $this.data("loading", false);
            } catch (err) {
              console.log(err);
            }
          }
        }
        $this.data("expanded", !expanded);
      }
    });
  }

  function onTableRedraw() {
    //readjust expand buttons after table events
    $("#" + props.id).on('draw.dt', function () {
      const $expandBtn = $(this).find(".js-expand");
      $expandBtn.attr("class", "js-expand text-success");
      $expandBtn.find("i").attr("class", "fa fa-plus-circle fa-lg");
      $expandBtn.data("expanded", false);
    });
  }

  function getChildData(rowId) {
    let qs: any = {
      scope: props.options.scope,
      startDate: props.options.startDate,
      endDate: props.options.endDate,
      attributeId: props.attributeId,
      attributeId2: props.attributeId2,
      limit1: 1,
      filter1: rowId,
      filter: props.filter
    };
    if (!_.isUndefined(props.options.scopeId)) qs.scopeId = props.options.scopeId;
    return Api.Get({ path: "/api/statistics", qs });
  }

  function Header() {
    return <thead>
      <tr>
        {props.attributeId2 !== -1 && <th></th>}
        {
          props.metrics.map((m, i) => <th key={`th-${i}`}><div className="text-rotate"><span>{m.label || m.col || ""}</span></div></th>)
        }
      </tr>
    </thead>;
  }

  function Body() {
    const rows = _.get(props, "data.statisticList", []);
    return <tbody>
      {
        rows.map((row, i) => <Row row={row} i={i} />)
      }
    </tbody>;
  }

  function Row(rowProps: { row: any, i: number }) {
    return <tr key={`tr-${rowProps.i}`} data-id={rowProps.row.name}>
      {props.attributeId2 !== -1 && <td><a style={{ textDecoration: "none" }} href="#" data-expanded="false" className="js-expand text-success"><FontIcon names={["plus-circle", "lg"]} /></a></td>}
      {
        props.metrics.map((m, i) => <td key={`td-${i}`} className={m.align ? `text-${m.align}` : "text-right"}>{ColumnValue(rowProps.row, m)}</td>)
      }
    </tr>;
  }

  function ChildBody(data: any, parent: string, rowClass: string) {
    const rows = _.get(data, "statisticList", []);
    if (rows.length > 0) {
      return <Fragment>
        {
          rows.map((row, i) => <ChildRow row={row} i={i} parent={parent} rowClass={rowClass} />)
        }
      </Fragment>;
    } else {
      return <tr className={rowClass} data-parent={parent}>
        <td></td>
        <td colSpan={props.checked.length + 1}>No data</td>
      </tr>;
    }
  }

  function ChildRow(rowProps: { row: any, i: number, parent: string, rowClass: string }) {
    return <tr key={`tr-${rowProps.i}`} className={rowProps.rowClass} data-id={rowProps.row.name} data-parent={rowProps.parent}>
      <td></td>
      {
        props.metrics.map((m, j) => <td key={`td-${j}`} className={getChildClassNames(m, j)}>{ColumnValue(rowProps.row, m)}</td>)
      }
    </tr>;
  }

  function getChildClassNames(m, j) {
    const alignClass = m.align ? `text-${m.align}` : "text-right";
    const hiddenClass = props.checked.indexOf(m.col) > -1 || j === 0 ? "" : " d-none";
    return alignClass + hiddenClass;
  }

  function ColumnValue(row: any, m: Metric) {
    if (props.attributeFormat === 1) {
      return TableHelper.getPercentageFormatter(m.type)(row[m.col]);
    } else {
      return TableHelper.getFormatter(m.type)(row[m.col]);
    }
  }

  function Footer() {
    const metrics = props.metrics.concat();
    metrics.shift(); //the attribute column is always named total, so it is removed
    const row = _.get(props, "data.summary");
    return <tfoot>
      <tr>
        {props.attributeId2 !== -1 && <td></td>}
        <td>Total</td>
        {
          metrics.map((m, i) => <td key={`td-${i}`} className={m.align ? `text-${m.align}` : "text-right"}>{ColumnValue(row, m)}</td>)
        }
      </tr>
    </tfoot>;
  }

  return <table id={props.id} className="table table-striped table-hover table-borderless statistics-table"></table>;
}
export default StatisticsTable;