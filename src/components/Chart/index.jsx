import React, { useEffect } from "react";
import { createChart, isBusinessDay } from "lightweight-charts";

function cleanData(data) {
  data = [...new Map(data.map((item) => [item["time"], item])).values()];
  data = data.filter(({ time, value }) => time !== null && value !== null);
  data.sort((a, b) => a.time.localeCompare(b.time));
  return data;
}

function createLineSeriesData({ data, timeKey, valueKey }) {
  return cleanData(
    data.map((row) => {
      var date = new Date(row[timeKey]);
      const offset = date.getTimezoneOffset();
      date = new Date(date.getTime() - offset * 60 * 1000);
      const dateString = date.toISOString().split("T")[0];

      return {
        time: dateString,
        value: row[valueKey],
      };
    })
  );
}

function stringToColor(str = "") {
  let hex = "FFFF00" + parseInt(str, 36).toString(16);
  return "#" + hex.substring(hex.length - 6);
}

const Chart = ({ data = [], timeCol = "time", plotCols = new Set() }) => {
  const ref = React.useRef();
  const filteredData = data;

  function businessDayToString(businessDay) {
    return businessDay.year + "-" + businessDay.month + "-" + businessDay.day;
  }

  useEffect(() => {
    const height = window.innerHeight - 40;
    const width = window.innerWidth - 40;
    const chart = createChart(ref.current, {
      height,
      width,
    });

    const lineSeries = {};

    plotCols.forEach((col) => {
      const color = stringToColor(col);
      lineSeries[col] = {
        series: chart.addLineSeries({
          color,
        }),
        color,
      };

      lineSeries[col].series.setData(
        createLineSeriesData({
          data: filteredData,
          timeKey: timeCol,
          valueKey: col,
        })
      );

      chart.subscribeCrosshairMove(function (param) {
        const toolTip = document.getElementById("chart-tooltip");
        const toolTipHeight = toolTip.offsetHeight;
        const toolTipWidth = toolTip.offsetWidth;
        const toolTipMargin = 15;

        if (
          !param.time ||
          param.point.x < 0 ||
          param.point.x > width ||
          param.point.y < 0 ||
          param.point.y > height
        ) {
          toolTip.style.display = "none";
          return;
        }

        var dateStr = isBusinessDay(param.time)
          ? businessDayToString(param.time)
          : new Date(param.time * 1000).toLocaleDateString();

        toolTip.style.display = "block";
        let tooltipHtml = "";

        plotCols.forEach((col) => {
          const { series, color } = lineSeries[col];
          const price = param.seriesPrices.get(series);
          tooltipHtml += `
            <div style="background: ${color}; width: 10px; height: 10px; display: inline-block;">
            </div>
            <div style="display: inline-block;">
              <strong>${Math.round(price * 100) / 100}</strong>
              <span style="color:${color}">${col}</span>
            </div>
            <br />
            `;
        });
        toolTip.innerHTML = `
            <div style="font-size: 12px; margin: 4px 0px;">
              ${tooltipHtml}
            </div>
            <div>${dateStr}</div>
          `;

        const y = param.point.y;

        let left = param.point.x + toolTipMargin + 20;
        if (left > width - toolTipWidth) {
          left = param.point.x - toolTipMargin - toolTipWidth;
        }

        let top = y + toolTipMargin + 30;
        if (top > height - toolTipHeight) {
          top = y - toolTipHeight - toolTipMargin;
        }

        toolTip.style.left = left + "px";
        toolTip.style.top = top + "px";
      });
    });

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [filteredData, timeCol, plotCols]);

  return (
    <>
      <div ref={ref} id="chart" />
    </>
  );
};

export default Chart;
