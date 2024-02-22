import { useState } from "react";
import * as XLSX from "xlsx";

const Form = ({ onSubmit }) => {
  const [sheetsData, setSheetsData] = useState([]);
  const [isFileSelected, setIsFileSelected] = useState(false);

  const readXLSXFileData = (file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, {
        type: "binary",
      });

      const sheetsData = workbook.SheetNames.map((sheetName) => ({
        rawData: XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheetName]
        ),
        cols: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          header: 1,
        })[0],
        name: sheetName,
        timeCol: null,
        plotCols: new Set(),
      }));

      setSheetsData(sheetsData);
    };

    reader.onerror = function (ex) {
      console.error(ex);
    };

    reader.readAsBinaryString(file);
  };

  const onFileChange = (event) => {
    if (event.target.files) {
      readXLSXFileData(event.target.files[0]);
      setIsFileSelected(true);
    }
  };

  const onFormChange = (event) => {
    const { name, value, checked } = event.target;
    const nameParts = name.split("-");

    sheetsData.forEach((sheet) => {
      if (sheet.name === nameParts[0]) {
        if (nameParts[1] === "timeCol") {
          sheet.timeCol = value;
        } else if (nameParts[1] === "plotCols") {
          if (checked) {
            sheet.plotCols.add(value);
          } else {
            sheet.plotCols.delete(value);
          }
        }
      }
    });
    setSheetsData([...sheetsData]);
  };

  const onSubmitLocal = (event) => {
    event.preventDefault();
    onSubmit(
      sheetsData.map(({ rawData, cols, name, timeCol, plotCols }) => ({
        rawData: [...rawData],
        cols: [...cols],
        plotCols: new Set([...plotCols]),
        name,
        timeCol,
      }))
    );
  };

  return (
    <form onSubmit={onSubmitLocal}>
      <div className="p-1">
        <label className="p-0.5">Select the Excel file</label>
        <input
          type="file"
          name="file"
          onChange={onFileChange}
          accept=".xlsx"
          className="shadow appearance-none border rounded ml-2 py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      {!isFileSelected && (
        <>
          <span className="m-1">You can get data from here:</span>
          <a
            className="underline text-blue-400 p-1"
            href="https://www.almeezangroup.com/funds-archive/"
            target="_blank"
          >
            https://www.almeezangroup.com/funds-archive/
          </a>
        </>
      )}
      {isFileSelected && (
        <div>
          {sheetsData.map(({ cols, name, timeCol, plotCols }) => (
            <div key={`sheet-${name}`}>
              <div className="p-1">
                <label className="p-0.5">Select Time Attribute</label>
                <select
                  name={`${name}-timeCol`}
                  value={timeCol || ""}
                  onChange={onFormChange}
                  className="shadow appearance-none border rounded ml-2 py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="" key="timeColPlaceholder">
                    Select Time Attribute
                  </option>
                  {cols.map((col) => (
                    <option value={col} key={`${name}-${col}`}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-1">
                <label>Select attributes to plot</label>
                <br />
                <div className="shadow appearance-none border rounded ml-2 py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline">
                  {cols.map((col) => (
                    <span key={`${name}-${col}`}>
                      <input
                        id={`${name}-${col}`}
                        name={`${name}-plotCols`}
                        value={col}
                        checked={plotCols.has(col)}
                        type="checkbox"
                        onChange={onFormChange}
                        className="mx-2 leading-tight"
                      />
                      <label htmlFor={`${name}-${col}`} className="text-sm">
                        {col}
                      </label>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <input
            type="submit"
            className="shadow appearance-none border border-black-400 p-2 rounded m-2 hover:bg-blue-400 hover:cursor-pointer"
          />
        </div>
      )}
    </form>
  );
};

export default Form;
