import * as _ from "lodash";
import { regionsJson } from "./netherlands-geojson";

declare var $: any;
declare var d3: any;

export const chartColumns = (category, property) => {
  const categoryData = _.orderBy(category.data, 'id', 'asc');
  if (category.type === "donut") {
    return categoryData.map((o) => {
      return [o.name, o[property.value]];
    });
  } else if (category.type === "bar") {
    let cols = [['x'], [property.label]];
    const total = _.sumBy(categoryData, property.value);
    cols[0] = cols[0].concat(categoryData.map(function (o) { return o.name }));
    cols[1] = cols[1].concat(categoryData.map(function (o) { return getPercentage(o, total, property) }));
    return cols;
  }
}

export const createAttributeGraph = (elem, options, config) => {
  if (config.type == 'donut') {
    return donutGraph(elem, options, config);
  } else if (config.type == 'bar') {
    return barChart(elem, config);
  }
}

export const choroplethMap = (chartId, category, property, dimensions) => {
  $(chartId).html("");
  $(chartId).addClass("choropleth-map");
  const data = getMapData(category, property);
  const center = d3.geoCentroid(regionsJson);
  const offset = [dimensions.width / 2, dimensions.height / 2];
  const projection = d3.geoMercator().scale(dimensions.scale).center(center).translate(offset);
  const colors = ["#e8f7fc", "#15779e"];
  const domain = getDataDomain(category, property);
  const linearScale = d3.scaleLinear().domain(domain).range(colors);
  const path = d3.geoPath().projection(projection);
  const svg = d3.select(chartId)
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const tooltip = d3.select("body").append("div")
    .attr("class", "map-tooltip")
    .style("opacity", 0);

  svg.selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", path)
    .style("stroke", "#fff")
    .style("stroke-width", "1")
    .style("fill", function (d) { return d.properties.value === 0 ? '#ddd' : linearScale(d.properties.value) })
    .on("mouseover", function (d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 1);
      tooltip.html(bubblePopover(d.properties.displayName, d.properties.percentage, property))
        .style("left", (d3.event.pageX + 15) + "px")
        .style("top", (d3.event.pageY - 30) + "px");
    })
    .on("mouseout", function (d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  const labels = svg.append('g').attr('class', 'labels');

  labels.selectAll('.map-label').data(data).enter().append('text')
    .attr("class", "map-label")
    .attr('transform', function (d) {
      return "translate(" + path.centroid(d) + ")";
    })
    .style('text-anchor', 'middle')
    .text(function (d) {
      return d.properties.percentage + "%";
    });
}

export const mosaicGraph = (chartId, category, property) => {
  const total = _.sumBy(category.data, property.value);
  const data = _.keyBy(category.data, 'id');

  const domain = getDataDomain(category, property);
  const diamRange = [50, 150];
  const linearScale = d3.scaleLinear().domain(domain).range(diamRange);

  let html = '<div class="mosaic-groups">';
  const subgroups = getSubGroups();
  _.forEach(subgroups, function (n, key) {
    if (data[n.id] &&  data[n.id][property.value]) {
      const value = data[n.id][property.value];
      const percentage = getPercentage(data[n.id], total, property);
      const name = data[n.id].name;
      const diam = Math.round(linearScale(value));
      html += '<div data-toggle="popover" data-placement="top" data-content="' + bubblePopover(name, percentage, property) + '" class="mosaic-bubble" style="' + bubbleStyle(diam, n) + '"><strong>' + percentage + '%</strong></div>';
    }
  });
  html += '</div>';
  $(chartId).html(html);
}

function bubblePopover(name, value, property) {
  return '<div><strong>' + name + '</strong></div><div>' + property.label + ' ' + value + '%' + '</div>';
}

function bubbleStyle(diam, n) {
  return 'border-radius: ' + (diam / 2) + 'px;width:' + diam + 'px;height:' + diam + 'px;line-height:' + diam + 'px;top:' + (n.top - diam / 2) + 'px;left: ' + (n.left - diam / 2) + 'px';
}

function getDataDomain(category, property) {
  if (typeof (_.minBy(category.data, property.value)) === "undefined") return [0.0, 0.0]
  return [_.minBy(category.data, property.value)[property.value], _.maxBy(category.data, property.value)[property.value]];
}

function getSubGroups() {
  return {
    AO1: { id: 946, top: 1292, left: 972 },
    AO2: { id: 947, top: 1292, left: 1168 },
    AO3: { id: 948, top: 1292, left: 1448 },
    AO4: { id: 949, top: 1292, left: 1802 },
    BO5: { id: 950, top: 1210, left: 708 },
    BO6: { id: 951, top: 1126, left: 708 },
    BO7: { id: 952, top: 1082, left: 870 },
    BO8: { id: 953, top: 1020, left: 780 },
    CO9: { id: 954, top: 1166, left: 972 },
    C10: { id: 955, top: 1116, left: 1088 },
    C11: { id: 956, top: 1090, left: 1218 },
    C12: { id: 957, top: 1090, left: 1346 },
    C13: { id: 958, top: 1090, left: 1476 },
    C14: { id: 959, top: 1142, left: 1596 },
    C15: { id: 960, top: 1020, left: 1554 },
    D16: { id: 961, top: 1036, left: 1720 },
    D17: { id: 962, top: 1036, left: 1930 },
    D18: { id: 963, top: 1102, left: 2010 },
    D19: { id: 964, top: 1168, left: 1930 },
    E20: { id: 965, top: 912, left: 922 },
    E21: { id: 966, top: 820, left: 884 },
    E22: { id: 967, top: 820, left: 948 },
    E23: { id: 968, top: 702, left: 980 },
    E24: { id: 969, top: 702, left: 1100 },
    F25: { id: 970, top: 820, left: 1040 },
    F26: { id: 971, top: 844, left: 1116 },
    F27: { id: 972, top: 862, left: 1246 },
    F28: { id: 973, top: 862, left: 1358 },
    F29: { id: 974, top: 862, left: 1472 },
    F30: { id: 975, top: 804, left: 1510 },
    G31: { id: 976, top: 724, left: 1684 },
    G32: { id: 977, top: 724, left: 1752 },
    G33: { id: 978, top: 864, left: 1770 },
    G34: { id: 979, top: 864, left: 1860 },
    G35: { id: 980, top: 802, left: 2002 },
    H36: { id: 981, top: 594, left: 1128 },
    H37: { id: 982, top: 612, left: 1272 },
    H38: { id: 983, top: 680, left: 1568 },
    H39: { id: 984, top: 602, left: 1470 },
    H40: { id: 985, top: 602, left: 1670 },
    H41: { id: 986, top: 540, left: 1740 },
    H42: { id: 987, top: 602, left: 1838 },
    I43: { id: 988, top: 490, left: 1038 },
    I44: { id: 989, top: 490, left: 1182 },
    I45: { id: 990, top: 432, left: 1104 },
    I46: { id: 991, top: 370, left: 1182 },
    I47: { id: 992, top: 464, left: 1306 },
    I48: { id: 993, top: 464, left: 1440 },
    I49: { id: 994, top: 370, left: 1398 },
    J50: { id: 995, top: 428, left: 1544 },
    J51: { id: 996, top: 480, left: 1626 },
    J52: { id: 997, top: 480, left: 1866 },
    J53: { id: 998, top: 428, left: 1934 },
    J54: { id: 999, top: 378, left: 1802 },
    K55: { id: 1000, top: 280, left: 1278 },
    K56: { id: 1001, top: 228, left: 1396 },
    K57: { id: 1002, top: 280, left: 1490 },
    K58: { id: 1003, top: 178, left: 1540 },
    K59: { id: 1004, top: 280, left: 1756 },
  };
}

function getMapData(category, property) {
  const total = _.sumBy(category.data, property.value);
  const data = _.keyBy(category.data, 'id');
  const mapData = _.assign({}, regionsJson);
  const features = mapData.features.map((rg) => {
    let region = _.assign({}, rg);
    if (data[region.properties.id]) {
      region.properties.value = data[region.properties.id][property.value];
      region.properties.percentage = getPercentage(data[region.properties.id], total, property);
      region.properties.displayName = data[region.properties.id].name;
    } else {
      region.properties.value = 0;
      region.properties.percentage = 0;
      region.properties.displayName = region.properties.name;
    }
    return region;
  });
  return features;
}

function getPercentage(row, total, property) {
  if (total === 0) {
    return 0;
  } else {
    return _.round(row[property.value] * 100 / total, 2);
  }
}

function donutGraph(elem, options, config) {
  const donutConfig = { data: { type: 'donut' }, donut: { title: options.property }, axis: { x: { show: false } } };
  return $.extend(true, defaultGraph(elem), donutConfig, config);
}

function barChart(elem, config) {
  const barConfig = { padding: { top: 0, right: 20, bottom: 0, left: 60 }, legend: { show: false }, data: { type: 'bar', x: 'x' }, axis: { x: { type: 'category', tick: { rotate: 60, multiline: false } } } };
  return $.extend(true, defaultGraph(elem), barConfig, config);
}

function defaultGraph(elem) {
  return {
    size: { height: 275 },
    padding: { top: 0, right: 20, bottom: 0, left: 40 },
    color: { pattern: ['#089bc2', '#96c03d', '#f58129', '#a62174', '#1f3364', '#ccc'] },
    bindto: elem,
    legend: { show: true },
    point: { show: false }
  };
}