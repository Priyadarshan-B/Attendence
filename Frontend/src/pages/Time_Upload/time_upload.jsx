import React, { useState } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import requestApi from "../../components/utils/axios";
import apiHost from "../../components/utils/api";
import axios from "axios";
import * as XLSX from "xlsx";
import "./time_upload.css";

function TimeUpload() {
    return <AppLayout rId={5} body={<Body />} />;
}

function Body() {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleFileUpload = (e) => {
        setFile(e.target.files[0]);
    };

    const handleParse = async () => { 
        if (!file) {
            setMessage("Please upload a file.");
            return;
        }

        setIsLoading(true);
        setMessage("");

        const reader = new FileReader();
        reader.onload = async (event) => {  
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const headers = jsonData[0];
            const rows = jsonData.slice(1);

            function excelDateToJSDate(excelDate) {
                const date = new Date((excelDate - 25569) * 86400 * 1000);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
                const year = date.getFullYear();
                return `${year}-${month}-${day}`;
            }

            const parsedData = rows.map((row) => ({
                name: row[headers.indexOf("name")],
                email: row[headers.indexOf("gmail")],
                date: excelDateToJSDate(row[headers.indexOf("date")]), // Convert the date
                time_range: row[headers.indexOf("time")],
            }));

            console.log(parsedData);

            try {
                const response = await axios.post(`${apiHost}/time-upload`, parsedData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log(response.data);
                setMessage("Upload successful!");
            } catch (error) {
                setMessage("Unexpected error occurred.");
                console.error("Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="upload-container">
            <h2>Upload Faculty List (Time slots)</h2>
            <div className="upload-section">
                <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls" className="file-input" />
                <button onClick={handleParse} className="upload-button" disabled={isLoading}>
                    {isLoading ? "Uploading..." : "Upload and Parse"}
                </button>
            </div>
            {message && <p className="message">{message}</p>}
        </div>
    );
}

export default TimeUpload;
