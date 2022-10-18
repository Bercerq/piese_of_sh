import React, { Fragment } from "react";
import { Alert } from "react-bootstrap";
import * as _ from "lodash";
import * as AudienceHelper from "./AudienceHelper";
import { AudienceChartProps } from "./AudienceSchemas";
import FontIcon from "../../../../UI/FontIcon";

declare var $: any;
declare var c3: any;
declare var html2canvas: any;
declare var download: any;
declare var canvg: any;

const AudienceChartHeader = (props: AudienceChartProps) => {

  function downloadPng(e) {
    e.preventDefault();
    const $btn = $(e.target);
    $btn.prop("disabled", true);
    const graphId = `chart-${props.audienceCategory.category.toLowerCase()}`;
    const attrGraphPng = "#" + graphId + "-png";
    const $attrGraphPng = $(attrGraphPng);
    drawAudiencePngChart(attrGraphPng, props.property, props.audienceCategory);

    setTimeout(function () {
      adjustSvgStyles($attrGraphPng);
      html2canvas($attrGraphPng, {
        allowTaint: true,
        onrendered: function (canvas) {
          var imgData = canvas.toDataURL("image/png");
          download(imgData, props.audienceCategory.category + ".png", "image/png");
          setTimeout(function () {
            $attrGraphPng.removeAttr("style");
            $attrGraphPng.html("");
            $btn.prop("disabled", false);
          }, 1000);
        }
      });
    }, 300);
  }

  function adjustSvgStyles($attrGraphPng) {
    var $svgs = $attrGraphPng.find("svg");
    if ($svgs.length > 0) {
      $svgs.find(".domain").css("fill", "none");
      $svgs.find(".c3-chart-arc text").css({ "fill": "#fff", "fontSize": "30px", "opacity": 1 });
      $svgs.find(".c3 .tick text, .c3-legend-item, .c3-legend-item text, .c3-chart-arcs-title").css({ "fontSize": "30px" });
      svg2png($svgs);
    }
  }

  function svg2png($svgs) {
    if ($svgs.length > 0) {
      var svgTag = $svgs[0];
      var c = document.createElement('canvas');
      c.width = svgTag.clientWidth;
      c.height = svgTag.clientHeight;
      svgTag.parentNode.insertBefore(c, svgTag);
      svgTag.parentNode.removeChild(svgTag);
      var div = document.createElement('div');
      div.appendChild(svgTag);
      canvg(c, div.innerHTML, {
        ignoreDimensions: true,
        scaleWidth: c.width,
        scaleHeight: c.height
      });
      var img = document.createElement('img');
      img.src = c.toDataURL('image/png');
      c.parentNode.insertBefore(img, c);
      c.parentNode.removeChild(c);
    }
  }

  function drawAudiencePngChart(chartId, property, category) {
    if (category.type === "bar" || category.type === "donut") {
      const columns = AudienceHelper.chartColumns(category, property);
      const size = category.type === "bar" ? { width: 1000, height: 500 } : { width: 1000, height: 1000 };
      const config = _.assign({}, category.config, { size: size });
      const graph = AudienceHelper.createAttributeGraph(chartId, { property: property.label }, _.assign({}, { data: { columns: columns, order: 'desc' } }, config));
      const chart = c3.generate(graph);
    } else if (category.type === "mosaic") {
      AudienceHelper.mosaicGraph(chartId, category, property);
    } else if (category.type === "map") {
      const dimensions = {
        width: 1000,
        height: 1000,
        scale: 10000
      };
      AudienceHelper.choroplethMap(chartId, category, property, dimensions);
    }
  }

  return <Fragment>
    {props.audienceCategory.type === "mosaic" &&
      <Alert variant="info">
        <p><FontIcon name="info-circle" /> Without additional agreements with Whooz you are not permitted to process Whooz's information or use it in systems for purposes other than (exclusively) optimizing the purchase of audiences within Opt Out Advertising.</p>
      </Alert>
    }
    {props.audienceCategory.png && <div className="row mb-1">
      <h4 className="col-sm-8">{props.audienceCategory.title}</h4>
      <div className="col-sm-4 text-right">
        <button onClick={downloadPng} type="button" className="btn btn-primary btn-sm">
          <FontIcon name="download" /> PNG
        </button>
      </div>
    </div>
    }
    {!props.audienceCategory.png && <h4>{props.audienceCategory.title}</h4>}
  </Fragment>;
}
export default AudienceChartHeader;