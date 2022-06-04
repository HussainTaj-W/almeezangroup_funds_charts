import React, { useEffect } from "react";
import { createChart } from "lightweight-charts";

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

const Chart = ({ data = [] }) => {
  const ref = React.useRef();
  const filteredData = data;

  useEffect(() => {
    const chart = createChart(ref.current, {
      height: window.innerHeight - 40,
      width: window.innerWidth - 40,
    });
    const lineSeriesRepurchase = chart.addLineSeries({
      color: "#F00",
    });
    const lineSeriesOffer = chart.addLineSeries({
      color: "#0F0",
    });

    lineSeriesRepurchase.setData(
      createLineSeriesData({
        data: filteredData,
        timeKey: "Validity Date",
        valueKey: "Repurchase (Rs.)",
      })
    );
    lineSeriesOffer.setData(
      createLineSeriesData({
        data: filteredData,
        timeKey: "Validity Date",
        valueKey: "Offer (Rs.)",
      })
    );

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, []);

  return <div ref={ref} />;
};

export default Chart;
