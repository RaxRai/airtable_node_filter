const axios = require('axios');

const express = require('express');
const app = express();
const port = 5000;

app.get('/', async (req, res) => {
  const apiKey = '';
  const header = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  };
  let allLeads = [];
  let data = {};
  let dateNow = new Date();
  let epoch = Math.floor(dateNow.getTime());
  epoch += 3600 * 1000;
  let dateHourLater = new Date(epoch);

  console.log('---vvv', dateNow.toISOString(), epoch, dateHourLater);
  try {
    const todayHourUrl = `https://api.airtable.com/v0/applHX5xzPpF1liZT/Leads?api_key=${apiKey}&filterByFormula=AND(IS_SAME({Date}, TODAY(), "day"), IS_SAME({Date}, DATETIME_PARSE("${dateHourLater.toISOString()}"), "hour") )`;
    const sameDayUrl = `https://api.airtable.com/v0/applHX5xzPpF1liZT/Leads?api_key=${apiKey}&filterByFormula=(IS_SAME({Date}, TODAY(), "day"))`;
    data = await axios.get(sameDayUrl);
  } catch (err) {
    console.log(err);
    res.send(err);
  }

  if (data.data) {
    allLeads.push(data.data.records);
    // console.log('first', data.data);
    let offsetData = data.data.offset;
    console.log('offset', offsetData);
    while (true) {
      if (offsetData) {
        try {
          const newdata = await axios.get(
            `https://api.airtable.com/v0/applHX5xzPpF1liZT/Leads?api_key=${apiKey}&offset=${offsetData}`
          );
          console.log(newdata.data.records.length);
          if (newdata.data) {
            allLeads.push(newdata.data.records);
            // console.log('next', newdata.data.records[0]);
          }
          offsetData =
            newdata.data && newdata.data.offset ? newdata.data.offset : null;
        } catch (err) {
          console.log('err', err);
          break;
        }
      } else break;
    }
  }
  // let allData = [];
  // for (let i = 0; i < allLeads.length; i++) {
  //   allData.concat(allLeads[i]);
  // }

  // console.log('all done', allLeads, allData);
  res.send({ allLeads, data: data.data });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
