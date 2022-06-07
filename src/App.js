import { useState } from "react";
import "./App.css";
import Chart from "./components/Chart";
import Form from "./components/Form";

function App() {
  const [chartsData, setChartsData] = useState([]);

  return (
    <div className="App">
      <Form onSubmit={(data) => {
        setChartsData(data);
      }} />
      {chartsData.map(({ rawData: data, timeCol, plotCols }, index) => (
        <Chart
          data={data}
          timeCol={timeCol}
          plotCols={plotCols}
          key={`${index}`}
        />
      ))}
    </div>
  );
}

export default App;
