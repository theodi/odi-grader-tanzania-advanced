import validJson from 'is-my-json-valid'
import $ from "cash-dom"
import CsvToJson from "csvtojson";
import tableToJson from "html-table-to-json"
import similarity from "similarity";
import Darkmode from 'darkmode-js';


const options = {
  time: '0.5s', // default: '0.3s',
  backgroundColorLight: '#005086',
  label: '🌓',
  // change position to top right corner
  bottom: '44px', // default: '32px'
  right: 'unset', // default: '32px'
  left: '32px', // default: 'unset'
}
const darkmode = new Darkmode(options);
darkmode.showWidget();

let best = [{
  "reg": "5 Mara",
  "year": "2015",
  "cou": "MUS DC",
  "hf type": "Hospital",
  "owner": "Public",
  "hfr code": "101193-1",
  "name of facility": "BUTIAMA HOSPITAL",
  "star rating": "2"
}];

document.getElementById("import").onclick = function () {
  // empty array where we will store stringified json
  let arr;
  // finding imported file
  let files = document.getElementById("selectFiles").files;
  if (files.length <= 0) {
    return false;
  }
  let fr = new FileReader();
  //load csv and convert to JSON
  fr.onload = function (e) {
    //console.log('fetching file'); //ok
    CsvToJson()
      .fromString(e.target.result)
      .then((arr) => {
        let input = arr;
        //console.log(arr); // not ok, no values
        var col = [];
        for (var i = 0; i < input.length; i++) {
          for (var key in input[i]) {
            //console.log('key in input: ', key); //ok
            if (col.indexOf(key) === -1) {
              col.push(key);
              //console.log('col', col); //ok
            }
          }
        }
        // CREATE DYNAMIC TABLE.
        var table = document.createElement("table");
        //set table id
        table.setAttribute('id', 'table');
        // table.addClass('table');
        // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.
        var tr = table.insertRow(-1);                   // TABLE ROW.
        for (var i = 0; i < col.length; i++) {
          var th = document.createElement("th");      // TABLE HEADER.
          th.innerHTML = col[i];
          tr.appendChild(th);
        }
        // ADD JSON DATA TO THE TABLE AS ROWS.
        for (var i = 0; i < input.length; i++) {
          tr = table.insertRow(-1);
          for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);
            tabCell.innerHTML = input[i][col[j]];
          }
        }
        // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
        var divContainer = document.getElementById("result");
        divContainer.innerHTML = "";
        divContainer.appendChild(table);
        let counter = 0;
        let editedVersion
        document.getElementById("result").addEventListener("input", function () {
          //console.log("input event fired");
          // log the new table header
          editedVersion = table
          counter += 1
          //console.log(counter)
          const updatedTable = tableToJson.parse(table.outerHTML)
          editedVersion = updatedTable.results
          //console.log(editedVersion)
        }, false);

        let gradeTotal = 0

        function checkStars(input) {
          let allStars = [];
          for (let i of input) {
            for (let key in i) {
              if (key === 'STAR RATING') {
                allStars.push(parseInt(i[key]))
              }
              else {
                $("#starRatings").text("✏️ Star ratings information not found in your file.");
              }
            }
          }
          //console.log('allStars', allStars);
          if (allStars.length > 0) {
            let sumStars = allStars.reduce((a, b) => a + b, 0);
            let displayTotal = `Sum of stars: ${sumStars}`;
            let meanStars = sumStars/allStars.length;
            function median(values){
              if(values.length ===0) throw new Error("No inputs");
              values.sort(function(a,b){
                return a-b;
              });
              var half = Math.floor(values.length / 2);
              if (values.length % 2) return values[half];
              return (values[half - 1] + values[half]) / 2.0;
            }
            let medStars = median(allStars);
            let starType = typeof(sumStars);
            //console.log('sum, mean, median: ', sumStars, meanStars, medStars);
            if (sumStars === 348 && meanStars === 0.8207547169811321 && medStars === 1) {
              $("#starRatings").text("✅ Star ratings are valid numeric values and return the correct analysis.");
              gradeTotal += 2
              //console.log('points: ', gradeTotal);
            }
            else if (isNaN(sumStars)) {
              $("#starRatings").text("✏️ Star ratings could not be validated as the data contains non-numeric values.");
              gradeTotal += 0
              //console.log('points: ', gradeTotal);
            }
            else if (sumStars != 348 && starType == "number") {
              $("#starRatings").text("✏️ Star ratings failed validation.");
              gradeTotal += 1
              //console.log('points: ', gradeTotal);
            }
            else {
              $("#starRatings").text("✏️ Star ratings could not be validated.");
              gradeTotal += 0
            }

          }
        }
        checkStars(input);

      function checkTypes(input) {
        let allTypes = [];
        for (let i of input) {
          for (let key in i) {
            //console.log(key);
            if (key === 'HF TYPE') {
              allTypes.push(i[key])
            }
          }
        }
        //console.log('allTypes', allTypes);
        function countUnique(iterable) {
          return new Set(iterable);
        }
        let listTypes = countUnique(allTypes);
        let numTypes = listTypes.size;
        //console.log('Types', listTypes, numTypes);
        if (numTypes === 3) {
          $("#facTypes").text("✅  There are 3 distinct facility types in your file.");
          gradeTotal += 1
          //console.log('points: ', gradeTotal);
        }
        else if (numTypes !== 3) {
          $("#facTypes").text("✏️ There should be 3 health facility types in your file.");
          gradeTotal += 0
          //console.log('points: ', gradeTotal);
        }
        else {
          $("#facTypes").text("✏️ Facility type categories could not be found in your file.");
          gradeTotal += 0
        }
      }
      checkTypes(input);

      function checkOwner(input) {
        let allOwner = [];
        for (let i of input) {
          for (let key in i) {
            //console.log(key);
            if (key === 'OWNER') {
              allOwner.push(i[key])
            }
          }
        }
        //console.log('allOwner', allOwner);
        function countUnique(iterable) {
          return new Set(iterable);
        }
        let listOwner = countUnique(allOwner);
        let ownChecker = 0;
        for (let i in allOwner) {
          //console.log('own', own);
          let own = allOwner[i];
          if (typeof(own) === 'string') {
            ownChecker += 1;
          }
        }
        //console.log('ownChecker', ownChecker);
        let ownerType = typeof(listOwner);
        //console.log('owners?', ownerType);
        let numOwner = listOwner.size;
        //console.log('Owners', listOwner, numOwner);
        if (numOwner === 4 && ownChecker === 424) {
          $("#facOwner").text("✅  There are 4 distinct and descriptive ownership types in your file.");
          gradeTotal += 2
          //console.log('points: ', gradeTotal);
        }
        else if (numOwner === 4) {
          $("#facOwner").text("✏️ There are 4 distinct ownership categories in your file but they are not descriptive.");
          gradeTotal += 1
          //console.log('points: ', gradeTotal);
        }
        else if (numOwner !== 4 && ownChecker === 424) {
          $("#facOwner").text("✏️ There are ${numOwner} descriptive ownership types in your file but there should be 4.");
          gradeTotal += 1
          //console.log('points: ', gradeTotal);
        }
        else if (numOwner !== 4 && ownChecker !== 424) {
          $("#facOwner").text("✏️ Ownership types could not be validated.");
          gradeTotal += 0
          //console.log('points: ', gradeTotal);
        }
      }
      checkOwner(input);

      function checkRegions(input) {
        let allRegions = [];
        for (let i of input) {
          for (let key in i) {
            //console.log(key);
            if (key === 'REG') {
              allRegions.push(i[key])
            }
          }
        }
        //console.log('allRegions', allRegions);
        function countUnique(iterable) {
          return new Set(iterable);
        }
        let listRegions = countUnique(allRegions);
        let numRegions = listRegions.size;
        let regionChecker = 0;
        for (let i in allRegions) {
          let region = allRegions[i];
          //console.log('region', region, typeof(region));
          if (region == '05-Mar') {
            regionChecker += 1;
          }
        }
        //console.log('region checker', regionChecker);
        //console.log('Regions', listRegions, numRegions);
        if (numRegions === 2) {
          $("#regions").text("✅  There are 2 distinct regions in the file.");
          gradeTotal += 1
          //console.log('points: ', gradeTotal);
        }
        else if (regionChecker !== 424) {
          $("#regions").text("✏️ Some region values are invalid.");
          gradeTotal += 0
        }
        else {
          $("#regions").text("✏️ Regions could not be validated.");
          gradeTotal += 0
        }// TODO add something here to check if this column includes a date e.g. 5 Mar
      }
      checkRegions(input);

      function checkRows(input) {
        let allRows = [];
        let numRows = input.length;
        //console.log('numRows', numRows);
        if (numRows === 424) {
          $("#rows").text("✅  All of the original unique data points have been preserved.");
          gradeTotal += 1
          //console.log('points: ', gradeTotal);
        }
        else if (numRows > 424) {
          $("#rows").text("✏️ Data points have not been correctly validated. Your file may contain duplicates or errors.");
          gradeTotal += 0
        }
        else if (numRows < 424) {
          $("#rows").text("✏️ Some of the original data points are missing from your file.");
          gradeTotal += 0
        }
      }
      checkRows(input);


//Convert to lower case and sort for easier checking of headers
        let found = [];
        let keysUsed = Object.keys(input[0]).map(i => i.toLowerCase()).sort()
        let keysRecommended = Object.keys(best[0]).map(i => i.toLowerCase()).sort()

// Remove anything containing the word "of", "the", "facility", or "health"
        const removeWords = (arr) => {
          return arr.map((string) =>
            string.replace(/of|the|facility|health|/g, "").trim()
          );
        };

        const baseArr = removeWords(keysRecommended);
        const userArr = removeWords(keysUsed);

        let maxGrade = 7
        let gradePC = gradeTotal/maxGrade*100;
        let gradeRounded = gradePC.toFixed(1);
        //let gradeText = `You scored a total of ${gradeTotal} out of a possible ${maxGrade}. Your grade is ${gradeRounded}%`;
        let gradeText = `Your grade is ${gradeRounded}%`;

        $("#totalGrade").text(gradeText);

      })


  }
  fr.readAsText(files.item(0));
};
