import { useState } from 'react'

import Chart from "./components/Chart";
import Form from "./components/Form";

import './App.css'

function App() {
  const [chartsData, setChartsData] = useState([]);

  return (
    <div className="p-1">
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
  )
}

export default App
