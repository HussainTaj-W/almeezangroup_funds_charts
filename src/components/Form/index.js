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

    sheetsData.forEach((sheet, index) => {
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
      <input type="file" name="file" onChange={onFileChange} accept=".xlsx" />
      {isFileSelected && (
        <div>
          {sheetsData.map(({ cols, name, timeCol, plotCols }, index) => (
            <div key={`sheet-${name}`}>
              <p>{name}</p>
              <select
                name={`${name}-timeCol`}
                value={timeCol || ""}
                onChange={onFormChange}
              >
                <option value="" key="timeColPlaceholder">
                  Select Time Attribute
                </option>
                {cols.map((col, index) => (
                  <option value={col} key={`${name}-${col}`}>
                    {col}
                  </option>
                ))}
              </select>
              <div>
                {cols.map((col, index) => (
                  <span key={`${name}-${col}`}>
                    <input
                      id={`${name}-${col}`}
                      name={`${name}-plotCols`}
                      value={col}
                      checked={plotCols.has(col)}
                      type="checkbox"
                      onChange={onFormChange}
                    />
                    <label htmlFor={`${name}-${col}`}>{col}</label>
                  </span>
                ))}
              </div>
            </div>
          ))}
          <input type="submit" />
        </div>
      )}
    </form>
  );
};

export default Form;
