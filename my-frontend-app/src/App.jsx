import { useState } from 'react'
import axios from 'axios';
import * as XLSX from 'xlsx';


function App() {

  const [msg, setmsg] = useState("")
  const [status, setstatus] = useState(false)
  const [emailList, setemailList] = useState([])
  const API_URL = import.meta.env.VITE_API_URL;


  function handleChange(event) {
    setmsg(event.target.value)
  }

  function send() {
    setstatus(true)
    axios.post(`${API_URL}/send-email`, { msg: msg, emailList: emailList })
      .then(function (data) {
        setstatus(false)
      })
      .catch(function (error) {
        setstatus(false)
      })
  }

  function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const emailList = XLSX.utils.sheet_to_json(worksheet, { header: "A" });
      const totalEmails = emailList.map(function(item){return item.A});
      console.log(totalEmails);
      setemailList(emailList);

    };

    reader.readAsBinaryString(file);

  }


  return (
    <div>
      <div className="bg-blue-950 text-white text-center">
        <h1 className="text-2xl font-medium px-5 py-3"> Bulkmail</h1>
      </div>

      <div className="bg-blue-800 text-white text-center">
        <h1 className="font-medium px-5 py-3">We can help your business to sending multiple emails at once </h1>
      </div>

      <div className="bg-blue-600 text-white text-center">
        <h1 className="font-medium px-5 py-3">Drag and drop your email templates</h1>
      </div>

      <div className="bg-blue-400 flex flex-col text-black items-center px-5 py-3">
        <textarea onChange={handleChange} value={msg} className="bg-white w-[80%] h-32 py-2 outline-none px-2 border border-black rounded-md" placeholder="Enter your email content here..."></textarea>
        <div className="bg-blue-400 flex flex-col text-black items-center px-5 py-3">
          <input type="file" onChange={handleFile} className="bg-white border-4 border-dashed py-4 px-4 mt-5 mb-5" />
          <p className="text-black">Total emails in the file: {emailList.length}</p>
          <button onClick={send} className="bg-blue-950 text-white px-2 py-2 font-medium rounded-md mt-3 mb-5">{status ? 'Sending...' : 'Send Emails'}</button>
        </div>
      </div>

      <div className="bg-blue-300 text-white text-center p-8">
      </div>

      <div className="bg-blue-200 text-white text-center p-8">
      </div>


    </div>
  )
}

export default App
