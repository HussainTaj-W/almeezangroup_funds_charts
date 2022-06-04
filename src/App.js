import './App.css';
import Chart from './components/Chart';

import * as XLSX from 'xlsx';
import { useState } from 'react';

function App() {
  const [sheetsData, setSheetsData] = useState([]);

  const readXLSXFileData = (file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, {
        type: 'binary'
      });

      const sheetsData = workbook.SheetNames.map((sheetName) => XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]));
      setSheetsData(sheetsData);
    }


    reader.onerror = function (ex) {
      console.error(ex);
    };

    reader.readAsBinaryString(file);
  };

  const onFileChange = (event) => {
    if (event.target.files)
      readXLSXFileData(event.target.files[0]);
  };

  return (
    <div className="App">
      <input type="file" name="file" onChange={onFileChange} accept=".xlsx" />
      {
        sheetsData.map((data, index) => <Chart data={data} key={`${index}`} />)
      }
    </div >
  );
}

export default App;
